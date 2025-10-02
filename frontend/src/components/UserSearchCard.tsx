import React from 'react'
import { useNavigate } from 'react-router-dom'
import FollowButton from './FollowButton'

type User = {
    id: number
    email: string
    name?: string
    platformPreference?: string
}

interface UserSearchCardProps {
    user: User
    currentUserId?: number
    onClick?: () => void
}

export default function UserSearchCard({ user, currentUserId, onClick }: UserSearchCardProps) {
    const navigate = useNavigate()

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else {
            navigate(`/profile/${user.id}`)
        }
    }

    return (
        <div
            className="flex items-center gap-3 p-3 hover:bg-primary-50 rounded-lg transition-all duration-200 cursor-pointer"
            onClick={handleClick}
        >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-primary-700 text-sm leading-tight">
                    {user.name || user.email.split('@')[0]}
                </h3>
                <p className="text-primary-500 text-xs">@{user.email.split('@')[0]}</p>
            </div>
            <div className="flex gap-2">
                {currentUserId && user.id !== currentUserId && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <FollowButton currentUserId={currentUserId} targetUserId={user.id} />
                    </div>
                )}
            </div>
        </div>
    )
}