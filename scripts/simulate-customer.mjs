
// pnpm simulate                          # interactive chat — type messages, see replies
// pnpm simulate -m "do you sell shoes?"  # send one message and exit
// One-shot (single custom message):


// pnpm simulate -m "halo, ada promo hari ini?"
// Override the number anytime (if you ever want a different one):


// pnpm simulate --from 6289999999999 -m "test"

import "dotenv/config";
import { createHmac } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout, argv, exit, env } from "node:process";
import pg from "pg";

const DEFAULT_CUSTOMER_NUMBER = "6281245438363";
const DEFAULT_WEBHOOK_URL = "http://127.0.0.1:3000/api/whatsapp/webhook";
const REPLY_POLL_TIMEOUT_MS = 30_000;
const REPLY_POLL_INTERVAL_MS = 500;
const HUMAN_MODE_TIMEOUT_MINUTES = Number(env.HUMAN_MODE_TIMEOUT_MINUTES) || 30;

function parseArgs(rawArgs) {
  const options = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const token = rawArgs[index];
    if (token === "--help" || token === "-h") options.help = true;
    else if (token === "--list") options.list = true;
    else if (token === "--from") options.from = rawArgs[++index];
    else if (token === "--device") options.device = rawArgs[++index];
    else if (token === "--url") options.url = rawArgs[++index];
    else if (token === "--message" || token === "-m") options.message = rawArgs[++index];
  }
  return options;
}

function printUsage() {
  console.log(`
Simulate a WhatsApp customer messaging your bot — no phone, no Gowa, no real delivery.

It POSTs a correctly-signed fake webhook to your dev server, then reads the bot's
reply straight out of the database and prints it here.

Usage:
  node scripts/simulate-customer.mjs                       interactive chat (REPL)
  node scripts/simulate-customer.mjs -m "do you ship?"     send one message and exit
  node scripts/simulate-customer.mjs --list                list connected devices and exit

Options:
  --from <number>     customer number (default ${DEFAULT_CUSTOMER_NUMBER})
  --device <id>       device_id to target (default: the one authenticated device)
  --url <url>         webhook url (default ${DEFAULT_WEBHOOK_URL})
  -m, --message <t>   one-shot message instead of interactive mode
  -h, --help          show this help

The bot's reply is delivered to the --from number via the real Gowa API. Use YOUR
OWN number to test end-to-end delivery on a single phone (the reply lands in your
WhatsApp), or a junk number if you only want to read the reply printed here.
`);
}

function canonicalizePhone(input) {
  const beforeDomain = input.split("@")[0]?.split(":")[0] ?? "";
  const withoutPlus = beforeDomain.trim().replace(/^\+/, "");
  const digitsOnly = withoutPlus.replace(/\D/g, "");
  if (digitsOnly.length === 0) return null;
  return digitsOnly.startsWith("0") ? `62${digitsOnly.slice(1)}` : digitsOnly;
}

function toJid(number) {
  return number.includes("@") ? number : `${number}@s.whatsapp.net`;
}

function signBody(rawBody, secret) {
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  return `sha256=${digest}`;
}

async function listDevices(client) {
  const result = await client.query(
    `SELECT id, "businessId", status, "phoneNumber", "instanceKey"
     FROM whatsapp_auth
     ORDER BY "updatedAt" DESC`,
  );
  return result.rows;
}

function resolveDeviceId(device) {
  return device.phoneNumber ?? device.instanceKey ?? device.id;
}

async function pickDevice(client, requestedDeviceId) {
  const devices = await listDevices(client);
  if (devices.length === 0) {
    throw new Error(
      "No WhatsAppAuth rows found. Connect a WhatsApp device once so a business is registered.",
    );
  }

  if (requestedDeviceId) {
    const match = devices.find(
      (device) =>
        device.phoneNumber === requestedDeviceId ||
        device.instanceKey === requestedDeviceId ||
        device.id === requestedDeviceId,
    );
    if (!match) {
      throw new Error(`No device matches --device "${requestedDeviceId}".`);
    }
    return match;
  }

  const authenticated = devices.filter((device) => device.status === "AUTHENTICATED");
  const pool = authenticated.length > 0 ? authenticated : devices;
  if (pool.length === 1) return pool[0];

  console.log("Multiple devices found — pass --device to choose one:");
  for (const device of pool) {
    console.log(
      `  device_id=${resolveDeviceId(device)}  business=${device.businessId}  status=${device.status}`,
    );
  }
  throw new Error("Ambiguous device. Re-run with --device <id>.");
}

async function latestAiReplyTimestamp(client, businessId, phone) {
  const result = await client.query(
    `SELECT "createdAt" FROM chat_log
     WHERE "businessId" = $1 AND phone = $2 AND role = 'AI'
     ORDER BY "createdAt" DESC LIMIT 1`,
    [businessId, phone],
  );
  return result.rows[0]?.createdAt ?? null;
}

