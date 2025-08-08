import React from 'react';

interface SelectedTrackPreviewProps {
    track: {
        title: string;
        artist: string;
        cover?: string | null;
    };
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    error: string | null;
}

const SelectedTrackPreview: React.FC<SelectedTrackPreviewProps> = ({
    track,
    onCancel,
    onSubmit,
    isSubmitting,
    error
}) => {
    return (
        <div className="fixed bottom-16 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 shadow-2xl z-[60]">
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Selected track preview */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 overflow-hidden flex-shrink-0 border-2 border-emerald-200/50">
                            {track.cover ? (
                                <img
                                    src={track.cover}
                                    alt={`${track.title} cover`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-emerald-600 text-xl">
                                    🎵
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-800 truncate text-lg" title={track.title}>
                                {track.title}
                            </div>
                            <div className="text-gray-600 truncate" title={track.artist}>
                                {track.artist}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={isSubmitting || !!error}
                            className={`px-8 py-3 rounded-2xl font-bold transition-all duration-200 ${error
                                ? 'bg-red-100 text-red-600 cursor-not-allowed border-2 border-red-200'
                                : isSubmitting
                                    ? 'bg-emerald-400 text-white cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 hover:shadow-xl transform hover:scale-105 active:scale-95'
                                } shadow-lg`}
                        >
                            {error
                                ? error
                                : isSubmitting
                                    ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Publication...
                                        </span>
                                    )
                                    : (
                                        <span className="flex items-center gap-2">
                                            ✨ <span>Publier</span>
                                        </span>
                                    )
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectedTrackPreview;
