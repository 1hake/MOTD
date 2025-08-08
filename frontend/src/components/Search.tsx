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
};

export default function Search({ onSelect }: SearchProps) {
    const [q, setQ] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tracks, setTracks] = useState<DeezerTrack[]>([]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQ(q.trim()), 500);
        return () => clearTimeout(t);
    }, [q]);

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
                setTracks(data.data.slice(0, 3) || []);
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

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-6">
                <label htmlFor="mb-search" className="block text-lg font-semibold text-gray-800 mb-3">
                    Rechercher une chanson
                </label>
                <div className="relative">
                    <input
                        id="mb-search"
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={`Essayez "Daft Punk" ou "Bohemian Rhapsody"`}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
                    />
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            Recherche…
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((it) => (
                    <div
                        key={it.id}
                        className="group rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all p-4 flex gap-3 cursor-pointer hover:border-green-300"
                        onClick={() => onSelect?.(it)}
                    >
                        <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {it.cover ? (
                                <img
                                    src={it.cover}
                                    alt={`${it.title} cover`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="h-full w-full grid place-items-center text-gray-400 text-xl">
                                    🎵
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 truncate mb-1" title={it.title}>
                                {it.title}
                            </div>
                            <div className="text-sm text-gray-600 truncate mb-1" title={it.artist}>
                                {it.artist}
                            </div>
                            {it.album && (
                                <div className="text-xs text-gray-500 truncate mb-2" title={it.album}>
                                    {it.album}
                                </div>
                            )}
                            <div className="text-xs text-green-600 font-medium group-hover:text-green-700">
                                Cliquer pour sélectionner
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && !error && debouncedQ && items.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎵</div>
                    <p className="text-lg text-gray-500 mb-2">Aucun résultat trouvé</p>
                    <p className="text-sm text-gray-400">Essayez avec d'autres mots-clés</p>
                </div>
            )}
        </div>
    );
}