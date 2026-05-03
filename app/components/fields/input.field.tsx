import React from 'react'

interface InputFieldProps{
    label: string
}

const InputField = ({label}:InputFieldProps) => {
  return (
    <div>
      <label htmlFor={label}>{label}</label>
    </div>
  )
}

export default InputField
