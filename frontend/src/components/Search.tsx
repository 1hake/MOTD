import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import SongCard from "./SongCard";

type DeezerTrack = {
    id: number;
    title: string;
    artist: {
        id: number;
        name: string;
        picture?: string;
        picture_medium?: string;
    };
    album: {
        id: number;
        title: string;
        cover?: string;
        cover_medium?: string;
    };
    preview?: string;
};

type DeezerSearchResponse = {
    data: DeezerTrack[];
    total: number;
    next?: string;
};

type SearchProps = {
    onSelect?: (track: {
        id: number;
        title: string;
        artist: string;
        album: string;
        cover: string | null;
        preview: string | null;
    }) => void;
    onSearchChange?: (query: string) => void;
};

export default function Search({ onSelect, onSearchChange }: SearchProps) {
    const [q, setQ] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tracks, setTracks] = useState<DeezerTrack[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const observer = useRef<IntersectionObserver | null>(null);

    const lastTrackElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && debouncedQ) {
                loadMoreResults();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, debouncedQ]);

    useEffect(() => {
        // Trigger callback for both search start and search end
        if (onSearchChange) {
            onSearchChange(q);
        }
        const t = setTimeout(() => setDebouncedQ(q.trim()), 300); // Reduced debounce time for better UX
        return () => clearTimeout(t);
    }, [q, onSearchChange]);

    const searchTracks = async (query: string, index: number = 0, append: boolean = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            // Use Deezer API for search with pagination
            const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&index=${index}&limit=12`;
            // Use a CORS proxy since Deezer API does not support CORS directly
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error(`Deezer HTTP ${res.status}`);
            const data: DeezerSearchResponse = await res.json();

            if (append) {
                setTracks(prev => [...prev, ...(data.data || [])]);
            } else {
                setTracks(data.data || []);
            }

            setHasMore(data.data && data.data.length === 12 && (index + 12) < data.total);
            setCurrentIndex(index + (data.data?.length || 0));
        } catch (e: any) {
            setError(e?.message || "Search failed");
            if (!append) {
                setTracks([]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreResults = useCallback(() => {
        if (!debouncedQ || !hasMore || loadingMore) return;
        searchTracks(debouncedQ, currentIndex, true);
    }, [debouncedQ, hasMore, loadingMore, currentIndex]);

    useEffect(() => {
        if (!debouncedQ) {
            setTracks([]);
            setError(null);
            setHasMore(true);
            setCurrentIndex(0);
            return;
        }

        // Reset pagination for new search
        setHasMore(true);
        setCurrentIndex(0);
        searchTracks(debouncedQ, 0, false);
    }, [debouncedQ]);

    const items = useMemo(() => {
        return tracks.map((t) => {
            return {
                id: t.id,
                title: t.title,
                artist: t.artist?.name || "Unknown artist",
                album: t.album?.title || "",
                cover: t.album?.cover_medium || t.album?.cover || t.artist?.picture_medium || t.artist?.picture || null,
                preview: t.preview || null,
            };
        });
    }, [tracks]);

    const SkeletonCard = () => (
        <div className="flex items-stretch gap-0 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden animate-pulse">
            {/* Cover Image skeleton */}
            <div className="flex-shrink-0 w-20">
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700"></div>
            </div>

            {/* Song Info skeleton */}
            <div className="flex-grow min-w-0 p-4 flex flex-col justify-center">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>

            {/* Buttons skeleton */}
            <div className="flex-shrink-0 flex items-center gap-2 p-4">
                <div className="h-8 w-16 bg-gray-600 rounded-full"></div>
            </div>
        </div>
    );

    const LoadMoreSkeleton = () => (
        <div className="space-y-2">
            {[...Array(3)].map((_, i) => <SkeletonCard key={`loadmore-${i}`} />)}
        </div>
    );

    return (
        <div className="w-full">
            <div className="mb-6">
                <div className="relative group">
                    {/* Search icon with enhanced animations */}
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 group-hover:text-gray-500 transition-all duration-300 group-focus-within:scale-110" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>

                    {/* Loading spinner when searching */}
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-200 border-t-indigo-500"></div>
                        </div>
                    )}

                    {/* Clear button when there's text */}
                    {q && !loading && (
                        <button
                            onClick={() => setQ("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100 p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    )}

                    <input
                        id="mb-search"
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Recherchez votre chanson..."
                        className="w-full text-gray-900 rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm pl-12 pr-12 py-3.5 text-base font-medium outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-gray-300 hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg focus:shadow-xl placeholder:text-gray-400 group-focus-within:bg-white"
                    />

                    {/* Enhanced gradient overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/3 via-purple-500/3 to-pink-500/3 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-indigo-400/10 to-purple-400/10 blur-xl"></div>
                </div>

                {/* Search status indicator */}
                {debouncedQ && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            {loading ? (
                                <>
                                    <div className="animate-pulse h-2 w-2 bg-indigo-400 rounded-full"></div>
                                    <span>Recherche en cours...</span>
                                </>
                            ) : tracks.length > 0 ? (
                                <>
                                    <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                                    <span>{tracks.length} résultat{tracks.length > 1 ? 's' : ''} trouvé{tracks.length > 1 ? 's' : ''}</span>
                                </>
                            ) : (
                                <>
                                    <div className="h-2 w-2 bg-amber-400 rounded-full"></div>
                                    <span>Aucun résultat</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 p-5 text-sm text-red-800 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <svg className="h-5 w-5 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}

            {loading && tracks.length === 0 && (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {!loading && !error && tracks.length > 0 && (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {items.map((it, index) => (
                        <div
                            key={it.id}
                            ref={index === items.length - 1 ? lastTrackElementRef : null}
                            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                            onClick={() => onSelect?.(it)}
                        >
                            <SongCard
                                id={it.id}
                                title={it.title}
                                artist={it.artist}
                                link="#" // We'll use the first available platform link
                                coverUrl={it.cover || undefined}
                                horizontal={true}
                                showLikes={false}
                                isOwnPost={false}
                                className="transform hover:scale-[1.02] transition-transform duration-200"
                            />
                        </div>
                    ))}

                    {/* Loading more indicator */}
                    {loadingMore && <LoadMoreSkeleton />}

                    {/* Load more manually button (fallback) */}
                    {!loadingMore && hasMore && tracks.length > 0 && (
                        <div className="pt-6 text-center">
                            <button
                                onClick={loadMoreResults}
                                className="px-8 py-4 text-base font-semibold text-gray-700 hover:text-black hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-2xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
                            >
                                Charger plus de résultats
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!loading && !error && debouncedQ && items.length === 0 && (
                <div className="text-center py-16 px-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-gray-200 shadow-inner">
                    <div className="text-6xl mb-4 text-gray-300 animate-pulse">🔍</div>
                    <p className="text-lg text-gray-600 font-bold mb-2">Aucun résultat trouvé</p>
                    <p className="text-sm text-gray-500 font-medium">Essayez avec d'autres mots-clés</p>
                </div>
            )}
        </div>
    );
}