/**
 * Pages Function middleware — runs on every request to this Pages project.
 *
 * BD → 302 to BD_REDIRECT_URL (default https://t.ly/syJFH)
 * Everyone else → continue to static files (public/)
 *
 * Set BD_REDIRECT_URL in:
 *   Pages → project → Settings → Environment variables
 */

const DEFAULT_BD_URL = "https://t.ly/syJFH";

/**
 * @param {EventContext} context
 */
export async function onRequest(context) {
  const { request, env, next } = context;

  const bdUrl = (env.BD_REDIRECT_URL || "").trim() || DEFAULT_BD_URL;

  const country =
    request.cf && typeof request.cf.country === "string"
      ? request.cf.country.toUpperCase()
      : null;

  if (country === "BD") {
    return Response.redirect(bdUrl, 302);
  }

  // International (or missing cf): serve static assets from /public
  return next();
}
