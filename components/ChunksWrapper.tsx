import { FC, ReactNode, useEffect, useState } from 'react'

const MINIMUM_NFTS_TO_SHOW = 6

import { createContext } from 'react'

type FilterArray = [Array<any>, boolean]

export const FilterArrayContext = createContext<FilterArray>([[], false])

export const FilterWrapper: FC<{ arr: Array<any>; children: ReactNode }> = ({ arr, children }) => {
    const [showAll, setShowAll] = useState(false)

    return (
        <>
            <FilterArrayContext.Provider value={[arr, showAll]}>
                <div className='d-flex flex-column flex-items-start'>
                    {arr.length > MINIMUM_NFTS_TO_SHOW && (
                        <button
                            onClick={() => setShowAll((prev) => !prev)}
                            className='border-0 color-bg-transparent color-fg-accent underline mb-2'
                        >
                            {showAll ? 'See less' : 'See all'}
                        </button>
                    )}
                    {children}
                </div>
            </FilterArrayContext.Provider>
        </>
    )
}
