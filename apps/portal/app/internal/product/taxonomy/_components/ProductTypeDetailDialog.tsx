'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Label } from '@repo/ui/label'
import { InlineSvg } from '@/components/product/InlineSvg'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/dialog'
import type { ProductType } from './taxonomy-dnd-utils'

interface ProductTypeDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productType: (ProductType & {
    categoryName: string
    subcategoryName: string
  }) | null
  onSave: (id: string, data: {
    name?: string
    status?: 'active' | 'deprecated'
    sortOrder?: number
  }) => Promise<{ success: boolean; error?: string }>
  onUploadFlats: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}

export function ProductTypeDetailDialog({
  open,
  onOpenChange,
  productType,
  onSave,
  onUploadFlats,
}: ProductTypeDetailDialogProps) {
  const router = useRouter()
  const [flatView, setFlatView] = useState<'front' | 'back'>('front')
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'active' | 'deprecated'>('active')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [frontPreviewUrl, setFrontPreviewUrl] = useState<string | null>(null)
  const [backPreviewUrl, setBackPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const frontFileInputRef = useRef<HTMLInputElement>(null)
  const backFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!productType) return
    setFlatView('front')
    setName(productType.name)
    setStatus(productType.status === 'deprecated' ? 'deprecated' : 'active')
    setSortOrder(productType.sortOrder ?? 0)
    setFrontFile(null)
    setBackFile(null)
    setError(null)
    setIsEditing(false)
  }, [productType, open])

  const frontPath = useMemo(() => {
    if (!productType?.code) return ''
    return `/product/placeholders/product-types/${productType.code}/flats/${productType.code}-flat-front.svg`
  }, [productType?.code])

  const backPath = useMemo(() => {
    if (!productType?.code) return ''
    return `/product/placeholders/product-types/${productType.code}/flats/${productType.code}-flat-back.svg`
  }, [productType?.code])

  useEffect(() => {
    if (!frontFile) {
      setFrontPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(frontFile)
    setFrontPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [frontFile])

  useEffect(() => {
    if (!backFile) {
      setBackPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(backFile)
    setBackPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [backFile])

  if (!productType) return null
  const currentProductType = productType

  function handleSave() {
    setError(null)
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    const productTypeId = currentProductType.id
    startTransition(async () => {
      const result = await onSave(productTypeId, {
        name: name.trim(),
        status,
        sortOrder,
      })

      if (!result.success) {
        setError(result.error ?? 'Failed to update product type.')
        return
      }

      if (frontFile || backFile) {
        const fd = new FormData()
        fd.set('productTypeId', productTypeId)
        if (frontFile) fd.set('front', frontFile)
        if (backFile) fd.set('back', backFile)

        const uploadResult = await onUploadFlats(fd)
        if (!uploadResult.success) {
          setError(uploadResult.error ?? 'Product type updated, but flat upload failed.')
          return
        }
      }

      setIsEditing(false)
      setFrontFile(null)
      setBackFile(null)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="sticky top-0 z-20 bg-background px-4 py-3">
          <DialogTitle className="text-foreground">{productType.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {productType.categoryName} / {productType.subcategoryName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-3">
          <section className="space-y-2">
            <div className="relative mx-auto w-full max-w-[260px] aspect-square overflow-hidden rounded-md border bg-white">
              <div className="absolute right-2 top-2 z-10 flex overflow-hidden rounded-md border bg-white/90 backdrop-blur-sm">
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-7 rounded-none px-2 text-[11px] ${flatView === 'front' ? 'bg-accent' : ''}`}
                  onClick={() => setFlatView('front')}
                >
                  Front
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-7 rounded-none px-2 text-[11px] ${flatView === 'back' ? 'bg-accent' : ''}`}
                  onClick={() => setFlatView('back')}
                >
                  Back
                </Button>
              </div>

              {isEditing && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                  <Button
                    type="button"
                    size="sm"
                    className="pointer-events-auto h-7 px-2.5 text-[11px]"
                    onClick={() => {
                      if (flatView === 'front') {
                        frontFileInputRef.current?.click()
                      } else {
                        backFileInputRef.current?.click()
                      }
                    }}
                  >
                    Replace {flatView} flat
                  </Button>
                </div>
              )}
              <InlineSvg
                src={
                  flatView === 'front'
                    ? (frontPreviewUrl ?? frontPath)
                    : (backPreviewUrl ?? backPath)
                }
                alt={`${productType.name} ${flatView} flat`}
                className="h-full w-full p-4"
                hideLayers={['GRID', 'ANNOTATION']}
              />
              <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md bg-black/60 px-2 py-1 text-[10px] text-white/95">
                {flatView === 'front' ? (
                  <p className="truncate">
                    Front: <code className="text-white/95">{frontPath}</code>
                  </p>
                ) : (
                  <p className="truncate">
                    Back: <code className="text-white/95">{backPath}</code>
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <>
                <input
                  ref={frontFileInputRef}
                  className="hidden"
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={(e) => setFrontFile(e.target.files?.[0] ?? null)}
                />
                <input
                  ref={backFileInputRef}
                  className="hidden"
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={(e) => setBackFile(e.target.files?.[0] ?? null)}
                />
              </>
            )}
          </section>

          <section className="space-y-2">
            <div className="space-y-3">
              <div className="grid grid-cols-[92px_1fr] items-center gap-2">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Name:</Label>
                {isEditing ? (
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                ) : (
                  <p className="text-sm text-foreground">{productType.name}</p>
                )}
              </div>

              <div className="grid grid-cols-[92px_1fr] items-center gap-2">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Code:</Label>
                <code className="text-xs text-muted-foreground">{productType.code}</code>
              </div>

              <div className="grid grid-cols-[92px_1fr] items-center gap-2">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Status:</Label>
                {isEditing ? (
                  <select
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'deprecated')}
                  >
                    <option value="active">active</option>
                    <option value="deprecated">deprecated</option>
                  </select>
                ) : (
                  <p className="text-sm text-foreground">{productType.status}</p>
                )}
              </div>

              <div className="grid grid-cols-[92px_1fr] items-center gap-2">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Sort Order:</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value || 0))}
                  />
                ) : (
                  <p className="text-sm text-foreground tabular-nums">{productType.sortOrder}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[92px_1fr] items-start gap-2">
              <Label className="pt-2 text-[11px] uppercase tracking-wide text-muted-foreground">Description:</Label>
              <div className="rounded-md bg-muted/20 p-2.5 text-sm text-muted-foreground">
                No description field is currently modeled for product types.
              </div>
            </div>
          </section>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="sticky bottom-0 z-20 bg-background px-4 py-3">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setError(null)
                  setFrontFile(null)
                  setBackFile(null)
                  setName(productType.name)
                  setStatus(productType.status === 'deprecated' ? 'deprecated' : 'active')
                  setSortOrder(productType.sortOrder ?? 0)
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
