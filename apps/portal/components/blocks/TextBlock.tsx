interface TextContent {
  content: string
}

export function TextBlock({ content }: { content: TextContent }) {
  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:font-semibold"
      dangerouslySetInnerHTML={{ __html: content.content }}
    />
  )
}
