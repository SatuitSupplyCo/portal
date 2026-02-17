"use client"

import { useState, useTransition } from "react"
import { Button } from "@repo/ui/button"
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
import { addOrgMember } from "../actions"

interface AddMemberDialogProps {
  orgId: string
  availableUsers: { id: string; name: string | null; email: string }[]
}

export function AddMemberDialog({ orgId, availableUsers }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await addOrgMember(formData)
        setOpen(false)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to add member",
        )
      }
    })
  }

  if (availableUsers.length === 0) {
    return (
      <Button size="sm" variant="outline" disabled title="All users are already members">
        <UserPlus className="h-4 w-4" />
        Add Member
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Add an existing portal user to this organization.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="orgId" value={orgId} />

          <div className="space-y-2">
            <Label htmlFor="member-user">User</Label>
            <Select name="userId" required>
              <SelectTrigger id="member-user">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <span className="font-medium">
                      {user.name ?? "Unnamed"}
                    </span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {user.email}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-role">Organization Role</Label>
            <Select name="role" defaultValue="member">
              <SelectTrigger id="member-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="org_admin">Org Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

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
              {isPending ? "Adding…" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
