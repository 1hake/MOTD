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
        <div className="flex items-stretch gap-0 bg-white rounded-xl border-3 border-black shadow-neo-sm overflow-hidden animate-pulse">
            {/* Cover Image skeleton */}
            <div className="flex-shrink-0 w-20">
                <div className="w-full h-full bg-pop-pink/20"></div>
            </div>

            {/* Song Info skeleton */}
            <div className="flex-grow min-w-0 p-4 flex flex-col justify-center">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
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
                    <input
                        id="mb-search"
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Recherchez votre chanson..."
                        className="input-field pl-12 shadow-neo focus:shadow-neo-lg transition-all"
                    />

                    {/* Search icon */}
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>

                    {/* Loading spinner */}
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-3 border-black border-t-transparent"></div>
                        </div>
                    )}

                    {/* Clear button */}
                    {q && !loading && (
                        <button
                            onClick={() => setQ("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-pop-pink rounded-md transition-colors border-2 border-transparent hover:border-black"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-black">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Search status */}
                {debouncedQ && (
                    <div className="mt-3 flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase tracking-wider ${loading ? 'bg-pop-yellow' : tracks.length > 0 ? 'bg-pop-mint' : 'bg-pop-pink'}`}>
                            {loading ? 'Recherche...' : `${tracks.length} résultat${tracks.length > 1 ? 's' : ''}`}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-pop-red border-3 border-black shadow-neo rounded-xl text-sm font-bold flex items-center gap-3">
                    <svg className="h-5 w-5 text-black flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {loading && tracks.length === 0 && (
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {!loading && !error && tracks.length > 0 && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-none pb-8 pr-2">
                    {items.map((it, index) => (
                        <div
                            key={it.id}
                            ref={index === items.length - 1 ? lastTrackElementRef : null}
                            className="animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => {
                                console.log("Song selected in Search component:", it.title);
                                onSelect?.(it);
                            }}
                        >
                            <SongCard
                                id={it.id}
                                title={it.title}
                                artist={it.artist}
                                link="#"
                                coverUrl={it.cover || undefined}
                                horizontal={true}
                                showSaves={false}
                                isOwnPost={false}
                                className="hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
                                disableAudioClick={true} // In search, we usually want to select the song, not play it
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
                                className="btn-secondary w-full"
                            >
                                Charger plus de résultats
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!loading && !error && debouncedQ && items.length === 0 && (
                <div className="text-center py-16 px-8 rounded-2xl bg-white border-3 border-black shadow-neo">
                    <div className="text-6xl mb-4 grayscale">🔍</div>
                    <p className="text-xl text-black font-black uppercase italic mb-2">Aucun résultat</p>
                    <p className="text-sm text-black/60 font-bold uppercase tracking-wider">Essayez avec d'autres mots-clés</p>
                </div>
            )}
        </div>
    );
}