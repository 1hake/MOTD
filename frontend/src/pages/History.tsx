
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return navigate('/');
      const id = Number(token.split('-').pop());
      const res = await api.get(`/posts/me?userId=${id}`);
      setPosts(res.data);
    })();
  }, [navigate]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mon historique</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id} className="border-b py-2">
            <strong>{p.title}</strong> – {p.artist}
          </li>
        ))}
      </ul>
    </div>
  );
}
