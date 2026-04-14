import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/personal/Sidebar";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar />
      <main className="flex-1 w-full flex flex-col h-full bg-background overflow-auto relative">
        {children}
      </main>
    </SidebarProvider>
  );
}
