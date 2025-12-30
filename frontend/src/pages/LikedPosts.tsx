import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import SongCard from '../components/SongCard'
import LoadingState from '../components/LoadingState'

type SavedPost = {
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
    saveDate: string // Date when user saved this post
    saveCount: number
    isSavedByUser: boolean
    user: {
        id: number
        name?: string
        email: string
        platformPreference?: string
    }
}

export default function SavedPosts() {
    const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
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
                const res = await api.get('/posts/saved')
                setSavedPosts(res.data)
            } catch (error) {
                console.error('Error fetching saved posts:', error)
            } finally {
                setLoading(false)
            }
        })()
    }, [navigate, isAuthenticated, currentUser])

    const handleSaveChange = (postId: number, isSaved: boolean, newSaveCount: number) => {
        if (!isSaved) {
            // If the post is unsaved, remove it from the list
            setSavedPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId))
        } else {
            // If somehow re-saved, update the save count
            setSavedPosts((prevPosts) =>
                prevPosts.map((p) => (p.id === postId ? { ...p, isSavedByUser: isSaved, saveCount: newSaveCount } : p))
            )
        }
    }

    // Simple and clean date display for save dates
    const getDateDisplay = (dateString: string) => {
        const saveDate = new Date(dateString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)

        // Reset time to compare only dates
        const saveDateOnly = new Date(saveDate.getFullYear(), saveDate.getMonth(), saveDate.getDate())
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

        if (saveDateOnly.getTime() === todayOnly.getTime()) {
            return {
                displayText: "Aujourd'hui",
                isToday: true
            }
        } else if (saveDateOnly.getTime() === yesterdayOnly.getTime()) {
            return {
                displayText: 'Hier',
                isToday: false
            }
        } else {
            return {
                displayText: saveDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: saveDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                }),
                isToday: false
            }
        }
    }

    const groupPostsBySaveDate = (posts: SavedPost[]) => {
        const grouped: { [key: string]: SavedPost[] } = {}
        posts.forEach((post) => {
            const date = new Date(post.saveDate).toDateString()
            if (!grouped[date]) {
                grouped[date] = []
            }
            grouped[date].push(post)
        })
        return grouped
    }

    if (loading) {
        return <LoadingState message="Chargement des chansons sauvegardées..." />
    }

    if (savedPosts.length === 0) {
        return (
            <div className="min-h-screen">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-6 mb-8">
                            <button
                                onClick={() => navigate('/profile')}
                                className="p-3 rounded-xl bg-white border-3 border-black shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all"
                            >
                                <svg className="w-6 h-6 text-black stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-4xl font-black text-black uppercase italic tracking-tight">Sauvegardes</h1>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="card text-center py-20 px-8">
                        <div className="text-8xl mb-6">💙</div>
                        <h3 className="text-2xl font-black text-black mb-4 uppercase italic">Aucune chanson sauvegardée</h3>
                        <p className="text-lg font-bold text-black opacity-60 mb-8">Explorez et sauvegardez des chansons pour les retrouver ici !</p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => navigate('/explorer')}
                                className="btn-primary"
                            >
                                Explorer les chansons
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const groupedPosts = groupPostsBySaveDate(savedPosts)
    const sortedDates = Object.keys(groupedPosts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-6 mb-8">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-3 rounded-xl bg-white border-3 border-black shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all"
                        >
                            <svg className="w-6 h-6 text-black stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-black text-black uppercase italic tracking-tight">Chansons aimées</h1>
                    </div>

                </div>

                {/* Liked Posts History - Always in list view */}
                <div className="space-y-10 mb-24">
                    {sortedDates.map((date) => {
                        const dateDisplay = getDateDisplay(date)
                        return (
                            <div key={date} className="space-y-6">
                                {/* Neo Brutalist date header */}
                                <div className="flex items-center gap-4">
                                    <h2 className={`text-sm font-black uppercase italic px-4 py-1.5 border-2 border-black rounded-lg shadow-neo-sm ${dateDisplay.isToday
                                        ? 'bg-pop-pink text-black'
                                        : 'bg-pop-mint text-black'
                                        }`}>
                                        {dateDisplay.displayText}
                                    </h2>
                                    <div className="h-1 bg-black flex-1 rounded-full opacity-10"></div>
                                </div>

                                {/* Songs for this date - Always in list view */}
                                <div className="space-y-6">
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
                                            saveCount={post.saveCount}
                                            isSavedByUser={post.isSavedByUser}
                                            onSaveChange={handleSaveChange}
                                            showSaves={true}
                                            isOwnPost={post.user.id === currentUser?.id}
                                            horizontal={true} // Always horizontal in liked posts view
                                            userPlatformPreference={currentUser?.platformPreference}
                                            sharedBy={post.user.name || post.user.email.split('@')[0]}
                                            onUserClick={() => navigate(`/profile/${post.user.id}`)}
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