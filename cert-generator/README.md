# Certificate Generator — Ghaith Al Emarat Volunteering Team

A web app to generate personalized "Proud of UAE" certificates with a custom name overlay.

## Features
- Enter any name and preview the certificate instantly (client-side canvas)
- Download a high-quality PNG via the server API
- Fully responsive — works on mobile and desktop

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel via GitHub

1. **Push this repo to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit — certificate generator"
   git remote add origin https://github.com/YOUR_USERNAME/cert-generator.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com) → New Project
   - Select your GitHub repo
   - Framework: **Next.js** (auto-detected)
   - Click **Deploy** — no env vars needed

3. Vercel will build and deploy automatically. Every push to `main` triggers a new deploy.

## Tech Stack
- **Next.js 14** (App Router)
- **node-canvas** for server-side PNG generation
- **HTML Canvas API** for client-side live preview
