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
    user?: {
        id: number;
        email: string;
    };
};

interface PostsSectionProps {
    title: string;
    posts: Post[];
    variant: 'purple' | 'blue';
    gradientFrom: string;
    gradientTo: string;
    showCount?: boolean;
    emptyMessage?: React.ReactNode;
}

const PostsSection: React.FC<PostsSectionProps> = ({
    title,
    posts,
    variant,
    gradientFrom,
    gradientTo,
    showCount = false,
    emptyMessage
}) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className={`h-8 w-1 bg-gradient-to-b ${gradientFrom} ${gradientTo} rounded-full`}></div>
                <h2 className={`text-xl font-bold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
                    {title}
                    {showCount && posts.length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {posts.length}
                        </span>
                    )}
                </h2>
            </div>

            {posts.length === 0 && emptyMessage ? (
                emptyMessage
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
                            variant={variant}
                            className="transform hover:scale-105 transition-all duration-300"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostsSection;
