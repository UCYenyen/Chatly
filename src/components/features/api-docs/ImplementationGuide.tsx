export function ImplementationGuide() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="h-px w-8 bg-secondary-fixed"></div>
        <h2 className="text-2xl font-headline font-bold text-on-surface">Panduan Implementasi</h2>
      </div>
      
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-md p-8 flex flex-col gap-10">
        <p className="text-outline text-[15px] leading-relaxed">
          Mengintegrasikan Chatly ke dalam alur kerja Anda saat ini membutuhkan biaya minimal. Metode injeksi widget milik kami memastikan perwakilan AI CS Anda memuat secara asinkron tanpa memengaruhi metrik kinerja DOM inti.
        </p>

        <div className="flex flex-col gap-8">
          <div className="flex gap-6 items-start">
            <span className="text-2xl font-black font-headline text-secondary-fixed">01</span>
            <div className="flex flex-col gap-1 pt-1">
              <h3 className="font-bold text-on-surface text-base">Buat Identitas</h3>
              <p className="text-sm text-outline leading-relaxed max-w-md">
                Navigasikan ke Pengalih Bisnis dan buat <span className="text-secondary-fixed font-mono text-[13px]">data-id</span> unik untuk instans Anda.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <span className="text-2xl font-black font-headline text-secondary-fixed">02</span>
            <div className="flex flex-col gap-1 pt-1">
              <h3 className="font-bold text-on-surface text-base">Suntikkan Skrip Inti</h3>
              <p className="text-sm text-outline leading-relaxed max-w-md">
                Tempatkan tag skrip yang dioptimalkan sebelum tag penutup <span className="text-secondary-fixed font-mono text-[13px]">&lt;/body&gt;</span> aplikasi Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
