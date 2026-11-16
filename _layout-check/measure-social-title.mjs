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
    ws.send(JSON.stringify(sessionId ? { id: msgId, method, params, sessionId } : { id: msgId, method, params }));
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
const expr = `(() => {
  const el = document.querySelector('.page-intro-mantra__sanskrit');
  if (!el) return null;
  return { color: getComputedStyle(el).color, text: el.textContent.slice(0, 24) };
})()`;
for (const path of ["/Social", "/sustainability"]) {
  await send("Page.navigate", { url: "http://localhost:62233" + path }, sessionId);
  await new Promise((r) => setTimeout(r, 1400));
  const result = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sessionId);
  console.log(path, JSON.stringify(result.result.value));
}
ws.close();
