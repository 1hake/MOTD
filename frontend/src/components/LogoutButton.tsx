import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { unregisterPush } from '../push'

interface LogoutButtonProps {
  className?: string
}

export default function LogoutButton({ className = '' }: LogoutButtonProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await unregisterPush()
    } catch (e) {
      console.error('Error during push unregistration:', e)
    }
    await logout()
    navigate('/')
  }

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 bg-pop-red text-black font-black uppercase italic border-2 border-black rounded-lg shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-200 ${className}`}
    >
      Déconnexion
    </button>
  )
}
