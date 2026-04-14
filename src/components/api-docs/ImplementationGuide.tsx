export function ImplementationGuide() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="h-px w-8 bg-secondary-fixed"></div>
        <h2 className="text-2xl font-headline font-bold text-on-surface">Implementation Guide</h2>
      </div>
      
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-md p-8 flex flex-col gap-10">
        <p className="text-outline-variant text-[15px] leading-relaxed">
          Integrating Chatly into your existing workflow requires minimal overhead. Our proprietary widget injection method ensures that your AI CS representative loads asynchronously without impacting core DOM performance metrics.
        </p>

        <div className="flex flex-col gap-8">
          <div className="flex gap-6 items-start">
            <span className="text-2xl font-black font-headline text-secondary-fixed">01</span>
            <div className="flex flex-col gap-1 pt-1">
              <h3 className="font-bold text-on-surface text-base">Generate Identity</h3>
              <p className="text-sm text-outline leading-relaxed max-w-md">
                Navigate to the Business Switcher and generate a unique <span className="text-secondary-fixed font-mono text-[13px]">data-id</span> for your instance.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <span className="text-2xl font-black font-headline text-secondary-fixed">02</span>
            <div className="flex flex-col gap-1 pt-1">
              <h3 className="font-bold text-on-surface text-base">Inject Core Script</h3>
              <p className="text-sm text-outline leading-relaxed max-w-md">
                Place the optimized script tag before the closing <span className="text-secondary-fixed font-mono text-[13px]">&lt;/body&gt;</span> tag of your application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
