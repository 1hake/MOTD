import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo2 from '../assets/img/logoblack.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login({ email, password })
      navigate('/feed')
    } catch (error: any) {
      console.error('Login failed:', error)
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.'
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
            <h1 className="text-4xl font-black text-black mb-2 italic uppercase">Connexion</h1>
            <p className="text-black font-bold text-lg">Partagez votre musique du jour</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Se connecter</span>
                </span>
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-black font-bold">
              Pas encore de compte?{' '}
              <Link
                to="/signup"
                className="font-black text-black hover:bg-pop-mint px-2 py-1 border-2 border-transparent hover:border-black transition-all rounded-lg underline decoration-2 underline-offset-2"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
