import { UseFormRegister, FieldValues, Path, FieldErrors, } from "react-hook-form"

interface InputFieldProps <T extends FieldValues>{
  label: string;
  name: Path<T>
  type: string;
  placeholder: string;
  required: boolean;
  register: UseFormRegister<T>
  errors?: FieldErrors<T>
}

const InputField =<T extends FieldValues> ({ label, name, type, placeholder, required, register, errors }: InputFieldProps<T>) => {
  return (
    <div>
      <label className='block inter text-[#0d2033] font-semibold mb-2' htmlFor={label}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        // required={required}
        className={`block w-full text-[#0d2033] inter h-11.25 rounded-[10px] outline-0 border px-2 placeholder:text-[#a1a1a1] ${
          errors?.[name]
            ? "border-red-500"
            : "border-[#a1a1a1]"
        }`}
      />
      {errors?.[name] && (
        <p className="text-red-500 text-sm mt-1 inter">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  )
}

export default InputField
