### Competition-groups

[![Netlify Status](https://api.netlify.com/api/v1/badges/de795f72-dd3d-4adf-915f-2a11f9f58525/deploy-status)](https://app.netlify.com/sites/competition-groups/deploys)

## Summary

View WCA Competition groups digitally.

## Delegate Dashboard custom roles

This fork reads WCIF extensions written by the [delegate dashboard custom roles fork](https://github.com/coder13/delegateDashboard):

- `delegateDashboard.customRoleDefinitions` — role names, assignment letters, and per-group flags

- `delegateDashboard.customRoleAssignments` — backup of painted group assignments after WCA save

- `delegateDashboard.customRoles` — person-level custom roles (including extension-only roles)

When WCIF is loaded, custom role assignments are merged back onto persons so group views, live activities, and schedules show roles such as `custom-commentator` alongside built-in staff assignments.

## Development

This project is built with Vite, React, and TypeScript.

```bash

git clone https://github.com/coder13/Competitor-groups.git && cd Competitor-groups



# this project uses yarn

yarn

cp .env.example .env.local

# Add your WCA OAuth client ID to .env.local (see WCA OAuth below)

yarn dev



# testing

yarn test



# component and page development

yarn storybook

yarn build-storybook

```

## WCA OAuth

Sign-in uses the WCA **implicit OAuth flow** (`response_type=token`), matching [the upstream implementation](https://github.com/coder13/Competitor-groups/blob/main/src/providers/AuthProvider/AuthProvider.tsx). WCA redirects back with the access token in the URL hash, so no server-side token exchange is required.

1. Register an OAuth application at the WCA website.
2. Set the redirect URI to match your deployment:
   - Local: `http://localhost:5173/`
   - GitHub Pages: `https://bcchamps.github.io/`
   - Staging WCA: append `?staging=true` to the redirect URI above
3. Copy `.env.example` to `.env.local` and set `VITE_WCA_CLIENT_ID` to your application's **Application ID** (not the secret).

For GitHub Pages production builds, add `VITE_WCA_CLIENT_ID` as a repository secret.

## GitHub Pages

The site deploys to GitHub Pages on pushes to `main` via `.github/workflows/pages.yml`.

Enable GitHub Pages in repository settings (Source: GitHub Actions), then add the `VITE_WCA_CLIENT_ID` secret. For the `bcchamps.github.io` user site, the build uses `VITE_BASE_URL=/` (site root).

Local production preview:

```bash

VITE_BASE_URL=/ yarn build

yarn serve

```
