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
    likeCount: number;
    isLikedByUser: boolean;
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

    const handleLikeChange = (postId: number, isLiked: boolean, newLikeCount: number) => {
        setPosts(prevPosts =>
            prevPosts.map(p =>
                p.id === postId
                    ? { ...p, isLikedByUser: isLiked, likeCount: newLikeCount }
                    : p
            )
        );
    };

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Profile Header */}
                <div className="text-center mb-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {user.name || user.email.split('@')[0]}
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">{user.email}</p>
                    <p className="text-gray-500">
                        {posts.length} chanson{posts.length > 1 ? 's' : ''} partagée{posts.length > 1 ? 's' : ''}
                    </p>
                    {/* Show logout button only for current user's own profile */}
                    {currentUserId && user.id === currentUserId && (
                        <div className="mt-6">
                            <LogoutButton />
                        </div>
                    )}
                </div>

                {/* Posts History */}
                {sortedDates.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">🎵</div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Aucune chanson partagée</h3>
                        <p className="text-lg text-gray-500">L'aventure musicale commence ici !</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {sortedDates.map(date => (
                            <div key={date} className="space-y-6">
                                {/* Date Header - More prominent and elegant */}
                                <div className="flex items-center justify-center">
                                    <div className="bg-white rounded-full px-8 py-4 shadow-md border border-gray-100">
                                        <h2 className="text-2xl font-bold text-gray-900 text-center">
                                            {formatDate(date)}
                                        </h2>
                                    </div>
                                </div>

                                {/* Songs for this date - Direct display without card wrapper */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                            likeCount={post.likeCount}
                                            isLikedByUser={post.isLikedByUser}
                                            onLikeChange={handleLikeChange}
                                            showLikes={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
