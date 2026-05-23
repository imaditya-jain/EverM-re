"use client"

import { useAppSelector } from "@/lib/hooks";
import { useState } from "react";
import { UseFormRegister, FieldValues, Path, FieldErrors, } from "react-hook-form"
import { IoEye, IoEyeOff } from "react-icons/io5";

interface InputFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>
  type: string;
  placeholder: string;
  required: boolean;
  register: UseFormRegister<T>
  errors?: FieldErrors<T>
  fieldValue?: string
}

const InputField = <T extends FieldValues>({ label, name, type, placeholder, register, errors, fieldValue }: InputFieldProps<T>) => {
  const { success, hasChecked } = useAppSelector((state) => state.userNameCheck)
  const shouldShowUserNameStatus = name === "userName" && Boolean(fieldValue?.trim()) && hasChecked
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField =
    name === ("password" as Path<T>) ||
    name === ("cPassword" as Path<T>);


  return (
    <div>
      <label className='block inter text-[var(--muted-strong)] font-semibold mb-2' htmlFor={label}>{label}</label>
      <div className="relative" style={{ position: "relative" }}>
        <input
          type={
          isPasswordField
            ? showPassword
              ? "text"
              : "password"
            : type
        }
        placeholder={placeholder}
        {...register(name)}
        className={`block w-full text-[var(--foreground)] inter h-[45px] rounded-[8px] outline-0 border bg-white/90 px-3 transition focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(109,40,217,0.12)] ${isPasswordField ? "pr-10" : ""} placeholder:text-[#94a3b8] ${errors?.[name]
          ? "border-red-500"
          : "border-[var(--border)]"
          }`}
        />
        {
          name === 'password' || name === "cPassword" ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="z-10 px-3 text-[var(--muted-strong)]"
              style={{
                position: "absolute",
                right: "0.25rem",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          ) : null
        }
      </div>
      {
        shouldShowUserNameStatus && <p className={`inter ${success ? 'text-[var(--success)]' : 'text-red-500'}`}>{success ? 'Username Available' : 'Username Taken'}</p>
      }
      {errors?.[name] && (
        <p className="text-red-500 text-sm mt-1 inter">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  )
}

export default InputField
