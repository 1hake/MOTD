
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p) => (
          <div
            key={p.id}
            className="rounded-xl shadow border bg-white/80 relative overflow-hidden flex flex-col justify-end min-h-[120px]"
            style={p.coverUrl ? {
              backgroundImage: `url(${p.coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            } : {}}
          >
            <div className={p.coverUrl ? "bg-black/60 p-3" : "p-3"}>
              <div className="font-semibold text-white drop-shadow" title={p.title}>{p.title}</div>
              <div className="text-sm text-gray-200 drop-shadow" title={p.artist}>{p.artist}</div>
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-200 hover:underline mt-1 inline-block"
              >
                Voir sur Deezer
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
