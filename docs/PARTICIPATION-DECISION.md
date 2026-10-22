# Participation and account decision

Research checked October 20, 2026. Recommendation: keep this demo open, as requested. Use moderation and transparent browser-based voting limits. Do not describe votes as verified people.

| Approach | Useful for | Tradeoff |
|---|---|---|
| Current open demo | Quick discovery and testing with community members | Cookie limits are easy to bypass; no account recovery or reliable uniqueness |
| Google sign-in, optional initially | Returning participants and managing contributions across devices | Requires a Google account and consent; authenticating an account is not proving local residency or one person per vote |
| Email magic link or one-time code | A provider-neutral alternative and recovery channel | Requires email delivery, anti-abuse controls and a working inbox; more friction than an open form |
| Separate eligibility verification | A future formal civic process with residency/age rules | More exclusion, support burden and sensitive data; unnecessary for this demo |

[Google Identity Services](https://developers.google.com/identity/gsi/web/guides/overview) supplies account authentication and consent flows. [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless) supports magic links and one-time codes. [Decidim authorizations](https://docs.decidim.org/en/develop/admin/participants/authorizations.html) separates verification-based participation rights from ordinary accounts, with examples such as identity documents, postal codes and organizational censuses. These are product capabilities, not evidence of which sign-in method Sacramento residents prefer.

For the next release, offer Google plus email sign-in when someone wants to edit contributions or receive updates. Keep public reading open. Preserve wizard drafts through sign-in. Ask explicitly before linking a browser's historic votes/contributions to an account. If voting will allocate real funding, define eligibility and audit requirements first; adding Google alone does not create a verified civic ballot.

No identity-document collection or certification process is justified for this demo. Validate the next decision with five to ten local participants: completion rate, abandoned forms, email access, language needs and whether people want contribution editing. “Anonymized voting” should mean no public identity display; avoid claiming complete anonymity while cookies and service logs exist.
