import React, { useEffect, useState, useRef, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import SongCard from '../components/SongCard'
import LoadingState from '../components/LoadingState'
import FollowButton from '../components/FollowButton'

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
  likeCount: number
  isLikedByUser: boolean
  user: {
    id: number
    name?: string
    email: string
    platformPreference?: string
  }
}

type User = {
  id: number
  email: string
  name?: string
  platformPreference?: string
}

export default function Explorer() {
  const [posts, setPosts] = useState<Post[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()
  const { user: currentUser, isAuthenticated } = useAuth()
  const observer = useRef<IntersectionObserver | null>(null)

  // Ref for the last post element to trigger infinite scroll
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts()
      }
    })
    if (node) observer.current.observe(node)
  }, [loadingMore, hasMore])

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login')
      return
    }

    loadInitialPosts()
  }, [navigate, isAuthenticated, currentUser])

  const loadInitialPosts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/posts/explore?page=1&limit=10')
      setPosts(response.data.posts)
      setHasMore(response.data.hasMore)
      setPage(2)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      const response = await api.get(`/posts/explore?page=${page}&limit=10`)
      setPosts(prev => [...prev, ...response.data.posts])
      setHasMore(response.data.hasMore)
      setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    try {
      setIsSearching(true)
      const response = await api.get(`/users/search/${encodeURIComponent(query.trim())}?userId=${currentUser?.id}`)
      setSearchResults(response.data)
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentUser?.id])

  const handleLikeChange = (postId: number, isLiked: boolean, newLikeCount: number) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, isLikedByUser: isLiked, likeCount: newLikeCount } : p))
    )
  }

  if (loading) {
    return <LoadingState message="Chargement de l'explorateur..." />
  }

  return (
    <div className="min-h-screen text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
              placeholder="Rechercher des utilisateurs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Résultats de recherche</h2>
            {searchResults.length === 0 && !isSearching ? (
              <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/30 p-6 text-center">
                <p className="text-gray-400">Aucun utilisateur trouvé pour "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="bg-gray-900/30 hover:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/30 hover:border-gray-700/50 transition-all duration-300 p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base leading-tight">
                          {user.name || user.email.split('@')[0]}
                        </h3>
                        <p className="text-gray-400 text-sm">@{user.email.split('@')[0]}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/profile/${user.id}`)}
                        className="flex-1 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        Voir le profil
                      </button>
                      {currentUser && user.id !== currentUser.id && (
                        <FollowButton currentUserId={currentUser.id} targetUserId={user.id} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Music Feed */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-6">Musiques du jour</h2>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">🎵</div>
              <h3 className="text-2xl font-semibold text-gray-200 mb-4">Aucune musique partagée aujourd'hui</h3>
              <p className="text-lg text-gray-500">Soyez le premier à partager votre musique du jour !</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div key={post.id} ref={index === posts.length - 1 ? lastPostElementRef : null}>
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
                    likeCount={post.likeCount}
                    isLikedByUser={post.isLikedByUser}
                    onLikeChange={handleLikeChange}
                    showLikes={true}
                    userPlatformPreference={currentUser?.platformPreference}
                    showUserHeader={true}
                    userInfo={{
                      id: post.user.id,
                      name: post.user.name,
                      email: post.user.email,
                      username: post.user.email.split('@')[0]
                    }}
                    date={post.date}
                    onUserClick={() => navigate(`/profile/${post.user.id}`)}
                  />
                </div>
              ))}

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="flex justify-center py-8">
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
                <div className="text-center py-8">
                  <p className="text-gray-400">Vous avez vu toutes les musiques du jour !</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}