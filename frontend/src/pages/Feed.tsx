import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken, getUserIdFromToken } from '../lib/storage';
import { useNavigate } from 'react-router-dom';
import { initPushSafe } from '../push';
import EmptyFeedCTA from '../components/EmptyFeedCTA';
import PostsSection from '../components/PostsSection';
import EmptyFriendsState from '../components/EmptyFriendsState';
import LoadingState from '../components/LoadingState';

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

                // Fetch user's own posts for today
                const myPostsRes = await api.get(`/posts/me?userId=${userId}`);
                const allMyPosts = myPostsRes.data;

                // Filter to get only today's posts
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayMyPosts = allMyPosts.filter((post: Post) => {
                    const postDate = new Date(post.date);
                    postDate.setHours(0, 0, 0, 0);
                    return postDate.getTime() === today.getTime();
                });

                // Fetch friends' posts specifically
                const friendsPostsRes = await api.get(`/friends/posts?userId=${userId}`);
                const friendsPostsData = friendsPostsRes.data;

                setMyPosts(todayMyPosts);
                setFriendsPosts(friendsPostsData);
                setAllPosts([...todayMyPosts, ...friendsPostsData]);

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
        return <LoadingState message="Chargement du feed..." />;
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800">Feed du jour</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                {/* Empty feed CTA */}
                <EmptyFeedCTA show={myPosts.length === 0} />

                {/* My posts today */}
                {myPosts.length > 0 && (
                    <PostsSection
                        title="Ma chanson du jour"
                        posts={myPosts}
                        variant="purple"
                        gradientFrom="from-purple-500"
                        gradientTo="to-pink-500"
                    />
                )}

                {/* Friends' posts */}
                <PostsSection
                    title="Musiques de mes amis"
                    posts={friendsPosts}
                    variant="blue"
                    gradientFrom="from-blue-500"
                    gradientTo="to-indigo-500"
                    showCount={true}
                    emptyMessage={<EmptyFriendsState />}
                />

                {/* Floating Action Button */}

            </div>
        </div>
    );
}
