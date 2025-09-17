import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import SongCard from '../components/SongCard'
import LoadingState from '../components/LoadingState'

type LikedPost = {
    id: number
    title: string
    artist: string
    description?: string
    link: string
    deezerLink?: string
    spotifyLink?: string
    appleMusicLink?: string
    youtubeLink?: string
    coverUrl?: string
    date: string
    likeDate: string // Date when user liked this post
    likeCount: number
    isLikedByUser: boolean
    user: {
        id: number
        name?: string
        email: string
        platformPreference?: string
    }
}

export default function LikedPosts() {
    const [likedPosts, setLikedPosts] = useState<LikedPost[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { user: currentUser, isAuthenticated } = useAuth()

    useEffect(() => {
        ; (async () => {
            if (!isAuthenticated || !currentUser) {
                navigate('/login')
                return
            }

            try {
                setLoading(true)
                const res = await api.get('/posts/liked')
                setLikedPosts(res.data)
            } catch (error) {
                console.error('Error fetching liked posts:', error)
            } finally {
                setLoading(false)
            }
        })()
    }, [navigate, isAuthenticated, currentUser])

    const handleLikeChange = (postId: number, isLiked: boolean, newLikeCount: number) => {
        if (!isLiked) {
            // If the post is unliked, remove it from the list
            setLikedPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId))
        } else {
            // If somehow re-liked, update the like count
            setLikedPosts((prevPosts) =>
                prevPosts.map((p) => (p.id === postId ? { ...p, isLikedByUser: isLiked, likeCount: newLikeCount } : p))
            )
        }
    }

    // Simple and clean date display for like dates
    const getDateDisplay = (dateString: string) => {
        const likeDate = new Date(dateString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)

        // Reset time to compare only dates
        const likeDateOnly = new Date(likeDate.getFullYear(), likeDate.getMonth(), likeDate.getDate())
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

        if (likeDateOnly.getTime() === todayOnly.getTime()) {
            return {
                displayText: "Aujourd'hui",
                isToday: true
            }
        } else if (likeDateOnly.getTime() === yesterdayOnly.getTime()) {
            return {
                displayText: 'Hier',
                isToday: false
            }
        } else {
            return {
                displayText: likeDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: likeDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                }),
                isToday: false
            }
        }
    }

    const groupPostsByLikeDate = (posts: LikedPost[]) => {
        const grouped: { [key: string]: LikedPost[] } = {}
        posts.forEach((post) => {
            const date = new Date(post.likeDate).toDateString()
            if (!grouped[date]) {
                grouped[date] = []
            }
            grouped[date].push(post)
        })
        return grouped
    }

    if (loading) {
        return <LoadingState message="Chargement des chansons aimées..." />
    }

    if (likedPosts.length === 0) {
        return (
            <div className="min-h-screen text-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => navigate('/profile')}
                                className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-3xl font-bold text-white">Chansons aimées</h1>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">💙</div>
                        <h3 className="text-2xl font-semibold text-gray-200 mb-4">Aucune chanson aimée</h3>
                        <p className="text-lg text-gray-500 mb-8">Explorez et aimez des chansons pour les retrouver ici !</p>
                        <button
                            onClick={() => navigate('/explorer')}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Explorer les chansons
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const groupedPosts = groupPostsByLikeDate(likedPosts)
    const sortedDates = Object.keys(groupedPosts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    return (
        <div className="min-h-screen text-gray-100">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-3xl font-bold text-white">Chansons aimées</h1>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-800/30 p-6">
                        <p className="text-gray-300">
                            {likedPosts.length} chanson{likedPosts.length > 1 ? 's' : ''} que vous avez aimée{likedPosts.length > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Liked Posts History - Always in list view */}
                <div className="space-y-8 mb-24">
                    {sortedDates.map((date) => {
                        const dateDisplay = getDateDisplay(date)
                        return (
                            <div key={date} className="space-y-4">
                                {/* Date header */}
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className={`text-sm font-medium px-3 py-1 rounded-md ${dateDisplay.isToday
                                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                        : 'text-gray-400 bg-gray-800/30'
                                        }`}>
                                        {dateDisplay.displayText}
                                    </h2>
                                    <div className="h-px bg-gray-700/50 flex-1"></div>
                                </div>

                                {/* Songs for this date - Always in list view */}
                                <div className="space-y-4">
                                    {groupedPosts[date].map((post) => (
                                        <SongCard
                                            key={post.id}
                                            id={post.id}
                                            title={post.title}
                                            artist={post.artist}
                                            description={post.description}
                                            link={post.link}
                                            deezerLink={post.deezerLink}
                                            spotifyLink={post.spotifyLink}
                                            appleMusicLink={post.appleMusicLink}
                                            youtubeLink={post.youtubeLink}
                                            coverUrl={post.coverUrl}
                                            likeCount={post.likeCount}
                                            isLikedByUser={post.isLikedByUser}
                                            onLikeChange={handleLikeChange}
                                            showLikes={true}
                                            isOwnPost={post.user.id === currentUser?.id}
                                            horizontal={true} // Always horizontal in liked posts view
                                            userPlatformPreference={currentUser?.platformPreference}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}