"use client"

import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import InputField from '../fields/input.field'
import { toast } from 'react-toastify'
import { useAppDispatch } from '@/lib/hooks'
import { forgotPasswordHandler } from '@/lib/features/auth.feature'

const ForgotPasswordForm = () => {
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
    })

    type ForgotPasswordFormValues = {
        loginId: string
    }

    const { register, reset, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({ resolver: yupResolver(schema), mode: "onBlur" })

    const fields = [
        { id: 'field-1', label: 'Email or Username', name: 'loginId', type: 'text', placeholder: '', required: true }
    ] as const

    const handleForgotPassword = async (data: ForgotPasswordFormValues) => {
        try {

            const response = await dispatch(forgotPasswordHandler(data)).unwrap()

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
            <form onSubmit={handleSubmit(handleForgotPassword)}>
                {
                    fields.map((field) => <InputField<ForgotPasswordFormValues> key={field.id} label={field.label} name={field.name} type={field.type} placeholder={field.placeholder} register={register} errors={errors} required={field.required} />)
                }
                <div className="mt-4">
                    <button type="submit" className="inter h-[45px] w-full rounded-[8px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] text-base font-semibold text-white shadow-[0_16px_32px_rgba(109,40,217,0.22)]">Reset Password</button>
                </div>
            </form>
        </>
    )
}

export default ForgotPasswordForm
