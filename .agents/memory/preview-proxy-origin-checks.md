---
name: Preview proxy origin checks
description: Why same-origin form submissions behind Replit preview cannot rely only on an Origin-to-Host comparison.
---

For browser mutations behind the Replit preview proxy, accept the browser-protected `Sec-Fetch-Site: same-origin` signal before comparing `Origin` with `Host`. Continue rejecting `Sec-Fetch-Site: cross-site`.

**Why:** The browser-facing preview origin can differ from the internal request host, causing legitimate form submissions to be rejected even though they are same-origin in the browser.

**How to apply:** Use this rule when maintaining CSRF/origin checks for browser forms served through Replit's proxy. Preserve the fallback Origin comparison for clients that omit Fetch Metadata.