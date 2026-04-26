"use client"

import { useSearchParams } from "next/navigation"

const VerifyUser = () => {
const searchParams = useSearchParams()
const token = searchParams.get('token')

  return (
    <>
      
    </>
  )
}

export default VerifyUser
