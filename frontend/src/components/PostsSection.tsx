import React from 'react';
import SongCard from './SongCard';

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
    likeCount?: number;
    isLikedByUser?: boolean;
    user?: {
        id: number;
        email: string;
    };
};

interface PostsSectionProps {
    title: string;
    posts: Post[];
    showCount?: boolean;
    emptyMessage?: React.ReactNode;
    onLikeChange?: (postId: number, isLiked: boolean, newLikeCount: number) => void;
}

const PostsSection: React.FC<PostsSectionProps> = ({
    title,
    posts,
    showCount = false,
    emptyMessage,
    onLikeChange
}) => {
    return (
        <div className="space-y-6 animate-in">
            <div className="flex items-start gap-3">
                <div className="h-8 w-1 bg-white from-music-500 to-accent-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-white">
                    {title}
                    {showCount && posts.length > 0 && (
                        <span className="ml-2 bg-music-100/70 text-music-700 text-sm font-medium px-3 py-1 rounded-2xl backdrop-blur-sm">
                            {posts.length}
                        </span>
                    )}
                </h2>
            </div>

            {posts.length === 0 ? (
                emptyMessage || (
                    <p className="text-primary-500 text-center py-8 italic">Aucune chanson pour le moment.</p>
                )
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
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
                            sharedBy={post.user?.email}
                            likeCount={post.likeCount}
                            isLikedByUser={post.isLikedByUser}
                            showLikes={!!post.user?.email} // Only show likes for shared posts
                            onLikeChange={onLikeChange}
                            className="animate-up"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostsSection;
