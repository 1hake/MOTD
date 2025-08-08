
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import { initPushSafe } from '../push';
import AnimatedGradientBlob from '../components/AnimateGradient';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return navigate('/');

      const userId = getUserIdFromToken(token);
      if (!userId) {
        console.error('Could not get user ID from token');
        return navigate('/');
      }

      const res = await api.get(`/posts/today?userId=${userId}`);
      setPosts(res.data);
      // Initialize push listeners safely (no-op on web)
      initPushSafe().catch(() => { });
    })();
  }, [navigate]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chansons du jour</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          onClick={() => navigate('/post')}
        >
          Poster ma chanson
        </button>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          onClick={() => navigate('/playlist')}
        >
          🎵 Playlist du jour
        </button>
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          onClick={() => navigate('/history')}
        >
          Mon historique
        </button>
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
          onClick={() => navigate('/friends')}
        >
          Amis
        </button>
      </div>
      {/* <AnimatedGradientBlob width={420} height={420} speed={1.2} lineIntensity={0.12} /> */}

      <ul>
        {posts.map((p) => (
          <li key={p.id} className="border-b py-2">
            <strong>{p.title}</strong> – {p.artist} {p.user ? <span>({p.user.email})</span> : null}
            {" "}
            <a className="text-blue-600 underline" href={p.link} target="_blank" rel="noreferrer">écouter</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
