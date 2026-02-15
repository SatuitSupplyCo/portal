interface HeadingContent {
  level: number
  text: string
}

export function HeadingBlock({ content }: { content: HeadingContent }) {
  const id = content.text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const styles: Record<number, string> = {
    1: "text-3xl font-bold tracking-tight",
    2: "text-2xl font-semibold tracking-tight mt-10 pt-6 border-t",
    3: "text-lg font-semibold mt-6",
  }

  const Tag = `h${Math.min(content.level, 3)}` as "h1" | "h2" | "h3"

  return (
    <Tag id={id} className={styles[content.level] ?? styles[3]}>
      {content.text}
    </Tag>
  )
}
