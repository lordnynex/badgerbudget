import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AppStateProvider, useAppState } from "@/state/AppState";
import { api } from "@/data/api";
import { Header } from "@/components/layout/Header";
import { Main } from "@/components/layout/Main";
import { EventDetailPage } from "@/components/events/EventDetailPage";
import { MembersPanel } from "@/components/members/MembersPanel";
import { MemberDetailPage } from "@/components/members/MemberDetailPage";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { ContactDetailPage } from "@/components/contacts/ContactDetailPage";
import { MailingListsPanel } from "@/components/contacts/MailingListsPanel";
import { MailingBatchPage } from "@/components/contacts/MailingBatchPage";
import { ProjectionsSubNav } from "@/components/layout/ProjectionsSubNav";
import { EventDetailSubNav } from "@/components/layout/EventDetailSubNav";
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

  const navigate = useNavigate();
  const isPrintRoute = location.pathname === "/print";

  const onPrint = () => setPrintMode(true);
  const onEmail = () => setEmailOpen(true);

  const openPrintInNewTab = () => {
    const base = window.location.pathname.replace(/\/[^/]*$/, "") || "";
    const url = `${window.location.origin}${base}/print`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {(printMode || isPrintRoute) ? (
        <div className="min-h-screen bg-white p-8">
          <PrintView state={stateForExport} metrics={metrics} />
          <div className="mt-8 flex gap-4 print:hidden">
            <Button onClick={() => window.print()}>Print</Button>
            <Button variant="outline" onClick={openPrintInNewTab}>
              Open in new tab
            </Button>
            <Button variant="outline" onClick={() => (isPrintRoute ? navigate("/projections") : setPrintMode(false))}>
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
            {location.pathname.startsWith("/events/") && location.pathname !== "/events" && (
              <EventDetailSubNav />
            )}
          </div>
          <Routes>
            <Route path="/" element={<Navigate to="/projections" replace />} />
            <Route
              path="/events"
              element={<Main activeTab="events" onPrint={onPrint} onEmail={onEmail} />}
            />
            <Route
              path="/events/:id"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <EventDetailPage />
                </main>
              }
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
            <Route
              path="/contacts"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <ContactsPanel />
                </main>
              }
            />
            <Route
              path="/contacts/lists"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <MailingListsPanel />
                </main>
              }
            />
            <Route
              path="/contacts/lists/:listId"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <MailingListsPanel />
                </main>
              }
            />
            <Route
              path="/contacts/batches/:batchId"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <MailingBatchPage />
                </main>
              }
            />
            <Route
              path="/contacts/:id"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <ContactDetailPage />
                </main>
              }
            />
            <Route
              path="/members"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <MembersPanel />
                </main>
              }
            />
            <Route
              path="/members/:id"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <MemberDetailPage />
                </main>
              }
            />
            <Route path="/print" element={null} />
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

      const firstBudget = budgets[0];
      if (firstBudget) {
        await selectBudget(firstBudget.id);
      }
      const firstScenario = scenarios[0];
      if (firstScenario) {
        await selectScenario(firstScenario.id);
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
