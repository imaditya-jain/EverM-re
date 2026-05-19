'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/hooks'

const ProtectedRoute = ({children,}: {children: React.ReactNode}) => {
    const router = useRouter()
    const { isAuthenticated, initialized } = useAppSelector((state) => state.auth)

    useEffect(() => {
        if (initialized && !isAuthenticated) {
            router.replace('/auth/login')
        }
    }, [initialized, isAuthenticated, router])

    if (!initialized) {
        return <div>Loading...</div>
    }

    if (initialized && !isAuthenticated) {
        return null
    }

    return <>{children}</>
}

export default ProtectedRoute