# Idea Hub Sac

Public source edition of the Sacramento pilot at [ideahubsac.org](https://ideahubsac.org).

[Live Sacramento board](https://ideahubsac.org) · [Get involved](https://ideahubsac.org/join) · [Project directory](https://github.com/jackson-harris-iii/idea-hub-projects)

## What is here

- Open idea submission and an informal, most-voted-first community poll.
- A participation wizard for solutions, skills, resources and funding interest.
- Private owner moderation and optional private contact details.
- A consent-based interest list and private follow-up inbox.
- Project showcase, presentation screen, original hackathon guide and slides.
- Dated research examples and curated resource matching.
- Optional email notification outbox; no live email provider or paid research enabled by default.

Based on deployed Sacramento version 10. This is a redistributable source edition, not a byte-for-byte production backup: production identity, analytics, redirects, artwork and live QR codes are deliberately excluded.

## Run and contribute

Use Node 22.13+ and `npm run install:ci`. Follow [setup and deployment](docs/DEPLOYMENT.md) before starting the local preview.

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Read [CONTRIBUTING.md](CONTRIBUTING.md), [ROADMAP.md](ROADMAP.md), [governance](GOVERNANCE.md), [security reporting](SECURITY.md) and [license scope](NOTICE.md). Non-code help is welcome: test a setup, improve instructions, verify a resource or explain a local need.

## Hosting and privacy

The live board runs through Sites on Workers/D1. **GitHub pushes do not deploy the live site.** Operators must review and publish through Sites. Other hosts require a verified authentication adapter; never trust arbitrary incoming identity headers.

No production database, private submissions, tokens, account email, Site ID or analytics project is included. Public export analytics is off. Admin access fails closed until the operator explicitly opts into the trusted Sites dispatcher. Logos and project screenshots use placeholders; add artwork you have permission to use and regenerate QR codes for your own domain.

## Relationship to other repositories

- [idea-hub](https://github.com/jackson-harris-iii/idea-hub): shared starting point and general improvements.
- [ideahub-sac](https://github.com/jackson-harris-iii/ideahub-sac): Sacramento-specific copy and deployment edition.
- [idea-hub-projects](https://github.com/jackson-harris-iii/idea-hub-projects): links, maintainers and license status for community projects.

These are separate initial editions, not a published shared package with automatic upgrades. Reusable fixes go to `idea-hub` first and are manually reviewed for the Sacramento edition. The older `community-resource-board` repository remains available as the original prototype.
