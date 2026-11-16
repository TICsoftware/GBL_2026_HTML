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

async function measure(label, width, zoom) {
  await send("Emulation.setDeviceMetricsOverride", {
    width, height: 1000, deviceScaleFactor: 1, mobile: false,
  }, sessionId);
  await send("Page.navigate", { url: "http://localhost:62233/sustainability" }, sessionId);
  await new Promise((r) => setTimeout(r, 1800));
  await send("Runtime.evaluate", {
    expression: `document.documentElement.style.zoom='${zoom}';
      document.querySelectorAll('button').forEach(b => { if ((b.textContent||'').trim()==='Close') b.click(); });
      const s = document.querySelector('.CreatingTowards-outer');
      const y = s.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo(0, y);`,
  }, sessionId);
  await new Promise((r) => setTimeout(r, 700));
  const result = await send("Runtime.evaluate", {
    expression: `(() => {
      const items = [...document.querySelectorAll('.CreatingTowards-media__item')];
      const copy = document.querySelector('.CreatingTowards-copy').getBoundingClientRect();
      const media = document.querySelector('.CreatingTowards-media').getBoundingClientRect();
      return {
        copyH: Math.round(copy.height),
        mediaH: Math.round(media.height),
        copyBottom: Math.round(copy.bottom),
        mediaBottom: Math.round(media.bottom),
        rows: items.map(el => {
          const r = el.getBoundingClientRect();
          const img = el.querySelector('img').getBoundingClientRect();
          return { h: Math.round(r.height*10)/10, top: Math.round(r.top*10)/10, bottom: Math.round(r.bottom*10)/10, imgTop: Math.round(img.top*10)/10, imgBottom: Math.round(img.bottom*10)/10 };
        })
      };
    })()`,
    returnByValue: true,
  }, sessionId);
  console.log(label, JSON.stringify(result.result.value));
  const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  fs.writeFileSync(`D:/GBL_2026_HTML/_layout-check/${label}.png`, Buffer.from(shot.data, "base64"));
}

await measure("z125", 1920, "1.25");
await measure("z150", 1920, "1.5");
await measure("w1536", 1536, "1");
await measure("w1280", 1280, "1");
ws.close();
