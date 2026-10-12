# GLORIFIER Official Brand Asset Policy

## Canonical source asset

The authoritative brand artwork is the logo supplied by the Human Owner on 2026-09-24.

- Canonical repository path: `public/glorifier-logo.jpg`
- Source dimensions / format: 500 × 500 / JPEG
- Recorded source SHA-256: `ea08a5035eedcf2c45d42163d9db4a08b7b68052a95eece40e5e83582c9e37de`
- Provenance record: supplied by the Human Owner; the source hash is recorded here but was **not recalculated from the repository asset as part of the Issue #6 implementation**.
- Brand status: designated official source artwork by the Human Owner.
- Legal status: **PENDING** — this record is not trademark clearance, a copyright opinion, proof of registration, or a third-party endorsement.
- Final authority: Human Owner.

## Implementation rule

Use `public/glorifier-logo.jpg` directly for the favicon, Apple touch-icon reference, social preview image, and PWA manifest until a derived asset is visually compared with the source and approved. The app-icon SVG is an unverified derivative candidate; it must not be treated as the canonical artwork merely because it exists in the repository.

A future derivative may be used only after review confirms that it preserves all source artwork and visible wording, including “EST 2022” where present. Do not crop, redraw, recolor, omit details, or add an endorsement/certification signal without Human Owner approval. Do not silently replace the canonical source.

## Usage guidance

- Preserve the complete artwork and its aspect ratio; do not stretch or crop the circular boundary.
- Keep at least 10% of the displayed artwork width as clear space around the image.
- Prefer a plain, uncluttered background; do not place text, badges, or competing marks over the artwork.
- Do not apply effects, filters, recoloring, perspective transforms, or decorative overlays.
- If the source is too small or unclear to read at the target size, use an approved larger presentation rather than altering the artwork.
- Favicon, social, app, and print variants require actual rendering/readability checks at their target sizes before being marked approved.

## AI policy and marketing claims

GLORIFIER is provider-neutral. The mark is a brand asset, not evidence of AI capability, autonomy, financial performance, ownership, settlement, security certification, legal clearance, or endorsement by any AI provider. Public claims must not promise guaranteed earnings, guaranteed autonomous execution, or unverified outcomes.

AI agents may propagate the canonical source within GLORIFIER-owned systems, check references, and prepare technical derivatives for review. They may not unilaterally replace the source, claim legal clearance, assert ownership beyond recorded evidence, or initiate legal enforcement.

## Governance and change control

Material changes to the source asset, wordmark, public brand claim, or approved derivative require Human Owner review. Record the asset path, source hash, derivative hash (if applicable), review date, reviewer, purpose, and approval status. Keep assets separate from secrets and runtime configuration.

The implementation/review checklist and unresolved items are maintained in [Brand Governance Review](docs/brand-governance-review.md).
