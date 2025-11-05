# AI agent guide for this repo (React + Vite + Tailwind + shadcn)

Use these project-specific notes to be productive immediately. Keep changes small, follow the patterns below, and reference the files called out.

## Architecture
- Frontend SPA built with Vite + React + TypeScript, styled via Tailwind CSS.
- Router: `react-router-dom` with a catch‑all 404. Main wiring lives in `src/App.tsx`.
- State/data: `@tanstack/react-query` with a shared `QueryClient` in `src/App.tsx`.
- UI kit: shadcn/ui components under `src/components/ui/*` (Radix primitives). Utility `cn()` in `src/lib/utils.ts`.
- Path alias: `@` resolves to `src/` (see `vite.config.ts`). Prefer absolute imports from `@/...`.
- SPA hosting: `vercel.json` rewrites all paths to `/index.html`.

## Dev workflows
- Package manager: pnpm (lockfile present). Common scripts in `package.json`:
  - Dev server (port 8080 from `vite.config.ts`): `pnpm dev`
  - Build: `pnpm build` (or `pnpm build:dev` for development mode)
  - Preview built app: `pnpm preview`
  - Lint (ESLint 9, TypeScript rules, react-refresh): `pnpm lint`
- CSS is compiled via Tailwind (see `tailwind.config.ts`), dark mode is class-based (`dark`).

## Routing and pages
- Routes are declared in `src/App.tsx` using `<BrowserRouter>`.
  - Add new routes ABOVE the catch‑all `path="*"` route.
  - Pages live under `src/pages/`. Example: `src/pages/Index.tsx` is wired to `/`.
- 404 page: `src/pages/NotFound.tsx` (logs attempted path for debugging).

## UI components and styling
- Prefer components from `src/components/ui/*` (shadcn). Compose them and extract app-specific wrappers to `src/components/`.
- Use `cn()` from `src/lib/utils.ts` to merge Tailwind classes.
- Tailwind tokens are driven by CSS variables in `tailwind.config.ts` (e.g., `--primary`, `--background`).

## Data fetching and mutations
- Use React Query hooks close to the component; keys should be stable and descriptive.
- Query client is provided at the app root; no additional providers are needed unless you customize caching.

## Notifications / toasts
- Two options are pre-wired:
  - shadcn toaster: `src/components/ui/toast*` with hook `src/hooks/use-toast.ts` and `<Toaster />` mounted in `src/App.tsx`.
  - Sonner: `src/components/ui/sonner.tsx` with `<Sonner />` mounted and convenience helpers in `src/utils/toast.ts` (`showSuccess`, `showError`, etc.). Use one style consistently per feature.

## External integrations and plugins
- Vite plugin `@dyad-sh/react-vite-component-tagger` is enabled (first in `vite.config.ts`), followed by React SWC. Keep both when editing plugins and preserve the `@` alias.

## File layout highlights
- Entry: `index.html` mounts the element with id "root"; `src/main.tsx` renders `<App />` and imports `src/globals.css`.
- Global providers and router: `src/App.tsx`.
- Reusable UI: `src/components/ui/*` (Radix/shadcn).
- App components: `src/components/*` (e.g., `made-with-dyad.tsx`).
- Pages (route targets): `src/pages/*`.
- Hooks: `src/hooks/*` (e.g., `useIsMobile`, `useToast`).
- Utilities: `src/lib/utils.ts`, `src/utils/toast.ts`.

## Common tasks (examples)
- Add a route: create `src/pages/About.tsx`, then in `src/App.tsx` add `<Route path="/about" element={<About />} />` above the `"*"` route.
- Fetch data: inside a page/component, use `useQuery({ queryKey: ["users"], queryFn: fetchUsers })` and render loading/error states.
- Show a toast: `import { showSuccess } from "@/utils/toast"; showSuccess("Saved!")`.

If a pattern isn’t present in this repo (e.g., testing), don’t invent it—ask first. Keep imports using `@/` alias, route additions centralized in `src/App.tsx`, and UI built from `src/components/ui/*`.
