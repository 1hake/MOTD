
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import { initPushSafe } from '../push';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return navigate('/');
      const id = Number(token.split('-').pop());
      const res = await api.get(`/posts/today?userId=${id}`);
      setPosts(res.data);
      // Initialize push listeners safely (no-op on web)
      initPushSafe().catch(() => {});
    })();
  }, [navigate]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chansons du jour</h1>
      <div className="flex gap-2 mb-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => navigate('/post')}
        >
          Poster ma chanson
        </button>
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded"
          onClick={() => navigate('/history')}
        >
          Mon historique
        </button>
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => navigate('/friends')}
        >
          Amis
        </button>
      </div>
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
