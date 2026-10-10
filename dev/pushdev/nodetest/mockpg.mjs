// postgres.js 흉내: 질의 문장을 보고 미리 정한 답을 돌려줌
export const store = { vault: {}, results: [], calls: [] };
export default function postgres() {
  const sql = async (strings, ...vals) => {
    const q = strings.join("$"); store.calls.push([q.replace(/\s+/g, " ").slice(0, 90), vals.map(v => String(v).slice(0, 40))]);
    if (/from vault\.decrypted_secrets where name = 'kjy_vapid'/.test(q)) return store.vault.kjy_vapid ? [{ s: store.vault.kjy_vapid }] : [];
    if (/from vault\.decrypted_secrets where name = 'kjy_cron_secret'/.test(q)) return [{ s: "cronsecret123" }];
    if (/vault\.create_secret/.test(q)) { if (store.vault.kjy_vapid) throw new Error("duplicate"); store.vault.kjy_vapid = vals[0]; return [{}]; }
    if (/kjy_private\.noti_test/.test(q)) return [{ r: store.testRes }];
    if (/kjy_private\.noti_due/.test(q)) return store.due;
    if (/kjy_private\.noti_result/.test(q)) { store.results.push([vals[0], vals[1]]); return [{}]; }
    throw new Error("unexpected query " + q);
  };
  return sql;
}
