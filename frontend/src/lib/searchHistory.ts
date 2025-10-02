export interface SearchHistoryItem {
    id: string
    query: string
    timestamp: number
}

const SEARCH_HISTORY_KEY = 'motd_search_history'
const MAX_HISTORY_ITEMS = 10

export class SearchHistoryService {
    private static getStoredHistory(): SearchHistoryItem[] {
        try {
            const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
            return stored ? JSON.parse(stored) : []
        } catch (error) {
            console.error('Error reading search history:', error)
            return []
        }
    }

    private static saveHistory(history: SearchHistoryItem[]): void {
        try {
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
        } catch (error) {
            console.error('Error saving search history:', error)
        }
    }

    static addToHistory(query: string): void {
        if (!query.trim()) return

        const history = this.getStoredHistory()
        const existingIndex = history.findIndex(item => item.query.toLowerCase() === query.toLowerCase())

        // Remove existing entry if found
        if (existingIndex !== -1) {
            history.splice(existingIndex, 1)
        }

        // Add new entry at the beginning
        const newItem: SearchHistoryItem = {
            id: `${Date.now()}-${Math.random()}`,
            query: query.trim(),
            timestamp: Date.now()
        }

        history.unshift(newItem)

        // Keep only the latest MAX_HISTORY_ITEMS
        if (history.length > MAX_HISTORY_ITEMS) {
            history.splice(MAX_HISTORY_ITEMS)
        }

        this.saveHistory(history)
    }

    static getHistory(): SearchHistoryItem[] {
        return this.getStoredHistory()
    }

    static removeFromHistory(itemId: string): void {
        const history = this.getStoredHistory()
        const filteredHistory = history.filter(item => item.id !== itemId)
        this.saveHistory(filteredHistory)
    }

    static clearHistory(): void {
        try {
            localStorage.removeItem(SEARCH_HISTORY_KEY)
        } catch (error) {
            console.error('Error clearing search history:', error)
        }
    }
}