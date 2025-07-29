import type React from "react"

interface CardProps {
  className?: string
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ className = "", children }) => {
  return <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>{children}</div>
}

interface CardHeaderProps {
  className?: string
  children: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className = "", children }) => {
  return <div className={`p-8 pb-4 text-center ${className}`}>{children}</div>
}

interface CardContentProps {
  className?: string
  children: React.ReactNode
}

export const CardContent: React.FC<CardContentProps> = ({ className = "", children }) => {
  return <div className={`p-8 pt-4 ${className}`}>{children}</div>
}

interface CardTitleProps {
  className?: string
  children: React.ReactNode
}

export const CardTitle: React.FC<CardTitleProps> = ({ className = "", children }) => {
  return <h1 className={`text-3xl font-bold mb-2 ${className}`}>{children}</h1>
}

interface CardDescriptionProps {
  className?: string
  children: React.ReactNode
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ className = "", children }) => {
  return <p className={`text-lg text-gray-600 leading-relaxed ${className}`}>{children}</p>
}
