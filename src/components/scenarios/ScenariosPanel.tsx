import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAppState } from "@/state/AppState";
import { api } from "@/data/api";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScenarioInputsCard } from "./ScenarioInputsCard";

export function ScenariosPanel() {
  const {
    scenarios,
    currentScenario,
    selectScenario,
    refreshScenarios,
    refreshScenario,
  } = useAppState();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const created = await api.scenarios.create({
      name: newName.trim(),
      description: newDescription.trim() || undefined,
    });
    setNewName("");
    setNewDescription("");
    setCreateOpen(false);
    await refreshScenarios();
    await selectScenario(created.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this scenario?")) return;
    await api.scenarios.delete(id);
    await refreshScenarios();
    const remaining = scenarios.filter((s) => s.id !== id);
    await selectScenario(remaining[0]?.id ?? null);
  };

  const openEdit = (s: { id: string; name: string; description: string | null }) => {
    setEditingScenario(s);
    setEditName(s.name);
    setEditDescription(s.description ?? "");
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingScenario || !editName.trim()) return;
    await api.scenarios.update(editingScenario.id, {
      name: editName.trim(),
      description: editDescription.trim(),
    });
    await refreshScenarios();
    if (currentScenario?.id === editingScenario.id) {
      await refreshScenario(editingScenario.id);
    }
    setEditOpen(false);
    setEditingScenario(null);
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Scenarios</CardTitle>
          <CardDescription>
            Create and manage input variable sets for scenario testing.
          </CardDescription>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="size-4" />
          New Scenario
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {scenarios.map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30 ${
                currentScenario?.id === s.id ? "border-primary" : ""
              }`}
            >
              <div
                className="cursor-pointer flex-1"
                onClick={() => selectScenario(s.id)}
              >
                <p className="font-medium">{s.name}</p>
                {s.description && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {s.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(s)}
                  title="Edit scenario"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(s.id)}
                  title="Delete scenario"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Conservative 2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe this scenario..."
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
            <DialogTitle>New Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Conservative 2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe this scenario..."
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
    </Card>

    <ScenarioInputsCard />
    </>
  );
}
