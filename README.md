# Qenovra Labs Website

Static frontend website with Vercel serverless backend endpoints.

## Project Structure

- `index.html` - Main landing page
- `style.css` - Styles
- `script.js` - Frontend behavior and animations
- `api/health.js` - Health check API endpoint
- `api/contact.js` - Contact API endpoint (POST)
- `api/chat.js` - Chatbot reply API endpoint (POST)
- `vercel.json` - Vercel deployment configuration

## Chatbot AI Setup (OpenRouter)

1. Copy `.env.example` to `.env.local`
2. Set `OPENROUTER_API_KEY` in `.env.local`
3. Optional: change `OPENROUTER_MODEL`

Example `.env.local`:

```bash
OPENROUTER_API_KEY=your_real_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=Qenovra Labs Website (Local)
```

For Vercel production:

1. Open your project in Vercel dashboard
2. Go to Settings -> Environment Variables
3. Add `OPENROUTER_API_KEY`
4. Add optional `OPENROUTER_MODEL`, `OPENROUTER_SITE_URL`, `OPENROUTER_SITE_NAME`
5. Redeploy

## Local Run

### Frontend only

```bash
npm run start
```

Open: `http://127.0.0.1:5500`

### Frontend + Backend (Vercel local)

```bash
npm run dev
```

Open: `http://localhost:3000`

API endpoints:
- `GET /api/health`
- `POST /api/contact`
- `POST /api/chat`

Example `POST /api/contact` body:

```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "message": "Hello from Qenovra"
}
```

## GitHub Setup

Run these commands from project root:

```bash
git init
git add .
git commit -m "Initial Qenovra website with Vercel API setup"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Vercel Deployment

### Option 1: Dashboard (recommended)

1. Push code to GitHub.
2. Go to Vercel dashboard.
3. Click Add New Project.
4. Import your GitHub repository.
5. Keep defaults and deploy.

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

## Notes

- This is a static site, so no build step is required.
- Vercel automatically serves static files and `/api/*` serverless functions.
- `.vercel/` and `node_modules/` are ignored via `.gitignore`.
- `.env.local` is ignored, so secret keys are not committed.
