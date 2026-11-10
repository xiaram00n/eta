ETA FRONTEND HANDOFF — ENGLISH REVIEW VERSION

This is a frontend-only package for the EXISTING eta-stvi Worker. DO NOT replace its backend with a static-only Worker.

Routes:
/ -> public/index.html
/partnership and /partnership/ -> public/partnership/index.html
/questionnaire and /questionnaire/ -> public/questionnaire/index.html
/assets/* -> public/assets/*

Questionnaire POSTs JSON to same-origin /api/responses using the handoff schema. No admin token is in these files. Test URL: /questionnaire?test=1. Test mode is a convenience, NOT a security boundary: the server must classify test submissions appropriately for research.

IMPORTANT SECURITY:
Rotate the disclosed admin token before collecting responses. Do not embed the replacement in frontend files. Protect /admin AND /api/admin/* consistently. Cloudflare Access on the HTML alone does not protect API endpoints. Retain backend bearer-token checks unless intentionally replaced with verified server-side Access authentication. Never log Authorization values or questionnaire content.
The partnership route is unlisted from guest navigation, not authenticated. Protect with Access if needed.

DEPLOYMENT:
Preserve existing D1 binding, database UUID, API handlers, secrets, account and Worker name. Merge a static-assets binding into the existing Wrangler configuration. Explicitly route /api/* to the existing API handler BEFORE asset handling; otherwise fallback could serve HTML at API URLs. Serve the HTML routes above through the assets binding. Preserve admin and export behavior. _headers is supplied, but the agent must confirm actual response headers after deployment and set in Worker code if needed.
No wrangler file is supplied because the existing backend entry point and current config were not provided. Do not invent or overwrite them.

PAYLOAD:
submission_id UUID (retained in pending draft across retries)
questionnaire_version 1.0.0; language en
answers.working_arrangement uses independent/lease/employee/dispatcher/other
answers.pilot_interest is boolean; pilot_interest_response preserves maybe/notnow/unanswered
answers.services uses taxi, transfer, tour, wedding, villa, reserved
follow_up_consent boolean; contact fields sent ONLY when consent is true
is_test is true only with ?test=1 on a new submission
Unanswered numeric values are absent, not zero.

LOCAL DATA:
Draft/pending payload stored without encryption in localStorage. Disclosed on form. Cleared after confirmed success. No analytics or recording. Google Fonts is external. Failed/uncertain submissions retry the exact pending payload and ID. If 422 rejection occurs, the form can be corrected. Do not fake a successful response.

REMAINING CHECKS:
Verify the backend optional contact-field max lengths; supplied handoff did not state them. Client currently caps text at 1000 characters and depends on server validation. Tighten contact-specific caps to actual rules. Review retention/contact/privacy text before distribution. Obtain real site-owner instructions on data access/deletion. Arabic is not implemented yet.

TEST BEFORE SHARING:
1. Render all three pages on mobile and desktop; guest navigation must not link to partnership/admin.
2. Submit with ?test=1 using explicit owner approval for test database writes.
3. Verify D1/admin retrieval, nested service fields and consent-based contact exclusion.
4. Simulate network/server failure, reload, retry same UUID, verify one record.
5. Verify rejection preserves answers and correction is possible.
6. Verify existing admin/export/delete/auth tests remain valid.
7. Test CSV for Arabic and service-level columns; these frontend pages are currently English.
8. Clean up only explicitly identified test records with approval.

JavaScript syntax is checked locally; no browser or live API write tests were performed here.
