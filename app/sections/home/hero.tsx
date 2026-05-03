"use client"

import { useRouter } from 'next/navigation'
import Styles from '@/app/styles/hero.module.css'
import { GrAppleAppStore } from 'react-icons/gr'
import { BsGooglePlay } from 'react-icons/bs'
import { Header } from '@/app/components'

const Hero = () => {
  const router = useRouter()

  const textBase =
    'text-[#0d2033] inter font-light tracking-wide'

  const storeButton =
    'flex gap-2 items-center justify-between py-2 px-4 border border-[#a3a3a3] w-50 rounded-full'

  return (
    <>
    <Header />
    <div className={`${Styles.hero} flex flex-col justify-center-safe items-center gap-8`}>
      <div>
        <p className={`text-center text-sm md:text-[18px] lg:text-2xl ${textBase}`}>
          Find Your <br /> Kind of Connection
        </p>

        <h1 className='text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-[#0d2033] pompiere'>
          Make new people. <br /> Make real connections.
        </h1>
      </div>
      <div>
        <button
          className='
            bg-[#0d2033] text-[#ffffff]
            border-2 border-[#0d2033]
            text-[18px] lg:text-2xl
            px-6 py-3
            rounded-full
            tracking-wide
            transition-all duration-300 ease-in-out
            hover:bg-transparent hover:text-[#0d2033]
            inter
          '
          onClick={()=> router.push('/auth/register')}
        >
          Get Started
        </button>
      </div>

      <div className='absolute bottom-8 left-8 flex flex-col gap-4'>
        
        <p className={`text-sm md:text-[18px] lg:text-2xl ${textBase}`}>
          Safe Simple, <br /> and 100% free to start
        </p>

        <div className='hidden sm:flex gap-2'>
          
          <div className={storeButton}>
            <p className='inter text-[#0d2033]'>
              Available on <br /> App Store
            </p>
            <GrAppleAppStore className='text-[#0d2033] text-2xl' />
          </div>

          <div className={storeButton}>
            <p className='inter text-[#0d2033]'>
              Available on <br /> Google Play
            </p>
            <BsGooglePlay className='text-[#0d2033] text-2xl' />
          </div>

        </div>
      </div>
    </div>
    </>
  )
}

export default Hero