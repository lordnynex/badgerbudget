import { Suspense, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AppStateProvider, useAppState } from "@/state/AppState";
import { Header } from "@/components/layout/Header";
import { Main } from "@/components/layout/Main";
import { BudgetScenarioLayout } from "@/components/layout/BudgetScenarioLayout";
import { PageLoading } from "@/components/layout/PageLoading";
import { EventDetailPage } from "@/components/events/EventDetailPage";
import { EventsPanel } from "@/components/events/EventsPanel";
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
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <Suspense fallback={<PageLoading />}>
                    <EventsPage />
                  </Suspense>
                </main>
              }
            />
            <Route
              path="/events/:id"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <Suspense fallback={<PageLoading />}>
                    <EventDetailPage />
                  </Suspense>
                </main>
              }
            />
            <Route
              path="/projections"
              element={
                <Suspense fallback={<PageLoading />}>
                  <BudgetScenarioLayout>
                    <Main activeTab="projections" onPrint={onPrint} onEmail={onEmail} />
                  </BudgetScenarioLayout>
                </Suspense>
              }
            />
            <Route
              path="/budget"
              element={
                <Suspense fallback={<PageLoading />}>
                  <BudgetScenarioLayout>
                    <Main activeTab="budget" onPrint={onPrint} onEmail={onEmail} />
                  </BudgetScenarioLayout>
                </Suspense>
              }
            />
            <Route
              path="/scenarios"
              element={
                <Suspense fallback={<PageLoading />}>
                  <BudgetScenarioLayout>
                    <Main activeTab="scenarios" onPrint={onPrint} onEmail={onEmail} />
                  </BudgetScenarioLayout>
                </Suspense>
              }
            />
            <Route
              path="/contacts"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <Suspense fallback={<PageLoading />}>
                    <ContactsPanel />
                  </Suspense>
                </main>
              }
            />
            <Route
              path="/contacts/lists"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <Suspense fallback={<PageLoading />}>
                    <MailingListsPanel />
                  </Suspense>
                </main>
              }
            />
            <Route
              path="/contacts/lists/:listId"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <Suspense fallback={<PageLoading />}>
                    <MailingListsPanel />
                  </Suspense>
                </main>
              }
            />
            <Route
              path="/contacts/batches/:batchId"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <Suspense fallback={<PageLoading />}>
                    <MailingBatchPage />
                  </Suspense>
                </main>
              }
            />
            <Route
              path="/contacts/:id"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <Suspense fallback={<PageLoading />}>
                    <ContactDetailPage />
                  </Suspense>
                </main>
              }
            />
            <Route
              path="/members"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <Suspense fallback={<PageLoading />}>
                    <MembersPanel />
                  </Suspense>
                </main>
              }
            />
            <Route
              path="/members/:id"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <Suspense fallback={<PageLoading />}>
                    <MemberDetailPage />
                  </Suspense>
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

/** Events page: loads only events list (suspense). */
function EventsPage() {
  return <Main activeTab="events" onPrint={() => {}} onEmail={() => {}} />;
}

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
