# Issue #6 — Brand Governance Review Register

**Last engineering review:** 2026-10-12  
**Repository:** `GLORIFIER7/GLORIFIER`  
**Owner-designated source hash on record:** `ea08a5035eedcf2c45d42163d9db4a08b7b68052a95eece40e5e83582c9e37de`  
**Decision boundary:** engineering implementation is not legal clearance.

## Acceptance criteria and evidence

| Criterion | Status | Evidence / remaining action |
|---|---|---|
| Canonical logo asset identified | PARTIAL | Owner designation, 500 × 500 JPEG description, and recorded source hash exist. No checked-in image has yet been proven to match that source. |
| Asset provenance recorded | RECORDED | Provenance is recorded as supplied by the Human Owner on 2026-09-24. Preserve the original file/message/receipt separately if available. |
| Copyright/licensing evidence recorded | PENDING | No license grant, assignment, or other copyright evidence is attached in this repository review. Obtain and archive appropriate evidence before commercial reliance. |
| Trademark/legal review completed | PENDING | No legal clearance is claimed. A qualified human/legal reviewer must assess trademark conflicts, copyright, jurisdiction, and intended uses. |
| AI policy review completed | PARTIAL | The policy prohibits provider endorsement and unsupported claims. A repository-wide review of all public copy was not performed by this change. |
| Marketing claims reviewed | PARTIAL | The HTML title/description and social-preview language were inspected. Audit other public pages and campaigns before marking complete. |
| Favicon and app-icon variants reviewed | PARTIAL | References remain on the existing SVG as a temporary fallback because the repository JPEG did not match the recorded source hash. The SVG is not approved as faithful. Browser/device appearance, Apple touch-icon behavior, and PWA installation still require tests. |
| Accessibility/readability reviewed | PENDING | Test legibility and contrast at target sizes, including favicon and social previews; record actual test evidence. |
| Brand usage guidance documented | RECORDED | See `BRAND_ASSET_POLICY.md` for source preservation, clear-space, background, and alteration rules. |
| Governance owner and approval status recorded | RECORDED | Human Owner is final authority. The source designation does not imply legal clearance or approval of unreviewed derivatives. |
| Final approved asset/version referenced | PARTIAL | Source hash and repository candidate are referenced, but the candidate’s calculated hash differs from the recorded source hash. Final byte-level identity remains unverified. |

## Integrity finding

The repository API returned encoded content for `public/glorifier-logo.jpg`. SHA-256 calculated from those decoded bytes was:

- Recorded source hash: `ea08a5035eedcf2c45d42163d9db4a08b7b68052a95eece40e5e83582c9e37de`
- Calculated candidate hash: `60bd392bb61104651aa6b1a4d97ef2f36ba98e3a2cd6df1c4754b014b29ee0aa`
- Result: **MISMATCH — reproduce from a local checkout and inspect file format/content before deciding whether the repository copy is wrong or merely a different encoding.**

Do not silently replace either hash or certify the asset until this discrepancy is resolved. The separate NFT artwork hash/CID is not interchangeable with this source hash.

## Implementation changes in this review

- Added explicit asset-integrity and legal-review status to `src/lib/brand-assets.ts`.
- Expanded `BRAND_ASSET_POLICY.md` to separate the Human Owner’s source designation from repository-copy integrity and legal clearance.
- Changed the HTML brand-asset metadata to say verification is pending.
- Removed the unsupported `maskable` claim from the PWA manifest until the icon safe area is verified.
- Kept the existing SVG as a temporary rendering fallback rather than switching production references to a raster that did not match the recorded source hash. The SVG itself remains an unverified derivative, not an approved canonical asset.

## Required before final governance approval

1. Recompute SHA-256 from a local checkout of `public/glorifier-logo.jpg`, inspect its file signature and image, and compare it with the source record.
2. Restore the original source bytes or obtain Human Owner approval for a derivative that demonstrably preserves the artwork and all visible wording, including “EST 2022” where present.
3. Complete browser, mobile, PWA-install, favicon, contrast, and small-size readability checks and store the evidence/results.
4. Attach or reference copyright/licensing provenance and obtain qualified legal review for trademark and commercial-use risks.
5. Review all public marketing copy for provider neutrality and unsupported capability, earnings, autonomy, security, or certification claims.

Do not mark the remaining criteria complete solely because CI passes. No NFT mint, payment, legal filing, or paid external action is authorized by this issue.
