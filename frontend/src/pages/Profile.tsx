import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate, useParams } from 'react-router-dom';
import SongCard from '../components/SongCard';

type Post = {
    id: number;
    title: string;
    artist: string;
    link: string;
    coverUrl?: string;
    date: string;
};

type User = {
    id: number;
    email: string;
    name?: string;
};

export default function Profile() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { userId: paramUserId } = useParams();

    useEffect(() => {
        (async () => {
            const token = await getToken();
            if (!token) return navigate('/');

            const currentUserId = getUserIdFromToken(token);
            if (!currentUserId) {
                console.error('Could not get user ID from token');
                return navigate('/');
            }

            // If no userId in params, show current user's profile
            const targetUserId = paramUserId ? parseInt(paramUserId, 10) : currentUserId;

            try {
                setLoading(true);

                // Fetch user info
                const userRes = await api.get(`/users/${targetUserId}`);
                setUser(userRes.data);

                // Fetch user's posts
                const postsRes = await api.get(`/posts/me?userId=${targetUserId}`);
                setPosts(postsRes.data);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate, paramUserId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const groupPostsByDate = (posts: Post[]) => {
        const grouped: { [key: string]: Post[] } = {};
        posts.forEach(post => {
            const date = new Date(post.date).toDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(post);
        });
        return grouped;
    };

    if (loading) {
        return (
            <div className="p-4 flex justify-center items-center min-h-screen">
                <div className="text-lg">Chargement...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-4 flex justify-center items-center min-h-screen">
                <div className="text-lg text-red-600">Utilisateur non trouvé</div>
            </div>
        );
    }

    const groupedPosts = groupPostsByDate(posts);
    const sortedDates = Object.keys(groupedPosts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {user.name || user.email.split('@')[0]}
                            </h1>
                            <p className="text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {posts.length} chanson{posts.length > 1 ? 's' : ''} partagée{posts.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts History */}
            <div className="space-y-6">
                {sortedDates.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        <div className="text-6xl mb-4">🎵</div>
                        <p className="text-lg">Aucune chanson partagée pour le moment</p>
                    </div>
                ) : (
                    sortedDates.map(date => (
                        <div key={date} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3">
                                <h2 className="text-white font-semibold text-lg">
                                    {formatDate(date)}
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedPosts[date].map((post) => (
                                        <SongCard
                                            key={post.id}
                                            id={post.id}
                                            title={post.title}
                                            artist={post.artist}
                                            link={post.link}
                                            coverUrl={post.coverUrl}
                                            variant="purple"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
