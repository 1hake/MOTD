import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useAudio } from '../contexts/AudioContext'
import { useNavigate } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import SearchBar from '../components/SearchBar'
import SearchResults from '../components/SearchResults'
import MusicFeed from '../components/MusicFeed'
import FullScreenMusicPlayer from '../components/FullScreenMusicPlayer'
import { SearchHistoryService } from '../lib/searchHistory'

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
  isPublic: boolean
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
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [fullScreenIndex, setFullScreenIndex] = useState(0)
  const navigate = useNavigate()
  const { user: currentUser, isAuthenticated } = useAuth()
  const audio = useAudio()

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
      const timezoneOffset = new Date().getTimezoneOffset()
      const response = await api.get(`/posts/explore?page=1&limit=10&timezoneOffset=${timezoneOffset}`)
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
      const timezoneOffset = new Date().getTimezoneOffset()
      const response = await api.get(`/posts/explore?page=${page}&limit=10&timezoneOffset=${timezoneOffset}`)
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

  const handleSaveChange = (postId: number, isSaved: boolean, newSaveCount: number) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, isSavedByUser: isSaved, saveCount: newSaveCount } : p))
    )
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleSearchSubmit = (query: string) => {
    SearchHistoryService.addToHistory(query)
    // The search is already handled by the useEffect above
  }

  const handleUserSelect = (user: User) => {
    navigate(`/profile/${user.id}`)
  }

  const handlePostClick = (index: number) => {
    // Stop all audio before entering full-screen using the centralized audio context
    audio.stopAll()

    setFullScreenIndex(index)
    setIsFullScreen(true)
  }

  const handleCloseFullScreen = () => {
    setIsFullScreen(false)
  }

  if (loading) {
    return <LoadingState message="Chargement de l'explorateur..." />
  }

  // Full-screen mode
  if (isFullScreen) {
    return (
      <FullScreenMusicPlayer
        posts={posts}
        initialIndex={fullScreenIndex}
        currentUserId={currentUser?.id}
        currentUserPlatformPreference={currentUser?.platformPreference}
        onClose={handleCloseFullScreen}
        onSaveChange={handleSaveChange}
      />
    )
  }

  return (
    <div className="min-h-screen text-gray-100">
      {/* Sticky Floating Search Bar */}
      <div className="sticky top-[max(1.5rem,env(safe-area-inset-top))] z-50 flex justify-center px-8">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
          isLoading={isSearching}
          className="max-w-sm w-full"
        />
      </div>

      {/* Search Results */}
      <SearchResults
        searchQuery={searchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        currentUserId={currentUser?.id}
        onUserSelect={handleUserSelect}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-12">
        <MusicFeed
          posts={posts}
          loading={false} // Already handled above
          loadingMore={loadingMore}
          hasMore={hasMore}
          currentUserId={currentUser?.id}
          currentUserPlatformPreference={currentUser?.platformPreference}
          onLoadMore={loadMorePosts}
          onSaveChange={handleSaveChange}
          onPostClick={handlePostClick}
        />
      </div>
    </div>
  )
}
