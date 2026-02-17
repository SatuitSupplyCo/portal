"use client"

import { useTransition, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { updateProductRole } from "../actions"

const PRODUCT_ROLES = [
  { value: "studio_contributor", label: "Studio Contributor" },
  { value: "product_lead", label: "Product Lead" },
  { value: "founder", label: "Founder" },
  { value: "external_designer", label: "External Designer" },
  { value: "factory_partner", label: "Factory Partner" },
]

const NONE_VALUE = "__none__"

interface ProductRoleSelectProps {
  userId: string
  currentRole: string | null
  isSelf: boolean
}

export function ProductRoleSelect({
  userId,
  currentRole,
  isSelf,
}: ProductRoleSelectProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleChange(newRole: string) {
    setError(null)
    startTransition(async () => {
      try {
        const role = newRole === NONE_VALUE ? null : newRole
        await updateProductRole(
          userId,
          role as Parameters<typeof updateProductRole>[1],
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update role")
      }
    })
  }

  return (
    <div className="space-y-1">
      <Select
        value={currentRole ?? NONE_VALUE}
        onValueChange={handleChange}
        disabled={isPending || isSelf}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>
            <span className="text-muted-foreground">None</span>
          </SelectItem>
          {PRODUCT_ROLES.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isSelf && (
        <p className="text-xs text-muted-foreground">
          You cannot change your own product role
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
