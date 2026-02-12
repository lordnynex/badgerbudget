import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppStateProvider, useAppState } from "@/state/AppState";
import { api } from "@/data/api";
import { Header } from "@/components/layout/Header";
import { Main } from "@/components/layout/Main";
import { ProjectionsSubNav } from "@/components/layout/ProjectionsSubNav";
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
  const { getInputs, getLineItems, currentBudget, currentScenario } = useAppState();
  const metrics = useScenarioMetrics(getInputs(), getLineItems());
  const location = useLocation();
  const [printMode, setPrintMode] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const stateForExport = {
    inputs: getInputs(),
    lineItems: getLineItems(),
    budget: currentBudget,
    scenario: currentScenario,
  };

  const onPrint = () => setPrintMode(true);
  const onEmail = () => setEmailOpen(true);

  return (
    <>
      {printMode ? (
        <div className="min-h-screen bg-white p-8">
          <PrintView state={stateForExport} metrics={metrics} />
          <div className="mt-8 flex gap-4 print:hidden">
            <Button onClick={() => window.print()}>Print</Button>
            <Button variant="outline" onClick={() => setPrintMode(false)}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-40 bg-background">
            <Header />
            {location.pathname === "/projections" && (
              <ProjectionsSubNav onPrint={onPrint} onEmail={onEmail} />
            )}
          </div>
          <Routes>
            <Route path="/" element={<Navigate to="/projections" replace />} />
            <Route
              path="/events"
              element={<Main activeTab="events" onPrint={onPrint} onEmail={onEmail} />}
            />
            <Route
              path="/projections"
              element={<Main activeTab="projections" onPrint={onPrint} onEmail={onEmail} />}
            />
            <Route
              path="/budget"
              element={<Main activeTab="budget" onPrint={onPrint} onEmail={onEmail} />}
            />
            <Route
              path="/scenarios"
              element={<Main activeTab="scenarios" onPrint={onPrint} onEmail={onEmail} />}
            />
            <Route path="*" element={<Navigate to="/projections" replace />} />
          </Routes>
        </>
      )}

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email-friendly Summary</DialogTitle>
          </DialogHeader>
          <EmailView state={stateForExport} metrics={metrics} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function App() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await api.seed();
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to seed");
      } finally {
        setInitialized(true);
      }
    }
    init();
  }, []);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading Badger Budget...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Check that the server is running and the database is accessible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppStateProvider>
      <AppLoader />
    </AppStateProvider>
  );
}

function AppLoader() {
  const { dispatch, selectBudget, selectScenario, loading } = useAppState();

  useEffect(() => {
    async function load() {
      const [budgets, scenarios] = await Promise.all([
        api.budgets.list(),
        api.scenarios.list(),
      ]);

      dispatch({ type: "SET_BUDGETS", payload: budgets });
      dispatch({ type: "SET_SCENARIOS", payload: scenarios });

      if (budgets.length > 0) {
        await selectBudget(budgets[0].id);
      }
      if (scenarios.length > 0) {
        await selectScenario(scenarios[0].id);
      }

      dispatch({ type: "SET_LOADING", payload: false });
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboards...</p>
      </div>
    );
  }

  return <AppContent />;
}

export default App;
