interface RuleContent {
  label: string
  content: string
}

export function RuleBlock({ content }: { content: RuleContent }) {
  return (
    <div className="border-l-4 border-primary/60 bg-muted/40 rounded-r-lg px-5 py-4 my-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {content.label}
      </div>
      <div
        className="text-[0.95rem] font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />
    </div>
  )
}
