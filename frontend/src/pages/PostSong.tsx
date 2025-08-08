import React, { useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import Search from '../components/Search';
import SelectedTrackPreview from '../components/SelectedTrackPreview';
import { generateMusicServiceLinks } from '../lib/musicServices';

export default function PostSong() {
  const [selected, setSelected] = useState<{
    title: string;
    artist: string;
    link: string;
    cover?: string | null;
    id?: number;
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
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-16 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Partager ma chanson du jour
            </h1>
          </div>
          <p className="text-gray-600 mt-2 ml-6">Recherchez et sélectionnez la musique que vous souhaitez partager</p>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <Search onSelect={track => {
            setSelected({
              title: track.title,
              artist: track.artist,
              link: `https://www.deezer.com/track/${track.id}`,
              cover: track.cover || null,
              id: track.id
            });
            setError(null); // Clear any previous errors when selecting a new track
          }} />
        </div>
      </div>

      {/* Fixed bottom confirmation bar */}
      {selected && (
        <SelectedTrackPreview
          track={selected}
          onCancel={() => setSelected(null)}
          onSubmit={submit}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  );
}
