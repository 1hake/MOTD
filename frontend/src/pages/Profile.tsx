import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate, useParams } from 'react-router-dom';
import SongCard from '../components/SongCard';
import LoadingState from '../components/LoadingState';
import LogoutButton from '../components/LogoutButton';
import FollowButton from '../components/FollowButton';

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
    platformPreference?: string;
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

    // Helper function to capitalize first letter
    const capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // Enhanced date display with French localization
    const getDateDisplay = (dateString: string) => {
        const postDate = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // Reset time to compare only dates
        const postDateOnly = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (postDateOnly.getTime() === todayOnly.getTime()) {
            return {
                displayText: "Aujourd'hui",
                subtitle: capitalizeFirstLetter(postDate.toLocaleDateString('fr-FR', { weekday: 'long' })),
                isSpecial: true
            };
        } else if (postDateOnly.getTime() === yesterdayOnly.getTime()) {
            return {
                displayText: "Hier",
                subtitle: capitalizeFirstLetter(postDate.toLocaleDateString('fr-FR', { weekday: 'long' })),
                isSpecial: true
            };
        } else {
            const daysDiff = Math.floor((todayOnly.getTime() - postDateOnly.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff <= 7) {
                // Within a week - show day name
                return {
                    displayText: capitalizeFirstLetter(postDate.toLocaleDateString('fr-FR', { weekday: 'long' })),
                    subtitle: postDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                    isSpecial: false
                };
            } else {
                // Older - show full date
                return {
                    displayText: postDate.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                    }),
                    subtitle: postDate.toLocaleDateString('fr-FR', {
                        year: 'numeric'
                    }),
                    isSpecial: false
                };
            }
        }
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
                <div className="relative mb-16">
                    {/* Background Banner */}
                    <div className="relative ">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-4 ring-indigo-400/30">
                                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="mb-4">
                                    <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                        {user.name || user.email.split('@')[0]}
                                    </h1>
                                    <p className="text-lg text-indigo-300 mb-1">@{user.email.split('@')[0]}</p>
                                </div>

                                {/* Stats */}
                                <div className="flex justify-center md:justify-start gap-8 mb-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{posts.length}</div>
                                        <div className="text-sm text-gray-400 uppercase tracking-wide">
                                            Chanson{posts.length > 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* Member since */}
                                <div className="flex justify-center md:justify-start items-center gap-2 text-gray-500 text-sm mb-4">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <span>Membre depuis {posts.length > 0 ?
                                        new Date(posts[posts.length - 1].date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) :
                                        'récemment'
                                    }</span>
                                </div>

                                {/* Show logout button only for current user's own profile */}
                                {currentUserId && user.id === currentUserId && (
                                    <div className="flex justify-center md:justify-start gap-3">
                                        <button
                                            onClick={() => navigate('/profile/edit')}
                                            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 rounded-lg transition-all duration-200 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Modifier
                                        </button>
                                        <LogoutButton />
                                    </div>
                                )}

                                {/* Show follow button for other users' profiles */}
                                {currentUserId && user.id !== currentUserId && (
                                    <div className="flex justify-center md:justify-start">
                                        <FollowButton
                                            currentUserId={currentUserId}
                                            targetUserId={user.id}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts History */}
                {sortedDates.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">🎵</div>
                        <h3 className="text-2xl font-semibold text-gray-200 mb-4">Aucune chanson partagée</h3>
                        <p className="text-lg text-gray-500">L'aventure musicale commence ici !</p>
                    </div>
                ) : (
                    <div className="space-y-10 mb-24">
                        {sortedDates.map(date => {
                            const dateDisplay = getDateDisplay(date);
                            return (
                                <div key={date} className="space-y-2">
                                    {/* Elegant date header */}
                                    <div className="flex justify-center">
                                        <div className="text-center">
                                            <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${dateDisplay.isSpecial
                                                ? 'bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent'
                                                : 'text-white'
                                                }`}>
                                                {dateDisplay.displayText}
                                            </h2>
                                            <p className="text-gray-400 text-sm uppercase tracking-wide font-medium">
                                                {dateDisplay.subtitle}
                                            </p>
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
