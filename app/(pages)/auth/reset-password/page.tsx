import { AuthLayout, ResetPasswordForm } from '@/app/components'
import React, { Suspense } from 'react'

const ResetPasswordContent = () => {
  return (
    <AuthLayout title='Create a New Password' paragraph='Choose a strong new password to keep your account safe and continue connecting with people who match your vibe.'>
      <ResetPasswordForm />
    </AuthLayout>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}