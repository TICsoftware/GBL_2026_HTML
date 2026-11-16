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
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
await send("Page.navigate", { url: "http://localhost:62233/Social" }, sessionId);
await new Promise((r) => setTimeout(r, 1800));
const expr = `(() => {
  const words = [...document.querySelectorAll('.page-intro-inner .page-intro-mantra__sanskrit .page-intro-fill-word')];
  return { count: words.length, colors: [0, words.length - 1].map(i => words[i] ? getComputedStyle(words[i]).color : null) };
})()`;
const pos = await send("Runtime.evaluate", {
  expression: `(() => { const s = document.querySelector('.page-intro-inner'); const top = s.getBoundingClientRect().top + window.scrollY; return { top: Math.round(top), h: s.offsetHeight }; })()`,
  returnByValue: true,
}, sessionId);
console.log("POS", JSON.stringify(pos.result.value));
for (const [label, y] of [["above", Math.max(0, pos.result.value.top - 600)], ["mid", pos.result.value.top], ["end", pos.result.value.top + pos.result.value.h]]) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` }, sessionId);
  await new Promise((r) => setTimeout(r, 400));
  const result = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sessionId);
  console.log(label, JSON.stringify(result.result.value));
}
ws.close();
