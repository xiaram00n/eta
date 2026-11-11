# ETA packet reassessment

## What was actually reviewed
Repository root index.html, assets/app.js and worker.js at the current repository
snapshot returned during this review, plus the project history supplied in this
conversation. The earlier ZIP itself was not extracted. No separate partnership
HTML appeared in the root listing; this packet replaces that experience from the
agreed project requirements rather than claiming a line-by-line audit of it.
No live deployment or live D1 verification was performed.

## Direction
Build for existing operators. Do not imply a new carrier, pooled marketplace,
commission business or outsourced booking desk is already the operating model.
Operators are intended customers. Their guests need clear arrangements and a
credible experience under the operator's own brand. ETA remains an uncleared
working name; do not present a trademark clearance as complete.

## Copy changes
Removed slogans, imagined hardship, defensive sales disclaimers, English-review
labels, technical database lectures and inflated promises. The operator opening
states what we are doing, what we need to understand and why answers matter.
Questions ask about current work, not agreement with a product pitch. No profit,
booking growth or time saving is asserted as demonstrated. Plain language is a
matter of respecting people's time, not treating experienced operators as naive.

## Design changes
Three separate experiences; public guests see neither internal economics nor a
partnership pitch. Operator form uses grouped short sections, large labels,
visible focus, Back controls and no forced financial answers. Twenty-two base
questions include conditional follow-up contact fields; thirteen additional
questions are behind optional detail controls. Optional service figures add six
fields per selected service, behind a separate disclosure. These are design
counts, not completion-time estimates. Not everyone sees every base question.
No 'five minute' claim until actual timed tests.

No fonts, tracking scripts or imagery are fetched from third parties by these
pages. Labels and actual HTML controls replace decorative mock inputs.
The aesthetic is restrained, readable and mobile-responsive, rather than a
luxury-app advertisement. Browser, screen-reader and device tests remain pending.

## Research balance
The short path finds work type, sources, unanswered requests, guest needs,
coordination effort, capacity and priorities. Optional detail gathers scope,
expenses, network fees, restrictions and service-level figures. The partner
interview obtains context and checks ambiguous units. This is deliberate staging,
not deletion of business-critical research. An optional open answer allows needs
we have not anticipated. 'My current setup works well' is a valid answer.

Thirty-day figures reduce mixed reporting periods but still rely on recall.
Requests that did not become completed work are NOT automatically lost revenue.
An abandoned inquiry, refused price, inability to serve and guest cancellation
must remain distinct. Approximate service receipts minus broad cost bands are
NOT an accounting profit calculation. Shared costs, payments passed to other
operators, owner's labor and service mix prevent simple attribution.

Payment preferences are NOT willingness-to-pay validation. Show a concrete
solution and real price later; record accept / decline and reason. Do not convert
pilot curiosity into a purchase commitment. Convenience samples are not estimates
of island-wide demand. No claim that competition or existing solutions are absent.

## Partnership reset
No upfront cash requested from the male operator partner for discovery.
His experience, introductions and time are substantive contributions, not free
labor hidden under 'partnership.' Agree the workload, expenses and data handling
before fieldwork. Ownership, compensation and ongoing obligations remain open.
No invented split, hypothetical margin calculator or guaranteed opportunity.
The walkthrough is public/unlisted, not private. Apply access control before
adding confidential commercial terms or participant details.

## Guest reset
Operator-branded flow: plans -> request review -> operator availability/price
confirmation -> guest agreement -> payment/receipt and trip updates.
This packet demonstrates the request review and sample downstream states; it does
not implement a production booking engine. Taxi, airport/ferry, tours, villa and
wedding use cases are represented. Multi-leg scheduling, passenger manifests,
vehicle allocation, accessible-vehicle matching, live GPS and processing payments
remain future functionality to validate, not promised capabilities.
No invented fare, $10 platform fee or service-charge structure. No implying a
preferred driver is reserved unless that operator actually confirms availability.

## Backend findings from source review — release blockers
1. Existing admin HTML interpolates stored contact and service values through
   innerHTML: stored-XSS risk. Use textContent/DOM construction before real use.
2. Admin helper fetch(p,{m,...}) does not set method. Delete sends GET rather than
   DELETE. Fix to method:m and test successful and denied deletion.
3. /admin requires a bearer header before serving its own token-entry page.
   Ordinary navigation cannot reach that login form as written. Choose a tested
   Access-authenticated workspace or a safe login-shell/API-auth arrangement.
4. Listing filters service/arrangement/pilot AFTER limit/offset, so pagination can
   omit matching records. Apply filters before pagination. Export only honors
   exclude_test; it does not implement all the advertised list filters.
5. Initial duplicate lookup is outside the submit handler's try/catch. Database
   failures may not return the documented JSON error. Catch the whole database path
   and never return raw exception details to public clients.
6. Rate limiting is not implemented in the inspected Worker. Body/answer limits
   use JavaScript string length, not actual UTF-8 bytes. Enforce byte limits and
   safe pagination parameters; add tested abuse controls.
7. Consent is enforced by this frontend for contacts, but the existing backend
   accepts contact fields even with false consent. Enforce the rule server-side.
8. Rotation of the previously exposed admin token remains unverified. Rotate it
   out of chat; no token belongs in this frontend or ZIP.
9. Anonymous participation means no name/contact requested, not proof that no
   infrastructure metadata exists. Avoid absolute privacy promises. Establish
   researcher access, retention, deletion and reporting practices before launch.

This replacement deliberately does NOT edit the Worker or bind new infrastructure.
A frontend ZIP cannot repair these backend issues. No release-ready claim is made.

## Evidence used
GOV.UK, Using in-depth interviews: open, neutral questions; real examples; test the
flow; listen rather than turn an interview into a pitch.
https://www.gov.uk/service-manual/user-research/using-in-depth-interviews
ONS, Question and questionnaire development overview: additional instructions,
large option sets, recall demands and repeated questions increase burden.
https://cy.ons.gov.uk/census/censustransformationprogramme/questiondevelopment/questionandquestionnairedevelopmentoverviewforcensus2021
Government Analysis Function, User-centred design approach to surveys: connect
questions to data uses, design smartphone-first and test respondent materials.
https://analysisfunction.civilservice.gov.uk/policy-store/a-user-centred-design-approach-to-surveys/
These are design/research sources, not evidence of local operator pain or USVI law.
