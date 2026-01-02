import React from 'react'
import AutoSavePlatformSelector from './AutoSavePlatformSelector'

interface PlatformSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (platformId: string) => void
}

export default function PlatformSelectionModal({
  isOpen,
  onClose,
  onSelect
}: PlatformSelectionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white border-4 border-black shadow-neo-lg rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white border-3 border-black rounded-xl hover:bg-pop-pink transition-colors z-10 shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <div className="mb-6 text-center">
            <div className="inline-block px-4 py-1.5 bg-pop-yellow border-3 border-black rounded-full text-xs font-black uppercase italic mb-4 shadow-neo-sm transform -rotate-2">
              Configuration requise
            </div>
            <h2 className="text-3xl font-black text-black uppercase italic leading-tight">
              Choisis ta plateforme
            </h2>
            <p className="text-black/60 font-bold mt-2 text-sm uppercase">
              Pour ouvrir tes musiques directement dans ton app préférée
            </p>
          </div>

          <div className="mt-8">
            <AutoSavePlatformSelector
              showClearOption={false}
              onPlatformChange={(id) => {
                onSelect(id)
                // On laisse un petit délai pour que l'utilisateur voie le glitch avant de fermer
                setTimeout(onClose, 400)
              }}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-black text-black/40 uppercase italic">
              Tu pourras modifier ce choix plus tard dans ton profil
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}

