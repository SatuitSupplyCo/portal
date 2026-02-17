"use client"

import { useState, useTransition } from "react"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { UserPlus } from "lucide-react"
import { inviteUser } from "../actions"

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin", description: "Full administrative access" },
  { value: "editor", label: "Editor", description: "Create and edit content" },
  {
    value: "internal_viewer",
    label: "Internal Viewer",
    description: "Read-only internal access",
  },
  {
    value: "partner_viewer",
    label: "Partner Viewer",
    description: "Partner portal access",
  },
  {
    value: "vendor_viewer",
    label: "Vendor Viewer",
    description: "Vendor portal access",
  },
]

const PRODUCT_ROLE_OPTIONS = [
  {
    value: "studio_contributor",
    label: "Studio Contributor",
    description: "Can submit studio entries",
  },
  {
    value: "product_lead",
    label: "Product Lead",
    description: "Manage seasons, approve transitions",
  },
  {
    value: "founder",
    label: "Founder",
    description: "Full lifecycle permissions",
  },
  {
    value: "external_designer",
    label: "External Designer",
    description: "Can submit studio entries",
  },
  {
    value: "factory_partner",
    label: "Factory Partner",
    description: "Limited access, no margins",
  },
]

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await inviteUser(formData)
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send invitation")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a New User</DialogTitle>
          <DialogDescription>
            Send an invitation to join the portal. They will receive access
            based on the role you assign.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Portal Role</Label>
            <Select name="role" required>
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Select a portal role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <span className="font-medium">{role.label}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      — {role.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-product-role">
              Product Role{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Select name="productRole">
              <SelectTrigger id="invite-product-role">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <span className="font-medium">{role.label}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      — {role.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls lifecycle permissions (seasons, concepts, approvals)
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending…" : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
