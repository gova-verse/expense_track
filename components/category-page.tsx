"use client"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories"
import { PencilSimple, Trash } from "@phosphor-icons/react"
import { insertCategorySchema } from "@/lib/validations"

type Category = {
  id: number;
  name: string;
  type: "expense" | "income";
  icon: string | null;
  color: string | null;
  isDefault: boolean;
}

export function CategoryPage({ title, type, categories }: { title: string, type: "expense" | "income", categories: Category[] }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  
  // Form State
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("")
  const [color, setColor] = useState("")

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    setName(cat.name)
    setIcon(cat.icon || "")
    setColor(cat.color || "")
    setError(null)
    setIsSheetOpen(true)
  }

  const openNew = () => {
    setEditingCategory(null)
    setName("")
    setIcon("")
    setColor("")
    setError(null)
    setIsSheetOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const payload = {
      name,
      type,
      icon: icon || undefined,
      color: color || undefined,
    }
    
    const parsed = insertCategorySchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }

    startTransition(async () => {
      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, payload)
        if (res.success) {
          setIsSheetOpen(false)
        } else {
          setError(res.error || "Failed to update category")
        }
      } else {
        const res = await createCategory(payload)
        if (res.success) {
          setIsSheetOpen(false)
        } else {
          setError(res.error || "Failed to create category")
        }
      }
    })
  }

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return
    startTransition(async () => {
      const res = await deleteCategory(id, type)
      if (!res.success) {
        alert(res.error || "Failed to delete category")
      }
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={openNew}>Add Category</Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col p-0">
            <SheetHeader>
              <SheetTitle>{editingCategory ? "Edit Category" : "New Category"}</SheetTitle>
              <SheetDescription>
                {editingCategory ? "Update the details of the category." : "Add a new category for your transactions."}
              </SheetDescription>
            </SheetHeader>
            <form id="category-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Groceries" disabled={isPending} />
              </Field>
              <Field>
                <FieldLabel>Icon (emoji/text)</FieldLabel>
                <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="e.g. 🍔" disabled={isPending} />
              </Field>
              <Field>
                <FieldLabel>Color (hex)</FieldLabel>
                <Input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. #ff0000" disabled={isPending} />
              </Field>
              {error && <FieldError>{error}</FieldError>}
            </form>
            <SheetFooter>
              <Button form="category-form" type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No categories found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(cat => (
            <Card key={cat.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  {cat.color && (
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  )}
                  <CardTitle className="text-lg flex items-center gap-2 truncate">
                    {cat.icon && <span>{cat.icon}</span>}
                    {cat.name}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(cat)} disabled={isPending}>
                    <PencilSimple className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} disabled={isPending}>
                    <Trash className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
