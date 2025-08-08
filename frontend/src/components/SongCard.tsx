import React from 'react';

type SongCardProps = {
    id: number;
    title: string;
    artist: string;
    link: string;
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
    coverUrl,
    sharedBy,
    variant = 'default',
    className = ''
}: SongCardProps) {
    const getGradientBackground = () => {
        switch (variant) {
            case 'purple':
                return 'bg-gradient-to-br from-purple-100 to-pink-100';
            case 'blue':
                return 'bg-gradient-to-br from-blue-100 to-indigo-100';
            default:
                return 'bg-gradient-to-br from-gray-100 to-slate-100';
        }
    };

    return (
        <div
            key={id}
            className={`rounded-xl shadow-lg border bg-white relative overflow-hidden flex flex-col justify-end min-h-[140px] hover:shadow-xl transition-shadow ${className}`}
            style={coverUrl ? {
                backgroundImage: `url(${coverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            } : {}}
        >
            <div className={coverUrl ? "bg-black/60 p-4" : `p-4 ${getGradientBackground()}`}>
                <div className={`font-semibold ${coverUrl ? 'text-white' : 'text-gray-800'} drop-shadow mb-1`} title={title}>
                    {title}
                </div>
                <div className={`text-sm ${coverUrl ? 'text-gray-200' : 'text-gray-600'} drop-shadow mb-1`} title={artist}>
                    {artist}
                </div>
                {sharedBy && (
                    <div className={`text-xs ${coverUrl ? 'text-gray-300' : 'text-gray-500'} drop-shadow mb-2`}>
                        Partagé par {sharedBy}
                    </div>
                )}
                <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs ${coverUrl ? 'text-indigo-200 hover:text-indigo-100' : 'text-indigo-600 hover:text-indigo-800'} hover:underline inline-block`}
                >
                    🎵 Écouter
                </a>
            </div>
        </div>
    );
}
