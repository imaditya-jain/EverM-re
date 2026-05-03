import Styles from '@/app/styles/auth.module.css'
import { ReactNode } from 'react';

interface authLayoutProps{
  title?: string;
  paragraph?: string;
  children: ReactNode
}

const AuthLayout = ({title, paragraph, children}: authLayoutProps) => {
  return (
    <>
      <div className={`min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 auto-rows-min lg:auto-rows-auto p-4 ${Styles.root}`}>
        <div className='flex justify-center lg:items-center'>
          <div className='w-full lg:w-[85%] flex flex-col gap-6'>
            <p className='inter text-[#0d2033] text-sm md:text-[18px] lg:text-2xl'>Find Your Kind <br /> of Connection</p>
            <h1 className='inter text-[#0d2033] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl' style={{ lineHeight: 1.1 }}>Make new people.<br />Make real connections.</h1>
            <p className='inter text-[#0d2033]/70 text-sm md:text-[18px] lg:text-2xl'>Discover meaningful conversations, genuine connections, and people who truly match your energy.</p>
            <div></div>
          </div>
        </div>
        <div className='flex justify-center lg:items-center'>
          <div className='w-full lg:w-[85%]'>
            <div className='shadow bg-[#fff] rounded-4xl p-8'>
              <div className='flex flex-col gap-2 md:gap-3 lg:gap-4'>
                <p className='inter text-[#0d2033]/70 text-sm md:text-[18px] lg:text-2xl tracking-wide font-medium'>EVERMORE</p>
              <h2 className='inter text-4xl xl:text-5xl font-bold text-[#0d2033]'>{title}</h2>
              <p className='inter text-[#0d2033]/70 text-sm md:text-[18px] lg:text-2xl'>{paragraph}</p>
              <div>{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthLayout
