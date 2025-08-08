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
        <div className="w-full max-w-3xl mx-auto">
            <label htmlFor="mb-search" className="block text-sm font-medium text-gray-700 mb-2">
                Search by artist or song
            </label>
            <div className="relative">
                <input
                    id="mb-search"
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={`Try "Daft Punk" or "Smells Like Teen Spirit"`}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                        Searching…
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((it) => (
                    <div
                        key={it.id}
                        className="group rounded-2xl border border-gray-200 bg-white/60 backdrop-blur hover:bg-white transition p-3 flex gap-3 cursor-pointer"
                        onClick={() => onSelect?.(it)}
                    >
                        <div className="h-20 w-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                            {it.cover ? (
                                <img
                                    src={it.cover}
                                    alt={`${it.title} cover`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="h-full w-full grid place-items-center text-xs text-gray-400">
                                    No cover
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="font-semibold truncate" title={it.title}>
                                {it.title}
                            </div>
                            <div className="text-sm text-gray-700 truncate" title={it.artist}>
                                {it.artist}
                            </div>
                            {it.album && (
                                <div className="text-xs text-gray-500 truncate" title={it.album}>
                                    {it.album}
                                </div>
                            )}

                            <a
                                href={`https://www.deezer.com/track/${it.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-block text-xs text-indigo-600 hover:underline"
                                onClick={e => e.stopPropagation()}
                            >
                                View on Deezer
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && !error && debouncedQ && items.length === 0 && (
                <p className="mt-4 text-sm text-gray-500">No results found.</p>
            )}
        </div>
    );
}