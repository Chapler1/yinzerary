# Yinzerary

Your Pittsburgh itinerary - events, a calendar, and farmers markets. Live at
https://yinzerary.com.

This repo is just the website: plain static HTML/CSS/JS with no build step. The event
data in `data/` is written daily by a separate private program and pushed here; the pages
load it in the browser.

- `index.html` - browse and filter every upcoming event
- `farmers-markets.html` - map of area farmers markets
- `assets/` - shared CSS and JS
- `static/` - category placeholder images
- `data/events.json`, `data/farmers_markets.json` - **generated, don't edit by hand**
- `CNAME` - the custom domain

Event details (titles, times, venues) come from the linked sources; each card links back to
the original listing. Info can be out of date - check with the organizer before you go.

## Run locally

Browsers block loading the JSON from `file://`, so serve the folder:

```
python -m http.server 8000
```
then open http://localhost:8000.

## Deploy (GitHub Pages)

1. Create a **public** GitHub repo (e.g. `yinzerary`), then in this folder:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/yinzerary.git
   git push -u origin main
   ```
2. Repo **Settings -> Pages**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`.
3. **Custom domain** (yinzerary.com): in Settings -> Pages enter `yinzerary.com` (the `CNAME`
   file here already says so), then at your domain registrar add DNS records:

   | Type | Host | Value |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `<you>.github.io` |

   DNS can take up to a few hours. When GitHub shows the domain as verified, tick
   **Enforce HTTPS**.
