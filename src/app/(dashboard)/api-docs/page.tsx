import { ApiHeader } from "@/components/features/api-docs/ApiHeader";
import { ApiHero } from "@/components/features/api-docs/ApiHero";
import { ImplementationGuide } from "@/components/features/api-docs/ImplementationGuide";
import { EndpointsList } from "@/components/features/api-docs/EndpointsList";
import { CodePanels } from "@/components/features/api-docs/CodePanels";
import { ApiFooter } from "@/components/features/api-docs/ApiFooter";

export default function ApiDocsPage() {
  return (
    <div className="flex-1 w-full flex flex-col min-h-full">
      <div className="px-10 lg:px-14 py-12 flex-1 max-w-[1500px] w-full mx-auto flex flex-col">
        <ApiHeader />

        <div className="mt-16 w-full max-w-3xl mb-16">
          <ApiHero />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-20 xl:gap-24 mb-24 w-full">
          <div className="flex flex-col gap-16">
            <ImplementationGuide />
            <EndpointsList />
          </div>

          <div className="flex flex-col">
            <CodePanels />
          </div>
        </div>

        <div className="mt-auto pt-10">
          <ApiFooter />
        </div>
      </div>
    </div>
  );
}
