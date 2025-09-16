import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface FollowButtonProps {
    currentUserId: number;
    targetUserId: number;
    onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ currentUserId, targetUserId, onFollowChange }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(false);
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
        }
    };

    if (checking) {
        return (
            <div className="relative min-w-[120px] h-11">
                <div className="w-full h-full bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl animate-pulse backdrop-blur-sm border border-gray-600/30 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-400/50 border-t-gray-300 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={handleFollow}
            className={`
                relative px-6 py-3 rounded-xl font-semibold text-sm
                transition-all duration-300 ease-out
                min-w-[120px] h-11
                transform hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
                flex items-center justify-center gap-2
                ${isFollowing
                    ? `
                        bg-gradient-to-r from-emerald-500 to-teal-500
                        hover:from-emerald-400 hover:to-teal-400
                        text-white shadow-emerald-500/25 hover:shadow-emerald-500/40
                    `
                    : `
                        bg-gradient-to-r from-indigo-600 to-purple-600
                        hover:from-indigo-500 hover:to-purple-500
                        text-white shadow-indigo-500/25 hover:shadow-indigo-500/40
                    `
                }
            `}
        >
            {isFollowing ? (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Suivi
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11v6m-3-3h6" />
                    </svg>
                    Suivre
                </>
            )}

            {/* Beautiful glow effect */}
            <div className={`
                absolute inset-0 rounded-xl opacity-20 blur-sm -z-10 
                transition-opacity duration-300
                ${isFollowing
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:opacity-30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:opacity-30'
                }
            `}></div>
        </button>
    );
}
