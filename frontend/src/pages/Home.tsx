import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getToken } from "../lib/storage";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return navigate("/");
      const id = Number(token.split("-").pop());
      setUserId(id);
      const res = await api.get(`/posts/today?userId=${id}`);
      setPosts(res.data);
    })();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chansons du jour</h1>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => navigate("/post")}
      >
        Poster ma chanson
      </button>
      <ul>
        {posts.map((p) => (
          <li key={p.id} className="border-b py-2">
            <strong>{p.title}</strong> – {p.artist} ({p.user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
