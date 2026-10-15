// ハヤトへ暮らしの記録を渡す小さな部品（2026-10-15）
// ATLAS・計量KEIRYO・賃管特訓は、ハヤトの入口と同じ場所(toshi5128.github.io)にあるので、記録と合言葉が同じ箱に入っている。
// これまでは「ハヤトの入口を開いた時」しか送れず、ほぼ届いていなかった → 各アプリを開いた時・閉じる時に、変わっていれば送る。
// 合言葉が無い端末（ハヤトを一度も開いていない）では何もしない。記録はPCのハヤトにだけ送る（ntfyにはURLを読みに行くだけ）。
(() => {
  const TOPIC = "hayato-url-3218359548";
  const KEYS = ["gym_logs_v2", "gym_exercises_v2", "gym_bw_v1", "gym_meas_v1", "gym_dayinfo_v1", "gym_meals_v1", "gym_drinks_v1",
    "gym_supps_v1", "gym_program_v1", "gym_settings_v1", "keiryo.v1", "chinkan.v1"];
  const get = k => { try { return localStorage.getItem(k) || ""; } catch { return ""; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  let busy = false, last = 0;

  async function hayatoUrl() {
    const c = get("hayato_url_cache"), at = +get("hayato_url_at") || 0;
    if (c && Date.now() - at < 30 * 60 * 1000) return c;
    const t = await (await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=24h`)).text();
    const urls = t.trim().split("\n").map(l => { try { return JSON.parse(l).message; } catch { return ""; } })
      .filter(u => /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(u || ""));
    const u = urls[urls.length - 1] || "";
    if (u) { set("hayato_url_cache", u); set("hayato_url_at", String(Date.now())); }
    return u;
  }

  async function send(why) {
    const key = get("hayato_key");
    if (!key || busy || (why !== "close" && Date.now() - last < 60 * 1000)) return;
    const body = {};
    for (const k of KEYS) { const v = get(k); if (v) body[k] = v; }
    if (!Object.keys(body).length) return;
    const json = JSON.stringify(body);
    const sig = json.length + ":" + json.slice(-200);
    if (get("hayato_life_sig") === sig) return;  // 前回から変わっていなければ送らない
    busy = true; last = Date.now();
    try {
      let url = await hayatoUrl();
      for (let i = 0; i < 2 && url; i++) {
        try {
          const r = await fetch(url + "/api/life?from=" + encodeURIComponent(location.pathname.split("/")[1] || "") + "&why=" + why,
            { method: "POST", headers: { "X-Key": key, "Content-Type": "application/json" }, body: json });
          if (r.ok) { set("hayato_life_sig", sig); break; }
        } catch {}
        set("hayato_url_at", "0"); url = await hayatoUrl();  // URLが変わっていたかもしれない → 読み直して1回だけやり直す
      }
    } catch {} finally { busy = false; }
  }

  window.addEventListener("load", () => setTimeout(() => send("open"), 4000));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") send("close"); });
  setInterval(() => { if (document.visibilityState === "visible") send("tick"); }, 10 * 60 * 1000);
})();
