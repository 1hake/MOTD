import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Search from './Search';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { generateMusicServiceLinks } from '../lib/musicServices';

interface EmptyFeedCTAProps {
    show: boolean;
}

const EmptyFeedCTA: React.FC<EmptyFeedCTAProps> = ({ show }) => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<{
        title: string;
        artist: string;
        link: string;
        cover?: string | null;
        id?: number;
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Auto-scroll management - trigger on any non-empty search
    useEffect(() => {
        const trimmedQuery = searchQuery.trim();

        // Scroll to top whenever user types a search query
        if (trimmedQuery.length > 0) {
            console.log('Scrolling to top for query:', trimmedQuery);

            const scrollToTop = () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            };

            // Small delay to ensure search results are rendered
            const timeoutId = setTimeout(scrollToTop, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery]);

    const handleSearchStart = (query: string) => {
        console.log('Search query changed:', query);
        setSearchQuery(query);
        const trimmedQuery = query.trim();

        // Set searching state based on whether there's a query
        if (trimmedQuery) {
            setIsSearching(true);

            // Immediate scroll when user starts typing
            console.log('Triggering scroll for query:', trimmedQuery);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            setIsSearching(false);
        }

        // Clear any previous errors when starting a new search
        if (trimmedQuery && error) {
            setError(null);
        }
    };

    const handlePostSong = async () => {
        if (!selected || isSubmitting) return;

        try {
            setIsSubmitting(true);
            setError(null);

            const token = await getToken();
            if (!token) return navigate('/');

            const userId = getUserIdFromToken(token);
            if (!userId) return navigate('/');

            // Generate links for all music services
            const musicLinks = selected.id
                ? generateMusicServiceLinks({
                    id: selected.id,
                    title: selected.title,
                    artist: selected.artist
                })
                : {};

            await api.post('/posts', {
                title: selected.title,
                artist: selected.artist,
                link: selected.link,
                coverUrl: selected.cover,
                deezerLink: musicLinks.deezer,
                spotifyLink: musicLinks.spotify,
                appleMusicLink: musicLinks.appleMusic,
                userId
            });

            // Reload the page to show the new post
            window.location.reload();
        } catch (err: any) {
            setIsSubmitting(false);

            // Handle 400 error (already posted today)
            if (err.response?.status === 400) {
                setError('Déjà posté aujourd\'hui');
            } else {
                setError('Erreur lors de la publication. Veuillez réessayer.');
            }
        }
    };

    const handleCancel = () => {
        setSelected(null);
        setError(null);
        setIsSearching(false);
        setSearchQuery('');
    };

    if (!show) return null;

    return (
        <div className={`text-white rounded-2xl p-6 transition-all duration-500 ease-out ${isSearching ? 'pb-24 transform' : ''
            }`}>
            {!selected ? (
                <div className="space-y-6">
                    {/* Header */}
                    <div className={`text-center space-y-3 transition-all duration-300 ${isSearching ? 'opacity-75 scale-95' : 'opacity-100 scale-100'
                        }`}>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Partagez votre chanson du jour</h3>
                            <p className="text-black text-sm">Recherchez et partagez votre musique préférée avec vos amis.</p>
                        </div>
                    </div>

                    {/* Integrated Search */}
                    <div className={`transition-all duration-300 ${isSearching ? 'pb-20 transform scale-102' : ''
                        }`}>
                        <Search
                            onSelect={track => {
                                setSelected({
                                    title: track.title,
                                    artist: track.artist,
                                    link: `https://www.deezer.com/track/${track.id}`,
                                    cover: track.cover || null,
                                    id: track.id
                                });
                                setError(null);
                                setIsSearching(false);
                                setSearchQuery('');
                            }}
                            onSearchChange={handleSearchStart}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header with close button */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Votre sélection</h3>
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-white transition-all duration-200 p-2 hover:bg-white/10 rounded-lg hover:scale-110 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Selected Track Card */}
                    <div className="bg-white rounded-xl p-6 space-y-4 shadow-xl border border-gray-100">
                        {/* Cover and Track Info */}
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-lg transition-transform hover:scale-105">
                                {selected.cover ? (
                                    <img
                                        src={selected.cover}
                                        alt={`${selected.title} cover`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-2xl text-gray-400">🎵</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-black truncate" title={selected.title}>
                                    {selected.title}
                                </h4>
                                <p className="text-gray-600 truncate" title={selected.artist}>
                                    {selected.artist}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                onClick={handlePostSong}
                                disabled={isSubmitting || !!error}
                                className={`w-full px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${error
                                    ? 'bg-red-50 text-red-600 border border-red-200 cursor-not-allowed'
                                    : isSubmitting
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-black text-white hover:bg-gray-800 active:bg-gray-900 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                {error ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {error}
                                    </>
                                ) : isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        Publication...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Publier ma chanson
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                                disabled={isSubmitting}
                            >
                                Choisir une autre chanson
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmptyFeedCTA;
