"use client"

import { useRouter } from 'next/navigation'
import Styles from '@/app/styles/hero.module.css'
import { Header } from '@/app/components'

const Hero = () => {
  const router = useRouter()

  return (
    <>
      <Header />
      <main className={Styles.hero}>
        <section className={Styles.content} aria-labelledby="hero-title">
          <p className={Styles.badge}>
            <span className={Styles.spark}>✦</span>
            AI-Powered Shopify Growth Platform
          </p>

          <h1 id="hero-title" className={Styles.title}>
            Optimize Your Shopify Store With <span className={Styles.highlight}>AI</span>
          </h1>

          <p className={Styles.description}>
            Generate SEO that converts, sync products intelligently, and automate Shopify workflows from one polished growth dashboard.
          </p>

          <div className={Styles.actions}>
            <button
              className={Styles.primaryButton}
              onClick={() => router.push('/auth/register')}
            >
              Get Started
            </button>
            <button
              className={Styles.secondaryButton}
              onClick={() => router.push('/auth/login')}
            >
              Sign In
            </button>
          </div>
        </section>
        <div className={Styles.visualSpace} aria-hidden="true" />
      </main>
    </>
  )
}

export default Hero
