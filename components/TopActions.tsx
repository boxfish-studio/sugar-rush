import { FC } from 'react'

const TopActions: FC<{ children: any }> = ({ children }) => {
    return <div className='d-flex flex-justify-end column-gap-1 flex-row flex-md-row'>{children}</div>
}

export default TopActions
