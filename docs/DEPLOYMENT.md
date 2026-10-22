# Setup and deployment

## Local preview

Use Node 22.13+ and run `npm run install:ci`, then `npm run build`. Initialize an empty local D1 database with each of the three files in `drizzle/`, in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_magenta_power_pack.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_serious_crystal.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_noisy_madame_web.sql
```

For **local testing only**, create ignored `.dev.vars`:

```text
ADMIN_EMAIL=seedy@sites.test
TRUST_SITES_IDENTITY=true
```

Run `npm run dev -- --port 18766 --hostname 127.0.0.1`. The preview's mock login is for local use only. Never expose the dev server publicly.

## A new Sites deployment

Use the Sites plugin's template-source workflow to create a new Site and database from this checkout. Configure your own ADMIN_EMAIL and explicitly set TRUST_SITES_IDENTITY=true only behind the trusted Sites dispatcher. Never reuse the Sacramento Site ID, database or keys. Apply all three migrations to the new deployment through the supported deployment workflow.

Set your domain and community settings in app/community.config.ts, app/layout.tsx and app/SharePanel.tsx. Review all app copy, about-page credits, ideas.json, community-builds.json, research files and the serialized guide. City configuration is not fully centralized yet. Replace placeholders with authorized artwork and generate and decode QR codes for the new address. Analytics is off until you explicitly add your own setup.

RESEND_API_KEY and NOTIFICATION_FROM enable the optional mail adapter when a sender is verified. The demo has no provider configured. Keep all secrets in the host's server environment, never Git.

## Production relationship

These public repositories are source editions; a push does not automatically publish to ideahubsac.org. The operator reviews changes and deploys through Sites. Production retains its own authorized artwork, identity, analytics and domain behavior. The Sacramento domain redirect module is omitted from forks intentionally.

Direct Workers or Vercel deployments are not supported out of the box. Workers needs deployment bindings and verified auth; Vercel also needs a replacement for the Workers/D1 runtime. Do not deploy this adapter on an unprotected host.

## Tests

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Historical browser checks are under tests/pilot-reference and need adaptation before use; they are not the default suite. Never aim write tests at production.
