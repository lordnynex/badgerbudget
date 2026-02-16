import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Plus } from "lucide-react";
import { useAppState } from "@/state/AppState";
import { useInvalidateQueries } from "@/queries/hooks";
import { api } from "@/data/api";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LineItemsTable } from "./LineItemsTable";

export function BudgetsPanel() {
  const {
    budgets,
    currentBudget,
    selectBudget,
    refreshBudgets,
    refreshBudget,
  } = useAppState();
  const invalidate = useInvalidateQueries();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newDescription, setNewDescription] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<{ id: string; name: string; year: number; description: string | null } | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const created = await api.budgets.create({
      name: newName.trim(),
      year: newYear,
      description: newDescription.trim() || undefined,
    });
    setNewName("");
    setNewYear(new Date().getFullYear());
    setNewDescription("");
    setCreateOpen(false);
    invalidate.invalidateBudgets();
    await refreshBudgets();
    selectBudget(created.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this budget and all its line items?")) return;
    await api.budgets.delete(id);
    invalidate.invalidateBudgets();
    await refreshBudgets();
    const remaining = budgets.filter((b) => b.id !== id);
    selectBudget(remaining[0]?.id ?? null);
  };

  const openEdit = (b: { id: string; name: string; year: number; description: string | null }) => {
    setEditingBudget(b);
    setEditName(b.name);
    setEditDescription(b.description ?? "");
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBudget || !editName.trim()) return;
    await api.budgets.update(editingBudget.id, {
      name: editName.trim(),
      description: editDescription.trim(),
    });
    invalidate.invalidateBudgets();
    invalidate.invalidateBudget(editingBudget.id);
    await refreshBudgets();
    if (currentBudget?.id === editingBudget.id) {
      await refreshBudget(editingBudget.id);
    }
    setEditOpen(false);
    setEditingBudget(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>
              Create and manage budgets. Each budget has its own line items.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="size-4" />
            New Budget
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {budgets.map((b) => (
              <div
                key={b.id}
                className={`flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30 ${
                  currentBudget?.id === b.id ? "border-primary" : ""
                }`}
              >
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => selectBudget(b.id)}
                >
                  <p className="font-medium">{b.name} ({b.year})</p>
                  {b.description && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {b.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(b)}
                    title="Edit budget"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(b.id)}
                    title="Delete budget"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <LineItemsTable />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Badger South 2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe this budget..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Badger South 2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
                min={2000}
                max={2100}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe this budget..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
