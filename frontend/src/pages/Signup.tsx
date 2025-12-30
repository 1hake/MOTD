import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo2 from '../assets/img/logoblack.png'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signup, isLoading } = useAuth()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return // Prevent multiple submissions

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setError('')

    try {
      await signup({ email, password })
      navigate('/feed')
    } catch (error: any) {
      console.error('Signup failed:', error)
      const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.'
      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Logo */}
        <div className="w-full flex justify-center mb-4 mt-8">
          <img src={logo2} alt="DIGGER" className="w-64" />
        </div>

        <div className="card w-full max-w-md mx-auto p-8 relative z-10 animate-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-black mb-2 italic uppercase">Inscription</h1>
            <p className="text-black font-bold text-lg">Partagez votre musique du jour</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-pop-red border-3 border-black text-black px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-neo-sm">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-black text-black uppercase">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="input-field"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-black text-black uppercase">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-black font-bold flex items-center gap-2">
                <span className="text-sm">🔒</span>
                <span>Minimum 6 caractères</span>
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                  Inscription...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>S'inscrire</span>
                </span>
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-black font-bold">
              Déjà un compte?{' '}
              <Link
                to="/"
                className="font-black text-black hover:bg-pop-pink px-2 py-1 border-2 border-transparent hover:border-black transition-all rounded-lg underline decoration-2 underline-offset-2"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
