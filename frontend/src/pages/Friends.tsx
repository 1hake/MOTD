
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';

export default function Friends() {
  const [friends, setFriends] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return navigate('/');
      const id = Number(token.split('-').pop());
      const res = await api.get(`/friends?userId=${id}`);
      setFriends(res.data);
    })();
  }, [navigate]);

  const addFriend = async () => {
    const token = await getToken();
    if (!token) return navigate('/');
    const userId = Number(token.split('-').pop());
    await api.post('/friends', { userId, friendEmail: email });
    setEmail('');
    const res = await api.get(`/friends?userId=${userId}`);
    setFriends(res.data);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mes amis</h1>
      <div className="flex gap-2 mb-4">
        <input className="border p-2 flex-1" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="bg-blue-600 text-white px-4" onClick={addFriend}>Ajouter</button>
      </div>
      <ul>
        {friends.map((f) => (
          <li key={f.id}>{f.email}</li>
        ))}
      </ul>
    </div>
  );
}
