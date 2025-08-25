import React, { useEffect, useMemo, useState } from "react";

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
    const [error, setError] = useState<string | null>(null);
    const [tracks, setTracks] = useState<DeezerTrack[]>([]);

    useEffect(() => {
        onSearchChange?.(q);
        const t = setTimeout(() => setDebouncedQ(q.trim()), 500);
        return () => clearTimeout(t);
    }, [q, onSearchChange]);

    useEffect(() => {
        async function search() {
            if (!debouncedQ) {
                setTracks([]);
                setError(null);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                // Use Deezer API for search
                const url = `https://api.deezer.com/search?q=${encodeURIComponent(debouncedQ)}`;
                // Use a CORS proxy since Deezer API does not support CORS directly
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                const res = await fetch(proxyUrl);
                if (!res.ok) throw new Error(`Deezer HTTP ${res.status}`);
                const data: DeezerSearchResponse = await res.json();
                setTracks(data.data.slice(0, 6) || []);
            } catch (e: any) {
                setError(e?.message || "Search failed");
                setTracks([]);
            } finally {
                setLoading(false);
            }
        }
        search();
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
        <div className="bg-white p-4 rounded-xl border border-gray-200 animate-pulse">
            <div className="flex gap-4 items-center">
                <div className="h-20 w-20 rounded-lg bg-gray-200 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8">
                <label htmlFor="mb-search" className="block text-xl font-bold text-gray-800 mb-4 text-center">
                    Rechercher une chanson
                </label>
                <div className="relative">
                    <svg className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input
                        id="mb-search"
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={`Essayez "Daft Punk" ou "Bohemian Rhapsody"`}
                        className="w-full rounded-full border border-gray-300 bg-white pl-14 pr-6 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-shadow focus:shadow-md"
                    />
                </div>
            </div>

            {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {!loading && !error && tracks.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((it) => (
                        <div
                            key={it.id}
                            className="group rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all p-4 flex gap-4 items-center cursor-pointer hover:border-green-300 hover:bg-green-50"
                            onClick={() => onSelect?.(it)}
                        >
                            <div className="h-20 w-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 shadow-md">
                                {it.cover ? (
                                    <img
                                        src={it.cover}
                                        alt={`${it.title} cover`}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="h-full w-full grid place-items-center text-gray-400 text-2xl">
                                        🎵
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-gray-800 truncate mb-1" title={it.title}>
                                    {it.title}
                                </div>
                                <div className="text-sm text-gray-600 truncate mb-1" title={it.artist}>
                                    {it.artist}
                                </div>
                                {it.album && (
                                    <div className="text-xs text-gray-500 truncate" title={it.album}>
                                        {it.album}
                                    </div>
                                )}
                            </div>
                            <div className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && debouncedQ && items.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4 text-gray-300">☹️</div>
                    <p className="text-xl text-gray-600 font-semibold mb-2">Aucun résultat trouvé</p>
                    <p className="text-md text-gray-400">Essayez avec d'autres mots-clés ou vérifiez l'orthographe.</p>
                </div>
            )}
        </div>
    );
}