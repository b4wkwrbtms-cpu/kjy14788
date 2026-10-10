let handler = null;
globalThis.Deno = { env: { get: () => "x" }, serve: h => { handler = h; } };
await import("./out/index2.mjs");
const r = await handler(new Request("https://x", { method: "POST", headers: { "x-kjy-cron": "cronsecret123" }, body: JSON.stringify({ mode: "selftest" }) }));
console.log(r.status, await r.text());
const r2 = await handler(new Request("https://x", { method: "POST", body: JSON.stringify({ mode: "selftest" }) }));
console.log(r2.status, await r2.text());
