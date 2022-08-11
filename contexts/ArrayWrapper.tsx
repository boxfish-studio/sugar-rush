import { FC, ReactNode, useState, createContext, useEffect } from 'react'

type FilterArray = [Array<any>, boolean]

export const FilterArrayContext = createContext<FilterArray>([[], false])

enum State {
    ShowAll = 'Show All',
    ShowLess = 'Show Less',
}

export const ArrayWrapper: FC<{ array: Array<any>; children: ReactNode; minimum: number }> = ({
    array: originalArray,
    children,
    minimum,
}) => {
    const [showAll, setShowAll] = useState(false)
    const [filteredArray, setFilteredArray] = useState([...originalArray])

    useEffect(() => {
        if (showAll) {
            setFilteredArray(originalArray)
        } else {
            setFilteredArray(originalArray.slice(0, minimum))
        }
    }, [showAll, originalArray, minimum])

    return (
        <FilterArrayContext.Provider value={[filteredArray, showAll]}>
            <div className='d-flex flex-column flex-items-start'>
                {originalArray.length > minimum && (
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
    )
}
