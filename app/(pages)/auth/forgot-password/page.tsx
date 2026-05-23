import { AuthLayout, ForgotPasswordForm } from '@/app/components'
import React from 'react'

const ForgotPassword = () => {
  return (
    <>
    <AuthLayout title='Forgot Your Password?' paragraph="No worries. Enter your email address and we'll send you a secure link to get back into your workspace.">
      <ForgotPasswordForm />
    </AuthLayout>
    </>
  )
}

export default ForgotPassword
