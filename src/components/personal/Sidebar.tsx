"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BarChart2,
  BrainCircuit,
  Code2,
  CreditCard,
  FileText,
  Settings,
  HelpCircle,
  Plus,
  ChevronsUpDown,
  Rocket,
  MoreHorizontal,
  LogOut,
  Building2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";

import { authClient } from "@/lib/utils/auth/auth-client";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
          router.refresh();
        },
      },
    });
  };

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const businesses = [
    { name: "Acme Corp", type: "Perusahaan Terverifikasi", icon: Rocket },
    { name: "Global Tech", type: "B2B Penjualan", icon: Building2 },
    { name: "Startup X", type: "Inovasi Digital", icon: Zap },
  ];

  const [activeBusiness, setActiveBusiness] = useState(businesses[0]);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Analitik", path: "/analytics", icon: BarChart2 },
    { name: "Pelatihan", path: "/training", icon: BrainCircuit },
    { name: "Manajemen API", path: "/api-management", icon: Code2 },
    { name: "Billing", path: "/billing", icon: CreditCard },
    { name: "Dokumentasi API", path: "/api-docs", icon: FileText },
  ];

  return (
    <ShadcnSidebar
      variant="sidebar"
      className="border-r border-outline-variant/15 shadow-[40px_0_40px_rgba(4,15,28,0.15)] z-50 bg-surface-container-low transition-all duration-200"
    >
      <SidebarHeader className="py-6 px-4 bg-transparent border-0">
        <Link
          href={"/"}
          className="cursor-pointer flex items-center gap-3 mb-6 px-2"
        >
          <div className="w-8 h-8 bg-secondary-fixed rounded-sm flex items-center justify-center text-on-secondary font-black">
            <Rocket className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-on-surface font-headline tracking-wide">
            Chatly
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-3 bg-surface-container rounded-sm border border-outline-variant/10 cursor-pointer group transition-all duration-200 hover:bg-card outline-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-secondary-fixed mb-1 font-label">
                    Pengalih Bisnis
                  </p>
                  <p className="font-bold text-secondary-fixed truncate text-sm">
                    {activeBusiness.name}
                  </p>
                  <p className="text-xs text-outline mt-0.5">
                    Kelola Perusahaan
                  </p>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-outline group-hover:text-secondary-fixed transition-colors" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] rounded-lg bg-surface border-outline-variant/20 shadow-xl z-[100]"
            align="start"
            sideOffset={8}
          >
            <DropdownMenuLabel className="text-outline text-[10px] uppercase tracking-widest px-3 py-2">
              Pilih Bisnis
            </DropdownMenuLabel>
            {businesses.map((business) => (
              <DropdownMenuItem
                key={business.name}
                onClick={() => setActiveBusiness(business)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-sm transition-colors focus:bg-secondary/10 focus:text-secondary",
                  activeBusiness.name === business.name
                    ? "bg-surface-container-high text-secondary-fixed"
                    : "text-on-surface",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-sm flex items-center justify-center font-black",
                    activeBusiness.name === business.name
                      ? "bg-secondary-fixed text-on-secondary"
                      : "bg-surface-container-high text-outline",
                  )}
                >
                  <business.icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight">
                    {business.name}
                  </span>
                  <span className="text-[10px] text-outline">
                    {business.type}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 bg-transparent custom-scrollbar flex flex-col gap-4">
        <Button
          variant={"default"}
          className="py-6 rounded-sm uppercase text-[10px] tracking-[0.2em] font-black"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Bisnis Baru</span>
        </Button>
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.path || pathname?.startsWith(item.path);
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      "flex items-center gap-3 px-4 py-5 rounded-sm font-inter text-[15px] font-medium transition-all duration-200 group h-auto",
                      isActive
                        ? "bg-surface-container  text-secondary-fixed border-r-[3px] border-secondary-fixed hover:bg-surface-container hover:text-secondary-fixed"
                        : "text-outline hover:bg-surface-container hover:text-on-surface border-r-[3px] border-transparent",
                    )}
                  >
                    <Link href={item.path} data-transition-ignore>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pt-0 bg-transparent border-0 space-y-4">
        <SidebarMenu className="space-y-1">
          {/* <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              className="flex items-center gap-3 px-4 py-5 text-outline hover:bg-surface-container hover:text-on-surface rounded-sm transition-all text-sm font-medium h-auto"
            >
              <Link href="/settings" data-transition-ignore>
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span>Pengaturan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              className="flex items-center gap-3 px-4 py-5 text-outline hover:bg-surface-container hover:text-on-surface rounded-sm transition-all text-sm font-medium h-auto"
            >
              <Link href="/support" data-transition-ignore>
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                <span>Bantuan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem> */}

          {/* Authenticated User Section */}
          <div className="pt-4 mt-2 border-t border-outline-variant/15">
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-outline-variant/10 hover:bg-surface-container p-2 rounded-sm h-auto"
                  >
                    <Avatar className="h-9 w-9 rounded-md bg-surface-container-high border border-outline-variant/20">
                      <AvatarImage
                        src={user?.image || ""}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="text-secondary-fixed text-xs font-bold rounded-md">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                      <span className="truncate font-bold text-on-surface">
                        {user?.name || "User"}
                      </span>
                      <span className="truncate text-[11px] text-outline mt-0.5">
                        {user?.role === "ADMIN" ? "Admin" : "Akses Personal"}
                      </span>
                    </div>
                    <MoreHorizontal className="ml-auto size-4 text-outline" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-surface border-outline-variant/20 shadow-xl z-[100]"
                  side="right"
                  align="end"
                  sideOffset={14}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-3 py-2.5 text-left text-sm border-b border-outline-variant/10">
                      <Avatar className="h-8 w-8 rounded-md">
                        <AvatarImage
                          src={user?.image || ""}
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback className="bg-surface-container-high text-secondary-fixed">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-bold text-on-surface">
                          {user?.name || "User"}
                        </span>
                        <span className="truncate text-xs text-outline">
                          {user?.email || ""}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <div className="p-1">
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      variant="destructive"
                      className="cursor-pointer rounded-sm py-2"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
