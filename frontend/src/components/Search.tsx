import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";

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
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-pulse">
            <div className="flex gap-3 items-center">
                <div className="h-12 w-12 rounded-lg bg-gray-200 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
            <div className="mb-4">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input
                        id="mb-search"
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={`Recherchez votre chanson...`}
                        className="w-full text-black rounded-lg border border-gray-300 bg-white pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    />
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading && tracks.length === 0 && (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {!loading && !error && tracks.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {items.map((it, index) => (
                        <div
                            key={it.id}
                            ref={index === items.length - 1 ? lastTrackElementRef : null}
                            className="group rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 p-3 flex gap-3 items-center cursor-pointer transform hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2 duration-300"
                            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                            onClick={() => onSelect?.(it)}
                        >
                            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                                {it.cover ? (
                                    <img
                                        src={it.cover}
                                        alt={`${it.title} cover`}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="h-full w-full grid place-items-center text-gray-400 text-lg">
                                        🎵
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-black transition-colors" title={it.title}>
                                    {it.title}
                                </div>
                                <div className="text-xs text-gray-600 truncate group-hover:text-gray-700 transition-colors" title={it.artist}>
                                    {it.artist}
                                </div>
                            </div>
                            <div className="text-gray-400 group-hover:text-gray-600 transition-all transform group-hover:translate-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                        </div>
                    ))}

                    {/* Loading more indicator */}
                    {loadingMore && <LoadMoreSkeleton />}

                    {/* Load more manually button (fallback) */}
                    {!loadingMore && hasMore && tracks.length > 0 && (
                        <div className="pt-4 text-center">
                            <button
                                onClick={loadMoreResults}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
                            >
                                Charger plus de résultats
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!loading && !error && debouncedQ && items.length === 0 && (
                <div className="text-center py-8">
                    <div className="text-3xl mb-2 text-gray-300">🔍</div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Aucun résultat trouvé</p>
                    <p className="text-xs text-gray-400">Essayez avec d'autres mots-clés</p>
                </div>
            )}
        </div>
    );
}