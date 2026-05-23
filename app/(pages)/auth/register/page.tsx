import { AuthLayout } from '@/app/components'
import {RegistrationForm} from '@/app/components'
import React from 'react'

const Register = () => {
  return (
    <AuthLayout title='Create Account' paragraph='Set up your workspace and start optimizing your Shopify catalog with AI.'>
     <RegistrationForm />
    </AuthLayout>
  )
}

export default Register
