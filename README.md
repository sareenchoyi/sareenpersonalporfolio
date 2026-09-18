# Sareen Choyi — Portfolio

Two static, dependency-free pages:

- [`index.html`](./index.html) — blueprint/schematic-themed portfolio (site root, `/`)
- [`arcade.html`](./arcade.html) — retro arcade-game themed portfolio (`/arcade`)
- [`agent-wallet.html`](./agent-wallet.html) — SpendOS case study (`/agent-wallet`)

No build step, no framework, no npm dependencies. Both pages pull fonts from Google
Fonts over a CDN `<link>` and are otherwise self-contained HTML/CSS/JS.

## Local preview

From this directory:

```
npx serve .
```

Then open the printed URL (usually `http://localhost:3000`) for `index.html`,
or `http://localhost:3000/arcade.html` for the arcade page.

## Routing on Vercel

`vercel.json` sets `"cleanUrls": true`, so once deployed:

- `/` → `index.html`
- `/arcade` → `arcade.html` (the `.html` URL redirects to the clean one)
- `/agent-wallet` → `agent-wallet.html` (the `.html` URL redirects to the clean one)

No other config is needed — this is otherwise a zero-config static deploy.

## Deploying

Install the Vercel CLI and log in (one-time):

```
npm install -g vercel
vercel login
```

From this project directory, deploy a preview:

```
vercel
```

This prints a preview URL you can share/test without affecting production.

When you're happy with it, promote to production:

```
vercel --prod
```

Subsequent `vercel --prod` runs redeploy production directly; `vercel` alone always
creates a new preview deployment.
