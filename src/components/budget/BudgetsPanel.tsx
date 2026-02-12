import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useAppState } from "@/state/AppState";
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
  } = useAppState();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newDescription, setNewDescription] = useState("");

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
    await refreshBudgets();
    await selectBudget(created.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this budget and all its line items?")) return;
    await api.budgets.delete(id);
    await refreshBudgets();
    const remaining = budgets.filter((b) => b.id !== id);
    await selectBudget(remaining[0]?.id ?? null);
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(b.id)}
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <LineItemsTable />

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
