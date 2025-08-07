
import React, { useState } from 'react';
import { api } from '../lib/api';
import { getToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';

export default function PostSong() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [link, setLink] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    const token = await getToken();
    if (!token) return navigate('/');
    const userId = Number(token.split('-').pop());
    await api.post('/posts', { title, artist, link, userId });
    navigate('/home');
  };

  return (
    <div className="flex flex-col p-4 gap-2">
      <h1 className="text-xl font-bold">Poster une chanson</h1>
      <input className="border p-2" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
      <input className="border p-2" placeholder="Artiste" value={artist} onChange={e => setArtist(e.target.value)} />
      <input className="border p-2" placeholder="Lien Spotify/YouTube" value={link} onChange={e => setLink(e.target.value)} />
      <button className="bg-blue-600 text-white p-2 rounded" onClick={submit}>Publier</button>
    </div>
  );
}
