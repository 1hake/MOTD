import classNames from 'classnames'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  color?: 'light' | 'dark'
  size?: 'small' | 'large'
  type?: 'button' | 'submit' | 'reset'
}

const Button = ({
  children,
  onClick,
  disabled = false,
  color = 'light',
  size = 'large',
  className,
  type = 'button'
}: Props) => {
  const baseClasses = 'border-2 rounded-lg cursor-pointer transition-transform duration-150 ease-in-out'
  const lightClasses = 'bg-white text-black border-black'
  const darkClasses = 'bg-black text-white border-white'
  const disabledClasses = 'opacity-50 cursor-not-allowed'

  const sizeClasses = size === 'small' ? 'px-2 py-1 text-sm' : 'px-4 py-2 text-lg'
  const shadowClass =
    size === 'small'
      ? color === 'light'
        ? 'shadow-light-small'
        : 'shadow-dark-small'
      : color === 'light'
      ? 'shadow-light-large'
      : 'shadow-dark-large'

  const colorClasses = color === 'light' ? lightClasses : darkClasses

  const classes = classNames(baseClasses, colorClasses, sizeClasses, shadowClass, className, {
    [disabledClasses]: disabled
  })

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(classes)}
      aria-disabled={disabled}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.classList.add('scale-95')
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.classList.remove('scale-95')
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.classList.remove('scale-95')
      }}
      onTouchStart={(e) => {
        if (!disabled) e.currentTarget.classList.add('scale-95')
      }}
      onTouchEnd={(e) => {
        if (!disabled) e.currentTarget.classList.remove('scale-95')
      }}
      onTouchCancel={(e) => {
        if (!disabled) e.currentTarget.classList.remove('scale-95')
      }}
    >
      {children}
    </button>
  )
}

export default Button
