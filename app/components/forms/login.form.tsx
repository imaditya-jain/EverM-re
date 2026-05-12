"use client"

import { useForm } from 'react-hook-form'
import * as yup from "yup"
import { yupResolver } from '@hookform/resolvers/yup'
import InputField from '../fields/input.field'
import { useAppDispatch } from '@/lib/hooks'
import { toast } from 'react-toastify'
import { loginUserHandler } from '@/lib/features/auth.feature'
import { useRouter } from 'next/navigation'

const LoginForm = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()

    const schema = yup.object({
        loginId: yup
            .string()
            .required("Email or Username is required")
            .test(
                "is-email-or-username",
                "Enter valid email or username",
                (value) => {
                    if (!value) return false;

                    const emailRegex =
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                    const usernameRegex =
                        /^(?=.{3,20}$)[a-zA-Z0-9._]+$/;

                    return (
                        emailRegex.test(value) ||
                        usernameRegex.test(value)
                    );
                }
            ),
        password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required."),

    })

    const { register, reset, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        mode: 'onBlur'
    })

    const fields = [
        { id: 'field-1', label: 'Email or Username', name: 'loginId', type: 'text', placeholder: '', required: true },
        { id: 'field-2', label: 'Password', name: 'password', type: 'password', placeholder: '', required: true },
    ] as const

    type LoginFormValues = {
        loginId: string
        password: string
    }

    const handleOnLogin = async (data: LoginFormValues) => {
        try {
            const response = await dispatch(loginUserHandler(data)).unwrap()

            const { success, error, message } = response

            if (message && success) {
                toast.success(message)
            } else if (error && !success) {
                toast.error(error)
            }
        } catch (error) {
            console.log(error)
        } finally {
            reset()
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit(handleOnLogin)}>
                <div className='flex flex-col gap-4'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {
                            fields.map((field) => <InputField key={field.id} name={field.name} type={field.type} placeholder={field.placeholder} label={field.label} required={field.required} register={register} errors={errors} />)
                        }
                    </div>
                    <div>
                        <button type="submit" className="w-full h-11.25 bg-[#0d2033] text-[#fff] text-[20px] font-semibold inter rounded-[10px]">Sign In</button>
                    </div>
                    <div className='flex justify-between items-center'>
                        <p className='inter text-[#0d2033]/70'>Create an account <button type="button" onClick={() => router.push('/auth/register/')} className='text-[#0d2033]'>Sign Up</button></p>
                        <button className='inter text-[#0d2033]' type="button" onClick={() => router.push('/auth/forgot-password/')}>Forgot Password</button>
                    </div>
                </div>
            </form>
        </>
    )
}

export default LoginForm
