import { useEffect, useState } from "react";
import { AppStateProvider, useAppState } from "@/state/AppState";
import { loadBudgetData } from "@/data/loadData";
import type { BadgerBudgetState } from "@/types/budget";
import { Header } from "@/components/layout/Header";
import { Main } from "@/components/layout/Main";
import { PrintView } from "@/components/export/PrintView";
import { EmailView } from "@/components/export/EmailView";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useScenarioMetrics } from "@/hooks/useScenarioMetrics";
import "./index.css";

function AppContent() {
  const { state } = useAppState();
  const metrics = useScenarioMetrics(state.inputs, state.lineItems);
  const [printMode, setPrintMode] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      {printMode ? (
        <div className="min-h-screen bg-white p-8">
          <PrintView state={state} metrics={metrics} />
          <div className="mt-8 flex gap-4 print:hidden">
            <Button onClick={() => window.print()}>Print</Button>
            <Button variant="outline" onClick={() => setPrintMode(false)}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Header
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onPrint={() => setPrintMode(true)}
            onEmail={() => setEmailOpen(true)}
          />
          <Main
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </>
      )}

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email-friendly Summary</DialogTitle>
          </DialogHeader>
          <EmailView state={state} metrics={metrics} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function App() {
  const [state, setState] = useState<BadgerBudgetState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgetData()
      .then((data) => {
        setState(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading Badger Budget...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error ?? "Failed to load data"}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Ensure /data/export.json is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppStateProvider initialState={state}>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
