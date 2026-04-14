import { SignUpForm } from '@/components/features/auth/SignUpASection'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Prism from '@/components/personal/Prism'

export default function page() {
  return (
    <main className='relative min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden p-6 py-20'>
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          scale={3.6}
          height={4.2}
          baseWidth={4.4}
          noise={0.55}
          glow={1}
          hueShift={0}
          colorFrequency={1}
        />
      </div>

      <div className='z-10 flex flex-col items-center gap-8 w-full max-w-md'>
        <Link href="/">
          <Image 
            src="/logos/chatly-text.svg" 
            alt="Chatly Logo" 
            width={180} 
            height={60} 
            className="h-auto w-44 hover:opacity-80 transition-opacity" 
          />
        </Link>
        <SignUpForm />
      </div>
    </main>
  )
}
