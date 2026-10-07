# Web & Frontend SSR/SSG Architectural Guardrails

## Dependency Architecture & SSR/SSG Guardrails
- **Universal SSR/SSG Isolation:** In projects utilizing static site generation (SSG) or server-side rendering (SSR) (e.g., `tuquet.github.io` with `vite-ssg`), NEVER import DOM-dependent libraries (`mermaid`, `canvas`, `chart.js`, etc.) at the top-level module scope. Always encapsulate them behind dynamic imports (`const m = (await import('...')).default`) within `onMounted()` or guarded by `if (typeof window !== 'undefined')`.
- **Heavy Bundle Code-Splitting:** Large visualization or utility libraries (>50 KB gzip) must be lazy-loaded in dedicated async chunks to preserve first-load performance and Core Web Vitals.
- **Strict Package Manager SSOT:**
  - Strictly use `pnpm` (`pnpm add`, `pnpm build`, `pnpm --prefix <dir>`).
  - Prohibit `npm`, `yarn`, and `nvm` to prevent lockfile conflicts.
- **YAGNI & Native First (Ponytail Standard):** Prioritize native platform capabilities, standard libraries, and CSS before adding third-party dependencies.
