# Optional participation analytics

Analytics remains disabled in the public starter. To enable it, copy `examples/analytics/analytics.js` to `public/analytics.js`, set your own community hostname(s) and PostHog public ingestion token, and choose the correct ingestion region. Never add a personal API key.

Events: `vote_cast`, `idea_submitted`, `contribution_submitted`, `interest_signed_up`, `demo_clicked`, plus `$pageview`. Form events fire after successful API responses, not button clicks. Signups mean the interest list; votes include changed choices. These are best-effort browser analytics, not authoritative database totals. No form contents, email, contact fields, demo URLs or replay are collected.

Attribution: current-visit `source`, `medium`, `campaign` and safe UTM labels persist through navigation; `first_source`, `first_medium`, `first_campaign` retain the first observed attribution for 30 days. Internal referrals do not overwrite arrival sources. UTM labels accept letters, numbers, underscores and hyphens only; never put personal information in a campaign URL.

Authenticated admin visits exclude the browser automatically. `?analytics_test=1` also persists exclusion on that origin; `?analytics_test=0` explicitly removes it. Automated browsers (webdriver/headless and known crawler user agents), localhost and unlisted hosts, admin paths, DNT and GPC are excluded. Storage clearing resets the browser exclusion. This changes analytics only, not real votes/submissions.

For a one-page ingestion check from an excluded browser, use `?analytics_test=verify&utm_source=qa&utm_medium=test&utm_campaign=participation_verification`; these events carry `is_test=true`. All community charts must filter `tracking_version=3` AND `is_test=false`. Never share diagnostic links publicly. Old traffic cannot be reliably retroclassified.

Configure your own dashboard with totals for the five events; page visitors and participation broken down by `source`; offers by `contribution_kind`; demos by `idea_id`; participation by `campaign`. Do not compare old pageview-only data with newly instrumented participation as though both were measured previously.

Tests: `node verify-analytics.mjs` and `node verify-participation-tracking.mjs`. Both use mocked capture requests; no events or submissions are sent externally.
