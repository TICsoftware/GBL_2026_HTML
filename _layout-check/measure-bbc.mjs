import http from "http";

function request(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(d));
    }).on("error", reject);
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
  width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
}, sessionId);
await send("Page.navigate", { url: "http://localhost:62233/BioBasedChemicals" }, sessionId);
await new Promise((r) => setTimeout(r, 1800));

const expr = `(() => {
  return [...document.querySelectorAll('.bbc-split')].map((row, i) => {
    const media = row.querySelector('.bbc-split__media');
    const copy = row.querySelector('.bbc-split__copy');
    const mr = media.getBoundingClientRect();
    const cr = copy.getBoundingClientRect();
    const cs = getComputedStyle(media);
    return {
      i,
      reverse: row.classList.contains('reverse'),
      position: cs.position,
      top: cs.top,
      mediaTop: Math.round(mr.top),
      copyTop: Math.round(cr.top),
      copyBottom: Math.round(cr.bottom),
      mediaLeft: Math.round(mr.left),
      copyLeft: Math.round(cr.left)
    };
  });
})()`;

async function sample(label, y) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` }, sessionId);
  await new Promise((r) => setTimeout(r, 350));
  const result = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sessionId);
  console.log(label, JSON.stringify(result.result.value));
}

const metrics = await send("Runtime.evaluate", {
  expression: `(() => {
    const rows = [...document.querySelectorAll('.bbc-split')];
    return rows.map(row => {
      const top = row.getBoundingClientRect().top + window.scrollY;
      const bottom = row.getBoundingClientRect().bottom + window.scrollY;
      return { top: Math.round(top), bottom: Math.round(bottom) };
    });
  })()`,
  returnByValue: true,
}, sessionId);
console.log("ROWS", JSON.stringify(metrics.result.value));
const rows = metrics.result.value;
await sample("before", Math.max(0, rows[0].top - 200));
await sample("mid", rows[0].top + 180);
await sample("end", rows[0].bottom - 200);
await sample("mid2", rows[1].top + 180);
ws.close();
