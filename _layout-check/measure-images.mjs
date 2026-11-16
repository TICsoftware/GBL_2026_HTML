import http from "http";

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

const widths = [1920, 1536, 1440, 1366, 1280, 1200, 1100];
const expr = `(() => {
  const items = [...document.querySelectorAll('.CreatingTowards-media__item')];
  const media = document.querySelector('.CreatingTowards-media');
  const copy = document.querySelector('.CreatingTowards-copy');
  const rows = items.map((el) => {
    const r = el.getBoundingClientRect();
    const img = el.querySelector('img');
    const ir = img.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const ics = getComputedStyle(img);
    return {
      h: Math.round(r.height * 100) / 100,
      top: Math.round(r.top * 100) / 100,
      bottom: Math.round(r.bottom * 100) / 100,
      imgH: Math.round(ir.height * 100) / 100,
      imgTop: Math.round(ir.top * 100) / 100,
      imgBottom: Math.round(ir.bottom * 100) / 100,
      pos: cs.position,
      itemH: cs.height,
      imgPos: ics.position,
      imgCssH: ics.height
    };
  });
  const mr = media.getBoundingClientRect();
  const cr = copy.getBoundingClientRect();
  return {
    vw: window.innerWidth,
    mediaH: Math.round(mr.height),
    copyH: Math.round(cr.height),
    mediaTop: Math.round(mr.top),
    copyTop: Math.round(cr.top),
    rows
  };
})()`;

for (const width of widths) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  }, sessionId);
  if (width === widths[0]) {
    await send("Page.navigate", { url: "http://localhost:62233/sustainability" }, sessionId);
    await new Promise((r) => setTimeout(r, 2200));
  } else {
    await new Promise((r) => setTimeout(r, 400));
  }
  await send("Runtime.evaluate", {
    expression: `document.querySelector('.CreatingTowards-outer').scrollIntoView({block:'center'})`,
  }, sessionId);
  await new Promise((r) => setTimeout(r, 300));
  const result = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sessionId);
  console.log("WIDTH", width, JSON.stringify(result.result.value));
}

ws.close();
