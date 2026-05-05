"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const businessId = params.businessId as string;
  const { setActiveBusinessId, activeBusinessId, businesses, isLoading } = useBusinessContext();

  useEffect(() => {
    if (businessId && businessId !== activeBusinessId) {
      // Verify if the business exists before setting it
      const businessExists = businesses.some(b => b.id === businessId);
      if (businessExists || isLoading) {
        setActiveBusinessId(businessId);
      }
    }
  }, [businessId, activeBusinessId, setActiveBusinessId, businesses, isLoading]);

  return <>{children}</>;
}
