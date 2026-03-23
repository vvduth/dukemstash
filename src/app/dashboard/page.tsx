export default function DashboardPage() {
  return (
    <>
      <aside className="w-60 border-r border-border bg-sidebar shrink-0 p-4">
        <h2 className="font-semibold text-sidebar-foreground">Sidebar</h2>
      </aside>

      <main className="flex-1 overflow-auto bg-background p-6">
        <h2 className="font-semibold text-foreground">Main</h2>
      </main>
    </>
  );
}
