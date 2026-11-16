import http from "http";
import fs from "fs";

function request(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(d));
    });
    req.on("error", reject);
    req.end();
  });
}

const ver = JSON.parse(await request("http://127.0.0.1:9334/json/version"));
const ws = new WebSocket(ver.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
function send(method, params = {}, sessionId) {
  const msgId = ++id;
  return new Promise((resolve, reject) => {
    pending.set(msgId, { resolve, reject });
    const payload = { id: msgId, method, params };
    if (sessionId) payload.sessionId = sessionId;
    ws.send(JSON.stringify(payload));
  });
}
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
  }
});
await new Promise((r) => ws.addEventListener("open", r));
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Emulation.setDeviceMetricsOverride", {
  width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false,
}, sessionId);
await send("Page.navigate", { url: "http://localhost:62233/sustainability" }, sessionId);
await new Promise((r) => setTimeout(r, 2000));

const expr = `(() => {
  const items = [...document.querySelectorAll('.CreatingTowards-media__item')];
  return {
    zoom: document.documentElement.style.zoom || '1',
    vw: window.innerWidth,
    rows: items.map((el) => {
      const r = el.getBoundingClientRect();
      const img = el.querySelector('img').getBoundingClientRect();
      return {
        h: Math.round(r.height * 100) / 100,
        top: Math.round(r.top * 100) / 100,
        bottom: Math.round(r.bottom * 100) / 100,
        w: Math.round(r.width * 100) / 100,
        imgH: Math.round(img.height * 100) / 100,
        imgTop: Math.round(img.top * 100) / 100,
        imgBottom: Math.round(img.bottom * 100) / 100
      };
    })
  };
})()`;

for (const zoom of ["1", "1.25", "1.5"]) {
  await send("Runtime.evaluate", {
    expression: `document.documentElement.style.zoom='${zoom}'; document.querySelector('.CreatingTowards-outer').scrollIntoView({block:'start'});`,
  }, sessionId);
  await new Promise((r) => setTimeout(r, 500));
  const result = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sessionId);
  console.log("ZOOM", zoom, JSON.stringify(result.result.value));
  if (zoom !== "1") {
    const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
    fs.writeFileSync(`D:/GBL_2026_HTML/_layout-check/zoom-${zoom}.png`, Buffer.from(shot.data, "base64"));
  }
}
ws.close();