async function getConversationState(client, businessId, phone) {
  const result = await client.query(
    `SELECT mode, "updatedAt" FROM conversation_state
     WHERE "businessId" = $1 AND phone = $2 LIMIT 1`,
    [businessId, phone],
  );
  return result.rows[0] ?? null;
}

function describeHumanModeRemaining(updatedAt) {
  const elapsedMs = Date.now() - new Date(updatedAt).getTime();
  const remainingMinutes = Math.max(0, HUMAN_MODE_TIMEOUT_MINUTES - elapsedMs / 60000);
  return `~${remainingMinutes.toFixed(1)} min left before auto-revert to AI (timeout ${HUMAN_MODE_TIMEOUT_MINUTES} min)`;
}

async function waitForNewAiReply(client, businessId, phone, since) {
  const deadline = Date.now() + REPLY_POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const result = await client.query(
      `SELECT content, "createdAt" FROM chat_log
       WHERE "businessId" = $1 AND phone = $2 AND role = 'AI'
         AND ($3::timestamptz IS NULL OR "createdAt" > $3)
       ORDER BY "createdAt" DESC LIMIT 1`,
      [businessId, phone, since],
    );
    if (result.rows[0]) return result.rows[0].content;
    await new Promise((resolve) => setTimeout(resolve, REPLY_POLL_INTERVAL_MS));
  }
  return null;
}

async function sendMessage(context, text) {
  const { client, device, fromJid, phone, webhookUrl, secret } = context;
  const businessId = device.businessId;
  const since = await latestAiReplyTimestamp(client, businessId, phone);

  const payload = {
    event: "message",
    device_id: resolveDeviceId(device),
    payload: {
      from: fromJid,
      from_me: false,
      id: `SIM-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      message: { conversation: text },
    },
  };

  const rawBody = JSON.stringify(payload);
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-hub-signature-256": signBody(rawBody, secret),
    },
    body: rawBody,
  });

  const responseText = await response.text();
  if (!response.ok) {
    console.log(`\n  ⚠ webhook returned ${response.status}: ${responseText}`);
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = {};
  }
  if (parsed.deduped) {
    console.log("\n  ⚠ deduped — reuse a fresh message (this id was already seen).");
    return;
  }
  if (parsed.ignored) {
    console.log("\n  ⚠ this contact is ignored or ignoreAllContacts is ON — no reply.");
    return;
  }
  if (parsed.mode === "HUMAN") {
    const state = await getConversationState(client, businessId, phone);
    if (state?.updatedAt) {
      console.log(
        `\n  ℹ HUMAN mode — bot stays silent. ${describeHumanModeRemaining(state.updatedAt)}.`,
      );
    } else {
      console.log("\n  ℹ conversation is in HUMAN mode — bot stays silent.");
    }
    return;
  }

  const reply = await waitForNewAiReply(client, businessId, phone, since);
  if (reply) {
    console.log(`\n  🤖 bot: ${reply}\n`);
  } else {
    console.log(
      "\n  ℹ no AI reply recorded (bot chose silence, or AI is still running). Check the dev server logs.\n",
    );
  }
}

async function runRepl(context) {
  const rl = createInterface({ input: stdin, output: stdout });
  console.log(
    `\nChatting as ${context.phone} → device ${resolveDeviceId(context.device)} (business ${context.device.businessId}).`,
  );
  console.log('Type a message and press enter. Type "exit" or Ctrl+C to quit.\n');

  while (true) {
    const text = (await rl.question("  you: ")).trim();
    if (text === "exit" || text === "quit") break;
    if (text.length === 0) continue;
    await sendMessage(context, text);
  }
  rl.close();
}

async function main() {
  const options = parseArgs(argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const secret = env.GOWA_WEBHOOK_SECRET;
  const databaseUrl = env.DATABASE_URL;
  if (!secret) throw new Error("GOWA_WEBHOOK_SECRET is missing from your environment.");
  if (!databaseUrl) throw new Error("DATABASE_URL is missing from your environment.");

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    if (options.list) {
      const devices = await listDevices(client);
      if (devices.length === 0) {
        console.log("No WhatsAppAuth rows found.");
        return;
      }
      console.log("Connected devices:");
      for (const device of devices) {
        console.log(
          `  device_id=${resolveDeviceId(device)}  business=${device.businessId}  status=${device.status}`,
        );
      }
      return;
    }

    const device = await pickDevice(client, options.device);
    const fromNumber = options.from ?? DEFAULT_CUSTOMER_NUMBER;
    const phone = canonicalizePhone(fromNumber);
    if (!phone) throw new Error(`Invalid --from number: "${fromNumber}".`);

    const context = {
      client,
      device,
      fromJid: toJid(fromNumber),
      phone,
      webhookUrl: options.url ?? DEFAULT_WEBHOOK_URL,
      secret,
    };

    if (options.message) {
      await sendMessage(context, options.message);
    } else {
      await runRepl(context);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`\n✖ ${error.message}\n`);
  exit(1);
});
