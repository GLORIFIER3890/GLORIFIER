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
| Existing CID public retrieval | NOT VERIFIED | Must retrieve the actual image bytes |
| Image digest matches recorded SHA-256 | NOT RE-VERIFIED | Compute SHA-256 from retrieved bytes and compare |
| Image pinned by a durable provider | PENDING | No pinning receipt/connection confirmed |
| Metadata pinned and publicly retrievable | PENDING | Must publish and independently fetch the metadata |
| NFT minted | NOT PERFORMED | No mint transaction submitted |
| Funds spent | NOT AUTHORIZED | Do not use paid services or submit transactions |

## Required safe completion procedure

1. Retrieve `ipfs://bafkreiakbvnq4sc5xvff5vzyhj572kemre5sfwedi2almqkhlqz53hefcm` using an IPFS-aware client or independent gateways.
2. Verify the downloaded bytes are the original logo and compute SHA-256. It must equal the recorded hash above before describing the file as verified.
3. If the CID is unavailable, locate the original bytes from the existing source/repository history and compare their SHA-256. Do not silently replace the existing CID; any recovery CID must be documented separately and only after integrity is proven.
4. Pin the existing image CID and the metadata JSON using an authorized storage/pinning provider. This requires a functioning account/connection. Do not incur a charge without explicit authorization.
5. Publish metadata with the image URI set to the verified image CID, then fetch the metadata and image from an independent client/gateway. Record provider receipt/ID, retrieval URLs, timestamp, HTTP results, and hashes.
6. Only after these checks, consider a separate mint proposal. Minting is not authorized by this preparation task.

## Important

A metadata file committed to GitHub is not the same as metadata published to IPFS. A CID/hash relationship recorded in notes does not establish public availability or active pinning. A gateway error alone also does not prove the content is lost. Report each check honestly and preserve the existing artwork and CID.
