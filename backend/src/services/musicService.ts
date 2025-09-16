import axios from 'axios'

export interface MusicServiceLinks {
  deezerLink?: string
  spotifyLink?: string
  appleMusicLink?: string
  youtubeLink?: string
}

/**
 * Search for a track on Deezer and return the first result URL
 */
export async function searchDeezer(artist: string, track: string): Promise<string> {
  try {
    const searchQuery = encodeURIComponent(`${artist} ${track}`)
    const response = await axios.get(`https://api.deezer.com/search?q=${searchQuery}&limit=1`)

    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0].link
    }

    // Fallback: return a search URL if no exact match found
    return `https://www.deezer.com/search/${searchQuery}`
  } catch (error) {
    console.error('Error searching Deezer:', error)
    // Fallback: return a search URL
    const searchQuery = encodeURIComponent(`${artist} ${track}`)
    return `https://www.deezer.com/search/${searchQuery}`
  }
}

/**
 * Get all platform links for a track using song.link API
 */
export async function getAllPlatformLinks(artist: string, track: string): Promise<MusicServiceLinks> {
  try {
    // First, get a Deezer URL to use as input for song.link
    const deezerUrl = await searchDeezer(artist, track)

    // Use song.link API to get all platform links
    const response = await axios.get(`https://api.song.link/v1-alpha.1/links?url=${deezerUrl}&userCountry=FR`)
    const allLinksObject = response.data.entitiesByUniqueId as Record<string, any>

    let spotifyId: string | undefined
    let deezerId: string | undefined
    let youtubeId: string | undefined
    let appleMusicId: string | undefined

    // Extract IDs from the response
    for (const key in allLinksObject) {
      if (key.startsWith('SPOTIFY_SONG::')) {
        spotifyId = key.replace('SPOTIFY_SONG::', '')
      } else if (key.startsWith('DEEZER_SONG::')) {
        deezerId = key.replace('DEEZER_SONG::', '')
      } else if (key.startsWith('YOUTUBE_VIDEO::')) {
        youtubeId = key.replace('YOUTUBE_VIDEO::', '')
      } else if (key.startsWith('APPLE_MUSIC_SONG::')) {
        appleMusicId = key.replace('APPLE_MUSIC_SONG::', '')
      }
    }
    // Generate the appropriate links
    const spotifyLink = spotifyId ? `spotify:track:${spotifyId}` : undefined
    const deezerLink = deezerId ? `https://dzr.page.link/${deezerId}` : undefined
    const youtubeLink = youtubeId ? `https://music.youtube.com/watch?v=${youtubeId}` : undefined
    const appleMusicLink = appleMusicId ? `https://music.apple.com/track/${appleMusicId}` : undefined

    return {
      deezerLink,
      spotifyLink,
      appleMusicLink,
      youtubeLink
    }
  } catch (error) {
    console.error('Error getting platform links:', error)

    // Fallback: return search URLs
    const searchQuery = encodeURIComponent(`${artist} ${track}`)
    return {
      deezerLink: `https://www.deezer.com/search/${searchQuery}`,
      spotifyLink: `https://open.spotify.com/search/${searchQuery}`,
      appleMusicLink: `https://music.apple.com/search?term=${searchQuery}`,
      youtubeLink: `https://music.youtube.com/search?q=${searchQuery}`
    }
  }
}
