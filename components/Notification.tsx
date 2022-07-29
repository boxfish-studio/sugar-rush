import { Flash } from '@primer/react'
import { INotification } from 'lib/interfaces'
import { StyledOcticon } from '@primer/react'
import { XCircleIcon } from '@primer/octicons-react'

const Notification = (props: INotification) => {
    const { type, message, icon } = props
    return (
        <div className='notification'>
            <Flash variant={type}>
                <div className='d-flex flex-justify-between'>
                    <div className='mr-3 d-flex width-full flex-items-center'>
                        <StyledOcticon icon={icon} />
                        <div className='f4 wb-break-word'>{message}</div>
                    </div>
                </div>
            </Flash>
        </div>
    )
}
export default Notification
