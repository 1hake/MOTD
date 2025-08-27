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

    // Calendar style date parts (fixed tile sizing)
    const getDateParts = (dateString: string) => {
        const d = new Date(dateString);
        return {
            day: d.getDate(),
            month: d.toLocaleDateString('fr-FR', { month: 'short' }), // abbreviated month
            weekday: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
            year: d.getFullYear()
        };
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
        <div className="min-h-screen text-gray-100">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Profile Header */}
                <div className="text-center mb-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-xl ring-2 ring-indigo-400/30">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {user.name || user.email.split('@')[0]}
                    </h1>
                    <p className="text-lg text-gray-400 mb-2">{user.email}</p>
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
                        <h3 className="text-2xl font-semibold text-gray-200 mb-4">Aucune chanson partagée</h3>
                        <p className="text-lg text-gray-500">L'aventure musicale commence ici !</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {sortedDates.map(date => {
                            const { day, month, weekday, year } = getDateParts(date);
                            return (
                                <div key={date} className="space-y-8">
                                    {/* Calendar style date header */}
                                    <div className="flex justify-center">
                                        <div className="flex items-center space-x-5">
                                            <div className="w-16 h-16 bg-gray-800/80 backdrop-blur rounded-lg flex flex-col items-center justify-center border border-gray-700 shadow-inner shadow-black/40">
                                                <span className="text-3xl font-extrabold leading-none text-white">{day}</span>
                                                <span className="text-xs uppercase tracking-wider text-gray-400">{month}</span>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-sm uppercase tracking-wide text-indigo-400 font-medium">{weekday}</span>
                                                <span className="text-xl md:text-2xl font-semibold text-gray-100">{year}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Songs for this date */}
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
