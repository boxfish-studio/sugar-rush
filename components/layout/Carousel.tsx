import Swiper, { Navigation } from 'swiper'
import { FC } from 'react'
import { Token } from 'lib/candy-machine/view/interfaces'

const Carousel: FC<{
    tokens: Token[]
}> = ({ tokens }) => {
    Swiper.use([Navigation])
    new Swiper('.carousel', {
        slidesPerView: 1,
        spaceBetween: 100,
        loop: false,
        updateOnWindowResize: true,
        // noSwiping: false,
        allowSlideNext: true,
        allowSlidePrev: true,
        observer: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    })

    return (
        <>
            <link rel='stylesheet' href='https://unpkg.com/swiper/swiper-bundle.min.css' />
            <div className='container py-0 w-96 relative'>
                <div className='carousel overflow-hidden md:flex md:justify-between m-5'>
                    <div className='swiper-wrapper'>
                        {tokens &&
                            tokens.map((token, i) => (
                                <div className='swiper-slide' key={i}>
                                    <div className='inline-block'>
                                        <img src={token.imageLink} alt={token.name} width='250' height='250'></img>
                                    </div>
                                    <div className='flex flex-col gap-y-10 pt-5'>
                                        <h2 className='text-grey-daylight'>Name: {token.name}</h2>
                                        <span>Description: {token.description}</span>
                                        <span>Collection: {token.collection.toString()}</span>
                                        <span>Symbol: {token.symbol}</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
                <button className='swiper-button-prev inset-y-0 left-0' />
                <button className='swiper-button-next inset-y-0 right-0' />
            </div>
        </>
    )
}

export default Carousel
