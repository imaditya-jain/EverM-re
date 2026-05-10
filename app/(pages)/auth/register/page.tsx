import { AuthLayout } from '@/app/components'
import {RegistrationForm} from '@/app/components'
import React from 'react'

const Register = () => {
  return (
    <AuthLayout title='Sign Up' paragraph='Start your journey and connect with people who truly match your vibe.'>
     <RegistrationForm />
    </AuthLayout>
  )
}

export default Register
