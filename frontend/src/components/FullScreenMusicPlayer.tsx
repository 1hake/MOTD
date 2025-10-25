import React, { useState, useRef, useEffect } from 'react'
import { savePost, unsavePost, getDeezerTrackPreview } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useAudio } from '../contexts/AudioContext'

type Post = {
    id: number
    title: string
    artist: string
    description?: string
    link: string
    deezerLink?: string
    spotifyLink?: string
    appleMusicLink?: string
    youtubeLink?: string
    deezerTrackId?: string
    coverUrl?: string
    date: string
    saveCount: number
    isSavedByUser: boolean
    user: {
        id: number
        name?: string
        email: string
        platformPreference?: string
    }
}

type FullScreenMusicPlayerProps = {
    posts: Post[]
    initialIndex: number
    currentUserId?: number
    currentUserPlatformPreference?: string
    onClose: () => void
    onSaveChange: (postId: number, isSaved: boolean, newSaveCount: number) => void
    autoPlayInitial?: boolean
}

type PlatformInfo = {
    url: string
    name: string
    icon: JSX.Element
    color: string
}

// Platform icons as SVG components
const PlatformIcons = {
    Spotify: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
    ),
    Deezer: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.81 8.1h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm-3.7-5.55h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm-3.7-5.55h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31z" />
        </svg>
    ),
    AppleMusic: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
    ),
    YouTube: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    )
}

