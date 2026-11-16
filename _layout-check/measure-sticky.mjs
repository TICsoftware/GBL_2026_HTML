import http from "http";
import fs from "fs";

function request(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.end();
  });
}

const created = await request("http://127.0.0.1:9333/json/version");
const ver = JSON.parse(created.body);
const ws = new WebSocket(ver.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const sessions = new Map();

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
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
}, sessionId);

await send("Page.navigate", { url: "http://localhost:62233/sustainability" }, sessionId);
await new Promise((r) => setTimeout(r, 2500));

const expr = `(() => {
  const quote = document.querySelector('.page-intro-mantra__quote');
  const copy = document.querySelector('.page-intro-mantra__copy');
  const section = document.querySelector('.page-intro-mantra');
  const qr = quote.getBoundingClientRect();
  const cr = copy.getBoundingClientRect();
  const sr = section.getBoundingClientRect();
  const cs = getComputedStyle(quote);
  return {
    position: cs.position,
    top: cs.top,
    alignSelf: cs.alignSelf,
    quoteTop: Math.round(qr.top),
    quoteBottom: Math.round(qr.bottom),
    copyTop: Math.round(cr.top),
    copyBottom: Math.round(cr.bottom),
    sectionBottom: Math.round(sr.bottom),
    scrollY: Math.round(window.scrollY)
  };
})()`;

async function sample(label, y) {
  await send("Runtime.evaluate", {
    expression: `window.scrollTo(0, ${y});`,
  }, sessionId);
  await new Promise((r) => setTimeout(r, 400));
  const result = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sessionId);
  console.log(label, JSON.stringify(result.result.value));
}

const metrics = await send("Runtime.evaluate", {
  expression: `(() => {
    const section = document.querySelector('.page-intro-outer--mantra');
    const copy = document.querySelector('.page-intro-mantra__copy');
    const top = section.getBoundingClientRect().top + window.scrollY;
    const copyBottom = copy.getBoundingClientRect().bottom + window.scrollY;
    return { top, copyBottom, h: document.documentElement.scrollHeight };
  })()`,
  returnByValue: true,
}, sessionId);
const m = metrics.result.value;
console.log("METRICS", JSON.stringify(m));

await sample("before", Math.max(0, m.top - 200));
await sample("enter", m.top + 40);
await sample("mid", m.top + 420);
await sample("near-end", m.copyBottom - 1100);
await sample("after", m.copyBottom);

const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
fs.writeFileSync("D:/GBL_2026_HTML/_layout-check/sticky-mid.png", Buffer.from(shot.data, "base64"));

await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${m.top + 420});` }, sessionId);
await new Promise((r) => setTimeout(r, 300));
const shot2 = await send("Page.captureScreenshot", { format: "png" }, sessionId);
fs.writeFileSync("D:/GBL_2026_HTML/_layout-check/sticky-hold.png", Buffer.from(shot2.data, "base64"));

ws.close();
