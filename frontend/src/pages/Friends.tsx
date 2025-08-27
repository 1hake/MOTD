
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import AddFriendButton from '../components/AddFriendButton';
import LoadingState from '../components/LoadingState';

type Friend = {
  id: number;
  email: string;
};

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return navigate('/');

      const userId = getUserIdFromToken(token);
      if (!userId) {
        console.error('Could not get user ID from token');
        return navigate('/');
      }

      // Fetch friends list
      const friendsRes = await api.get(`/friends?userId=${userId}`);
      setFriends(friendsRes.data);
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

    const userId = getUserIdFromToken(token);
    if (!userId) {
      console.error('Could not get user ID from token');
      return navigate('/');
    }

    await api.post('/friends', { userId, friendEmail: email });
    // Refresh data after adding friend
    fetchData();
  };

  return (
    <div className="min-h-screen text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Mes amis</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              {friends.length === 0 ? 'Aucun ami pour le moment' : `${friends.length} ami${friends.length > 1 ? 's' : ''}`}
            </p>
            <AddFriendButton onAdd={addFriend} />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500/30 border-t-indigo-400 mx-auto"></div>
            <p className="text-gray-500 mt-4">Chargement...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && friends.length === 0 && (
          <div className="text-center py-16">
            <div className="text-7xl mb-6">👥</div>
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Aucun ami ajouté</h3>
            <p className="text-gray-500">Ajoutez des amis pour découvrir leurs musiques préférées !</p>
          </div>
        )}

        {/* Friends list */}
        {!loading && friends.length > 0 && (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="group rounded-xl p-4  border border-gray-800 hover:border-indigo-500/40 hover:bg-gray-900 transition-colors duration-200 cursor-pointer backdrop-blur-sm"
                onClick={() => navigate(`/profile/${friend.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white font-semibold shadow-md shadow-black/40 ring-2 ring-indigo-400/30">
                      {friend.email.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-100 truncate group-hover:text-white">
                      {friend.email.split('@')[0]}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{friend.email}</p>
                  </div>
                  <div className="text-gray-600 group-hover:text-indigo-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
