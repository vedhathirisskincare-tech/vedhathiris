'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  name?: string
  id?: string
  placeholder?: string
  className?: string
  required?: boolean
}

export function PasswordInput({
  name = 'password',
  id = 'password',
  placeholder = '••••••••',
  className = '',
  required = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        id={id}
        required={required}
        placeholder={placeholder}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full focus:outline-none transition-colors"
        tabIndex={-1}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  )
}
