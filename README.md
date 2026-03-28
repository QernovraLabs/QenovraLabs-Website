# Qenovra Lab Website

Static frontend website with Vercel serverless backend endpoints.

## Project Structure

- `index.html` - Main landing page
- `style.css` - Styles
- `script.js` - Frontend behavior and animations
- `api/health.js` - Health check API endpoint
- `api/contact.js` - Contact API endpoint (POST)
- `vercel.json` - Vercel deployment configuration

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
