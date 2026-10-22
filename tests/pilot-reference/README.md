# Sacramento pilot reference suites

These suites are historical regression scenarios from the hosted pilot. Branding, screenshot paths, QR targets and analytics assertions need adapting to the public export before running. Browser suites require Playwright installed separately. Run API suites only against disposable localhost D1. They are not included in `npm test` and are not claimed to pass in this template. The root `verify-public-export.mjs` and `verify-notifications.mjs` are the supported offline checks.
