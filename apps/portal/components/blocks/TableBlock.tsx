interface TableContent {
  caption?: string
  headers: string[]
  rows: string[][]
}

export function TableBlock({ content }: { content: TableContent }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        {content.caption && (
          <caption className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted/30">
            {content.caption}
          </caption>
        )}
        <thead>
          <tr className="border-b bg-muted/40">
            {content.headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5">
                  <span dangerouslySetInnerHTML={{ __html: cell }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
