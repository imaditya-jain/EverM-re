"use client"

import { AuthLayout } from '../../../components/index'
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function VerifyUserContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  return (<>
    <AuthLayout title='Verify Your Email' paragraph='We’ve sent a verification link to your email address. Verify your account to unlock the full EverMore experience and start making real connections.'>
      <div></div>
    </AuthLayout>
  </>)
}

export default function VerifyUser() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyUserContent />
    </Suspense>
  )
}