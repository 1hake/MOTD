import React from 'react'

import Button from '../Button'

export const NumberInput = ({ value, onChange }) => {
  const handleDecrement = () => {
    if (value === 0) {
      return
    }
    onChange(value - 1)
  }

  const handleIncrement = () => {
    onChange(value + 1)
  }

  return (
    <div className="w-32 py-2 px-3 bg-white border-2 border-black rounded-lg shadow-sm dark:bg-slate-800 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <Button onClick={handleDecrement} disabled={value === 0} size="small" color="light">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        <input
          className="text-center w-full mx-2 text-lg leading-none bg-transparent outline-none border-none text-gray-800 dark:text-white"
          type="text"
          value={value}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value, 10) || 1))} // Prevent non-numeric values and negative values
        />
        <Button onClick={handleIncrement} size="small" color="light">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
