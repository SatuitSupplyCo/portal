import { Sparkles, CheckCircle2, RefreshCw, XCircle } from 'lucide-react'
import { AI_MODEL_ID, AI_PROVIDER } from '@/lib/ai/registry'

interface FeatureStats {
  feature: string
  total: number
  selected: number
  rejected: number
  regenerated: number
}

interface AiUsageStatsProps {
  total: number
  selected: number
  rejected: number
  regenerated: number
  byFeature: FeatureStats[]
  totalInputTokens: number
  totalOutputTokens: number
  avgLatencyMs: number | null
}

export function AiUsageStats({
  total,
  selected,
  rejected,
  regenerated,
  byFeature,
  totalInputTokens,
  totalOutputTokens,
  avgLatencyMs,
}: AiUsageStatsProps) {
  const acceptanceRate = total > 0
    ? Math.round((selected / (selected + rejected)) * 100)
    : 0
  const regenRate = total > 0
    ? Math.round((regenerated / total) * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Total Suggestions"
          value={total.toLocaleString()}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          label="Acceptance Rate"
          value={`${acceptanceRate}%`}
          sublabel={`${selected} selected / ${selected + rejected} decided`}
        />
        <StatCard
          icon={<RefreshCw className="h-4 w-4 text-amber-500" />}
          label="Regeneration Rate"
          value={`${regenRate}%`}
          sublabel={`${regenerated} regenerated`}
        />
        <StatCard
          icon={<XCircle className="h-4 w-4 text-red-400" />}
          label="Rejected"
          value={rejected.toLocaleString()}
        />
      </div>

      {/* Model + token stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Model"
          value={AI_MODEL_ID.split('/').pop()?.split(':')[0] ?? AI_MODEL_ID}
          sublabel={AI_PROVIDER}
        />
        <StatCard
          label="Input Tokens"
          value={totalInputTokens.toLocaleString()}
        />
        <StatCard
          label="Output Tokens"
          value={totalOutputTokens.toLocaleString()}
        />
        <StatCard
          label="Avg Latency"
          value={avgLatencyMs != null ? `${Math.round(avgLatencyMs)}ms` : '—'}
        />
      </div>

      {/* Per-feature breakdown */}
      {byFeature.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {byFeature.map((f) => {
            const fDecided = f.selected + f.rejected
            const fRate = fDecided > 0 ? Math.round((f.selected / fDecided) * 100) : 0
            return (
              <div
                key={f.feature}
                className="rounded-lg border bg-card px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{f.feature}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.total} total · {fRate}% acceptance
                  </p>
                </div>
                <div className="flex gap-3 text-xs tabular-nums text-muted-foreground">
                  <span className="text-emerald-600">{f.selected} sel</span>
                  <span className="text-red-400">{f.rejected} rej</span>
                  <span className="text-amber-500">{f.regenerated} regen</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  sublabel?: string
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-semibold tracking-tight">{value}</p>
      {sublabel && (
        <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
      )}
    </div>
  )
}
