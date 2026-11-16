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
await send("Page.navigate", { url: "http://localhost:62233/careers" }, sessionId);
await new Promise((r) => setTimeout(r, 1500));

const expr = `(() => {
  const first = document.querySelector('.page-intro-inner > p');
  const rest = document.querySelector('.page-intro-inner > p + p');
  const probe = document.createElement('div');
  probe.style.fontSize = 'var(--text-22)';
  document.body.appendChild(probe);
  const token = getComputedStyle(probe).fontSize;
  probe.remove();
  return {
    vw: window.innerWidth,
    token,
    first: first ? getComputedStyle(first).fontSize : null,
    rest: rest ? getComputedStyle(rest).fontSize : null
  };
})()`;

for (const width of [1920, 1680, 1536, 1440, 1366, 1280, 1024, 768, 390]) {
  await send("Emulation.setDeviceMetricsOverride", {
    width, height: 900, deviceScaleFactor: 1, mobile: width < 768,
  }, sessionId);
  await new Promise((r) => setTimeout(r, 250));
  const result = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sessionId);
  console.log(width, JSON.stringify(result.result.value));
}
ws.close();
