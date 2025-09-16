export interface MusicServiceLinks {
  trackId: number
  title: string
  artist: string
}

export function generateMusicServiceLinks(track: { id: number; title: string; artist: string }): MusicServiceLinks {
  return {
    trackId: track.id,
    title: track.title,
    artist: track.artist
  }
}

export interface MusicServiceInfo {
  name: string
  icon: string
  color: string
}

export const musicServices: Record<string, MusicServiceInfo> = {
  deezer: {
    name: 'Deezer',
    icon: '🎵',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  spotify: {
    name: 'Spotify',
    icon: '🎧',
    color: 'bg-green-500 hover:bg-green-600'
  },
  appleMusic: {
    name: 'Apple Music',
    icon: '🎼',
    color: 'bg-gray-800 hover:bg-gray-900'
  },
  youtube: {
    name: 'YouTube Music',
    icon: '📺',
    color: 'bg-red-500 hover:bg-red-600'
  }
}
