"use client";

import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
    LayoutDashboard,
    BarChart2,
    BrainCircuit,
    CreditCard,
    Plus,
    ChevronsUpDown,
    Rocket,
    MoreHorizontal,
    LogOut,
    ArrowLeft,
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

import { CreateBusinessModal } from "./CreateBusinessModal";
import { authClient } from "@/lib/utils/auth/auth-client";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { useWalletContext } from "@/components/features/billing/WalletProvider";
import { formatIDR } from "@/components/features/billing/billing-format";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const { data: walletData, isLoading: isWalletLoading } = useWalletContext();
    const params = useParams();
    const businessId = params?.businessId as string | undefined;
    const { businesses, activeBusiness, setActiveBusinessId, isLoading } =
        useBusinessContext();

    const handleSignOut = async (): Promise<void> => {
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
    const balanceLabel = isWalletLoading
        ? "Memuat..."
        : formatIDR(walletData?.balance ?? 0);

    const initials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

    const navItems = businessId
        ? [
            { name: "Ringkasan", path: `/business/${businessId}/ringkasan`, icon: LayoutDashboard },
            { name: "Analitik", path: `/business/${businessId}/analytics`, icon: BarChart2 },
            { name: "Pelatihan", path: `/business/${businessId}/training`, icon: BrainCircuit },
            { name: "Langganan", path: `/business/${businessId}/langganan`, icon: CreditCard },
        ]
        : [
            { name: "Beranda", path: "/dashboard", icon: LayoutDashboard },
            { name: "Billing", path: "/billing", icon: CreditCard },
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

                {businessId && (
                    <>
                        <div className="px-1">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 px-4 py-3 rounded-sm text-[13px] font-medium text-outline hover:bg-surface-container hover:text-on-surface transition-all duration-200 group border border-dashed border-outline-variant/20 mb-2"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                <span>Kembali ke Utama</span>
                            </Link>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={businesses.length === 0}>
                                <div className="p-3 bg-surface-container rounded-sm border border-outline-variant/10 cursor-pointer group transition-all duration-200 hover:bg-card outline-none">
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0">
                                            <p className="text-[10px] uppercase tracking-widest text-secondary-fixed mb-1 font-label">
                                                Pengalih Bisnis
                                            </p>
                                            <p className="font-bold text-secondary-fixed truncate text-sm">
                                                {activeBusiness
                                                    ? activeBusiness.name
                                                    : isLoading
                                                        ? "Memuat..."
                                                        : "Belum ada bisnis"}
                                            </p>
                                        </div>
                                        <ChevronsUpDown className="w-4 h-4 text-outline group-hover:text-secondary-fixed transition-colors shrink-0 ml-2" />
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] rounded-lg bg-surface border-outline-variant/20 shadow-xl z-100"
                                align="start"
                                sideOffset={8}
                            >
                                <DropdownMenuLabel className="text-outline text-[10px] uppercase tracking-widest px-3 py-2">
                                    Pilih Bisnis
                                </DropdownMenuLabel>
                                {businesses.map((business) => {
                                    const isActive = activeBusiness?.id === business.id;
                                    return (
                                        <DropdownMenuItem
                                            key={business.id}
                                            onClick={() => {
                                                setActiveBusinessId(business.id);
                                                router.push(`/business/${business.id}/ringkasan`);
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2.5 cursor-pointer rounded-sm transition-colors focus:bg-secondary/10 focus:text-secondary",
                                                isActive
                                                    ? "bg-surface-container-high text-secondary-fixed"
                                                    : "text-on-surface",
                                            )}
                                        >
                                            <span className="font-bold text-sm tracking-tight truncate">
                                                {business.name}
                                            </span>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}
            </SidebarHeader>

            <SidebarContent className="px-3 bg-transparent custom-scrollbar flex flex-col gap-4">
                <CreateBusinessModal>
                    <Button
                        variant={"default"}
                        className="py-6 rounded-sm uppercase text-[10px] tracking-[0.2em] font-black"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Bisnis Baru</span>
                    </Button>
                </CreateBusinessModal>
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
                                            <item.icon className="w-5 h-5 shrink-0" />
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
                                                Saldo: {balanceLabel}
                                            </span>
                                        </div>
                                        <MoreHorizontal className="ml-auto size-4 text-outline" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-surface border-outline-variant/20 shadow-xl z-100"
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
