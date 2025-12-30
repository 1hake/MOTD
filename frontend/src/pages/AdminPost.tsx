import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import Search from '../components/Search'
import { generateMusicServiceLinks } from '../lib/musicServices'

export default function AdminPost() {
  const [users, setUsers] = useState<any[]>([])
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [numPosts, setNumPosts] = useState(1)
  const [postsPerUser, setPostsPerUser] = useState(1)
  const [dateRange, setDateRange] = useState(14)
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/all')
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users', err)
    }
  }

  const postForRandomUsers = async () => {
    if (!selectedTrack || users.length === 0 || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      let successfulPosts = 0
      const usedPairs = new Set<string>() // userId:dateString

      const targetUserIds = selectedUserIds.length > 0
        ? selectedUserIds
        : []

      const isRandomMode = selectedUserIds.length === 0
      const totalToCreate = isRandomMode ? numPosts : targetUserIds.length * postsPerUser

      while (successfulPosts < totalToCreate) {
        let userId: number
        if (isRandomMode) {
          // Prefer users who haven't posted today
          const notPostedToday = users.filter(u => !u.hasPostToday)
          const sourcePool = notPostedToday.length > 0 ? notPostedToday : users
          userId = sourcePool[Math.floor(Math.random() * sourcePool.length)].id
        } else {
          userId = targetUserIds[Math.floor(successfulPosts / postsPerUser)]
        }

        let date = new Date()
        let pairKey = ''
        let attempts = 0
        let success = false

        // Try different dates for this user
        while (attempts < 20 && !success) {
          const daysAgo = Math.floor(Math.random() * dateRange)
          date = new Date()
          date.setDate(date.getDate() - daysAgo)
          date.setUTCHours(0, 0, 0, 0)

          pairKey = `${userId}:${date.toISOString().split('T')[0]}`

          if (!usedPairs.has(pairKey)) {
            try {
              const musicLinks = selectedTrack.id
                ? generateMusicServiceLinks({
                  id: selectedTrack.id,
                  title: selectedTrack.title,
                  artist: selectedTrack.artist
                })
                : {}

              await api.post('/posts/admin', {
                title: selectedTrack.title,
                artist: selectedTrack.artist,
                link: `https://www.deezer.com/track/${selectedTrack.id}`,
                coverUrl: selectedTrack.cover,
                id: selectedTrack.id,
                userId: userId,
                date: date.toISOString(),
                isPublic: true,
                ...musicLinks
              })

              usedPairs.add(pairKey)
              successfulPosts++
              success = true
            } catch (err: any) {
              if (err.response?.status === 400 && err.response?.data?.error?.includes('already has a post')) {
                // Collision with database, try another date
                attempts++
                if (isRandomMode && attempts >= 5) {
                  // In random mode, if one user is full, pick another user
                  userId = users[Math.floor(Math.random() * users.length)].id
                }
              } else {
                throw err // Other errors fail the whole process
              }
            }
          } else {
            attempts++
          }
        }

        if (!success) {
          // If we couldn't find a spot for this post after many attempts
          if (isRandomMode) {
            // In random mode we can just stop if we're stuck, but it's unlikely
            break
          } else {
            // For selected users, we might have to skip one if they are fully booked for the week
            successfulPosts++
          }
        }
      }

      setMessage(`Successfully created ${successfulPosts} post(s).`)
      setSelectedTrack(null)
      setSelectedUserIds([])
      setNumPosts(1)
      setPostsPerUser(1)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen pb-32">
      <h1 className="text-3xl font-bold mb-6 text-black">Admin: Random Post Generator</h1>

      {error && (
        <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 rounded-xl mb-4">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 border-2 border-green-500 text-green-700 p-4 rounded-xl mb-4">
          {message}
        </div>
      )}

      <div className="bg-white border-3 border-black p-6 rounded-2xl shadow-neo mb-6">
        <h2 className="text-xl font-bold mb-4">Step 1: Search for a song</h2>

        {!selectedTrack ? (
          <Search
            onSelect={(track) => setSelectedTrack(track)}
            onSearchChange={() => { }}
          />
        ) : (
          <div className="mt-4 p-4 border-2 border-black rounded-xl bg-gray-50 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
            {selectedTrack.cover && (
              <img src={selectedTrack.cover} alt="" className="w-16 h-16 rounded-lg border-2 border-black object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{selectedTrack.title}</p>
              <p className="text-gray-600 truncate">{selectedTrack.artist}</p>
            </div>
            <button
              onClick={() => setSelectedTrack(null)}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors"
            >
              Change
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border-3 border-black p-6 rounded-2xl shadow-neo">
        <h2 className="text-xl font-bold mb-4">Step 2: Target Users</h2>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Select specific users to post for, or leave empty to pick random users.
          </p>

          <div className="max-h-48 overflow-y-auto border-2 border-black rounded-xl p-2 mb-4 bg-gray-50">
            {users.map(user => (
              <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                  className="w-5 h-5 border-2 border-black rounded"
                />
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-medium">{user.name || user.email}</span>
                  {user.hasPostToday && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">
                      POSTED TODAY
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>

          {selectedUserIds.length > 0 ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-4">
                <label className="block text-sm font-bold">Posts per selected user:</label>
                <input
                  type="number"
                  min="1"
                  max={dateRange}
                  value={postsPerUser}
                  onChange={(e) => setPostsPerUser(parseInt(e.target.value) || 1)}
                  className="w-20 p-2 border-2 border-black rounded-lg font-bold"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="block text-sm font-bold">In the last X days:</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={dateRange}
                  onChange={(e) => setDateRange(parseInt(e.target.value) || 7)}
                  className="w-20 p-2 border-2 border-black rounded-lg font-bold"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-4">
                <label className="block text-sm font-bold">Number of random users:</label>
                <input
                  type="number"
                  min="1"
                  max={Math.min(users.length * dateRange, 50)}
                  value={numPosts}
                  onChange={(e) => setNumPosts(parseInt(e.target.value) || 1)}
                  className="w-20 p-2 border-2 border-black rounded-lg font-bold"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="block text-sm font-bold">In the last X days:</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={dateRange}
                  onChange={(e) => setDateRange(parseInt(e.target.value) || 7)}
                  className="w-20 p-2 border-2 border-black rounded-lg font-bold"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={postForRandomUsers}
          disabled={!selectedTrack || users.length === 0 || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${!selectedTrack || users.length === 0 || isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-black hover:translate-x-1 hover:-translate-y-1 shadow-neo active:translate-x-0 active:translate-y-0'
            }`}
        >
          {isSubmitting
            ? 'Posting...'
            : selectedUserIds.length > 0
              ? `Post for ${selectedUserIds.length} Users (${selectedUserIds.length * postsPerUser} posts total)`
              : `Post for ${numPosts} Random Users`}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Random posts will be assigned to unique dates within the last {dateRange} days.
        </p>
      </div>

      <button
        onClick={() => navigate('/feed')}
        className="mt-8 text-gray-600 hover:text-black font-bold flex items-center gap-2 transition-colors"
      >
        ← Back to Feed
      </button>
    </div>
  )
}

