"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function VerifyUserContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  return <div>Token: {token}</div>
}

export default function VerifyUser() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyUserContent />
    </Suspense>
  )
}