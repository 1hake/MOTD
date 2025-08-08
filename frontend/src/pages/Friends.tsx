
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import AddFriendButton from '../components/AddFriendButton';

type Friend = {
  id: number;
  email: string;
};

type Post = {
  id: number;
  title: string;
  artist: string;
  link: string;
  coverUrl?: string;
  user: {
    id: number;
    email: string;
  };
};

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return navigate('/');
      const id = Number(token.split('-').pop());

      // Fetch friends list
      const friendsRes = await api.get(`/friends?userId=${id}`);
      setFriends(friendsRes.data);

      // Fetch friends' posts
      const postsRes = await api.get(`/friends/posts?userId=${id}`);
      setPosts(postsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const addFriend = async (email: string) => {
    const token = await getToken();
    if (!token) return navigate('/');
    const userId = Number(token.split('-').pop());
    await api.post('/friends', { userId, friendEmail: email });
    // Refresh data after adding friend
    fetchData();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Mes amis</h1>
        <AddFriendButton onAdd={addFriend} />
      </div>

      {/* Friends list */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Amis ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500">Vous n'avez pas encore d'amis. Ajoutez-en un!</p>
        ) : (
          <ul className="bg-white rounded-lg shadow divide-y">
            {friends.map((friend) => (
              <li key={friend.id} className="py-3 px-4">
                {friend.email}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Posts from friends */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Musiques du jour</h2>
        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">Vos amis n'ont pas encore partagé de musique aujourd'hui.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl shadow border bg-white/80 relative overflow-hidden flex flex-col justify-end min-h-[140px]"
                style={post.coverUrl ? {
                  backgroundImage: `url(${post.coverUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : {}}
              >
                <div className={post.coverUrl ? "bg-black/60 p-3" : "p-3"}>
                  <div className="font-semibold text-white drop-shadow">{post.title}</div>
                  <div className="text-sm text-gray-200 drop-shadow">{post.artist}</div>
                  <div className="text-xs text-gray-300 drop-shadow mt-1">
                    Partagé par {post.user.email}
                  </div>
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-200 hover:underline mt-1 inline-block"
                  >
                    Écouter
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
