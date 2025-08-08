
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import AddFriendButton from '../components/AddFriendButton';

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
    <div className="p-4 max-w-4xl mx-auto">
      {/* Friends list */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Liste d'amis ({friends.length})</h2>
          <AddFriendButton onAdd={addFriend} />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Chargement...</div>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-lg mb-4">Vous n'avez pas encore d'amis</p>
            <p className="text-sm text-gray-400 mb-4">Ajoutez des amis pour voir leurs musiques dans votre feed!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div key={friend.id} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 border hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {friend.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{friend.email.split('@')[0]}</div>
                    <div className="text-sm text-gray-600">{friend.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 text-blue-700">
            <span className="text-lg">💡</span>
            <div className="text-sm">
              <strong>Astuce:</strong> Les musiques partagées par vos amis apparaissent maintenant dans votre{' '}
              <button
                onClick={() => navigate('/feed')}
                className="text-blue-600 underline hover:text-blue-800"
              >
                feed principal
              </button>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
