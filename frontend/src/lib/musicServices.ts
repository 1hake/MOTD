export interface MusicServiceLinks {
    deezer?: string;
    spotify?: string;
    appleMusic?: string;
}

export function generateMusicServiceLinks(track: {
    id: number;
    title: string;
    artist: string;
}): MusicServiceLinks {
    const searchQuery = encodeURIComponent(`${track.artist} ${track.title}`);

    return {
        deezer: `https://www.deezer.com/track/${track.id}`,
        spotify: `https://open.spotify.com/search/${searchQuery}`,
        appleMusic: `https://music.apple.com/search?term=${searchQuery}`
    };
}

export interface MusicServiceInfo {
    name: string;
    icon: string;
    color: string;
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
    }
};
