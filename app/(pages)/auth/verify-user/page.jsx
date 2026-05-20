"use client"

import { AuthLayout } from '../../../components/index'
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { toast } from 'react-toastify'
import { useAppDispatch } from "@/lib/hooks"
import { verifyUserHandler } from "@/lib/features/auth.feature"

function VerifyUserContent() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const handleVerifyAccount = async () => {
    try {
      if (token) {
        const response = await dispatch(verifyUserHandler(token)).unwrap()

        if (response.success && response.message) {
          toast.success(response?.message)
          router.push("/dashbaord")
        } else if (!response.success && response.error) {
          toast.error(response.error)
        }

      } else {
        router.back()
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.")
    }
  }

  return (<>
    <AuthLayout title='Verify Your Email' paragraph='We’ve sent a verification link to your email address. Verify your account to unlock the full EverMore experience and start making real connections.'>
      <div>
        <button onClick={handleVerifyAccount} className="w-full h-11.25 bg-[#0d2033] text-[#fff] text-[20px] font-semibold inter rounded-[10px]">Verify Account</button>
      </div>
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
