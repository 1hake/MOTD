import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import { initPushSafe } from '../push';
import SongCard from '../components/SongCard';

type Post = {
    id: number;
    title: string;
    artist: string;
    link: string;
    coverUrl?: string;
    date: string;
    user?: {
        id: number;
        email: string;
    };
};

export default function Feed() {
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [friendsPosts, setFriendsPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                if (!token) return navigate('/');

                const userId = getUserIdFromToken(token);
                if (!userId) {
                    console.error('Could not get user ID from token');
                    return navigate('/');
                }

                // Fetch all today's posts (including user's own posts)
                const allPostsRes = await api.get(`/posts/today?userId=${userId}`);
                const allPostsData = allPostsRes.data;

                // Fetch friends' posts specifically
                const friendsPostsRes = await api.get(`/friends/posts?userId=${userId}`);
                const friendsPostsData = friendsPostsRes.data;

                // Separate my posts from friends' posts
                const myPostsData = allPostsData.filter((post: Post) => !post.user || post.user.id === userId);

                setAllPosts(allPostsData);
                setMyPosts(myPostsData);
                setFriendsPosts(friendsPostsData);

                // Initialize push listeners safely (no-op on web)
                initPushSafe().catch(() => { });
            } catch (error) {
                console.error('Error fetching feed data:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    if (loading) {
        return (
            <div className="p-4 flex justify-center items-center min-h-screen">
                <div className="text-lg">Chargement du feed...</div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Sticky CTA when user hasn't posted yet */}
            {myPosts.length === 0 && (
                <div className="sticky top-16 z-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white bg-opacity-20 rounded-full p-3">
                                <span className="text-2xl">🎵</span>
                            </div>
                            <div className="text-white">
                                <h3 className="text-lg font-semibold">Vous n'avez pas encore partagé votre chanson du jour !</h3>
                                <p className="text-sm text-green-100">Partagez votre musique préférée avec vos amis.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/post')}
                            className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
                        >
                            ➕ Poster ma chanson
                        </button>
                    </div>
                </div>
            )}

            {/* My posts today */}
            {myPosts.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-purple-600">Ma chanson du jour</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myPosts.map((post) => (
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
            )}

            {/* Friends' posts */}
            <div>
                <h2 className="text-lg font-semibold mb-4 text-blue-600">
                    Musiques de mes amis
                    {friendsPosts.length > 0 && <span className="text-sm text-gray-500 ml-2">({friendsPosts.length})</span>}
                </h2>

                {friendsPosts.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow">
                        <div className="text-6xl mb-4">👥</div>
                        <p className="text-lg mb-2">Vos amis n'ont pas encore partagé de musique aujourd'hui</p>
                        <button
                            onClick={() => navigate('/friends')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Gérer mes amis
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {friendsPosts.map((post) => (
                            <SongCard
                                key={post.id}
                                id={post.id}
                                title={post.title}
                                artist={post.artist}
                                link={post.link}
                                coverUrl={post.coverUrl}
                                sharedBy={post.user?.email}
                                variant="blue"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Quick actions at the bottom */}
            <div className="fixed bottom-20 right-4 flex flex-col gap-2">
                <button
                    onClick={() => navigate('/post')}
                    className="bg-green-600 text-white w-12 h-12 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center text-xl"
                    title="Poster une chanson"
                >
                    ➕
                </button>
            </div>
        </div>
    );
}
