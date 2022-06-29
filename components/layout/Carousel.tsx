import Swiper, { Navigation } from 'swiper'
import { FC } from 'react'
import { ICarousel } from 'lib/interfaces'
import Image from 'next/image'

const Carousel: FC<{
    carouselData: ICarousel[]
}> = ({ carouselData }) => {
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
                <div className='carousel overflow-hidden md:flex md:justify-between'>
                    <div className='swiper-wrapper'>
                        {carouselData &&
                            carouselData.map((data, i) => (
                                <div className='swiper-slide flex flex-col' key={i}>
                                    <div className='inline-block'>
                                        <h1 className='text-grey-daylight'>{data.title}</h1>
                                        <Image src={data.image} alt={data.title} width={250} height={250} />
                                    </div>
                                    <span>
                                        {i + 1}/{carouselData.length}
                                    </span>
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
