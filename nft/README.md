# GLORIFIER SERVICES NFT — preparation status

## Identity to preserve

- Name: `GLORIFIER SERVICES — Official Logo #001`
- Artwork: existing circular GLORIFIER SERVICES logo, including “EST 2022”
- Existing image CID: `bafkreiakbvnq4sc5xvff5vzyhj572kemre5sfwedi2almqkhlqz53hefcm`
- Previously recorded artwork SHA-256: `0a0d5b0e485dbd4a5ed7383a7bfd288c893b22d8834680b641475c33dd9c8513`
- Metadata draft: [metadata.json](./metadata.json)

## Evidence status

| Check | Status | Meaning |
|---|---|---|
| Metadata draft committed to GitHub | RECORDED | Repository copy only; not an IPFS publication |
| Existing image CID public gateway retrieval | PARTIALLY VERIFIED | On 2026-10-18, the Pinata public gateway returned HTTP 200 with `Content-Type: image/png`; displayed content identified GLORIFIER / EST 2022 / SERVICES |
| CID SHA-256 digest matches recorded artwork hash | MATCH | Decoding the existing CIDv1 raw-codec multihash yields SHA-256 `0a0d5b0e485dbd4a5ed7383a7bfd288c893b22d8834680b641475c33dd9c8513`, matching the recorded artwork digest |
| Raw downloaded image bytes separately hashed | NOT VERIFIED | The available fetch path did not provide the raw image file for a separate local SHA-256 calculation |
| Metadata CID public gateway retrieval | PARTIALLY VERIFIED | On 2026-10-18, a public dweb.link gateway returned HTTP 200 and the returned JSON referenced the existing image CID |
| Image pinned by a durable provider | NOT VERIFIED | No provider pin receipt or account/dashboard evidence was independently confirmed |
| Metadata pinned with durable retention | NOT VERIFIED | Gateway reachability alone is not proof of a pinning receipt or persistence guarantee |
| NFT minted | NOT PERFORMED | No mint transaction submitted |
| Funds spent | NOT AUTHORIZED | No paid service or transaction is authorized by this task |

## Evidence captured on 2026-10-18

- Image gateway: `https://gateway.pinata.cloud/ipfs/bafkreiakbvnq4sc5xvff5vzyhj572kemre5sfwedi2almqkhlqz53hefcm`
- Metadata gateway: `https://bafkreig7fyy4shnubajnzzflqrnlnd3dsb3acyuqomr7miiomtb2p5e4ai.ipfs.dweb.link`
- Image CID's embedded SHA-256 digest matches the previously recorded artwork SHA-256.
- The metadata gateway response's `image` field references the existing image CID; no CID was substituted.
- These checks prove gateway reachability at the time observed, not durable pinning, independent raw-byte hashing, legal clearance, or NFT minting.

## Required safe completion procedure

1. Retrieve the image bytes with an IPFS-aware client or direct HTTP download, compute SHA-256 locally, and confirm it equals the recorded hash above.
2. Pin the existing image CID and metadata CID using an authorized storage/pinning provider; record the provider receipt/ID and retention status. Do not incur a charge without explicit authorization.
3. Verify durable pinning for the existing image CID and metadata CID in the provider account. Record receipt/ID and retention status; do not treat gateway reachability alone as proof of pinning.
4. Retrieve the published metadata and image independently. Record timestamps, HTTP results, raw byte hashes, and the metadata's exact `image` URI.
5. If the existing CID is unavailable, locate the original bytes from existing source/repository history and compare SHA-256. Do not silently replace the CID; document any recovery CID separately only after integrity is proven.
6. Only after these checks, consider a separate mint proposal. Minting is not authorized by this preparation task.

## Important

A metadata file committed to GitHub is not the same as metadata published to IPFS. A CID's embedded digest is useful integrity evidence, but it is not a provider pinning receipt. A gateway error alone does not prove content is lost, and a successful gateway response alone does not prove durable availability. Report each check honestly and preserve the existing artwork and CID.
