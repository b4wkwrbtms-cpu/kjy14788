// Web Push (RFC 8291 aes128gcm + RFC 8292 VAPID) — WebCrypto만 씀 (Node·Deno 공용)
const te = new TextEncoder();
export function b64u(buf) { const b = new Uint8Array(buf); let s = ""; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
export function unb64u(s) { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function cat(...a) { const n = a.reduce((t, x) => t + x.length, 0), o = new Uint8Array(n); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; }
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}
export async function encrypt(payload, uaPublicB64, authB64, opts = {}) {
  const uaPub = unb64u(uaPublicB64), auth = unb64u(authB64);
  if (uaPub.length !== 65 || uaPub[0] !== 4 || auth.length < 16) throw new Error("bad subscription keys");
  let as = opts.asKeys;
  if (!as) {
    const kp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
    as = { privateKey: kp.privateKey, publicRaw: new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey)) };
  }
  const uaKey = await crypto.subtle.importKey("raw", uaPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(auth, ecdh, cat(te.encode("WebPush: info\0"), uaPub, as.publicRaw), 32);
  const salt = opts.salt || crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const plain = cat(typeof payload === "string" ? te.encode(payload) : payload, new Uint8Array([2]));
  if (plain.length + 16 + 86 > 4096) throw new Error("payload too large");
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, plain));
  const hdr = new Uint8Array(21 + as.publicRaw.length);
  hdr.set(salt, 0); new DataView(hdr.buffer).setUint32(16, 4096); hdr[20] = as.publicRaw.length; hdr.set(as.publicRaw, 21);
  return cat(hdr, ct);
}
export async function vapidAuth(endpoint, jwk, pubB64, sub, now) {
  const aud = new URL(endpoint).origin, t = Math.floor((now || Date.now()) / 1000);
  const h = b64u(te.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const p = b64u(te.encode(JSON.stringify({ aud, exp: t + 3000, sub })));
  const key = await crypto.subtle.importKey("jwk", { kty: "EC", crv: "P-256", d: jwk.d, x: jwk.x, y: jwk.y, ext: true }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, te.encode(h + "." + p)));
  return `vapid t=${h}.${p}.${b64u(sig)}, k=${pubB64}`;
}
export async function sendPush(sub, payload, cfg) {
  const body = await encrypt(payload, sub.p256dh, sub.auth);
  const r = await fetch(sub.endpoint, { method: "POST", body, headers: {
    Authorization: await vapidAuth(sub.endpoint, cfg.jwk, cfg.pub, cfg.sub), TTL: String(cfg.ttl || 3600),
    "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", Urgency: cfg.urgency || "normal" } });
  let text = ""; try { text = r.ok ? "" : (await r.text()).slice(0, 200); } catch (e) {}
  return { status: r.status, text };
}
