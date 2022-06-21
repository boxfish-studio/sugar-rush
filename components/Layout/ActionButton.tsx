import React, { FC } from 'react'

const ActionButton: FC<{
    text: string
    isLoading?: boolean
    type?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>['type']
    onClick?: () => void
}> = ({ text, isLoading = false, type = 'button', onClick }) => {
    return (
        <button
            className={`flex items-center justify-center px-4 py-2 mx-auto mt-4 text-white
      transition-all duration-300 ease-linear bg-[hsl(258,52%,56%)] shadow-lg cursor-pointer hover:bg-[hsl(258,52%,65%)]
       rounded-xl group  ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={isLoading}
            onClick={onClick}
            type={type}
        >
            {isLoading && (
                <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                >
                    <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                    ></circle>
                    <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                </svg>
            )}
            {text}
        </button>
    )
}

export default ActionButton
