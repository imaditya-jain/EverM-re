import { AuthLayout, LoginForm } from '@/app/components'
import React from 'react'

const Login = () => {
  return (
    <AuthLayout title='Welcome Back' paragraph='Sign in to manage your Shopify SEO, product syncs, and AI growth workflows.'>
      <LoginForm />
    </AuthLayout>
  )
}

export default Login
