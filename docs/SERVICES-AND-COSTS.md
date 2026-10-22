# Services, ownership and cost boundaries

Checked October 20, 2026. Prices are vendor limits, not a guarantee that this hosted account has free capacity. No new paid plan was purchased. Project operators own their service accounts and credentials; never borrow Jackson's production keys for a fork.

| Component | Current use | Free allowance / paid trigger | Replacement / export |
|---|---|---|---|
| Sites | Current deployment and trusted owner sign-in | Existing account entitlement; no separate “unlimited free hosting” claim | Source export provided; identity and hosting adapters are platform-specific |
| Cloudflare Workers / D1 | Worker runtime and durable SQL storage through Sites | Direct Workers Free advertises 100,000 requests/day; D1 Free 5m rows read/day, 100k rows written/day, 5GB total. CPU limits can make a direct free deployment unsuitable. Sites quotas/billing are separate | Export SQL; evaluate a direct Workers deployment and auth adapter independently |
| GitHub | Public source repository | Public repository; Actions/package usage has separate limits | Standard Git clone |
| Resend | Implemented notification adapter, not configured live | Free: 3,000 emails/month and 100/day. Pro shown at $20/month for 50k emails; verify current rates before upgrade | Swap `app/notifications.ts`; outbox data stays in D1 |
| PostHog | Existing Sacramento pageview analytics | Existing project/account; check dashboard usage rather than assuming remaining free quota | Disabled in reusable export; can replace or omit analytics |
| AI/search | Initial research performed during development; no runtime adapter enabled | No automated model/search API spend. Select provider and caps before activation | Curated JSON directory and portable reports |
| SMS | Proposed only for SMS Resource Finder | No number or messaging service purchased. Expect number, registration, carrier and per-message charges | Web simulation first; provider choice deferred |
| Public data | Linked official sources | NWS documentation and AirNow public access; account/usage/attribution conditions still apply | Link to authoritative services and cache permitted data with provenance |

Primary pricing references: [Cloudflare Workers](https://developers.cloudflare.com/workers/platform/pricing/), [D1](https://developers.cloudflare.com/d1/platform/pricing/), [Resend](https://resend.com/pricing). These published direct-service prices do not override Sites terms. Keep dependencies' licenses and notices; open-source software does not mean every managed service is free.

## Before enabling paid research

Record provider/account owner, model/search tool, estimated cost per run, maximum sources/tokens, per-day and monthly ceiling, retry limit, and a stop condition. Anonymous submissions must not create unlimited paid work. Start with owner-triggered runs or a tightly capped queue, not unbounded calls from public POST requests.
