import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface FollowButtonProps {
    currentUserId: number;
    targetUserId: number;
    onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ currentUserId, targetUserId, onFollowChange }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkFriendshipStatus();
    }, [currentUserId, targetUserId]);

    const checkFriendshipStatus = async () => {
        try {
            setChecking(true);
            const response = await api.get(`/friends/status?userId=${currentUserId}&friendId=${targetUserId}`);
            setIsFollowing(response.data.isFriend);
        } catch (error) {
            console.error('Error checking friendship status:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleFollow = async () => {
        setLoading(true);
        try {
            if (isFollowing) {
                // Unfollow
                await api.delete('/friends', {
                    data: {
                        userId: currentUserId,
                        friendId: targetUserId
                    }
                });
                setIsFollowing(false);
                onFollowChange?.(false);
            } else {
                // Follow
                await api.post('/friends', {
                    userId: currentUserId,
                    friendId: targetUserId
                });
                setIsFollowing(true);
                onFollowChange?.(true);
            }
        } catch (error) {
            console.error('Error updating friendship:', error);
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="relative">
                <div className="w-32 h-11 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl animate-pulse backdrop-blur-sm border border-gray-600/30">
                    <div className="flex items-center justify-center h-full">
                        <div className="w-4 h-4 border-2 border-gray-400/50 border-t-gray-300 rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`
                relative px-6 py-3 rounded-xl font-semibold text-sm
                transition-all duration-300 ease-out
                flex items-center justify-center gap-2.5 min-w-[120px]
                transform hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
                backdrop-blur-sm
                ${isFollowing
                    ? `
                        bg-gradient-to-r from-emerald-500/20 to-teal-500/20
                        hover:from-red-500/20 hover:to-pink-500/20
                        text-emerald-300 hover:text-red-300
                        border border-emerald-400/40 hover:border-red-400/50
                        group
                    `
                    : `
                        bg-gradient-to-r from-indigo-600 to-purple-600
                        hover:from-indigo-500 hover:to-purple-500
                        text-white
                        border border-indigo-500/50 hover:border-indigo-400
                        shadow-indigo-500/25 hover:shadow-indigo-500/40
                    `
                }
                ${loading ? 'opacity-75 cursor-not-allowed transform-none' : 'cursor-pointer'}
            `}
        >
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span className="opacity-75">
                        {isFollowing ? 'Arrêt...' : 'Suivi...'}
                    </span>
                </>
            ) : isFollowing ? (
                <>
                    {/* Following state - show checkmark, change to X on hover */}
                    <div className="relative w-4 h-4">
                        <svg
                            className="absolute inset-0 w-4 h-4 transition-all duration-200 group-hover:opacity-0 group-hover:scale-75"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <svg
                            className="absolute inset-0 w-4 h-4 transition-all duration-200 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <span className="relative">
                        <span className="group-hover:opacity-0 transition-opacity duration-200">Suivi</span>
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Ne plus suivre
                        </span>
                    </span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11v6m-3-3h6" />
                    </svg>
                    <span>Suivre</span>
                </>
            )}

            {/* Subtle glow effect for follow state */}
            {!isFollowing && !loading && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur-sm -z-10 group-hover:opacity-30 transition-opacity duration-300"></div>
            )}
        </button>
    );
}
