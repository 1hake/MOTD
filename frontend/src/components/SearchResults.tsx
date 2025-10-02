import React from 'react'
import UserSearchCard from './UserSearchCard'

type User = {
    id: number
    email: string
    name?: string
    platformPreference?: string
}

interface SearchResultsProps {
    searchQuery: string
    searchResults: User[]
    isSearching: boolean
    currentUserId?: number
    onUserSelect?: (user: User) => void
}

export default function SearchResults({
    searchQuery,
    searchResults,
    isSearching,
    currentUserId,
    onUserSelect
}: SearchResultsProps) {
    if (!searchQuery) {
        return null
    }

    return (
        <div className="fixed top-20 left-8 right-8 z-40 flex justify-center">
            <div className="mt-4 bg-white/95 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-sm font-medium text-primary-600 mb-3">
                        Résultats pour "{searchQuery}"
                    </h2>

                    {isSearching ? (
                        <div className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-primary-500 text-sm">Recherche en cours...</span>
                            </div>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-primary-500 text-sm">Aucun utilisateur trouvé</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {searchResults.map((user) => (
                                <UserSearchCard
                                    key={user.id}
                                    user={user}
                                    currentUserId={currentUserId}
                                    onClick={() => onUserSelect?.(user)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}