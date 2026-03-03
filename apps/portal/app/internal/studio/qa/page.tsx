import type { Metadata } from "next"
import { DocPageShell } from "@/components/nav/DocPageShell"

export const metadata: Metadata = {
  title: "Studio QA | Satuit Supply Co.",
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="rounded-md border bg-card p-4">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-1.5 text-sm text-muted-foreground">{children}</div>
    </li>
  )
}

export default function StudioQaPage() {
  return (
    <DocPageShell
      breadcrumbs={[
        { label: "Studio", href: "/internal/studio" },
        { label: "QA" },
      ]}
    >
      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 md:px-12 border-b">
          <h1 className="text-xl font-bold tracking-tight">Studio QA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Weekly beta cadence and release gates for Concepting → Design → Render validation.
          </p>
        </div>

        <div className="px-8 py-6 md:px-12 space-y-6">
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold">Weekly beta cadence</h2>
            <dl className="mt-2 space-y-2 text-sm text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">Who runs it</dt>
                <dd>Design/QA owner (or designated beta lead). Same person week-over-week when possible.</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">When</dt>
                <dd>Weekly, same day/time (e.g. Tuesday EOD). Run before beta sign-off cut-off.</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Artifacts to capture</dt>
                <dd>Screenshots: concept accepted → open in design; design version restore; render completed row with diagnostics. Paste into Beta Sign-Off Template and attach to release/PR.</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Escalation for blockers</dt>
                <dd>Log blocker in ticket/PR; tag eng owner. If gate fails, do not enable broader rollout until resolved and re-run.</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold">Release gate criteria</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-3">Must pass before enabling broader rollout.</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60 mt-0.5">□</span>
                <span>Concepting: generate and accept at least one concept; hand-off to Design works.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60 mt-0.5">□</span>
                <span>Design: layer edit, undo/redo, version save/restore verified.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60 mt-0.5">□</span>
                <span>Asset flow: upload + create record + insert on canvas (or clear not_configured messaging).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60 mt-0.5">□</span>
                <span>Render: queue → process → complete; provider/fallback badge and diagnostics visible.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60 mt-0.5">□</span>
                <span>Guardrails: cancel, moderation block, active-job limit behave as expected.</span>
              </li>
            </ul>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold">Preflight</h2>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Enable Studio routes: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">STUDIO_DESIGN_ENABLED=true</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-xs">STUDIO_CONCEPTING_ENABLED=true</code>.</li>
              <li>Enable provider execution as needed: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">CONCEPTING_PROVIDER_ENABLED=true</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-xs">RENDER_PROVIDER_ENABLED=true</code>.</li>
              <li>For file uploads, set <code className="rounded bg-muted px-1.5 py-0.5 text-xs">STUDIO_DESIGN_ASSET_BUCKET</code> (optional <code className="rounded bg-muted px-1.5 py-0.5 text-xs">STUDIO_DESIGN_ASSET_PUBLIC_BASE_URL</code>).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2">Manual Flow Checklist</h2>
            <ol className="space-y-3">
              <Step title="1) Concept generation and acceptance">
                Generate 3-5 concepts from at least one inspiration, accept one concept, confirm success toast,
                then use <span className="font-medium text-foreground">Open in Design</span> and verify URL contains
                <code className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs">entryId=...</code>.
              </Step>
              <Step title="2) Design editor basics">
                Add text + SVG layers, update properties, use Undo/Redo keyboard shortcuts, save a design version,
                then restore that version and verify layer coordinates/content revert correctly.
              </Step>
              <Step title="3) Asset library flow">
                Upload a valid SVG/PNG via <span className="font-medium text-foreground">Upload file + create record</span>;
                confirm the asset appears in the library and can be inserted on canvas. If storage is not configured,
                verify clear <code className="rounded bg-muted px-1.5 py-0.5 text-xs">not_configured</code> guidance.
              </Step>
              <Step title="4) Render queue lifecycle">
                Queue a render job, process it, validate provider/fallback badge + metadata, inspect diagnostics JSON,
                then force a failed case and verify retry cooldown/limit messaging and disabled retry button behavior.
              </Step>
              <Step title="5) Guardrails and controls">
                Confirm cancel works for queued/running jobs, moderation-blocked input is rejected, and active-job limit
                prevents queue spam with a user-facing error.
              </Step>
            </ol>
          </section>

          <section className="rounded-lg border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold">Scripted Smoke Steps</h2>
            <p className="text-sm text-muted-foreground">
              Run these before manual validation to keep the session reproducible.
            </p>
            <pre className="overflow-auto rounded-md border bg-muted/30 p-3 text-xs leading-5">
{`# 1) Start app
pnpm -C apps/portal dev

# 2) (Optional) update env for provider-backed checks
# STUDIO_CONCEPTING_ENABLED=true
# STUDIO_DESIGN_ENABLED=true
# STUDIO_RENDER_ENABLED=true
# CONCEPTING_PROVIDER_ENABLED=true
# RENDER_PROVIDER_ENABLED=true
# STUDIO_DESIGN_ASSET_BUCKET=...

# 3) Open these routes in order
# /internal/studio/concepting
# /internal/studio/design
# /internal/studio/qa

# 4) During render checks, verify queue metadata
# - status
# - provider/model/promptVersion
# - fallback badge + reason (if fallback)
# - retry count/cooldown/limit

# 5) Capture screenshots for internal beta sign-off
# - concept accepted -> open in design
# - design version restore
# - render completed row with diagnostics expanded`}
            </pre>
          </section>

          <section className="rounded-lg border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold">Beta Sign-Off Template</h2>
            <p className="text-sm text-muted-foreground">
              Use this template in your test notes, PR description, or release comment for consistent QA records.
            </p>
            <pre className="overflow-auto rounded-md border bg-muted/30 p-3 text-xs leading-5">
{`Studio Beta Sign-Off

Owner: <name>
Date: <YYYY-MM-DD>
Environment: <local/staging>
Commit/Branch: <sha or branch>
Result: <PASS | FAIL | PASS with caveats>

Checklist
- [ ] Concepting: generated concepts and accepted at least one
- [ ] Hand-off: "Open in Design" deep-link works with entryId
- [ ] Design editor: layer edits + undo/redo + version restore verified
- [ ] Asset flow: upload/create record + insert into canvas verified
- [ ] Render queue: queued -> processed -> completed verified
- [ ] Render telemetry: provider/model/promptVersion visible
- [ ] Fallback behavior (if triggered) shows badge + reason
- [ ] Retry controls: cooldown + limit messaging verified
- [ ] Guardrails: moderation and active-job cap behavior verified

Evidence
- Screenshot(s): <links or filenames>
- Notes:
  - <observation 1>
  - <observation 2>

Follow-ups
- <bug or improvement item 1>
- <bug or improvement item 2>`}
            </pre>
          </section>

          <section className="rounded-lg border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold">Weekly Run Log (Copy/Paste)</h2>
            <p className="text-sm text-muted-foreground">
              Append one block per run to keep rollout sign-off auditable over time.
            </p>
            <pre className="overflow-auto rounded-md border bg-muted/30 p-3 text-xs leading-5">
{`Run: <YYYY-MM-DD / release name>
Owner: <name>
Environment: <local/staging/prod-like>
Overall Result: <PASS | FAIL | PASS with caveats>

Photoreal Quality Notes
- Preset(s) tested: <quality/fit/style>
- Provider fallback rate observed: <n/%>
- Output quality verdict: <acceptable | needs tuning>

Actions
- [ ] Concepting flow passed
- [ ] Design edit/version flow passed
- [ ] Render queue flow passed
- [ ] Guardrails/limits passed

Evidence
- <screenshot/link 1>
- <screenshot/link 2>

Follow-ups
- <ticket/item 1>
- <ticket/item 2>`}
            </pre>
          </section>
        </div>
      </main>
    </DocPageShell>
  )
}
