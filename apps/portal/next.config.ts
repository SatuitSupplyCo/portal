import type { NextConfig } from "next"
import path from "node:path"

const config: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/ui", "@repo/types", "@repo/db", "@repo/auth"],
  turbopack: {
    root: path.join(process.cwd(), "../.."),
  },
}

export default config
