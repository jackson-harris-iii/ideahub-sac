# Running the community board

## Demo policy

Anyone can browse, vote, submit a new idea, suggest a solution, or offer resources/funding interest without creating an account. One changeable vote is stored per browser cookie for 30 days. This is an informal signal, not proof of unique people or residency. Clearing cookies bypasses browser-level limits. Contributions have a five-per-hour browser limit; new ideas retain three per hour. Public launch beyond this small demo needs edge-level abuse controls and a retention policy.

Open `/admin` and sign in with the configured owner account. Review both queues: **Submissions** for new ideas and **Community offers & solutions** for support, solutions, resources and funding. Approve only text suitable for public display. Reject or return to pending to hide it. Removing a parent idea also hides its contributions from the public API. Votes remain stored, so reapproving an idea restores its count. Contact fields are never returned by the public API. The dashboard includes current vote rankings, curated-resource matches and email status. Its first release shows the latest 500 contributions/reports and 100 email jobs; larger communities need pagination.

Funding offers are expressions of interest only. No payments, binding pledges, tax receipts or verified awards are created. People can share an email privately to the owner for follow-up; this does not subscribe them to marketing. Do not publish contact information copied into description fields. Moderation status changes are logged. No contributor emails are sent automatically.

## Notifications

Submission, its resource match and its notification job are saved in one D1 batch. A provider failure cannot erase the submission. Existing submissions predating this release are not backfilled into the notification queue; moderation creates their resource match.

The Resend HTTP adapter needs server-side `RESEND_API_KEY`, `NOTIFICATION_FROM` (a verified sender) and `ADMIN_EMAIL` (recipient and owner allowlist). Never put keys in a public config or browser bundle. See [Resend send API](https://resend.com/docs/api-reference/emails/send-email) and [domain setup](https://resend.com/docs/dashboard/domains/introduction). The demo does not currently have the email credentials/sender configured, so jobs remain pending. No inbox delivery has been verified.

With configuration present, each submission attempts one pending job. The owner can retry up to ten from admin. Minimum retry delay is one minute, with at most five attempts. Provider idempotency keys avoid duplicates within its retry window. Uncertain jobs older than 23 hours move to manual review rather than risk a second send. `accepted` records provider acceptance, not inbox delivery. There is no background retry scheduler; configure one only after choosing its cadence and budget. Message bodies contain the admin URL and type, not participant contact or submission contents.

## Research

`app/research/resources.json` is the cited directory; `briefs.json` contains four project judgments. A deterministic matcher attaches relevant source IDs to each submission, and refreshes them on moderation. Reports record the submitted public text snapshot, directory version, trigger and timestamp. Contact information is excluded. Reports stay private in admin; the curated briefs/directory are public.

This is **directory matching**, not automatic fresh web research. No paid model/search credentials are configured, and there is no paid API spend. Fresh research needs a provider, allowed model, hard per-run/monthly limits, source restrictions, review policy and secure credentials. Treat submitted text and web pages as data, not instructions. Never include private contact data or tokens in prompts. Require primary-source citations, observed dates, explicit grant status, and admin approval before publication.

Suggested routine: monthly resource review, weekly deadline checks while relevant rounds are active, and before any application. No recurring schedule is enabled. When updating a source, record date, applicable applicant/geography, amount, match, deadline, access/license requirements and what changed. Do not silently make a closed grant look open. Re-run matches after updating the directory version.

## Recovery and privacy

Back up D1 before destructive migrations; this release only adds tables. Keep production data separate from source exports. Set and communicate a retention period before moving beyond the demo. The initial version has no self-service deletion/contact management; the owner handles requests in the database. Use authenticated operator tools and a documented request trail. Do not export raw D1 records into a public repository.

PostHog records anonymous pageviews and sanitized UTM/referrer data, excluding admin pages, form values and session replay. Do Not Track and Global Privacy Control are respected. The reusable template disables analytics by default; each operator must configure their own project.
