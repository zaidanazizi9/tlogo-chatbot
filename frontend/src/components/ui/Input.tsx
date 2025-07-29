import type React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  icon?: string
}

export const Input: React.FC<InputProps> = ({ className = "", icon, ...props }) => {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
      <input
        className={`w-full px-4 py-4 ${icon ? "pl-12" : ""} border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-green-400 transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  )
}
