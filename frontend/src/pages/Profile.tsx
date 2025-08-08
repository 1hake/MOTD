import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate, useParams } from 'react-router-dom';
import SongCard from '../components/SongCard';
import LoadingState from '../components/LoadingState';
import LogoutButton from '../components/LogoutButton';

type Post = {
    id: number;
    title: string;
    artist: string;
    link: string;
    deezerLink?: string;
    spotifyLink?: string;
    appleMusicLink?: string;
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
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const navigate = useNavigate();
    const { userId: paramUserId } = useParams();

    useEffect(() => {
        (async () => {
            const token = await getToken();
            if (!token) return navigate('/');

            const currentUserIdFromToken = getUserIdFromToken(token);
            if (!currentUserIdFromToken) {
                console.error('Could not get user ID from token');
                return navigate('/');
            }

            setCurrentUserId(currentUserIdFromToken);

            // If no userId in params, show current user's profile
            const targetUserId = paramUserId ? parseInt(paramUserId, 10) : currentUserIdFromToken;

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
        return <LoadingState message="Chargement du profil..." />;
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
                <div className="text-center space-y-4">
                    <div className="text-6xl">❌</div>
                    <div className="text-xl font-semibold text-red-600">Utilisateur non trouvé</div>
                </div>
            </div>
        );
    }

    const groupedPosts = groupPostsByDate(posts);
    const sortedDates = Object.keys(groupedPosts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-900">
                                {user.name || user.email.split('@')[0]}
                            </h1>
                            <p className="text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {posts.length} chanson{posts.length > 1 ? 's' : ''} partagée{posts.length > 1 ? 's' : ''}
                            </p>
                        </div>
                        {/* Show logout button only for current user's own profile */}
                        {currentUserId && user.id === currentUserId && (
                            <LogoutButton />
                        )}
                    </div>
                </div>

                {/* Posts History */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique musical</h2>

                    {sortedDates.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎵</div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune chanson partagée</h3>
                            <p className="text-gray-500">L'aventure musicale commence ici !</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sortedDates.map(date => (
                                <div key={date} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                        <h3 className="font-medium text-gray-900">
                                            {formatDate(date)}
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            {groupedPosts[date].map((post) => (
                                                <SongCard
                                                    key={post.id}
                                                    id={post.id}
                                                    title={post.title}
                                                    artist={post.artist}
                                                    link={post.link}
                                                    deezerLink={post.deezerLink}
                                                    spotifyLink={post.spotifyLink}
                                                    appleMusicLink={post.appleMusicLink}
                                                    coverUrl={post.coverUrl}
                                                    variant="purple"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
