import { FC } from 'react'

const Title: FC<{ text: string }> = ({ text }) => {
    return <h1>{text}</h1>
}

export default Title
