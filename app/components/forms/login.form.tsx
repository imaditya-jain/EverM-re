"use client"

import { useForm } from 'react-hook-form'
import * as yup from "yup"
import { yupResolver } from '@hookform/resolvers/yup'
import InputField from '../fields/input.field'
import { useAppDispatch } from '@/lib/hooks'
import { toast } from 'react-toastify'
import { loginUserHandler } from '@/lib/features/auth.feature'

const LoginForm = () => {
    const dispatch = useAppDispatch()

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
        mode: 'onChange'
    })

    const fields = [
        { id: 'field-1', label: 'Email or Username', name: 'loginId', type: 'text', placeholder: '', required: true },
        { id: 'field-2', label: 'Password', name: 'password', type: 'password', placeholder: '', required: true },
    ] as const

      type LoginFormValues = {
        loginId: string
        password: string
    }

    const handleOnLogin = async(data: LoginFormValues) =>{
        try {
            const response = await dispatch(loginUserHandler(data)).unwrap()

            const {success, error, message} = response
            
              if (message && success) {
                toast.success(message)
            } else if (error && !success) {
                toast.error(error)
            }
        } catch (error) {
            console.log(error)
        }finally{
            reset()
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit(handleOnLogin)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {
                    fields.map((field) => <InputField key={field.id} name={field.name} type={field.type} placeholder={field.placeholder} label={field.label} required={field.required} register={register} errors={errors} />)
                }
                </div>
                <div className="mt-4">
                    <button type="submit" className="w-full h-11.25 bg-[#0d2033] text-[#fff] text-[20px] font-semibold inter rounded-[10px]">Sign In</button>
                </div>
            </form>
        </>
    )
}

export default LoginForm
