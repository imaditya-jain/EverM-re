"use client"
import { useEffect } from "react"
import { useDebounce } from "use-debounce"
import { useForm, useWatch } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import InputField from "../fields/input.field"
import { useAppDispatch } from "@/lib/hooks"
import { userNameCheckHandler } from "@/lib/features/userNameCheck.feature"
import { resetUserNameCheckState } from "@/lib/slices/username-check.slice"
import { userRegistrationHandler } from "@/lib/features/auth.feature"
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify"


const RegistrationForm = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()


    const schema = yup.object({
        firstName: yup.string().matches(/^[A-Za-z]+$/, "Only alphabets are allowed for this field").required('Firstname is required.'),
        lastName: yup.string().matches(/^[A-Za-z]+$/, "Only alphabets are allowed for this field").required('Lastname is required.'),
        userName: yup.string().matches(/^[A-Za-z0-9_]+$/, "Only alphabets, numbers and underscore allowed").min(3, "Username must be at least 3 characters").required("Username is required."),
        email: yup.string().email('Email is invalid.').required('Email is required.'),
        phone: yup.string().matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number").required("Phone number is required."),
        password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required."),
        cPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match").required("Confirm Password is required."),
    })

    type RegistrationFormValues = {
        firstName: string
        lastName: string
        userName: string
        email: string
        phone: string
        password: string
        cPassword: string
    }

    const { register, handleSubmit, control, reset, formState: { errors }, } = useForm<RegistrationFormValues>({ resolver: yupResolver(schema), mode: 'onChange' })

    const userName = useWatch({ control, name: 'userName' })

    const [debouncedUserName] = useDebounce(userName, 500)

    useEffect(() => {
        if (!debouncedUserName || debouncedUserName.length < 3) {
            dispatch(resetUserNameCheckState())
            return
        }

        dispatch(userNameCheckHandler(debouncedUserName))
    }, [debouncedUserName, dispatch])

    const handleOnSubmit = async (data: RegistrationFormValues) => {
        try {
            const response = await dispatch(userRegistrationHandler(data)).unwrap()

            const { success, error, message } = response

            if (success && message) {
                toast.success(message)
            } else if (!success && error) {
                toast.error(error)
            }

        } catch (error) {
            console.log(error)
        } finally {
            reset()
        }
    }

    const fields: {
        id: string
        label: string
        name: keyof RegistrationFormValues
        type: string
        placeholder: string
        required: boolean
    }[] = [
            { id: 'field-1', label: 'Firstname', name: 'firstName', type: 'text', placeholder: 'John', required: true },
            { id: 'field-2', label: 'Lastname', name: 'lastName', type: 'text', placeholder: 'Doe', required: true },
            { id: 'field-3', label: 'Username', name: 'userName', type: 'text', placeholder: 'johndoe', required: true },
            { id: 'field-4', label: 'Email', name: 'email', type: 'email', placeholder: 'johndoe@example.com', required: true },
            { id: 'field-5', label: 'Phone', name: 'phone', type: 'tel', placeholder: '12345 67890', required: true },
            { id: 'field-6', label: 'Password', name: 'password', type: 'password', placeholder: '', required: true },
            { id: 'field-7', label: 'Confirm Password', name: 'cPassword', type: 'password', placeholder: '', required: true },
        ]

    return (
        <>
            <form onSubmit={handleSubmit(handleOnSubmit)}>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {
                            fields.map(field => <InputField key={field.id} label={field?.label} name={field.name} type={field.type} placeholder={field.placeholder} required={field.required} register={register} errors={errors} fieldValue={field.name === "userName" ? userName : undefined} />)
                        }
                    </div>
                    <div>
                        <button type="submit" className="w-full h-11.25 bg-[#0d2033] text-[#fff] text-[20px] font-semibold inter rounded-[10px]">Sign Up</button>
                    </div>
                    <div>
                        <p className='inter text-[#0d2033]/70'>Already have an account? <button type="button" onClick={() => router.push('/auth/login/')} className='text-[#0d2033]'>Log In</button></p>
                    </div>
                </div>
            </form>
        </>
    )
    
}

export default RegistrationForm
