// Cloudflare Worker: terima webhook Telegram -> balas "diterima" seketika -> picu GitHub Actions.
// Secret yang dibutuhkan: TG_TOKEN, TG_CHAT, GH_TOKEN (fine-grained, repo tap-bbt, Actions: read/write), HOOK_SECRET
// Notifikasi Web Push (tanpa isi pesan): butuh KV namespace dengan binding bernama PUSH.
//  GET  .../vapid  -> kunci publik (dibuat otomatis sekali, disimpan di KV)
//  POST .../sub    -> simpan langganan dari aplikasi
//  POST .../notify -> (header x-key = TG_TOKEN) kirim notifikasi ke semua langganan
const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const CORS = { "access-control-allow-origin": "https://pakyutu.github.io", "access-control-allow-headers": "content-type,x-key", "access-control-allow-methods": "GET,POST,OPTIONS" };
async function vapid(env) {
  let v = await env.PUSH.get("vapid", "json");
  if (v) return v;
  const k = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
  v = { priv: await crypto.subtle.exportKey("jwk", k.privateKey), pub: b64u(await crypto.subtle.exportKey("raw", k.publicKey)) };
  await env.PUSH.put("vapid", JSON.stringify(v));
  return v;
}
async function sendPush(env, v, sub) {
  const aud = new URL(sub.endpoint).origin, enc = o => b64u(new TextEncoder().encode(JSON.stringify(o)));
  const head = enc({ typ: "JWT", alg: "ES256" }) + "." + enc({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: "mailto:admin@pakyutu.github.io" });
  const key = await crypto.subtle.importKey("jwk", v.priv, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(head));
  return fetch(sub.endpoint, { method: "POST", headers: { Authorization: `vapid t=${head}.${b64u(sig)}, k=${v.pub}`, TTL: "86400", Urgency: "normal" } });
}
async function pushRoutes(req, env, path) {
  if (!env.PUSH) return new Response("KV PUSH belum dipasang", { status: 500, headers: CORS });
  if (path.endsWith("/vapid")) return new Response((await vapid(env)).pub, { headers: CORS });
  if (path.endsWith("/sub") && req.method === "POST") {
    const s = await req.json();
    if (!s || !/^https:\/\//.test(s.endpoint || "")) return new Response("bad", { status: 400, headers: CORS });
    const id = b64u(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s.endpoint)));
    await env.PUSH.put("s:" + id, JSON.stringify({ endpoint: s.endpoint }));
    return new Response("ok", { headers: CORS });
  }
  if (path.endsWith("/notify") && req.method === "POST") {
    if (req.headers.get("x-key") !== env.TG_TOKEN) return new Response("no", { status: 403 });
    const v = await vapid(env), L = await env.PUSH.list({ prefix: "s:" });
    let ok = 0, del = 0;
    for (const k of L.keys) {
      const sub = JSON.parse(await env.PUSH.get(k.name));
      try { const r = await sendPush(env, v, sub); if (r.status === 404 || r.status === 410) { await env.PUSH.delete(k.name); del++ } else if (r.ok) ok++ } catch (e) {}
    }
    return new Response(JSON.stringify({ ok, del }), { headers: CORS });
  }
  return null;
}
export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (/\/(vapid|sub|notify)$/.test(path)) { const r = await pushRoutes(req, env, path); if (r) return r; }
    if (req.method !== "POST") return new Response("ok");
    if (req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.HOOK_SECRET) return new Response("no", { status: 403 });
    const u = await req.json();
    const m = u.message;
    if (!m || String(m.chat.id) !== String(env.TG_CHAT)) return new Response("ok");
    const tg = (method, body) => fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${method}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const r = await tg("sendMessage", { chat_id: m.chat.id, text: `📥 ${m.document ? m.document.file_name : (m.text || "").split("\n")[0]} diterima, mengantre diproses…` });
    const mid = (await r.json()).result?.message_id;
    await fetch("https://api.github.com/repos/Pakyutu/tap-bbt/dispatches", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.GH_TOKEN}`, "User-Agent": "tap-bbt-worker", Accept: "application/vnd.github+json" },
      body: JSON.stringify({ event_type: "tg", client_payload: { update: u, ack: mid } }),
    });
    return new Response("ok");
  },
};
