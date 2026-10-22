export const canonicalOrigin = "https://your-community.example";
// Deployments configure their own aliases; forks must never redirect to Sacramento.
export function canonicalRedirect(_request) { void _request; return null; }
