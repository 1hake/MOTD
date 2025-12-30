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
        <div className="min-h-screen pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header with Back button */}
                <div className="flex items-center gap-6 mb-12">
                    <button
                        onClick={() => navigate(isOwnProfile ? '/profile' : `/profile/${user.id}`)}
                        className="shrink-0 p-3 rounded-xl bg-white border-3 border-black shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all"
                    >
                        <svg className="w-6 h-6 text-black stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black text-black italic tracking-tight">
                            {isOwnProfile ? 'Mes amis' : `Amis de ${user.name || user.email.split('@')[0]}`}
                        </h1>
                        {canViewFriends && (
                            <div className="inline-block px-3 py-1 mt-2 bg-pop-pink border-2 border-black rounded-full text-sm font-bold shadow-neo-sm">
                                {friends.length} {friends.length > 1 ? 'amis' : 'ami'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Friends List */}
                {!canViewFriends ? (
                    <div className="card bg-white p-12 text-center mt-12">
                        <div className="w-24 h-24 mx-auto bg-pop-yellow border-3 border-black rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-neo transform -rotate-3">
                            🔒
                        </div>
                        <h3 className="text-3xl font-black text-black mb-4 italic">
                            Liste d'amis privée
                        </h3>
                        <p className="text-lg font-medium text-black/70 max-w-sm mx-auto">
                            Cette personne a choisi de garder sa liste d'amis privée.
                        </p>
                    </div>
                ) : friends.length === 0 ? (
                    <div className="card bg-white p-12 text-center mt-12">
                        <div className="w-24 h-24 mx-auto bg-pop-mint border-3 border-black rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-neo transform rotate-3">
                            👥
                        </div>
                        <h3 className="text-3xl font-black text-black mb-4 italic">
                            {isOwnProfile ? 'Aucun ami pour le moment' : 'Aucun ami à afficher'}
                        </h3>
                        <p className="text-lg font-medium text-black/70 mb-8 max-w-sm mx-auto">
                            {isOwnProfile ? 'Commencez à suivre des personnes pour agrandir votre réseau !' : 'Cette personne n\'a pas encore d\'amis.'}
                        </p>
                        {isOwnProfile && (
                            <button
                                onClick={() => navigate('/explorer')}
                                className="btn-primary"
                            >
                                🔍 Découvrir des amis
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {friends.map((friend) => (
                            <div
                                key={friend.id}
                                onClick={() => navigate(`/profile/${friend.id}`)}
                                className="card bg-white p-5 cursor-pointer group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-pop-purple border-3 border-black rounded-2xl flex items-center justify-center text-black text-2xl font-black shadow-neo-sm group-hover:rotate-3 transition-transform">
                                        {friend.name ? friend.name.charAt(0).toUpperCase() : friend.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-xl text-black truncate italic">
                                            {friend.name || friend.email.split('@')[0]}
                                        </h3>
                                        <p className="font-bold text-black/60 truncate">@{friend.email.split('@')[0]}</p>
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