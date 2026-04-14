"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
} from '@/components/ui/dropdown-menu';

export default function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Training', path: '/training', icon: BrainCircuit },
    { name: 'API Management', path: '/api-management', icon: Code2 },
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { name: 'API Docs', path: '/api-docs', icon: FileText },
  ];

  return (
    <ShadcnSidebar variant="sidebar" className="border-r border-outline-variant/15 shadow-[40px_0_40px_rgba(4,15,28,0.15)] z-50 bg-surface-container-low transition-all duration-200">
      <SidebarHeader className="py-6 px-4 bg-transparent border-0">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 bg-primary-container rounded-sm flex items-center justify-center text-on-primary-container font-black">
            <Rocket className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-primary-container font-headline tracking-wide">Chatly AI</span>
        </div>
        
        <div className="p-3 bg-surface-container rounded-sm border border-outline-variant/10 cursor-pointer group transition-all duration-200 hover:bg-surface-container-high">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-outline mb-1 font-label">Business Switcher</p>
              <p className="font-bold text-on-surface truncate text-sm">Acme Corp</p>
              <p className="text-xs text-outline mt-0.5">Manage Enterprise</p>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-outline group-hover:text-secondary-fixed transition-colors" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 bg-transparent custom-scrollbar">
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path || pathname?.startsWith(item.path);
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive}
                    className={cn(
                      "flex items-center gap-3 px-4 py-5 rounded-sm font-inter text-[15px] font-medium transition-all duration-200 group h-auto",
                      isActive 
                        ? "bg-surface-container text-secondary-fixed border-r-[3px] border-secondary-fixed hover:bg-surface-container hover:text-secondary-fixed" 
                        : "text-outline hover:bg-surface-container hover:text-on-surface border-r-[3px] border-transparent"
                    )}
                  >
                    <Link href={item.path}>
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
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-sm bg-secondary-fixed text-on-secondary font-bold text-xs uppercase tracking-widest transition-transform active:scale-95 hover:scale-[1.02]">
          <Plus className="w-4 h-4" />
          <span>Create New Business</span>
        </button>

        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              className="flex items-center gap-3 px-4 py-5 text-outline hover:bg-surface-container hover:text-on-surface rounded-sm transition-all text-sm font-medium h-auto"
            >
              <Link href="/settings">
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              className="flex items-center gap-3 px-4 py-5 text-outline hover:bg-surface-container hover:text-on-surface rounded-sm transition-all text-sm font-medium h-auto"
            >
              <Link href="/support">
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

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
                      <AvatarImage src="" alt="Authenticated User" />
                      <AvatarFallback className="text-secondary-fixed text-xs font-bold rounded-md">JD</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                      <span className="truncate font-bold text-on-surface">John Doe</span>
                      <span className="truncate text-[11px] text-outline mt-0.5">Admin</span>
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
                        <AvatarImage src="" alt="Authenticated User" />
                        <AvatarFallback className="bg-surface-container-high text-secondary-fixed">JD</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-bold text-on-surface">John Doe</span>
                        <span className="truncate text-xs text-outline">john.doe@example.com</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <div className="p-1">
                    <DropdownMenuItem className="text-error focus:text-error focus:bg-error/10 cursor-pointer rounded-sm py-2">
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
