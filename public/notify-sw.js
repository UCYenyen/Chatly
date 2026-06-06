self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

async function closeByTag(tag) {
  const notifications = await self.registration.getNotifications({ tag });
  for (const notification of notifications) {
    notification.close();
  }
}

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  if (payload.type === "revoke") {
    event.waitUntil(closeByTag(payload.tag));
    return;
  }

  if (payload.type === "alert") {
    event.waitUntil(
      self.registration.showNotification(payload.businessName, {
        body:
          "Pelanggan " +
          payload.customerPhone +
          " butuh dibalas.\n" +
          payload.lastMessage,
        tag: payload.tag,
        renotify: true,
        requireInteraction: true,
        data: { claimUrl: payload.claimUrl },
      }),
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const claimUrl = event.notification.data && event.notification.data.claimUrl;
  if (!claimUrl) return;
  event.waitUntil(self.clients.openWindow(claimUrl));
});
