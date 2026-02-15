interface DocPropertiesPanelProps {
  title: string
  status: string
  ownerTeam: string | null
  visibleToInternal: boolean
  visibleToPartners: boolean
  visibleToVendors: boolean
  createdAt: string
  updatedAt: string
}

export function DocPropertiesPanel({
  title,
  status,
  ownerTeam,
  visibleToInternal,
  visibleToPartners,
  visibleToVendors,
  createdAt,
  updatedAt,
}: DocPropertiesPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Properties
        </h4>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Title</dt>
            <dd className="font-medium mt-0.5">{title}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-0.5">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 capitalize">
                {status}
              </span>
            </dd>
          </div>
          {ownerTeam && (
            <div>
              <dt className="text-muted-foreground">Owner Team</dt>
              <dd className="font-medium capitalize mt-0.5">{ownerTeam}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Visibility
        </h4>
        <div className="space-y-1.5 text-sm">
          <VisibilityRow label="Internal" visible={visibleToInternal} />
          <VisibilityRow label="Partners" visible={visibleToPartners} />
          <VisibilityRow label="Vendors" visible={visibleToVendors} />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Dates
        </h4>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd className="mt-0.5">{createdAt}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last Updated</dt>
            <dd className="mt-0.5">{updatedAt}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

function VisibilityRow({
  label,
  visible,
}: {
  label: string
  visible: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          visible
            ? "text-emerald-600 font-medium"
            : "text-muted-foreground/50"
        }
      >
        {visible ? "Visible" : "Hidden"}
      </span>
    </div>
  )
}
