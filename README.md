# random.trustfwbd.com — Cloudflare Pages (static + geo)

**You manage the international page as a normal static site** in Cloudflare **Workers & Pages**.  
Bangladesh visitors are redirected away by a small Pages Function.

| | |
|--|--|
| **URL** | `https://random.trustfwbd.com` |
| **Pages project name** | `trustfwbd` |
| **Static files** | `public/` (edit `public/index.html`) |
| **BD redirect** | `functions/_middleware.js` + env `BD_REDIRECT_URL` |
| **Repo** | `/opt/data/empire/sites/geo-redirect` |

| Visitor | Result |
|---------|--------|
| **BD** | 302 → `https://t.ly/syJFH` (change via `BD_REDIRECT_URL`) |
| **Everyone else** | Static page from `public/` |

---

## Fix build error: `npx wrangler deploy` / Missing entry-point

Cloudflare Pages **Git** builds must **not** run `wrangler deploy` (that is for Workers).

In the dashboard: **Workers & Pages** → **trustfwbd** → **Settings** → **Builds & deployments** (or **Build configuration**):

| Setting | Correct value |
|--------|----------------|
| Framework preset | **None** |
| Build command | **empty** (clear it) |
| **Deploy command** | **empty** (delete `npx wrangler deploy`) |
| Build output directory | `public` |
| Root directory | `/` |

Also set **Environment variable** (Production): `BD_REDIRECT_URL` = `https://t.ly/syJFH`

Then **Retry deployment** (or push a new commit).

Pages will publish `public/` and automatically include `functions/_middleware.js` for BD geo. No `wrangler deploy` step.

---

## A) Steps in Cloudflare dashboard (create Pages + domain)

Do this once in the browser.

### 1. Open Workers & Pages

1. Log in: [https://dash.cloudflare.com](https://dash.cloudflare.com)  
2. Select the account that owns zone **trustfwbd.com**  
3. Left sidebar: **Workers & Pages**

### 2. Create a Pages project (direct upload — easiest)

1. **Create application** → **Pages** → **Upload assets** (or **Create project** → **Upload assets**)  
2. **Project name:** `trustfwbd`  
3. Upload the contents of the local `public/` folder  
   - Minimum: `index.html`  
   - You can drag-and-drop `public/index.html` for a first deploy  
4. **Deploy site**

> Later deploys can stay “upload” in the UI, or use the CLI (`npm run deploy`) from this repo so `functions/` (geo) is included.

**Important:** Dashboard “upload assets” alone may **not** upload `functions/`.  
For BD geo redirect, either:

- Connect this folder via **Git** (GitHub) so both `public/` and `functions/` deploy, **or**  
- Deploy from this server with Wrangler (section B below)

### 3. Production env var (BD URL)

1. Workers & Pages → project **trustfwbd** → **Settings** → **Environment variables**  
2. Production → **Add**:  
   - Name: `BD_REDIRECT_URL`  
   - Value: `https://t.ly/syJFH`  
3. Save (redeploy if Cloudflare asks)

### 4. Attach custom domain `random.trustfwbd.com`

1. Project **trustfwbd** → **Custom domains** (or **Custom domain**)  
2. **Set up a domain** → enter `random.trustfwbd.com`  
3. Cloudflare will create/fix DNS on zone **trustfwbd.com** (proxied)  
4. Wait until status is **Active**

### 5. Check

- Browser: `https://random.trustfwbd.com` → international HTML  
- From BD (or VPN): should **302** to t.ly  

---

## B) Steps on this server (edit static page + deploy with geo)

### 1. Go to project

```bash
cd /opt/data/empire/sites/geo-redirect
```

### 2. Edit the static international page

```bash
# edit with nano/vim/editor
nano public/index.html
```

Change title, text, CSS — normal HTML. Save.

### 3. (Optional) change BD destination

- Dashboard env `BD_REDIRECT_URL`, **or**  
- `wrangler.toml` `[vars]`, **or**  
- fallback in `functions/_middleware.js` → `DEFAULT_BD_URL`

### 4. Install (first time)

```bash
npm install
```

### 5. Preview locally

```bash
npm run dev
```

Open the localhost URL Wrangler prints. You should see `public/index.html`.  
(Geo may not apply fully in local dev.)

### 6. Deploy to Pages (includes `public` + `functions`)

Needs API token with **Cloudflare Pages** + **Account** permissions (or `npx wrangler login`):

```bash
npm run deploy
```

First time, Wrangler may create project `trustfwbd` if it does not exist.

### 7. Confirm live

```bash
curl -sI https://random.trustfwbd.com | head
curl -s https://random.trustfwbd.com | head -20
```

---

## C) Day-to-day (easiest mental model)

| Goal | What you do |
|------|-------------|
| Change international look/copy | Edit `public/index.html` → `npm run deploy` **or** re-upload in dashboard |
| Change BD link | Pages → Settings → `BD_REDIRECT_URL` (or redeploy with new var) |
| Domain / SSL | Pages → Custom domains → `random.trustfwbd.com` |
| Add more static pages | Drop files in `public/` (e.g. `public/about.html`) → deploy |

---

## Project layout

```
geo-redirect/
├── public/
│   └── index.html          ← YOUR static site (edit this)
├── functions/
│   └── _middleware.js      ← BD geo 302 only
├── wrangler.toml
├── package.json
└── README.md
```

Old Worker-only entry `src/index.js` is obsolete for this setup; use Pages + `public/`.

---

## Token permissions (if CLI deploy fails)

API token should include roughly:

- Account → Cloudflare Pages → Edit  
- Account → Workers Scripts → Edit (sometimes required by Wrangler)  
- Zone → DNS → Edit (if CLI/dashboard sets the domain)

Or use **Wrangler login** OAuth in an interactive browser session.

---

## Summary

1. **Dashboard:** Workers & Pages → create **trustfwbd** → attach **random.trustfwbd.com** → set `BD_REDIRECT_URL`  
2. **Files:** edit **`public/index.html`** for the international page  
3. **Deploy with geo:** from this folder, `npm run deploy` (so `functions/` ships with the site)
