import { HeadingBlock } from "./HeadingBlock"
import { TextBlock } from "./TextBlock"
import { RuleBlock } from "./RuleBlock"
import { CalloutBlock } from "./CalloutBlock"
import { TableBlock } from "./TableBlock"

export interface BlockData {
  id: string
  type: string
  contentJson: Record<string, unknown>
  locked: boolean
}

export function BlockRenderer({ blocks }: { blocks: BlockData[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return <HeadingBlock key={block.id} content={block.contentJson as any} />
          case "text":
            return <TextBlock key={block.id} content={block.contentJson as any} />
          case "rule":
            return <RuleBlock key={block.id} content={block.contentJson as any} />
          case "callout":
            return <CalloutBlock key={block.id} content={block.contentJson as any} />
          case "table":
            return <TableBlock key={block.id} content={block.contentJson as any} />
          default:
            return null
        }
      })}
    </div>
  )
}
