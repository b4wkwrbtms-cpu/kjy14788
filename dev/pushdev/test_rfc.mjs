import { encrypt, vapidAuth, b64u, unb64u } from "./webpush.mjs";
import nodeCrypto from "node:crypto";
// 1) RFC 8291 5장 예시와 똑같이 나오는지
const asPriv = "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw", asPub = "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8";
const uaPub = "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4", auth = "BTBZMqHH6r4Tts7J_aSIgg", salt = "DGv6ra1nlYgDCS1FRnbzlw";
const want = "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN";
const pr = unb64u(asPub);
const privateKey = await crypto.subtle.importKey("jwk", { kty: "EC", crv: "P-256", d: asPriv, x: b64u(pr.slice(1, 33)), y: b64u(pr.slice(33)) }, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
const body = await encrypt("When I grow up, I want to be a watermelon", uaPub, auth, { asKeys: { privateKey, publicRaw: pr }, salt: unb64u(salt) });
console.log("RFC 8291 example:", b64u(body) === want ? "MATCH" : "MISMATCH\n" + b64u(body));
// 2) 다른 길(node:crypto)로 직접 풀어 보기: 무작위 키로 암호화 → UA 비밀키로 복호화
const ua = nodeCrypto.createECDH("prime256v1"); ua.generateKeys();
const uaAuth = nodeCrypto.randomBytes(16);
const msg = JSON.stringify({ title: "곽준영 키우기", body: "약속한 시간이에요. 식탁에서 말씀 한 장 펼쳐 볼까요?", url: "./" });
const enc = await encrypt(msg, b64u(ua.getPublicKey()), b64u(uaAuth));
const saltB = enc.slice(0, 16), rs = new DataView(enc.buffer, enc.byteOffset).getUint32(16), idlen = enc[20], asPubB = enc.slice(21, 21 + idlen), ct = enc.slice(21 + idlen);
const ecdh = ua.computeSecret(Buffer.from(asPubB));
const ikm = Buffer.from(nodeCrypto.hkdfSync("sha256", ecdh, uaAuth, Buffer.concat([Buffer.from("WebPush: info\0"), ua.getPublicKey(), Buffer.from(asPubB)]), 32));
const cek = Buffer.from(nodeCrypto.hkdfSync("sha256", ikm, saltB, Buffer.from("Content-Encoding: aes128gcm\0"), 16));
const nonce = Buffer.from(nodeCrypto.hkdfSync("sha256", ikm, saltB, Buffer.from("Content-Encoding: nonce\0"), 12));
const dec = nodeCrypto.createDecipheriv("aes-128-gcm", cek, nonce); dec.setAuthTag(Buffer.from(ct.slice(ct.length - 16)));
const pt = Buffer.concat([dec.update(Buffer.from(ct.slice(0, ct.length - 16))), dec.final()]);
console.log("node:crypto decrypt:", rs, idlen, pt[pt.length - 1] === 2 && pt.slice(0, -1).toString() === msg ? "MATCH" : "MISMATCH");
// 3) VAPID: 키 만들고 서명 → node:crypto 로 검증
const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey), pub = b64u(await crypto.subtle.exportKey("raw", kp.publicKey));
const hdr = await vapidAuth("https://web.push.apple.com/QABC123", jwk, pub, "https://b4wkwrbtms-cpu.github.io/kjy14788/");
const m = /^vapid t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)$/.exec(hdr);
const pubKeyObj = nodeCrypto.createPublicKey({ key: { kty: "EC", crv: "P-256", x: jwk.x, y: jwk.y }, format: "jwk" });
const ok = nodeCrypto.verify("sha256", Buffer.from(m[1] + "." + m[2]), { key: pubKeyObj, dsaEncoding: "ieee-p1363" }, Buffer.from(unb64u(m[3])));
console.log("VAPID verify:", ok ? "OK" : "FAIL", JSON.parse(Buffer.from(unb64u(m[2])).toString()), "k matches:", m[4] === pub, "k len", unb64u(pub).length);
