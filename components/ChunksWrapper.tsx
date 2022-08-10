import { FC, ReactNode, useState, createContext } from 'react'
import { MINIMUM_NFTS_TO_SHOW } from 'lib/constants'

type FilterArray = [Array<any>, boolean]

export const FilterArrayContext = createContext<FilterArray>([[], false])

enum State {
    ShowAll = 'Show All',
    ShowLess = 'Show Less',
}

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
                            {showAll ? State.ShowLess : State.ShowAll}
                        </button>
                    )}
                    {children}
                </div>
            </FilterArrayContext.Provider>
        </>
    )
}
