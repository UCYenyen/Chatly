import React from 'react'
import SignInSection from '@/components/features/auth/SignInSection'
export default function page() {
  return (
    <main className='flex flex-col gap-4 justify-center items-center bg-background py-32 pt-48'>
      <SignInSection />
    </main>
  )
}
