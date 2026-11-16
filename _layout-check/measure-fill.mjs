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
await send("Page.navigate", { url: "http://localhost:62233/sustainability" }, sessionId);
await new Promise((r) => setTimeout(r, 2000));

const expr = `(() => {
  const titleWords = [...document.querySelectorAll('.page-intro-mantra__sanskrit .page-intro-fill-word')];
  const copyWords = [...document.querySelectorAll('.page-intro-mantra__copy .page-intro-fill-word')];
  const colorAt = (list, indexes) => indexes.map(i => {
    const el = list[i];
    return el ? getComputedStyle(el).color : null;
  });
  return {
    titleCount: titleWords.length,
    copyCount: copyWords.length,
    title: colorAt(titleWords, [0, titleWords.length - 1]),
    copy: colorAt(copyWords, [0, 8, copyWords.length - 1])
  };
})()`;

async function sample(label, y) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` }, sessionId);
  await new Promise((r) => setTimeout(r, 400));
  const result = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sessionId);
  console.log(label, JSON.stringify(result.result.value));
}

const pos = await send("Runtime.evaluate", {
  expression: `(() => {
    const s = document.querySelector('.page-intro-outer--mantra');
    const top = s.getBoundingClientRect().top + window.scrollY;
    return { top: Math.round(top), h: Math.round(s.offsetHeight) };
  })()`,
  returnByValue: true,
}, sessionId);
console.log("POS", JSON.stringify(pos.result.value));
const top = pos.result.value.top;
await sample("above", Math.max(0, top - 700));
await sample("enter", top - 200);
await sample("mid", top + 200);
await sample("end", top + pos.result.value.h - 100);
ws.close();
