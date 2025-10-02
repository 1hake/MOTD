import React, { useCallback, useRef } from 'react'
import SongCard from './SongCard'

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

interface MusicFeedProps {
    posts: Post[]
    loading: boolean
    loadingMore: boolean
    hasMore: boolean
    currentUserId?: number
    currentUserPlatformPreference?: string
    onLoadMore: () => void
    onSaveChange: (postId: number, isSaved: boolean, newSaveCount: number) => void
}

export default function MusicFeed({
    posts,
    loading,
    loadingMore,
    hasMore,
    currentUserId,
    currentUserPlatformPreference,
    onLoadMore,
    onSaveChange
}: MusicFeedProps) {
    const observer = useRef<IntersectionObserver | null>(null)

    // Ref for the last post element to trigger infinite scroll
    const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loadingMore) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                onLoadMore()
            }
        })
        if (node) observer.current.observe(node)
    }, [loadingMore, hasMore, onLoadMore])

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-white text-lg">Chargement...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-6">Musiques du jour</h2>

            {posts.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-8xl mb-6">🎵</div>
                    <h3 className="text-2xl font-semibold text-gray-200 mb-4">Aucune musique partagée aujourd'hui</h3>
                    <p className="text-lg text-gray-500">Soyez le premier à partager votre musique du jour !</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 snap-y overflow-y-auto" style={{ scrollSnapType: 'y mandatory' }}>
                    {posts.map((post, index) => (
                        <div
                            key={post.id}
                            ref={index === posts.length - 1 ? lastPostElementRef : null}
                            className="snap-start"
                        >
                            <SongCard
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
                                onSaveChange={onSaveChange}
                                showSaves={true}
                                isOwnPost={post.user.id === currentUserId}
                                userPlatformPreference={currentUserPlatformPreference}
                                sharedBy={post.user.name || post.user.email.split('@')[0]}
                            />
                        </div>
                    ))}

                    {/* Loading more indicator */}
                    {loadingMore && (
                        <div className="flex justify-center py-8 col-span-full">
                            <div className="flex items-center gap-2 text-gray-400">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Chargement...</span>
                            </div>
                        </div>
                    )}

                    {/* End of content */}
                    {!hasMore && posts.length > 0 && (
                        <div className="text-center py-8 col-span-full">
                            <p className="text-gray-400">Vous avez vu toutes les musiques du jour !</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}