# GLORIFIER Bot

**Purpose:** repository-maintenance automation inspired by Dependabot, with GLORIFIER branding and GEAS safety boundaries.

## Current implementation

- A scheduled/manual GitHub Actions workflow refreshes npm dependencies within the version ranges already declared by the project, runs the repository type-check and frontend build, and opens a **draft** pull request when dependency files change.
- GitHub's native Dependabot remains configured for npm and GitHub Actions dependency updates.
- The bot does not auto-merge, deploy, modify secrets, transfer assets, trade, rotate credentials, or delete production data.
- Pull requests remain subject to required checks and human review.

## Identity limitation

A workflow cannot create a new GitHub account or GitHub App identity by itself. Unless a GLORIFIER GitHub App is registered and configured, GitHub will attribute workflow-created pull requests to `github-actions[bot]`, not `GLORIFIER[bot]`. Do not spoof the bot identity by setting only a commit author name.

## To create the true app identity

1. Open GitHub in a browser and navigate to **Settings → Developer settings → GitHub Apps → New GitHub App** (or organization settings if creating an organization-owned app).
2. Set the app name to **GLORIFIER Bot**. GitHub controls the generated bot username; the exact `GLORIFIER[bot]` handle is not guaranteed.
3. Use the original icon source in `assets/glorifier-bot.svg`; export to PNG if the GitHub upload form requires a raster image.
4. Grant only the permissions required for the intended scope: **Contents: read/write**, **Pull requests: read/write**, and **Metadata: read-only**. Avoid Administration, Secrets, Actions write, Deployments, and organization-wide permissions.
5. Install the app only on `GLORIFIER7/GLORIFIER`.
6. Generate an app private key and store it as repository Actions secrets:
   - `GLORIFIER_BOT_APP_ID`
   - `GLORIFIER_BOT_PRIVATE_KEY`
7. Configure the workflow to mint an installation token with `actions/create-github-app-token` and pass it to the pull-request action. Never commit the private key or print it in logs.

The current workflow deliberately uses the built-in `GITHUB_TOKEN`; it does not pretend that a custom app has been created or configured.

## Safety and acceptance criteria

- Bot changes are reviewable pull requests, initially draft.
- Required CI, dependency review, CodeQL, and repository policy gates remain in force.
- No automatic merge or production deployment.
- Dependency refreshes stay within existing package semver ranges; major-version upgrades require separate review.
- The bot fails safely when installation, tests, permissions, or dependencies fail.
- Report app identity as **NOT CONFIGURED** until a real GitHub App installation token is used and the resulting PR actor is verified.

## Branding

The original GLORIFIER Bot vector mark is in `assets/glorifier-bot.svg`. It is source artwork for adaptation; GitHub profile/app upload requirements may require exporting a PNG.
