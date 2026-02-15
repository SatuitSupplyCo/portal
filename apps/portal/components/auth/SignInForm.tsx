"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Separator } from "@repo/ui/separator"

export function SignInForm() {
  const isDev = process.env.NODE_ENV === "development"
  const [email, setEmail] = useState("dev@satuitsupply.com")
  const [loading, setLoading] = useState(false)

  const handleDevSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await signIn("dev-credentials", { email, callbackUrl: "/" })
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <Button
        className="w-full"
        size="lg"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        Continue with Google
      </Button>

      {isDev && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Development only
              </span>
            </div>
          </div>

          <form onSubmit={handleDevSignIn} className="space-y-3">
            <Input
              type="email"
              placeholder="dev@satuitsupply.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in as Dev User"}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
