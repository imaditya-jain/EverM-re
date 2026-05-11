import { AuthLayout, ForgotPasswordForm } from '@/app/components'
import React from 'react'

const ForgotPassword = () => {
  return (
    <>
    <AuthLayout title='Forgot Your Password?' paragraph='No worries — it happens. Enter your email address and we’ll send you a secure link to reset your password and get back to meaningful connections.'>
      <ForgotPasswordForm />
    </AuthLayout>
    </>
  )
}

export default ForgotPassword
