import React from 'react'
import { SearchHistoryItem, SearchHistoryService } from '../lib/searchHistory'

interface SearchHistoryProps {
    onSelectQuery: (query: string) => void
    onClose: () => void
    className?: string
}

export default function SearchHistory({ onSelectQuery, onClose, className = '' }: SearchHistoryProps) {
    const [history, setHistory] = React.useState<SearchHistoryItem[]>([])

    React.useEffect(() => {
        setHistory(SearchHistoryService.getHistory())
    }, [])

    const handleSelectQuery = (query: string) => {
        onSelectQuery(query)
        onClose()
    }

    const handleDeleteItem = (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation()
        SearchHistoryService.removeFromHistory(itemId)
        setHistory(SearchHistoryService.getHistory())
    }

    const handleClearAll = () => {
        SearchHistoryService.clearHistory()
        setHistory([])
    }

    if (history.length === 0) {
        return (
            <div className={`bg-white/95 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl ${className}`}>
                <div className="p-4">
                    <div className="text-center py-8">
                        <p className="text-primary-500 text-sm">Aucun historique de recherche</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`bg-white/95 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl ${className}`}>
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-primary-600">Recherches récentes</h2>
                    <button
                        onClick={handleClearAll}
                        className="text-xs text-primary-500 hover:text-primary-700 transition-colors"
                    >
                        Tout effacer
                    </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 p-2 hover:bg-primary-50 rounded-lg transition-all duration-200 cursor-pointer group"
                            onClick={() => handleSelectQuery(item.query)}
                        >
                            <div className="flex items-center justify-center w-6 h-6 text-primary-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-primary-700 text-sm truncate">{item.query}</p>
                            </div>
                            <button
                                onClick={(e) => handleDeleteItem(e, item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-md transition-all duration-200"
                                title="Supprimer"
                            >
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}