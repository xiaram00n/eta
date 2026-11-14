# Goal: Live ETA vault links

## User Request

Align local changes, web deployments, and the versions accessible from the
vault, then push the latest versions to GitHub. The files in the vault's
Current folder should open the corresponding hosted pages directly, and the
shareable links in Reference should match them.

## Refined Goal

Make the guest, partnership, and questionnaire files in Current open the
matching live ETA pages. Keep the preview and shareable-links references
consistent with those same routes. The hosted release and GitHub branch must
remain aligned with the verified local release.

## Acceptance Criteria

- [ ] Opening each of the three named Current HTML files takes the user to
  its corresponding live guest, partnership, or questionnaire URL.
- [ ] The Current preview file and Reference shareable-links note point to
  the matching hosted guest, partnership, questionnaire, and preview routes.
- [ ] The hosted pages and changed assets match the local release, and the
  GitHub release branch contains the latest release commit.
- [ ] Verification covers all four vault references and documents any
  validation that cannot be completed.

## Scope Boundaries

**In scope:**
- Vault Current folder:
  `/Users/amal-that-and-a-bag-of-chips/Library/Mobile Documents/iCloud~md~obsidian/Documents/Sync Vaults/USVI (Sync Vault)/USVI/Projects/ETA. Prototype – APPROVED SAMPLE (v1)/Current`
- The three files:
  `→ Your Trip To St. Thomas (Public UI).html`,
  `→ Working on ETA Together (Partnership).html`, and
  `→ Your Experience Shapes Our ETA. (Questionnaire).html`.
- Read-only verification of `→ Open ETA Preview Page.html` in Current and
  `/Users/amal-that-and-a-bag-of-chips/Library/Mobile Documents/iCloud~md~obsidian/Documents/Sync Vaults/USVI (Sync Vault)/USVI/Projects/ETA. Prototype – APPROVED SAMPLE (v1)/Reference/ETA. → Shareable Links.md`.
- Goal workflow artifacts in `.goals/eta-live-vault-links/`, and approved
  verification of the deployed Worker and GitHub release branch.

**Out of scope:**
- Deleting existing originals, changing unrelated vault content or the
  untracked `ETA_Reassessed_Packet.zip`, or modifying questionnaire data.
- Further product changes, deployments, network settings, and GitHub writes
  without their own explicit approval.
- Accessing other instruction files, personal-state documents, credentials,
  or any unapproved paths.

Preserve the existing standalone files before replacing them. Obtain explicit
approval for the preservation location, write test, changes, and each
subsequent action before proceeding.

## Applicable Project Conventions

**Quality gate command:**
- `node --test --test-reporter=dot tests/questionnaire.test.cjs`
- `node --check public/assets/guest.js`
- `git diff --check`

These focused checks passed for the release before the goal began.

**Commit convention:**
- Conventional commits with `[B]` or `[I]` role markers for goal iterations.
- Include `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
  on commits. Report the actual model if adding an Assisted-by trailer;
  do not invent one.

**Guidelines:**
- None found at the specifically approved guideline paths.

**Rules:**
- None found at the specifically approved AGENTS.md or CONSTITUTION.md paths.
- Do not expand file or network scope without explicit approval.