export default function FullScreenMusicPlayer({
    posts,
    initialIndex,
    currentUserId,
    currentUserPlatformPreference,
    onClose,
    onSaveChange,
    autoPlayInitial = true
}: FullScreenMusicPlayerProps) {
    const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({})
    const containerRef = useRef<HTMLDivElement>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const hasAutoPlayedRef = useRef<boolean>(false)
    const { isAuthenticated } = useAuth()
    const audio = useAudio()

    // Initialize preview URLs for all posts
    useEffect(() => {
        console.log('🎵 Fetching preview URLs for', posts.length, 'posts')
        posts.forEach((post) => {
            if (post.deezerTrackId && !previewUrls[post.id]) {
                getDeezerTrackPreview(post.deezerTrackId)
                    .then((response) => {
                        if (response.data.preview) {
                            console.log('✅ Got preview for post', post.id)
                            setPreviewUrls((prev) => ({
                                ...prev,
                                [post.id]: response.data.preview
                            }))
                        }
                    })
                    .catch((error) => console.error('❌ Error fetching preview for post', post.id, ':', error))
            }
        })
    }, [posts])

    // Intersection Observer for auto-play on scroll
    useEffect(() => {
        if (!containerRef.current) return

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const postId = parseInt(entry.target.getAttribute('data-post-id') || '0')
                const previewUrl = previewUrls[postId]

                if (entry.isIntersecting && hasAutoPlayedRef.current && previewUrl) {
                    console.log('👁️ In view, playing:', postId)
                    audio.play(postId, previewUrl).catch(err => {
                        console.error('Auto-play failed:', err)
                    })
                } else if (!entry.isIntersecting && audio.currentlyPlaying === postId) {
                    console.log('👁️ Out of view, pausing:', postId)
                    audio.pause(postId)
                }
            })
        }, {
            root: containerRef.current,
            threshold: 0.75
        })

        const postElements = containerRef.current.querySelectorAll('[data-post-id]')
        postElements.forEach((element) => observerRef.current?.observe(element))

        return () => observerRef.current?.disconnect()
    }, [previewUrls, audio])

    // Scroll to initial position
    useEffect(() => {
        if (containerRef.current && initialIndex > 0) {
            const targetElement = containerRef.current.querySelector(`[data-post-id="${posts[initialIndex]?.id}"]`)
            targetElement?.scrollIntoView({ behavior: 'auto', block: 'start' })
        }
    }, [])

    // Auto-play initial song
    useEffect(() => {
        if (!autoPlayInitial || hasAutoPlayedRef.current) return

        const initialPost = posts[initialIndex]
        const previewUrl = previewUrls[initialPost?.id]

        console.log('🎬 Auto-play check:', {
            postId: initialPost?.id,
            hasPreview: !!previewUrl
        })

        if (initialPost && previewUrl) {
            setTimeout(() => {
                console.log('🚀 AUTO-PLAYING:', initialPost.id)
                audio.play(initialPost.id, previewUrl).catch(err => {
                    console.error('Auto-play failed:', err)
                })
                hasAutoPlayedRef.current = true
            }, 100)
        }
    }, [previewUrls, audio])

    const toggleAudio = (postId: number) => {
        const previewUrl = previewUrls[postId]
        if (!previewUrl) return

        audio.toggle(postId, previewUrl).catch(err => {
            console.error('Toggle failed:', err)
        })
    }

    // Cleanup on unmount - stop all audio
    useEffect(() => {
        return () => {
            console.log('🧹 Cleaning up FullScreenMusicPlayer')
            audio.stopAll()
        }
    }, [])

    const handleSaveToggle = async (post: Post) => {
        if (!isAuthenticated) return

        try {
            const newSavedState = !post.isSavedByUser
            const newSavesCount = newSavedState ? post.saveCount + 1 : post.saveCount - 1

            onSaveChange(post.id, newSavedState, newSavesCount)

            if (newSavedState) {
                await savePost(post.id)
            } else {
                await unsavePost(post.id)
            }
        } catch (error) {
            console.error('Error toggling save:', error)
            // Revert on error
            onSaveChange(post.id, post.isSavedByUser, post.saveCount)
        }
    }

    const getPreferredPlatform = (post: Post): PlatformInfo | null => {
        const preference = currentUserPlatformPreference?.toLowerCase()

        switch (preference) {
            case 'spotify':
                return post.spotifyLink ? { url: post.spotifyLink, name: 'Spotify', icon: PlatformIcons.Spotify, color: 'bg-green-500 hover:bg-green-600' } : null
            case 'deezer':
                return post.deezerLink ? { url: post.deezerLink, name: 'Deezer', icon: PlatformIcons.Deezer, color: 'bg-orange-500 hover:bg-orange-600' } : null
            case 'apple':
            case 'apple music':
            case 'applemusic':
                return post.appleMusicLink ? { url: post.appleMusicLink, name: 'Apple Music', icon: PlatformIcons.AppleMusic, color: 'bg-pink-500 hover:bg-pink-600' } : null
            case 'youtube':
                return post.youtubeLink ? { url: post.youtubeLink, name: 'YouTube', icon: PlatformIcons.YouTube, color: 'bg-red-500 hover:bg-red-600' } : null
            default:
                if (post.spotifyLink) return { url: post.spotifyLink, name: 'Spotify', icon: PlatformIcons.Spotify, color: 'bg-green-500 hover:bg-green-600' }
                if (post.deezerLink) return { url: post.deezerLink, name: 'Deezer', icon: PlatformIcons.Deezer, color: 'bg-orange-500 hover:bg-orange-600' }
                if (post.appleMusicLink) return { url: post.appleMusicLink, name: 'Apple Music', icon: PlatformIcons.AppleMusic, color: 'bg-pink-500 hover:bg-pink-600' }
                if (post.youtubeLink) return { url: post.youtubeLink, name: 'YouTube', icon: PlatformIcons.YouTube, color: 'bg-red-500 hover:bg-red-600' }
                return null
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Close button */}
            <button
                onClick={() => {
                    audio.stopAll()
                    onClose()
                }}
                className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-gray-900/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-gray-800/80 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Scroll container with snap points */}
            <div
                ref={containerRef}
                className="h-screen overflow-y-scroll snap-y snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style>
                    {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
                </style>

                {posts.map((post, index) => {
                    const previewUrl = previewUrls[post.id]
                    const isPlaying = audio.isPlaying(post.id)
                    const preferredPlatform = getPreferredPlatform(post)
                    const isOwnPost = currentUserId === post.user.id

                    return (
                        <div
                            key={post.id}
                            data-post-id={post.id}
                            className="h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden"
                        >
                            {/* Blurred background using the cover image */}
                            {post.coverUrl && (
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: `url(${post.coverUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        filter: 'blur(2px)',
                                        transform: 'scale(1.1)'
                                    }}
                                />
                            )}

                            {/* Dark overlay and gradient blurs */}
                            <div className="absolute inset-0 bg-black/50" />
                            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                            {/* Content container - Single column layout */}
                            <div className="relative z-10 h-full w-full flex flex-col">
                                {/* Top bar: Song title on left, User info on right */}
                                <div className="flex items-start justify-between gap-3 px-5 pt-14 pb-2 mt-6">
                                    {/* Song title on left */}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-white drop-shadow-2xl leading-tight line-clamp-2">
                                            {post.title}
                                        </h2>
                                        <p className="text-base text-white/95 drop-shadow-xl font-medium mt-0.5">
                                            {post.artist}
                                        </p>
                                    </div>

                                    {/* User info on right */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="text-right">
                                            <div className="font-semibold text-white drop-shadow-2xl text-sm">
                                                {post.user.name || post.user.email.split('@')[0]}
                                            </div>
                                            <div className="text-white/90 text-xs drop-shadow-xl">
                                                {new Date(post.date).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-white/20">
                                            {post.user.name ? post.user.name.charAt(0).toUpperCase() : post.user.email.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Full width Album cover */}
                                <div className="flex-1 flex justify-center items-center">
                                    <div
                                        className="relative cursor-pointer group w-full"
                                        onClick={() => toggleAudio(post.id)}
                                    >
                                        {post.coverUrl ? (
                                            <div className="w-full aspect-square overflow-hidden shadow-2xl transition-transform duration-300 ease-out group-active:scale-98">
                                                <img
                                                    src={post.coverUrl}
                                                    alt={`${post.title} cover`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full aspect-square bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-2xl" />
                                        )}

                                        {/* Play/Pause overlay */}
                                        {previewUrl && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-black/50">
                                                    {isPlaying ? (
                                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6.3 4.1c0-.7.8-1.2 1.4-.8l8.9 5.2c.6.4.6 1.3 0 1.7l-8.9 5.2c-.6.4-1.4-.1-1.4-.8V4.1z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Song info and action buttons at bottom */}
                                {/* Bottom section - Description and action buttons */}
                                <div className="px-5 pt-2 pb-28 space-y-4">
                                    {/* Description if available */}
                                    {post.description && (
                                        <p className="text-sm text-white/90 italic drop-shadow-lg leading-relaxed">
                                            "{post.description}"
                                        </p>
                                    )}

                                    {/* Action buttons row: Platform button on left, Save on right */}
                                    <div className="w-full justify-between flex items-center gap-3">
                                        {/* Platform button */}
                                        {preferredPlatform && (
                                            <a
                                                href={preferredPlatform.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-2 px-4 py-2.5 ${preferredPlatform.color} text-white rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
                                                onClick={(e) => e.stopPropagation()}
                                                title={`Listen on ${preferredPlatform.name}`}
                                            >
                                                {preferredPlatform.icon}
                                            </a>
                                        )}

                                        {/* Save button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleSaveToggle(post)
                                            }}
                                            disabled={isOwnPost}
                                            className={`flex items-center gap-2 px-5 py-3.5 rounded-full transition-all duration-300 ease-out shadow-2xl ${post.isSavedByUser
                                                ? 'bg-white text-indigo-600'
                                                : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                                                } ${isOwnPost ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                                        >
                                            <svg
                                                className={`w-6 h-6 ${post.isSavedByUser ? 'fill-current' : 'stroke-current fill-none'}`}
                                                viewBox="0 0 24 24"
                                                strokeWidth="2.5"
                                            >
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                            </svg>
                                            <span className="font-semibold">{post.saveCount}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
