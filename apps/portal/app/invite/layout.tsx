/**
 * Invite layout — centered card, no sidebar. Matches the auth layout.
 */
export default function InviteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {children}
    </div>
  )
}
