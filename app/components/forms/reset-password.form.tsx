"use client"

import { useSearchParams } from "next/navigation"
import { useForm} from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import InputField from "../fields/input.field"
import { useAppDispatch } from "@/lib/hooks"
import { resetPasswordHandler } from "@/lib/features/auth.feature"
import { toast } from "react-toastify"

const ResetPasswordForm = () => {
      const dispatch = useAppDispatch()
      const searchParams = useSearchParams()
      const token = searchParams.get("token")

    const schema = yup.object({
        password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required."),
        cPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match").required("Confirm Password is required."),
    })

    const { handleSubmit, register, reset, formState: { errors } } = useForm({ resolver: yupResolver(schema), mode: 'onBlur' })

    const fields = [
        { id: 'field-1', label: 'Password', name: 'password', type: 'password', placeholder: '', required: true },
        { id: 'field-2', label: 'Confirm Password', name: 'cPassword', type: 'password', placeholder: '', required: true },
    ] as const

       type ResetPasswordFormValues = {
        password: string
        cPassword: string
    }

    const handleOnSubmit = async (data: ResetPasswordFormValues) =>{
        try {
            const response = await dispatch(resetPasswordHandler({...data, token})).unwrap()

             const { success, error, message } = response
            
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
            <form onSubmit={handleSubmit(handleOnSubmit)}>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {
                            fields.map(field => <InputField key={field.id} label={field?.label} name={field.name} type={field.type} placeholder={field.placeholder} required={field.required} register={register} errors={errors}  />)
                        }
                    </div>
                    <div>
                        <button type="submit" className="inter h-[45px] w-full rounded-[8px] bg-[linear-gradient(135deg,var(--primary),var(--primary-light))] text-base font-semibold text-white shadow-[0_16px_32px_rgba(109,40,217,0.22)]">Reset Password</button>
                    </div>
                </div>
            </form>
        </>
    )
}

export default ResetPasswordForm
