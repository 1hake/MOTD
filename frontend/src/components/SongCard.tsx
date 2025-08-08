import React from 'react';
import { musicServices } from '../lib/musicServices';

type SongCardProps = {
    id: number;
    title: string;
    artist: string;
    link: string;
    deezerLink?: string;
    spotifyLink?: string;
    appleMusicLink?: string;
    coverUrl?: string;
    sharedBy?: string;
    variant?: 'default' | 'purple' | 'blue';
    className?: string;
};

export default function SongCard({
    id,
    title,
    artist,
    link,
    deezerLink,
    spotifyLink,
    appleMusicLink,
    coverUrl,
    sharedBy,
    variant = 'default',
    className = ''
}: SongCardProps) {
    const getGradientBackground = () => {
        switch (variant) {
            case 'purple':
                return 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100';
            case 'blue':
                return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100';
            default:
                return 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100';
        }
    };

    const getBorderColor = () => {
        switch (variant) {
            case 'purple':
                return 'border-purple-200/50';
            case 'blue':
                return 'border-blue-200/50';
            default:
                return 'border-gray-200/50';
        }
    };

    // Create list of available links
    const musicLinks = [
        { key: 'deezer', url: deezerLink, ...musicServices.deezer },
        { key: 'spotify', url: spotifyLink, ...musicServices.spotify },
        { key: 'appleMusic', url: appleMusicLink, ...musicServices.appleMusic }
    ].filter(service => service.url);

    // Fallback to original link if no specific service links are available
    if (musicLinks.length === 0 && link) {
        musicLinks.push({
            key: 'default',
            url: link,
            name: 'Écouter',
            icon: '🎵',
            color: 'bg-indigo-500 hover:bg-indigo-600'
        });
    }

    return (
        <div
            key={id}
            className={`rounded-2xl shadow-lg border ${getBorderColor()} bg-white/80 backdrop-blur-sm relative overflow-hidden flex flex-col justify-end min-h-[160px] hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 group ${className}`}
            style={coverUrl ? {
                backgroundImage: `url(${coverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            } : {}}
        >
            {/* Gradient overlay for better text readability */}
            {coverUrl && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            )}

            <div className={coverUrl ? "relative z-10 p-5" : `p-5 ${getGradientBackground()}`}>
                <div className={`font-bold text-base ${coverUrl ? 'text-white' : 'text-gray-800'} drop-shadow-sm mb-2 overflow-hidden group-hover:text-opacity-90`}
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}
                    title={title}>
                    {title}
                </div>
                <div className={`text-sm ${coverUrl ? 'text-gray-200' : 'text-gray-600'} drop-shadow-sm mb-3 truncate`} title={artist}>
                    {artist}
                </div>
                {sharedBy && (
                    <div className={`text-xs ${coverUrl ? 'text-gray-300' : 'text-gray-500'} drop-shadow-sm mb-3 flex items-center gap-1`}>
                        <span>👤</span>
                        <span>Partagé par {sharedBy}</span>
                    </div>
                )}

                {/* Music service links */}
                <div className="flex gap-2 flex-wrap">
                    {musicLinks.map((service, index) => (
                        <a
                            key={`${service.key}-${index}`}
                            href={service.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg font-medium transition-all duration-200 ${coverUrl
                                    ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30'
                                    : `text-white ${service.color} border border-opacity-20`
                                } hover:scale-105 active:scale-95`}
                            title={`Écouter sur ${service.name}`}
                        >
                            <span>{service.icon}</span>
                            <span className="hidden sm:inline">{service.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
