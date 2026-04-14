import { SignUpForm } from '@/components/features/auth/SignUpASection'
import React from 'react'

export default function page() {
  return (
    <main className='flex flex-col gap-4 justify-center items-center bg-background py-32 pt-48'>
      <SignUpForm />
    </main>
  )
}
