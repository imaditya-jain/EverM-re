"use client"

import { initializeAuthSessionHandler } from "@/lib/features/auth.feature"
import { useAppDispatch } from "@/lib/hooks"
import { useEffect } from "react"

const AuthSessionProvide = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(initializeAuthSessionHandler())
    }, [dispatch])

    return (
        <>
            {children}
        </>
    )
}

export default AuthSessionProvide
