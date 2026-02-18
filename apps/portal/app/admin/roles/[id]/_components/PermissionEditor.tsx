"use client"

import { useState, useTransition } from "react"
import { Checkbox } from "@repo/ui/checkbox"
import { Button } from "@repo/ui/button"
import { setRolePermissions } from "../../actions"

interface Permission {
  code: string
  groupKey: string
  label: string
  description: string | null
}

interface PermissionEditorProps {
  roleId: string
  permissionGroups: Record<string, Permission[]>
  currentPermissionCodes: string[]
}

const GROUP_LABELS: Record<string, string> = {
  studio: "Studio",
  seasons: "Seasons & Slots",
  colors: "Colors",
  concepts: "Concepts",
  core_programs: "Core Programs",
  sourcing: "Sourcing",
  visibility: "Visibility",
}

export function PermissionEditor({
  roleId,
  permissionGroups,
  currentPermissionCodes,
}: PermissionEditorProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(currentPermissionCodes),
  )
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const hasChanges =
    selected.size !== currentPermissionCodes.length ||
    [...selected].some((c) => !currentPermissionCodes.includes(c))

  function toggle(code: string) {
    setSaved(false)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }

  function toggleGroup(group: string, allCodes: string[]) {
    setSaved(false)
    setSelected((prev) => {
      const next = new Set(prev)
      const allSelected = allCodes.every((c) => next.has(c))
      if (allSelected) {
        allCodes.forEach((c) => next.delete(c))
      } else {
        allCodes.forEach((c) => next.add(c))
      }
      return next
    })
  }

  function handleSave() {
    startTransition(async () => {
      await setRolePermissions(roleId, [...selected])
      setSaved(true)
    })
  }

  return (
    <div className="space-y-6">
      {Object.entries(permissionGroups).map(([group, perms]) => {
        const allCodes = perms.map((p) => p.code)
        const allSelected = allCodes.every((c) => selected.has(c))
        const someSelected =
          allCodes.some((c) => selected.has(c)) && !allSelected

        return (
          <div key={group} className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={() => toggleGroup(group, allCodes)}
              />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {GROUP_LABELS[group] ?? group}
              </h3>
            </div>
            <div className="grid gap-2 ml-7">
              {perms.map((perm) => (
                <label
                  key={perm.code}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <Checkbox
                    checked={selected.has(perm.code)}
                    onCheckedChange={() => toggle(perm.code)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium group-hover:text-foreground transition-colors">
                      {perm.label}
                    </p>
                    {perm.description && (
                      <p className="text-xs text-muted-foreground">
                        {perm.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )
      })}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending || !hasChanges}>
          {isPending ? "Saving..." : "Save Permissions"}
        </Button>
        {saved && !hasChanges && (
          <p className="text-sm text-emerald-600">Saved</p>
        )}
      </div>
    </div>
  )
}
