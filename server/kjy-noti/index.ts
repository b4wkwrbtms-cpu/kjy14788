// kjy-noti: 곽준영 키우기 '읽을 때와 곳' 알림 (웹 푸시 · RFC 8291 aes128gcm + RFC 8292 VAPID)
// mode "key"  : VAPID 공개키 (처음 부르면 금고에 키를 만들어 둠)
// mode "test" : 로그인 확인 뒤 이 계정의 기기에 시험 알림 (30초에 한 번)
// mode "tick" : 5분마다 pg_cron 이 부름 (x-kjy-cron 머리글 = 금고의 kjy_cron_secret) → 지금 보낼 알림을 보냄
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 2, idle_timeout: 20, connect_timeout: 10 });
const SUB = "https://b4wkwrbtms-cpu.github.io/kjy14788/";
const HOST_OK = /^(web\.push\.apple\.com|fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9-]+\.notify\.windows\.com)$/;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info, x-kjy-cron",
};
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

/* ---------- 웹 푸시 암호화 (WebCrypto만) ---------- */
const te = new TextEncoder();
function b64u(buf: ArrayBuffer | Uint8Array) { const b = new Uint8Array(buf); let s = ""; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function unb64u(s: string) { s = String(s).replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, ""); while (s.length % 4) s += "="; const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function cat(...a: Uint8Array[]) { const n = a.reduce((t, x) => t + x.length, 0), o = new Uint8Array(n); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; }
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}
async function encrypt(payload: string, uaPublicB64: string, authB64: string) {
  const uaPub = unb64u(uaPublicB64), auth = unb64u(authB64);
  if (uaPub.length !== 65 || uaPub[0] !== 4 || auth.length < 16) throw new Error("bad subscription keys");
  const kp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]) as CryptoKeyPair;
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, kp.privateKey, 256));
  const ikm = await hkdf(auth, ecdh, cat(te.encode("WebPush: info\0"), uaPub, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const plain = cat(te.encode(payload), new Uint8Array([2]));
  if (plain.length + 16 + 86 > 4096) throw new Error("payload too large");
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, plain));
  const hdr = new Uint8Array(21 + asPub.length);
  hdr.set(salt, 0); new DataView(hdr.buffer).setUint32(16, 4096); hdr[20] = asPub.length; hdr.set(asPub, 21);
  return cat(hdr, ct);
}
type Vapid = { jwk: { x: string; y: string; d: string }; pub: string };
async function vapidAuth(endpoint: string, v: Vapid) {
  const aud = new URL(endpoint).origin, t = Math.floor(Date.now() / 1000);
  const h = b64u(te.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const p = b64u(te.encode(JSON.stringify({ aud, exp: t + 3000, sub: SUB })));
  const key = await crypto.subtle.importKey("jwk", { kty: "EC", crv: "P-256", d: v.jwk.d, x: v.jwk.x, y: v.jwk.y, ext: true }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, te.encode(h + "." + p)));
  return `vapid t=${h}.${p}.${b64u(sig)}, k=${v.pub}`;
}
type Sub = { endpoint: string; p256dh: string; auth: string };
async function sendPush(s: Sub, payload: string, v: Vapid) {
  let host = ""; try { const u = new URL(s.endpoint); host = u.protocol === "https:" ? u.hostname : ""; } catch (_) { /* 잘못된 주소 */ }
  if (!HOST_OK.test(host)) return 410;
  const body = await encrypt(payload, s.p256dh, s.auth);
  const r = await fetch(s.endpoint, { method: "POST", body, headers: {
    Authorization: await vapidAuth(s.endpoint, v), TTL: "3600", Urgency: "normal",
    "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream" } });
  try { await r.body?.cancel(); } catch (_) { /* 본문은 쓰지 않음 */ }
  return r.status;
}

/* ---------- 키 · 비밀 (금고) ---------- */
let vapidCache: Vapid | null = null, cronCache = "";
async function vapid(): Promise<Vapid> {
  if (vapidCache) return vapidCache;
  const read = async () => { const r = await sql`select decrypted_secret as s from vault.decrypted_secrets where name = 'kjy_vapid'`; return r.length ? JSON.parse(r[0].s) as Vapid : null; };
  let v = await read();
  if (!v) {
    const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]) as CryptoKeyPair;
    const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey) as JsonWebKey;
    const fresh: Vapid = { jwk: { x: jwk.x!, y: jwk.y!, d: jwk.d! }, pub: b64u(await crypto.subtle.exportKey("raw", kp.publicKey)) };
    try { await sql`select vault.create_secret(${JSON.stringify(fresh)}, 'kjy_vapid', 'kjy-noti 웹 푸시 VAPID 키')`; } catch (_) { /* 동시에 만들었으면 먼저 만든 키를 씀 */ }
    v = await read();
  }
  if (!v || !v.pub || !v.jwk || !v.jwk.d) throw new Error("vapid");
  vapidCache = v; return v;
}
async function cronSecret() {
  if (cronCache) return cronCache;
  const r = await sql`select decrypted_secret as s from vault.decrypted_secrets where name = 'kjy_cron_secret'`;
  cronCache = r.length ? String(r[0].s) : ""; return cronCache;
}
function sameText(a: string, b: string) { if (!a || !b || a.length !== b.length) return false; let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i); return x === 0; }

/* ---------- 요청 ---------- */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ ok: false, err: "method" }, 405);
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch (_) { return json({ ok: false, err: "body" }, 400); }
  try {
    if (b.mode === "key") { const v = await vapid(); return json({ ok: true, key: v.pub }); }
    if (b.mode === "test") {
      const id = String(b.id || "").slice(0, 40), token = String(b.token || "").slice(0, 200);
      const [r] = await sql`select kjy_private.noti_test(${id}, ${token}) as r`;
      const res = r.r as { ok: boolean; err?: string; subs?: Sub[] };
      if (!res.ok) return json({ ok: false, err: res.err || "fail" });
      const v = await vapid();
      const payload = JSON.stringify({ title: "알림 시험", body: "이렇게 와요 · 정한 시간에, 아직 말씀을 안 읽은 날만 알려 드려요", url: "./?go=bible", tag: "kjy-test" });
      let sent = 0;
      for (const s of res.subs || []) { try { const st = await sendPush(s, payload, v); await sql`select kjy_private.noti_result(${s.endpoint}, ${st})`; if (st >= 200 && st < 300) sent++; } catch (_) { /* 다음 기기 */ } }
      return json({ ok: sent > 0, err: sent > 0 ? undefined : "send", sent });
    }
    if (b.mode === "tick") {
      const want = await cronSecret();
      if (!sameText(req.headers.get("x-kjy-cron") || "", want)) return json({ ok: false, err: "auth" }, 401);
      const due = await sql`select * from kjy_private.noti_due(now())`;
      if (!due.length) return json({ ok: true, sent: 0 });
      const v = await vapid();
      let sent = 0;
      await Promise.all(due.map(async (d) => {
        const payload = JSON.stringify({ title: d.title, body: d.body, url: "./?go=bible", tag: "kjy-read" });
        try { const st = await sendPush(d as unknown as Sub, payload, v); await sql`select kjy_private.noti_result(${d.endpoint}, ${st})`; if (st >= 200 && st < 300) sent++; }
        catch (_) { try { await sql`select kjy_private.noti_result(${d.endpoint}, ${0})`; } catch (_e) { /* 무시 */ } }
      }));
      return json({ ok: true, sent, due: due.length });
    }
    return json({ ok: false, err: "mode" }, 400);
  } catch (_) {
    return json({ ok: false, err: "server" }, 500);
  }
});
