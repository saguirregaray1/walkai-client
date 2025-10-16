# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains all TypeScript React components, layouts, and pages. Icons live under `src/components/icons/` and shared utilities sit beside their feature modules.
- `src/global.d.ts` and `tsconfig.json` define project-wide typing rules; `vite.config.ts` configures the dev server proxy for `/api` requests.
- Static assets live in `public/`; production builds emit to `dist/` after `npm run build`.

## Build, Test, and Development Commands
- `npm run dev` launches the Vite dev server with hot reloading at `http://localhost:5173`.
- `npm run build` produces the optimized production bundle in `dist/`.
- `npm run lint` runs ESLint with `typescript-eslint`, React Hooks, and React Refresh plugins to validate style and catch common issues.

## Coding Style & Naming Conventions
- TypeScript is required (`.ts`/`.tsx`); keep `strict` mode happy by avoiding `any` and ensuring exhaustive typing.
- Follow React function-component patterns (`PascalCase` for components, `camelCase` for hooks/utilities). Co-locate component-specific styles via CSS Modules (e.g., `Component.module.css`).
- Run `npm run lint` before pushing. Auto-format via your editor using the ESLint + Prettier integration; use 2-space indentation.

## Testing Guidelines
- No automated tests exist yet; add Vitest + React Testing Library for new features when feasible. Place tests alongside source files (`Component.test.tsx`).
- Aim to cover critical flows (authentication guard, invitation acceptance, user management). Ensure tests run with `npm test` (add a script when tests land).

## Commit & Pull Request Guidelines
- Write commits in the imperative mood (e.g., `Add invitation acceptance guard`). Group related changes and avoid mixing formatting-only edits with feature work.
- Pull requests should include: a concise summary, linked issue or ticket when available, screenshots/GIFs for UI changes, and a checklist of validation steps (lint, build, tests).
- Highlight any API assumptions (e.g., `/api` endpoints) so reviewers can validate backend alignment.

## Security & Configuration Tips
- Do not hardcode secrets; rely on environment variables consumed by Vite (`import.meta.env`). Document any required variables in the PR description.
- Respect the proxy defined in `vite.config.ts` to keep local requests routed through `/api`; never bypass the proxy with absolute URLs in client code.
