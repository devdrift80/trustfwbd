/**
 * random.trustfwbd.com — geo gate (Cloudflare Worker)
 *
 * BD → 302 to BD_REDIRECT_URL (default https://t.ly/syJFH)
 * Everyone else → international HTML on this host
 */

const DEFAULT_BD_URL = "https://t.ly/syJFH";

function resolveUrl(value, fallback) {
  const trimmed = (value ?? "").trim();
  return trimmed || fallback;
}

function internationalPage() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Trust FWBD</title>
  <meta name="description" content="Trust FWBD — international" />
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, sans-serif;
      line-height: 1.5;
      padding: 1.5rem;
      background: #0b1220;
      color: #e8eefc;
    }
    main { max-width: 36rem; text-align: center; }
    h1 {
      font-size: clamp(1.75rem, 4vw, 2.25rem);
      font-weight: 650;
      letter-spacing: -0.02em;
      margin: 0 0 0.75rem;
    }
    p { margin: 0; color: #a9b6d3; font-size: 1.05rem; }
  </style>
</head>
<body>
  <main>
    <h1>Trust FWBD</h1>
    <p>Welcome. You're viewing the international site on random.trustfwbd.com.</p>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
    },
  });
}

export default {
  async fetch(request, env, _ctx) {
    const bdUrl = resolveUrl(env.BD_REDIRECT_URL, DEFAULT_BD_URL);

    const country =
      request.cf && typeof request.cf.country === "string"
        ? request.cf.country.toUpperCase()
        : null;

    try {
      if (country === "BD") {
        return Response.redirect(bdUrl, 302);
      }
      return internationalPage();
    } catch (err) {
      console.error("trustfwbd geo error:", err);
      return internationalPage();
    }
  },
};
