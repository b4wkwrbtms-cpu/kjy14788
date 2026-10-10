import nodeCrypto from "node:crypto";
import { store } from "./out/mockpg.mjs";
let handler = null;
globalThis.Deno = { env: { get: k => (k === "SUPABASE_DB_URL" ? "postgres://x" : undefined) }, serve: h => { handler = h; } };
const sent = [];
globalThis.fetch = async (url, init) => { sent.push({ url, init }); return new Response("", { status: url.includes("gone") ? 410 : 201 }); };
await import("./out/index.mjs");
const call = async (body, headers = {}) => { const r = await handler(new Request("https://x/functions/v1/kjy-noti", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) })); return [r.status, await r.json()]; };
// UA(브라우저) 키
const mkUA = () => { const ua = nodeCrypto.createECDH("prime256v1"); ua.generateKeys(); const auth = nodeCrypto.randomBytes(16); return { ua, auth, p256dh: ua.getPublicKey().toString("base64url"), authB: auth.toString("base64url") }; };
const A = mkUA(), B = mkUA();
const decrypt = (U, buf) => {
  const enc = new Uint8Array(buf); const salt = enc.slice(0, 16), idlen = enc[20], asPub = enc.slice(21, 21 + idlen), ct = enc.slice(21 + idlen);
  const ecdh = U.ua.computeSecret(Buffer.from(asPub));
  const ikm = Buffer.from(nodeCrypto.hkdfSync("sha256", ecdh, U.auth, Buffer.concat([Buffer.from("WebPush: info\0"), U.ua.getPublicKey(), Buffer.from(asPub)]), 32));
  const cek = Buffer.from(nodeCrypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\0"), 16));
  const nonce = Buffer.from(nodeCrypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\0"), 12));
  const d = nodeCrypto.createDecipheriv("aes-128-gcm", cek, nonce); d.setAuthTag(Buffer.from(ct.slice(ct.length - 16)));
  const pt = Buffer.concat([d.update(Buffer.from(ct.slice(0, -16))), d.final()]); return pt.slice(0, -1).toString();
};
// 1) key
const [s1, k1] = await call({ mode: "key" }); console.log("key", s1, k1.ok, k1.key && k1.key.length, "| vault stored", !!store.vault.kjy_vapid);
const [, k2] = await call({ mode: "key" }); console.log("key again same", k1.key === k2.key);
// 2) tick without / wrong secret
console.log("tick no header", (await call({ mode: "tick" }))[0], "| wrong", (await call({ mode: "tick" }, { "x-kjy-cron": "nope" }))[0]);
// 3) test: auth fail · ok
store.testRes = { ok: false, err: "auth" }; console.log("test auth", JSON.stringify((await call({ mode: "test", id: "a", token: "b" }))[1]));
store.testRes = { ok: true, subs: [{ endpoint: "https://web.push.apple.com/QAbc", p256dh: A.p256dh, auth: A.authB }, { endpoint: "https://evil.example.com/x", p256dh: B.p256dh, auth: B.authB }] };
const [st3, r3] = await call({ mode: "test", id: "a", token: "b" }); console.log("test ok", st3, JSON.stringify(r3), "| fetched", sent.map(s => s.url), "| results", JSON.stringify(store.results));
const m = sent[0]; const h = m.init.headers;
console.log("headers", JSON.stringify({ ce: h["Content-Encoding"], ct: h["Content-Type"], ttl: h.TTL, urg: h.Urgency }), "| payload", decrypt(A, m.init.body));
const auth = /^vapid t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)$/.exec(h.Authorization);
const pub = Buffer.from(k1.key, "base64url"); const x = pub.slice(1, 33).toString("base64url"), y = pub.slice(33).toString("base64url");
const ok = nodeCrypto.verify("sha256", Buffer.from(auth[1] + "." + auth[2]), { key: nodeCrypto.createPublicKey({ key: { kty: "EC", crv: "P-256", x, y }, format: "jwk" }), dsaEncoding: "ieee-p1363" }, Buffer.from(auth[3], "base64url"));
console.log("vapid sig", ok ? "OK" : "FAIL", JSON.parse(Buffer.from(auth[2], "base64url").toString()), "k==key", auth[4] === k1.key);
// 4) tick with secret: two due rows, one gone
sent.length = 0; store.results.length = 0;
store.due = [{ player_id: "p", endpoint: "https://fcm.googleapis.com/fcm/send/abc", p256dh: B.p256dh, auth: B.authB, title: "말씀 읽을 시간이에요", body: "한 장이면 충분해요. 지금 펼쳐 볼까요?" }, { player_id: "p", endpoint: "https://web.push.apple.com/gone", p256dh: A.p256dh, auth: A.authB, title: "t", body: "b" }];
const [st4, r4] = await call({ mode: "tick" }, { "x-kjy-cron": "cronsecret123" }); console.log("tick", st4, JSON.stringify(r4), "| results", JSON.stringify(store.results));
console.log("tick payload", decrypt(B, sent.find(s => s.url.includes("fcm")).init.body));
store.due = []; console.log("tick empty", JSON.stringify((await call({ mode: "tick" }, { "x-kjy-cron": "cronsecret123" }))[1]));
// 5) options / bad body / bad mode
const o = await handler(new Request("https://x", { method: "OPTIONS" })); console.log("options", o.status, o.headers.get("access-control-allow-headers"));
const bad = await handler(new Request("https://x", { method: "POST", body: "{" })); console.log("bad body", bad.status);
console.log("bad mode", (await call({ mode: "zzz" }))[0], "| GET", (await handler(new Request("https://x", { method: "GET" }))).status);
