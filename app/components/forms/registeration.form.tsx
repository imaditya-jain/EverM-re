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


const RegistrationForm = () => {
    const dispatch = useAppDispatch()

    const schema = yup.object({
        firstName: yup.string().matches(/^[A-Za-z]+$/, "Only alphabets are allowed for this field").required('Firstname is required.'),
        lastName: yup.string().matches(/^[A-Za-z]+$/, "Only alphabets are allowed for this field").required('Lastname is required.'),
        userName: yup.string().matches(/^[A-Za-z0-9_]+$/, "Only alphabets, numbers and underscore allowed").min(3, "Username must be at least 3 characters").required("Username is required."),
        email: yup.string().email('Email is invalid.').required('Email is required.'),
        phone: yup.string().matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number").required("Phone number is required."),
        password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required."),
        cPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match").required("Confirm Password is required."),
    })

    const { register, handleSubmit, control, formState: { errors }, } = useForm<RegistrationFormValues>({ resolver: yupResolver(schema), mode: 'onChange' })
    type RegistrationFormValues = {
        firstName: string
        lastName: string
        userName: string
        email: string
        phone: string
        password: string
        cPassword: string
    }

    const userName = useWatch({ control, name: 'userName' })

    const [debouncedUserName] = useDebounce(userName, 500)

    useEffect(() => {
        if (!debouncedUserName || debouncedUserName.length < 3) {
            dispatch(resetUserNameCheckState())
            return
        }

        dispatch(userNameCheckHandler(debouncedUserName.toString()))
    }, [debouncedUserName, dispatch])

    const handleOnSubmit = async () => {
        try {

        } catch (error) {
            console.log(error)
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {
                        fields.map(field => <InputField key={field.id} label={field?.label} name={field.name} type={field.type} placeholder={field.placeholder} required={field.required} register={register} errors={errors} fieldValue={field.name === "userName" ? userName : undefined} />)
                    }
                </div>
                <div className="mt-4">
                    <button type="submit" className="w-full h-11.25 bg-[#0d2033] text-[#fff] text-[20px] font-semibold inter rounded-[10px]">Sign Up</button>
                </div>
            </form>
        </>
    )
}

export default RegistrationForm
