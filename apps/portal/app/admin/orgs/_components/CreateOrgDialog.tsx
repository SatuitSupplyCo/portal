"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
import { Plus } from "lucide-react"
import { createOrganization } from "../actions"

export function CreateOrgDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        const result = await createOrganization(formData)
        setOpen(false)
        if (result.orgId) {
          router.push(`/admin/orgs/${result.orgId}`)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create organization",
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Add a new vendor or partner company. You can add members after
            creating it.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              name="name"
              placeholder="Acme Manufacturing Co."
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-type">Type</Label>
            <Select name="type" required>
              <SelectTrigger id="org-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendor">
                  <span className="font-medium">Vendor</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    — Factory or supplier
                  </span>
                </SelectItem>
                <SelectItem value="partner">
                  <span className="font-medium">Partner</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    — Retail or distribution partner
                  </span>
                </SelectItem>
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
              {isPending ? "Creating…" : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
