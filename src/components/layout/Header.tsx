import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportDropdown } from "./ExportDropdown";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPrint: () => void;
  onEmail: () => void;
}

export function Header({ activeTab, onTabChange, onPrint, onEmail }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold">Badger Budget</h1>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budget">Budgets</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ExportDropdown onPrint={onPrint} onEmail={onEmail} />
    </header>
  );
}
