import React, { useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import Search from '../components/Search';

export default function PostSong() {
  const [selected, setSelected] = useState<{
    title: string;
    artist: string;
    link: string;
    cover?: string | null;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async () => {
    if (!selected || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const token = await getToken();
      if (!token) return navigate('/');

      const userId = getUserIdFromToken(token);
      if (!userId) return navigate('/');

      await api.post('/posts', {
        title: selected.title,
        artist: selected.artist,
        link: selected.link,
        coverUrl: selected.cover,
        userId
      });

      navigate('/feed');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area */}
      <div className="p-4 pb-32"> {/* Extra bottom padding for navigation + confirmation bar */}
        <Search onSelect={track => {
          setSelected({
            title: track.title,
            artist: track.artist,
            link: `https://www.deezer.com/track/${track.id}`,
            cover: track.cover || null
          });
          setError(null); // Clear any previous errors when selecting a new track
        }} />
      </div>

      {/* Fixed bottom confirmation bar */}
      {selected && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t shadow-lg z-[60]">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Selected track preview */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {selected.cover ? (
                    <img
                      src={selected.cover}
                      alt={`${selected.title} cover`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-xs text-gray-400">
                      🎵
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate" title={selected.title}>
                    {selected.title}
                  </div>
                  <div className="text-sm text-gray-600 truncate" title={selected.artist}>
                    {selected.artist}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={submit}
                  disabled={isSubmitting || !!error}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${error
                      ? 'bg-red-100 text-red-600 cursor-not-allowed'
                      : isSubmitting
                        ? 'bg-green-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                    }`}
                >
                  {error
                    ? error
                    : isSubmitting
                      ? 'Publication...'
                      : 'Publier'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
