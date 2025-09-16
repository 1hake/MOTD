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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Back button */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(isOwnProfile ? '/profile' : `/profile/${user.id}`)}
                        className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1"
                    >
                        <div className="p-2 rounded-full bg-gray-800/50 group-hover:bg-gray-700/50 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <span className="font-medium">Retour au profil</span>
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
                    <div className="text-center py-24">
                        <div className="relative">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center text-6xl mb-8 shadow-2xl border border-gray-600/30">
                                🔒
                            </div>
                            <div className="max-w-md mx-auto">
                                <h3 className="text-3xl font-bold text-white mb-4">
                                    Liste d'amis privée
                                </h3>
                                <p className="text-lg text-gray-400 leading-relaxed">
                                    Cette personne a choisi de garder sa liste d'amis privée.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : friends.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="relative">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center text-6xl mb-8 shadow-2xl border border-indigo-500/30">
                                👥
                            </div>
                            <div className="max-w-md mx-auto">
                                <h3 className="text-3xl font-bold text-white mb-4">
                                    {isOwnProfile ? 'Aucun ami pour le moment' : 'Aucun ami à afficher'}
                                </h3>
                                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                    {isOwnProfile ? 'Commencez à suivre des personnes pour agrandir votre réseau !' : 'Cette personne n\'a pas encore d\'amis.'}
                                </p>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => navigate('/explorer')}
                                        className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
                                    >
                                        <span className="flex items-center gap-2">
                                            🔍 Découvrir des amis
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {friends.map((friend) => (
                            <div
                                key={friend.id}
                                onClick={() => navigate(`/profile/${friend.id}`)}
                                className="bg-gray-800/50 hover:bg-gray-800/70 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 p-4 cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg font-bold group-hover:scale-105 transition-transform duration-200">
                                        {friend.name ? friend.name.charAt(0).toUpperCase() : friend.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white text-base group-hover:text-gray-100 transition-colors">
                                            {friend.name || friend.email.split('@')[0]}
                                        </h3>
                                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">@{friend.email.split('@')[0]}</p>
                                    </div>
                                    {currentUser && friend.id !== currentUser.id && (
                                        <div
                                            className="flex-shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FollowButton currentUserId={currentUser.id} targetUserId={friend.id} />
                                        </div>
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