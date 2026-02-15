import { SignInForm } from "@/components/auth/SignInForm"

export default function SignInPage() {
  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Satuit Supply</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access the portal
        </p>
      </div>
      <SignInForm />
    </div>
  )
}
