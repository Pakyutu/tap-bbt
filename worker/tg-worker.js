// Cloudflare Worker: terima webhook Telegram -> balas "diterima" seketika -> picu GitHub Actions.
// Secret yang dibutuhkan: TG_TOKEN, TG_CHAT, GH_TOKEN (fine-grained, repo tap-bbt, Actions: read/write), HOOK_SECRET
export default {
  async fetch(req, env) {
    if (req.method !== "POST") return new Response("ok");
    if (req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.HOOK_SECRET) return new Response("no", { status: 403 });
    const u = await req.json();
    const m = u.message;
    if (!m || String(m.chat.id) !== String(env.TG_CHAT)) return new Response("ok");
    const tg = (method, body) => fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${method}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const cmd = /^\/?(mom|soh|sn|outlet|status)\b/i.test(m.text || "");
    if (!m.document && !cmd) {
      await tg("sendMessage", { chat_id: m.chat.id, text: "Kirim FILE, atau perintah: status · sn <nomor> · outlet <id/nama> · mom pv 20 · soh sa 19" });
      return new Response("ok");
    }
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
