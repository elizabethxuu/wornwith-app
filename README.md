# Worn With Care

Worn With Care is a fashion-tech prototype exploring digital product passports for garments. It brings product information, care guidance, lifecycle storytelling, and sharing into one considered digital experience.

**Live experience:** https://wornwith.care  
**Repository:** https://github.com/elizabethxuu/wornwith-app

> **Prototype notice:** The app may contain illustrative garment details and sustainability metrics for demonstration purposes. Do not treat illustrative data as independently verified product claims.

## What it explores

The application is built around a garment passport and includes interfaces for product information, garment journey and lifecycle, care, environmental information, ownership, storytelling, and passport sharing. The repository also contains server-side API handlers for supported AI features.

Feature availability depends on configuration and deployed environment variables. See the code and deployment settings before assuming an API-backed feature is active in every environment.

## Technology

- React and React DOM
- TypeScript
- Vite
- Tailwind CSS
- Vercel serverless API handlers
- jsPDF for PDF generation
- QR code libraries for passport sharing
- Lucide icons
- Vercel Analytics

The exact dependency versions are maintained in `package.json` and `package-lock.json`.

## Run locally

### Requirements

Install a current Node.js LTS release and npm.

### Setup

```bash
git clone https://github.com/elizabethxuu/wornwith-app.git
cd wornwith-app
npm install
npm run dev
```

Vite prints the local development URL in your terminal.

### Available commands

```bash
npm run dev      # Start the Vite development server
npm run build    # Run TypeScript project checks and create a production build
npm run lint     # Run Oxlint
npm run preview  # Preview the built frontend locally
```

The preview command expects a production build to exist first. Vite's frontend preview does not by itself reproduce the Vercel serverless API runtime.

## Environment variables

Some server-side features require provider credentials configured in the deployment environment. Never commit real credentials or put server-only secrets in client-exposed variables such as `VITE_*`.

For local work, create a private `.env.local` file only when needed. Keep it out of version control. The frontend development server alone does not automatically run the functions in `api/`; use the project's Vercel-compatible local development workflow when testing serverless endpoints.

Check the implementation of each API handler to confirm its current environment variable names and behavior. Configure production variables in Vercel's project settings, not in committed source files.

## Deployment

The project is structured as a Vite frontend with an `api/` directory for Vercel serverless functions. The production domain is https://wornwith.care.

For a deployment:
1. Review the changes on a separate branch.
2. Run `npm run lint` and `npm run build`.
3. Test relevant application flows and API endpoints in a local or preview environment.
4. Review the Vercel preview deployment before promoting changes to production.

A successful frontend build does not prove that external AI services, serverless endpoints, or all interactive flows work in production.

## Data integrity and trust

The prototype should clearly distinguish brand or manufacturer information, owner-contributed records, estimates, and illustrative demo data. Avoid claims of independent verification, regulatory compliance, blockchain anchoring, or brand endorsement unless supported by evidence.

## Contributing and maintenance

Make small, reviewable changes and preserve existing functionality. Do not commit API keys, access tokens, personal data, or generated build output. Use pull requests or a separate branch when testing changes that could affect the live application.

## Brand

Worn With Care by Elizabeth Xu.
