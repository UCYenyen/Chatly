import React from 'react'
import SignInSection from '@/components/features/auth/SignInSection'
import Image from 'next/image'
import Link from 'next/link'
import Grainient from '@/components/personal/Grainient'

export default function page() {
  return (
    <main className='relative min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden p-6'>
      <div className="w-screen h-screen absolute top-0 left-0">
        <Grainient
          className="opacity-25"
          color1="#87b800"
          color2="#0013a0"
          color3="#131214"
          timeSpeed={0.55}
          colorBalance={0}
          warpStrength={1.75}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={580}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={0.85}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
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
        <SignInSection />
      </div>
    </main>
  )
}
