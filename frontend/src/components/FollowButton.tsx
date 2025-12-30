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
            <div className="min-w-[120px] h-11 bg-white border-3 border-black rounded-xl shadow-neo-sm animate-pulse flex items-center justify-center">
                <div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <button
            onClick={handleFollow}
            className={`
                px-5 py-2 rounded-xl font-black text-sm
                transition-all duration-200
                min-w-[120px] h-11
                border-3 border-black
                flex items-center justify-center gap-2
                ${isFollowing
                    ? 'bg-pop-mint shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'
                    : 'bg-pop-pink shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo'
                }
            `}
        >
            {isFollowing ? (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Suivi
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    Suivre
                </>
            )}
        </button>
    );
}
