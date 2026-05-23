import { ReactNode } from 'react';
import Styles from '@/app/styles/auth.module.css'

interface authLayoutProps{
  title?: string;
  paragraph?: string;
  children: ReactNode
}

const AuthLayout = ({title, paragraph, children}: authLayoutProps) => {
  return (
    <>
      <div className={`min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 auto-rows-min lg:auto-rows-auto gap-8 p-4 sm:p-6 ${Styles.root}`}>
        <div className='flex justify-center pt-8 lg:items-center lg:pt-0'>
          <div className='w-full lg:w-[85%] flex flex-col gap-5'>
            <p className='inter text-[var(--primary)] text-sm md:text-base lg:text-lg font-semibold'>AI-Powered Shopify Growth Platform</p>
            <h1 className='sora text-[var(--foreground)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold' style={{ lineHeight: 1.08 }}>Optimize your Shopify store with AI.</h1>
            <p className='inter text-[var(--muted)] text-base md:text-lg lg:text-xl leading-8'>Generate SEO, sync products, and monitor store performance from one focused workspace.</p>
            <div></div>
          </div>
        </div>
        <div className='flex justify-center lg:items-center'>
          <div className='w-full lg:w-[85%]'>
            <div className='border border-[var(--border)] bg-[rgba(255,255,255,0.88)] rounded-[8px] p-6 shadow-[0_24px_70px_rgba(109,40,217,0.14)] backdrop-blur md:p-8'>
              <div className='flex flex-col gap-2 md:gap-3 lg:gap-4'>
                <p className='inter text-[var(--primary)] text-sm md:text-base tracking-wide font-semibold'>STOREPILOT AI</p>
              <h2 className='sora text-3xl xl:text-5xl font-bold text-[var(--foreground)]'>{title}</h2>
              <p className='inter text-[var(--muted)] text-sm md:text-base lg:text-lg leading-7'>{paragraph}</p>
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
