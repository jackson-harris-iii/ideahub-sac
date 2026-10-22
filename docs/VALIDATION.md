# Source edition verification — October 22, 2026

Based on production version 10, source commit 2e396d99a9a8121c0dd170762fc80a6549b1268a. Live site was not redeployed.

Commands run independently in both public editions:
- `npm run lint`: passed (initial unused-parameter warning corrected and rechecked).
- `npm run typecheck`: passed.
- `npm test`: passed export/auth/redirect/analytics/migration checks and mocked notification tests.
- `npm run build`: passed. Vinext emits its existing route-classification notice and Node a module.register deprecation notice.

Dependencies were reused from the existing pilot installation locally; a clean install and the new GitHub Actions workflow are separate checks. Historical browser suites are retained under tests/pilot-reference and require adaptation. No full browser E2E pass is claimed for these public editions. No production records or real emails were used.
