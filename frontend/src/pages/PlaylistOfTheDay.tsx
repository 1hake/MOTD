import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate, Link } from 'react-router-dom';

type Post = {
    id: number;
    title: string;
    artist: string;
    link: string;
    coverUrl?: string;
    date: string;
    user: {
        id: number;
        email: string;
        name?: string;
    };
};

export default function PlaylistOfTheDay() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
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

            try {
                setLoading(true);
                const res = await api.get(`/friends/posts?userId=${userId}`);
                setPosts(res.data);
            } catch (error) {
                console.error('Error fetching friends posts:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserDisplayName = (user: Post['user']) => {
        return user.name || user.email.split('@')[0];
    };

    const getUserInitial = (user: Post['user']) => {
        return user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
    };

    if (loading) {
        return (
            <div className="p-4 flex justify-center items-center min-h-screen">
                <div className="text-lg">Chargement de la playlist...</div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">🎵 Playlist du jour</h1>
                <p className="text-gray-600">
                    Découvrez les chansons partagées aujourd'hui par vos amis
                </p>
                <div className="text-sm text-gray-500 mt-2">
                    {posts.length} chanson{posts.length > 1 ? 's' : ''} partagée{posts.length > 1 ? 's' : ''} aujourd'hui
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    <div className="text-6xl mb-4">🎭</div>
                    <p className="text-lg mb-2">Aucune chanson partagée aujourd'hui</p>
                    <p className="text-sm">Vos amis n'ont pas encore partagé de musique aujourd'hui.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {/* Album Cover */}
                            <div
                                className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center relative"
                                style={post.coverUrl ? {
                                    backgroundImage: `url(${post.coverUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                } : {}}
                            >
                                {!post.coverUrl && (
                                    <div className="text-white text-6xl">🎵</div>
                                )}
                                {/* Time posted overlay */}
                                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                                    {formatTime(post.date)}
                                </div>
                            </div>

                            {/* Song Info */}
                            <div className="p-4">
                                <div className="mb-3">
                                    <h3 className="font-semibold text-gray-800 text-lg truncate" title={post.title}>
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm truncate" title={post.artist}>
                                        {post.artist}
                                    </p>
                                </div>

                                {/* User Info */}
                                <div className="flex items-center justify-between mb-3">
                                    <Link
                                        to={`/profile/${post.user.id}`}
                                        className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {getUserInitial(post.user)}
                                        </div>
                                        <span className="text-sm text-gray-600 hover:text-purple-600 font-medium">
                                            {getUserDisplayName(post.user)}
                                        </span>
                                    </Link>
                                </div>

                                {/* Action Button */}
                                <a
                                    href={post.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium text-sm"
                                >
                                    🎧 Écouter sur Deezer
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom spacing for navigation */}
            <div className="h-20"></div>
        </div>
    );
}
