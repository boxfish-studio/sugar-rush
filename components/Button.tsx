import { Spinner } from 'components'
import React, { FC } from 'react'

const Button: FC<{
    text: string
    isLoading?: boolean
    disabled?: boolean
    secondary?: boolean
    danger?: boolean
    type?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>['type']
    onClick?: () => void
}> = ({ text, isLoading = false, disabled = false, secondary = false, danger = false, type = 'button', onClick }) => {
    return (
        <button
            className={`flex items-center justify-center px-4 py-2 text-black border-gray-500 border-2
                transition-all duration-300 ease-linear
                rounded-xl group  ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={disabled || isLoading}
            onClick={onClick}
            type={type}
        >
            {isLoading && (
                <div className='mr-3'>
                    <Spinner />
                </div>
            )}
            {text}
        </button>
    )
}

export default Button
