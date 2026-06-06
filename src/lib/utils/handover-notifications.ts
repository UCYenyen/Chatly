import { sendGowaMessage } from "@/lib/utils/whatsapp";

export async function sendCustomerHandoverAck(
  customerPhone: string,
  instanceKey: string,
): Promise<void> {
  await sendGowaMessage(
    customerPhone,
    "👋 Sebentar ya, tim kami akan segera membalas pesan kamu.",
    instanceKey,
  );
}
