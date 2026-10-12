# Issue #6 — Brand Governance Review Register

**Last engineering review:** 2026-10-12  
**Repository:** `GLORIFIER7/GLORIFIER`  
**Canonical asset reference:** `public/glorifier-logo.jpg`  
**Decision boundary:** engineering implementation is not legal clearance.

## Acceptance criteria and evidence

| Criterion | Status | Evidence / remaining action |
|---|---|---|
| Canonical logo asset identified | RECORDED | `public/glorifier-logo.jpg`; source is described in `BRAND_ASSET_POLICY.md`. |
| Asset provenance recorded | RECORDED | Provenance is recorded as supplied by the Human Owner on 2026-09-24. Preserve any original message or file receipt separately if available. |
| Copyright/licensing evidence recorded | PENDING | No license grant, assignment, or other copyright evidence is attached in this repository review. Obtain and archive appropriate evidence before commercial reliance. |
| Trademark/legal review completed | PENDING | No legal clearance is claimed. A qualified human/legal reviewer must assess trademark conflicts, copyright, jurisdiction, and intended uses. |
| AI policy review completed | PARTIAL | The brand policy prohibits provider endorsement and unsupported claims. A repository-wide review of all public copy was not performed by this change. |
| Marketing claims reviewed | PARTIAL | The HTML title/description and social-preview claims were reviewed for this implementation. Audit other public pages and campaigns before marking complete. |
| Favicon and app-icon variants reviewed | PARTIAL | Page and PWA references now use the canonical source raster to avoid treating an unverified SVG redraw as approved. Browser/device appearance and Apple touch-icon/PWA installation behavior still require testing. |
| Accessibility/readability reviewed | PENDING | Test legibility and contrast at target sizes, including favicon and social previews; record actual test evidence. |
| Brand usage guidance documented | RECORDED | See `BRAND_ASSET_POLICY.md` for preservation, clear-space, background, and alteration rules. |
| Governance owner and approval status recorded | RECORDED | Human Owner is final authority. This does not imply legal clearance or approval of unreviewed derivatives. |
| Final approved asset/version referenced | PARTIAL | Canonical path and a previously recorded source SHA-256 are referenced. The hash was not recomputed from the checked-in binary during this implementation; verify it before claiming byte-level integrity. |

## Implementation changes in this review

- Repointed favicon, Apple touch-icon, Open Graph, and Twitter image references to `public/glorifier-logo.jpg`.
- Updated the PWA manifest to use the same source raster instead of assuming that the SVG derivative is approved.
- Documented that `public/glorifier-app-icon.svg` is an unverified derivative candidate, not the canonical source.
- Clarified that a source hash/provenance record is not proof of copyright ownership, trademark clearance, or legal review.

## Required before final governance approval

1. Recompute SHA-256 from the checked-in canonical JPEG and compare it with the recorded value; investigate any mismatch rather than silently changing the value.
2. Have the Human Owner visually compare any proposed derivative with the original, including all visible wording and details.
3. Complete browser, mobile, PWA-install, favicon, contrast, and small-size readability checks, and store evidence/results.
4. Attach or reference copyright/licensing provenance and obtain qualified legal review for trademark and commercial-use risks.
5. Review all public marketing copy for provider neutrality and unsupported capability, earnings, autonomy, security, or certification claims.

Do not mark the remaining criteria complete solely because CI passes. No NFT mint, payment, legal filing, or paid external action is authorized by this issue.
