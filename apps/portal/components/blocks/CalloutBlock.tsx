interface CalloutContent {
  variant: "info" | "warning" | "do" | "avoid"
  content: string
}

const variants: Record<
  string,
  { border: string; bg: string; label: string; labelColor: string }
> = {
  info: {
    border: "border-blue-500/50",
    bg: "bg-blue-500/5",
    label: "Note",
    labelColor: "text-blue-600 dark:text-blue-400",
  },
  warning: {
    border: "border-amber-500/50",
    bg: "bg-amber-500/5",
    label: "Caution",
    labelColor: "text-amber-600 dark:text-amber-400",
  },
  do: {
    border: "border-emerald-500/50",
    bg: "bg-emerald-500/5",
    label: "Do",
    labelColor: "text-emerald-600 dark:text-emerald-400",
  },
  avoid: {
    border: "border-red-500/50",
    bg: "bg-red-500/5",
    label: "Avoid",
    labelColor: "text-red-600 dark:text-red-400",
  },
}

export function CalloutBlock({ content }: { content: CalloutContent }) {
  const v = variants[content.variant] ?? variants.info

  return (
    <div
      className={`border-l-4 ${v.border} ${v.bg} rounded-r-lg px-5 py-4 my-4`}
    >
      <div className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${v.labelColor}`}>
        {v.label}
      </div>
      <div
        className="prose prose-sm prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />
    </div>
  )
}
