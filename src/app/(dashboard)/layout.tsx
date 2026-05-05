import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Sidebar from "@/components/personal/Sidebar";
import { BusinessProvider } from "@/components/features/business/BusinessProvider";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BusinessProvider>
      <SidebarProvider>
        <Sidebar />
        <main className="flex-1 w-full flex flex-col h-full bg-background overflow-auto relative">
          <div className="md:hidden flex items-center p-4 border-b border-outline-variant/10 bg-surface-container shrink-0 sticky top-0 z-40">
            <SidebarTrigger />
            <span className="ml-3 font-headline font-bold text-on-surface">Chatly</span>
          </div>
          {children}
        </main>
      </SidebarProvider>
    </BusinessProvider>
  );
}
