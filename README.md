# Satuit Supply Co. — Product Monorepo

Turborepo monorepo for Satuit Supply Co. product tools, starting with the Factory Execution Pack (tech pack portal).

## Structure

```
product/
├── apps/
│   └── tech-packs/       # Factory Execution Pack — tech pack portal
├── packages/
│   ├── ui/               # Shared shadcn UI primitives
│   ├── types/            # Shared TypeScript types
│   ├── config-tailwind/  # Shared Tailwind theme
│   └── config-typescript/# Shared tsconfig
├── turbo.json
└── pnpm-workspace.yaml
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

## Getting Started

```bash
# Install dependencies
pnpm install

# Run the tech-packs app in development
pnpm dev --filter @repo/tech-packs

# Or run all apps
pnpm dev
```

## Tech Packs App

The tech pack portal lives at `apps/tech-packs/`. It serves the Launch v1.0 Factory Execution Pack as a navigable web document with:

- Route-based navigation matching the document's information architecture
- Left sidebar table-of-contents grouped by collection + appendices
- Each SKU has its own route/page
- Appendices are single-source-of-truth pages (SKU pages link to them, never duplicate)
- Print/PDF works via `window.print()` and produces a clean packet with page breaks

### Routes

| Route | Content |
|---|---|
| `/pack/launch-v1/cover` | Document cover page |
| `/pack/launch-v1/execution-rules` | Execution rules & order of authority |
| `/pack/launch-v1/brand-intent` | Brand execution intent |
| `/pack/launch-v1/collection-overview` | Collection overview table |
| `/pack/launch-v1/{collection}/{sku}` | Individual SKU tech pack |
| `/pack/launch-v1/appendix-a-trims` | Trim requirements |
| `/pack/launch-v1/appendix-b-measurements/{section}` | Measurement tables (tees, fleece, swim-men, coastal-women) |
| `/pack/launch-v1/appendix-c-sku-construction` | SKU-specific construction rules |
| `/pack/launch-v1/final-lock-points` | Lock points & factory acceptance |

### Printing

Click the **Print Packet** button in the top bar (or use Cmd/Ctrl+P). The print stylesheet hides the sidebar and renders the full ordered packet:

Cover → Rules → Intent → Overview → Section dividers + SKUs by group → Appendices → Final Lock Points

**Recommended print settings:**
- Paper: US Letter (8.5" x 11")
- Orientation: Portrait
- Margins: Default or 0.5"
- Background graphics: Enabled
- Scale: 100%

### Updating SKU Data

All SKU specifications live in a single file:

```
apps/tech-packs/lib/content/launch-v1.ts
```

To update specs:
1. Edit the relevant SKU object in this file
2. All text is verbatim binding language — edit carefully
3. Run validation: `pnpm validate --filter @repo/tech-packs`
4. Build: `pnpm build --filter @repo/tech-packs`

### Adding v1.1 (or Later Versions)

1. Create a new content module: `lib/content/launch-v1-1.ts`
2. Add new route group: `app/pack/launch-v1-1/layout.tsx`
3. Create corresponding page files under `app/pack/launch-v1-1/`
4. Add a print packet: `components/print/LaunchV1_1Packet.tsx`
5. The existing v1.0 routes remain untouched

### Validation

```bash
# Run validation only
pnpm validate --filter @repo/tech-packs

# Build (runs validation first)
pnpm build --filter @repo/tech-packs
```

The validation script checks:
- All required routes have backing data
- Every SKU generates a valid route
- All 4 measurement sections exist
- LOCK REQUIRED badges render for the right SKUs
- Data integrity (required fields, group coverage)

## Future Plans

- **CMS**: Custom content management for SKU specs (planned at `apps/cms/`)
- **Marketing site**: Customer-facing site (planned at `apps/web/`)
- **Database**: Drizzle/Prisma schema in `packages/db/` — SKU data will migrate from static TypeScript to database queries
- **Auth**: Partner authentication via middleware for `packs.satuitsupply.com`
