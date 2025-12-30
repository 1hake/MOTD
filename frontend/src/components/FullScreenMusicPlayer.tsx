import React, { useState, useRef, useEffect } from 'react'
import { savePost, unsavePost, getDeezerTrackPreview } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useAudio } from '../contexts/AudioContext'
import { useNavigate } from 'react-router-dom'
import AudioLevelIndicator from './AudioLevelIndicator'

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
    const navigate = useNavigate()

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
                return post.spotifyLink ? { url: post.spotifyLink, name: 'Spotify', icon: PlatformIcons.Spotify, color: 'bg-green-300' } : null
            case 'deezer':
                return post.deezerLink ? { url: post.deezerLink, name: 'Deezer', icon: PlatformIcons.Deezer, color: 'bg-orange-300' } : null
            case 'apple':
            case 'apple music':
            case 'applemusic':
                return post.appleMusicLink ? { url: post.appleMusicLink, name: 'Apple Music', icon: PlatformIcons.AppleMusic, color: 'bg-pink-300' } : null
            case 'youtube':
                return post.youtubeLink ? { url: post.youtubeLink, name: 'YouTube', icon: PlatformIcons.YouTube, color: 'bg-red-300' } : null
            default:
                if (post.spotifyLink) return { url: post.spotifyLink, name: 'Spotify', icon: PlatformIcons.Spotify, color: 'bg-green-300' }
                if (post.deezerLink) return { url: post.deezerLink, name: 'Deezer', icon: PlatformIcons.Deezer, color: 'bg-orange-300' }
                if (post.appleMusicLink) return { url: post.appleMusicLink, name: 'Apple Music', icon: PlatformIcons.AppleMusic, color: 'bg-pink-300' }
                if (post.youtubeLink) return { url: post.youtubeLink, name: 'YouTube', icon: PlatformIcons.YouTube, color: 'bg-red-300' }
                return null
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
            {/* Close button */}
            <button
                onClick={() => {
                    audio.stopAll()
                    onClose()
                }}
                className="fixed top-8 left-6 z-50 w-12 h-12 rounded-full bg-white border-3 border-black flex items-center justify-center text-black hover:bg-pop-pink transition-all duration-200 shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
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

                    // Use solid colors from design system
                    const bgColors = [
                        'bg-pop-pink',
                        'bg-pop-blue',
                        'bg-pop-mint',
                        'bg-pop-yellow',
                        'bg-pop-purple',
                        'bg-pop-orange'
                    ]
                    const bgColor = bgColors[index % bgColors.length]

                    return (
                        <div
                            key={post.id}
                            data-post-id={post.id}
                            className={`h-screen w-screen snap-start snap-always relative flex items-center justify-center overflow-hidden ${bgColor}`}
                        >
                            {/* Dot background pattern */}
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                            {/* Content container - Single column layout */}
                            <div className="relative z-10 h-full w-full flex flex-col max-w-lg mx-auto">
                                {/* Top bar: Song title on left, User info on right */}
                                <div className="flex items-center justify-between gap-4 px-6 pt-24 pb-4">
                                    {/* Song title on left */}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-2xl font-black text-black leading-tight line-clamp-2 uppercase tracking-tight italic">
                                            {post.title}
                                        </h2>
                                        <p className="text-lg text-black font-bold opacity-80">
                                            {post.artist}
                                        </p>
                                    </div>

                                    {/* User info on right */}
                                    <div
                                        className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            audio.stopAll()
                                            navigate(`/profile/${post.user.id}`)
                                        }}
                                    >
                                        <div className="w-12 h-12 bg-white border-3 border-black rounded-full flex items-center justify-center text-black text-lg font-black shadow-neo">
                                            {post.user.name ? post.user.name.charAt(0).toUpperCase() : post.user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="font-black text-black text-[10px] uppercase tracking-wider">
                                            {post.user.name || post.user.email.split('@')[0]}
                                        </div>
                                    </div>
                                </div>

                                {/* Album cover - Centered and large */}
                                <div className="flex-1 flex justify-center items-center px-6">
                                    <div
                                        className="relative cursor-pointer group w-full"
                                        onClick={() => toggleAudio(post.id)}
                                    >
                                        {/* Audio Level Indicator - Positioned absolutely above cover */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
                                            <AudioLevelIndicator isPlaying={isPlaying} barCount={7} />
                                        </div>

                                        {post.coverUrl ? (
                                            <div className="w-full aspect-square overflow-hidden border-[6px] border-black rounded-[2.5rem] transition-all duration-300 ease-out group-hover:scale-[1.02] group-active:scale-[0.98]">
                                                <img
                                                    src={post.coverUrl}
                                                    alt={`${post.title} cover`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full aspect-square bg-white border-[6px] border-black rounded-[2.5rem]" />
                                        )}

                                        {/* Play/Pause overlay - refined */}
                                        {previewUrl && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <div className="w-20 h-20 rounded-full bg-white border-3 border-black flex items-center justify-center shadow-neo">
                                                    {isPlaying ? (
                                                        <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-10 h-10 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6.3 4.1c0-.7.8-1.2 1.4-.8l8.9 5.2c.6.4.6 1.3 0 1.7l-8.9 5.2c-.6.4-1.4-.1-1.4-.8V4.1z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action buttons overlay - Platform button on bottom-left, Save on bottom-right */}
                                        <div className="absolute -bottom-8 left-4 right-4 flex items-end justify-between gap-3 pointer-events-none">
                                            {/* Platform button */}
                                            {preferredPlatform && (
                                                <a
                                                    href={preferredPlatform.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`pointer-events-auto flex items-center justify-center gap-2 px-4 py-3 ${preferredPlatform.color} text-black border-3 border-black rounded-xl transition-all duration-200 shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-none font-black text-sm`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {preferredPlatform.icon}
                                                    <span className="uppercase tracking-tight">{preferredPlatform.name}</span>
                                                </a>
                                            )}

                                            {/* Spacer if no platform button */}
                                            {!preferredPlatform && <div />}

                                            {/* Save button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleSaveToggle(post)
                                                }}
                                                disabled={isOwnPost}
                                                className={`pointer-events-auto flex items-center gap-2 px-4 py-3 border-3 border-black rounded-xl transition-all duration-200 shadow-neo ${post.isSavedByUser
                                                    ? 'bg-pop-pink text-black'
                                                    : 'bg-white text-black'
                                                    } ${isOwnPost ? 'opacity-40 cursor-not-allowed' : 'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-none'}`}
                                            >
                                                <svg
                                                    className={`w-6 h-6 ${post.isSavedByUser ? 'fill-current' : 'stroke-current fill-none'}`}
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="3"
                                                >
                                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                                </svg>
                                                <span className="font-black text-lg">{post.saveCount}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom section - Description only */}
                                <div className="px-6 pt-4 pb-32">
                                    {/* Description if available */}
                                    {post.description && (
                                        <div className="bg-white border-3 border-black rounded-2xl px-5 py-4 shadow-neo relative">
                                            {/* Little quote decoration */}
                                            <div className="absolute -top-3 -left-2 bg-pop-yellow border-2 border-black rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                                                Vibe
                                            </div>
                                            <p className="text-sm text-black font-bold italic leading-relaxed">
                                                "{post.description}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
