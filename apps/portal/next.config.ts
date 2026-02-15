import type { NextConfig } from "next"

const config: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/ui", "@repo/types", "@repo/db", "@repo/auth"],
}

export default config
