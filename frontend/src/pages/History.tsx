
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate, Link } from 'react-router-dom';
import SongCard from '../components/SongCard';

export default function History() {
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

      const res = await api.get(`/posts/me?userId=${userId}`);
      setPosts(res.data);
    })();
  }, [navigate]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p) => (
          <SongCard
            key={p.id}
            id={p.id}
            title={p.title}
            artist={p.artist}
            link={p.link}
            coverUrl={p.coverUrl}
            variant="default"
          />
        ))}
      </div>
    </div>
  );
}
