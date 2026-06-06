"use client";

import { authClient } from "@/lib/utils/auth/auth-client";
import { Hero } from "@/components/ui/hero-1";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { ChatSimulation } from "./chat-simulation/ChatSimulation";

export function HeroSection() {
    const { data: session } = authClient.useSession();
    const ctaHref = session ? "/dashboard" : "/sign-in";

    return (
        <div className="relative flex flex-col justify-center items-center dark">
            <Hero
                eyebrow=""
                title={
                    <>
                        Bisnis Anda,
                        <br />
                        membalas 24/7.
                    </>
                }
                subtitle="Luncurkan agen AI otonom yang menangani pertanyaan pelanggan, menutup penjualan, dan mengelola tiket bantuan dengan presisi layaknya manusia saat Anda beristirahat."
                ctaLabel="Luncurkan Agen Anda"
                ctaHref={ctaHref}
            />
            <div className="relative w-full h-[15rem] md:h-[30rem]">
                <div className="absolute -top-[80%] md:-top-[90%] lg:-top-[50%] w-full">
                    <ContainerScroll
                        titleComponent={
                            <></>
                        }
                    >
                        <ChatSimulation />
                    </ContainerScroll>
                </div>
            </div>
        </div>
    );
}
