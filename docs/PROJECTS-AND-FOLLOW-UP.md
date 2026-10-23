# Project details and private follow-up

## Public project details
In `/admin`, open **Project progress → Edit public project details** for an approved project. Add the maintainer name/team and public profile only with permission, describe working features and limitations, and give a concrete help request. Demo/status and source links remain separate. Blank fields show explicit unconfirmed states; names are never inferred from private contacts. Saving details records a real update date and does not change votes or moderation.

Visitors can open any idea to see these details and use **Offer help with this project**. The participation wizard retains the selected project.

## Private participation inbox
The top of `/admin#follow-up` combines offers/solutions, idea submissions and consent-based signups. Search contact information, descriptions, owners and notes; filter by type, status or original/matched project.

- **New:** needs review or follow-up.
- **Contacted:** you have followed up outside this app.
- **Matched:** you have connected the person/contribution with a project. A currently public project is required when saving this state.
- **Closed:** no further follow-up is planned. Historical matches may be retained.

Open **Update follow-up**, set the responsible person, record private notes and optionally select a project. The responsible person is an accountability label, not an admin permission grant. No participant messages are sent by these controls. Public approval is still handled separately. Notes, contacts, owner labels and matches are excluded from public responses and analytics.

Old contacted/archived signups appear as contacted/closed without invented dates. Existing signup controls remain compatible. Deleting a signup also deletes its follow-up notes and notification entry. Do not use notes to retain information someone has asked you to delete.

One inbox entry represents one contribution, not a deduplicated person. Old offers may have no contact details, and idea submissions do not collect them. Search and counts cover the latest 1,500 records; the UI warns if older records are omitted. The server rejects stale edits; refresh before retrying to avoid overwriting another edit.

## Setup and validation
Apply this repository's additive Drizzle migrations before serving the new routes. The hosted Site and standalone repositories have independent migration sequences; do not copy one database's migration ledger into another.

The standalone repositories retain disabled analytics and fail-closed admin identity defaults. Configure the existing trusted auth adapter before using admin on a deployment. Local integration checks use only disposable preview data and no mail credentials:

```
TEST_BASE=http://127.0.0.1:18768 node verify-project-profile.mjs
TEST_BASE=http://127.0.0.1:18768 node verify-follow-up.mjs
node verify-project-profile-render.mjs
```

Use the existing local mock identity setup (`ADMIN_EMAIL=seedy@sites.test`, and the repository's explicit local trust configuration where required); never enable trusted-header auth on an untrusted public origin.
