import type React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
  size?: "small" | "medium" | "large"
}

export const Button: React.FC<ButtonProps> = ({ className = "", children, size = "medium", ...props }) => {
  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  }

  return (
    <button
      className={`${sizeClasses[size]} rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
