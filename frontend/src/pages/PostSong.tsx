import React, { useState } from 'react';
import { api } from '../lib/api';
import { getToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import Search from '../components/Search';

// Decode a JWT and return the numeric userId claim
function getUserIdFromToken(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // base64url -> base64 with padding
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const obj = JSON.parse(json);
    const id = Number(obj.userId);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export default function PostSong() {
  const [selected, setSelected] = useState<{
    title: string;
    artist: string;
    link: string;
    cover?: string | null;
  } | null>(null);
  const navigate = useNavigate();

  const submit = async () => {
    if (!selected) return;
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
    navigate('/home');
  };

  return (
    <div className="flex flex-col p-4 gap-2">
      <h1 className="text-xl font-bold">Poster une chanson</h1>
      <Search onSelect={track => setSelected({
        title: track.title,
        artist: track.artist,
        link: `https://www.deezer.com/track/${track.id}`,
        cover: track.cover || null
      })} />
      {selected && (
        <div className="border rounded p-3 my-2 bg-white/80">
          <div className="font-semibold">{selected.title}</div>
          <div className="text-sm text-gray-700">{selected.artist}</div>
          <a href={selected.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">Voir sur Deezer</a>
        </div>
      )}
      <button
        className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        onClick={submit}
        disabled={!selected}
      >
        Publier
      </button>
    </div>
  );
}
