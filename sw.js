/* Chor-App MCT – Service Worker nur für Push-Nachrichten (kein Offline-Cache) */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: "Männerchor Thun", body: e.data ? e.data.text() : "" }; }
  const title = d.title || "Männerchor Thun";
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || undefined,
    data: { url: d.url || "./" }
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) {
      if (c.url.startsWith(self.registration.scope)) {
        try { await c.focus(); if ("navigate" in c) await c.navigate(target); return; } catch (x) {}
      }
    }
    await self.clients.openWindow(target);
  })());
});
