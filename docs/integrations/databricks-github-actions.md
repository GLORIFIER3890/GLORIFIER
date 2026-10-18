# Databricks API integration for GLORIFIER

This integration starts with a manual, read-only GitHub Actions authentication check. It does not deploy resources, run jobs, query tables, or modify data.

## 1. GitHub environment

In **Settings → Environments**, create an environment named `databricks-readonly`. Add these environment **variables** (not secrets):

- `DATABRICKS_HOST`: the HTTPS URL of the Databricks workspace, without an API path.
- `DATABRICKS_CLIENT_ID`: the application/client ID of a dedicated Databricks service principal.

Do not add a personal access token or client secret for this OIDC workflow.

## 2. Databricks service principal and federation

In the Databricks account console, create or select a dedicated service principal for this repository. Configure a workload identity federation policy for GitHub Actions with:

- Issuer: `https://token.actions.githubusercontent.com`
- Subject claim: `sub`
- Subject: the exact GitHub OIDC subject for this repository's `databricks-readonly` environment
- Audience: the value required by the Databricks federation setup (Databricks recommends the account ID where applicable)

The expected name-based subject is `repo:GLORIFIER7/GLORIFIER:environment:databricks-readonly`, but do not assume this value. GitHub repositories using immutable subject claims can include numeric organization/repository IDs. Confirm the actual subject format and configure an exact match; do not broaden the trust policy to all branches or repositories.

Keep the service principal at minimum privilege. This initial check only needs to authenticate and read the current caller identity.

Official references:
- https://docs.databricks.com/aws/en/dev-tools/auth/provider-github
- https://docs.databricks.com/aws/en/dev-tools/auth/oauth-federation-provider
- https://docs.github.com/en/actions/reference/security/oidc

## 3. Run the verification

On GitHub mobile or desktop:

1. Open **Actions** in the GLORIFIER repository.
2. Select **Databricks API Verification**.
3. Tap **Run workflow**.
4. Review the logs and the `Verify authenticated Databricks identity` step.

A passing run confirms that this workflow authenticated and read the current Databricks identity. It does not prove SQL warehouse, job, file, or model-serving access.

## 4. Troubleshooting

- **Missing configuration:** check the variable names and ensure they are defined in the `databricks-readonly` environment.
- **Federation/unauthorized error:** compare the token issuer, audience, and exact subject against the Databricks federation policy. Check whether the repository uses immutable subject claims.
- **Wrong workspace:** verify `DATABRICKS_HOST` points to the intended workspace.
- **Insufficient permissions:** grant only the specific permissions needed for a later approved integration; do not solve this by granting broad workspace-admin privileges.

## 5. Safe expansion path

After the identity check passes, add one integration at a time: read-only SQL access, then approved jobs or files, then model serving if needed. Review compute costs and permissions before enabling workloads. Do not add automatic deployments or production writes to this authentication check.
