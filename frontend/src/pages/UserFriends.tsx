import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import FollowButton from '../components/FollowButton'

type Friend = {
    id: number
    email: string
    name?: string
    platformPreference?: string
}

export default function UserFriends() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [user, setUser] = useState<Friend | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { userId } = useParams()
    const { user: currentUser, isAuthenticated } = useAuth()

    useEffect(() => {
        ; (async () => {
            if (!isAuthenticated || !currentUser) {
                navigate('/login')
                return
            }

            try {
                setLoading(true)

                // If no userId provided, show current user's friends
                const targetUserId = userId ? parseInt(userId, 10) : currentUser.id

                if (userId && !Number.isFinite(targetUserId)) {
                    navigate('/profile')
                    return
                }

                // Fetch user info
                const userRes = await api.get(`/users/${targetUserId}`)
                setUser(userRes.data)

                // Only fetch friends list for current user (privacy)
                if (targetUserId === currentUser.id) {
                    const friendsRes = await api.get('/friends')
                    setFriends(friendsRes.data)
                } else {
                    // For other users, we can't show their friends list for privacy
                    setFriends([])
                }
            } catch (error) {
                console.error('Error fetching friends data:', error)
                navigate('/profile')
            } finally {
                setLoading(false)
            }
        })()
    }, [navigate, userId, isAuthenticated, currentUser])

    // Helper function to capitalize first letter
    const capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    if (loading) {
        return <LoadingState message="Chargement des amis..." />
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
                <div className="text-center space-y-4">
                    <div className="text-6xl">❌</div>
                    <div className="text-xl font-semibold text-red-600">Utilisateur non trouvé</div>
                </div>
            </div>
        )
    }

    const isOwnProfile = !userId || (currentUser && user.id === currentUser.id)
    const canViewFriends = isOwnProfile

    return (
        <div className="min-h-screen text-gray-100">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Back button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(isOwnProfile ? '/profile' : `/profile/${user.id}`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour au profil
                    </button>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isOwnProfile ? 'Mes amis' : `Amis de ${user.name || user.email.split('@')[0]}`}
                    </h1>
                    {canViewFriends && (
                        <p className="text-gray-400">
                            {friends.length} ami{friends.length > 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Friends List */}
                {!canViewFriends ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">🔒</div>
                        <h3 className="text-2xl font-semibold text-gray-200 mb-4">
                            Liste d'amis privée
                        </h3>
                        <p className="text-lg text-gray-500">
                            Cette personne a choisi de garder sa liste d'amis privée.
                        </p>
                    </div>
                ) : friends.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">👥</div>
                        <h3 className="text-2xl font-semibold text-gray-200 mb-4">
                            {isOwnProfile ? 'Aucun ami pour le moment' : 'Aucun ami à afficher'}
                        </h3>
                        <p className="text-lg text-gray-500 mb-6">
                            {isOwnProfile ? 'Commencez à suivre des personnes pour agrandir votre réseau !' : 'Cette personne n\'a pas encore d\'amis.'}
                        </p>
                        {isOwnProfile && (
                            <button
                                onClick={() => navigate('/friends')}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                            >
                                Découvrir des amis
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {friends.map((friend) => (
                            <div
                                key={friend.id}
                                className="bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 p-6"
                            >
                                {/* Avatar and basic info */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                        {friend.name ? friend.name.charAt(0).toUpperCase() : friend.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white text-lg leading-tight">
                                            {friend.name || friend.email.split('@')[0]}
                                        </h3>
                                        <p className="text-indigo-300 text-sm">@{friend.email.split('@')[0]}</p>
                                    </div>
                                </div>

                                {/* Platform preference */}
                                {friend.platformPreference && (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
                                        </svg>
                                        <span>{capitalizeFirstLetter(friend.platformPreference)}</span>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/profile/${friend.id}`)}
                                        className="flex-1 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 rounded-lg transition-all duration-200 text-sm font-medium"
                                    >
                                        Voir le profil
                                    </button>
                                    {currentUser && friend.id !== currentUser.id && (
                                        <FollowButton currentUserId={currentUser.id} targetUserId={friend.id} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}