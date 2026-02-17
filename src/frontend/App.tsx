import { Suspense, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AppStateProvider, useAppState } from "@/state/AppState";
import { Header } from "@/components/layout/Header";
import { Main } from "@/components/layout/Main";
import { BudgetingLayout } from "@/components/layout/BudgetingLayout";
import { PageLoading } from "@/components/layout/PageLoading";
import { NotFoundPage } from "@/components/layout/NotFoundPage";
import { HomePage } from "@/components/layout/HomePage";
import { IdParamGuard } from "@/components/layout/IdParamGuard";
import { EventDetailPage } from "@/components/events/EventDetailPage";
import { EventsPanel } from "@/components/events/EventsPanel";
import { MembersPanel } from "@/components/members/MembersPanel";
import { MemberDetailPage } from "@/components/members/MemberDetailPage";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { ContactDetailPage } from "@/components/contacts/ContactDetailPage";
import { MailingListsPanel } from "@/components/contacts/MailingListsPanel";
import { QrCodesPanel } from "@/components/contacts/QrCodesPanel";
import { QrCodeDetailPage } from "@/components/contacts/QrCodeDetailPage";
import { ActualSpendPanel } from "@/components/budget/ActualSpendPanel";
import { VendorsPanel } from "@/components/budget/VendorsPanel";
import { ContactsLayout } from "@/components/layout/ContactsLayout";
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
            <Button variant="outline" onClick={() => (isPrintRoute ? navigate("/budgeting/projections") : setPrintMode(false))}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-40 bg-background">
            <Header />
            {location.pathname.startsWith("/events/") && location.pathname !== "/events" && (
              <EventDetailSubNav />
            )}
          </div>
          <Routes>
            <Route path="/" element={<HomePage />} />
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
                  <IdParamGuard>
                    <Suspense fallback={<PageLoading />}>
                      <EventDetailPage />
                    </Suspense>
                  </IdParamGuard>
                </main>
              }
            />
            <Route path="budgeting" element={<BudgetingLayout onPrint={onPrint} onEmail={onEmail} />}>
              <Route index element={<Navigate to="projections" replace />} />
              <Route
                path="projections"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Main activeTab="projections" onPrint={onPrint} onEmail={onEmail} />
                  </Suspense>
                }
              />
              <Route
                path="budget"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Main activeTab="budget" onPrint={onPrint} onEmail={onEmail} />
                  </Suspense>
                }
              />
              <Route
                path="budget/:id"
                element={
                  <IdParamGuard param="id">
                    <Suspense fallback={<PageLoading />}>
                      <Main activeTab="budget" onPrint={onPrint} onEmail={onEmail} />
                    </Suspense>
                  </IdParamGuard>
                }
              />
              <Route
                path="scenarios"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Main activeTab="scenarios" onPrint={onPrint} onEmail={onEmail} />
                  </Suspense>
                }
              />
              <Route
                path="scenarios/:id"
                element={
                  <IdParamGuard param="id">
                    <Suspense fallback={<PageLoading />}>
                      <Main activeTab="scenarios" onPrint={onPrint} onEmail={onEmail} />
                    </Suspense>
                  </IdParamGuard>
                }
              />
              <Route
                path="actual-spend"
                element={
                  <main className="space-y-6 p-4 md:p-6">
                    <Suspense fallback={<PageLoading />}>
                      <ActualSpendPanel />
                    </Suspense>
                  </main>
                }
              />
              <Route
                path="vendors"
                element={
                  <main className="space-y-6 p-4 md:p-6">
                    <Suspense fallback={<PageLoading />}>
                      <VendorsPanel />
                    </Suspense>
                  </main>
                }
              />
            </Route>
            <Route
              path="/contacts"
              element={
                <main className="space-y-6 p-4 md:p-6">
                  <ContactsLayout />
                </main>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<PageLoading />}>
                    <ContactsPanel />
                  </Suspense>
                }
              />
              <Route
                path="lists"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <MailingListsPanel />
                  </Suspense>
                }
              />
              <Route
                path="lists/:listId"
                element={
                  <IdParamGuard param="listId">
                    <Suspense fallback={<PageLoading />}>
                      <MailingListsPanel />
                    </Suspense>
                  </IdParamGuard>
                }
              />
              <Route
                path="qr-codes"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <QrCodesPanel />
                  </Suspense>
                }
              />
              <Route
                path="qr-codes/:id"
                element={
                  <IdParamGuard param="id">
                    <Suspense fallback={<PageLoading />}>
                      <QrCodeDetailPage />
                    </Suspense>
                  </IdParamGuard>
                }
              />
              <Route
                path=":id"
                element={
                  <IdParamGuard>
                    <Suspense fallback={<PageLoading />}>
                      <ContactDetailPage />
                    </Suspense>
                  </IdParamGuard>
                }
              />
            </Route>
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
                  <IdParamGuard>
                    <Suspense fallback={<PageLoading />}>
                      <MemberDetailPage />
                    </Suspense>
                  </IdParamGuard>
                </main>
              }
            />
            <Route path="/print" element={null} />
            <Route path="*" element={<NotFoundPage />} />
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
