import { FC, useState } from 'react'
import { ICarousel } from 'lib/interfaces'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, EffectCoverflow, Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const Carousel: FC<{
    carouselData: ICarousel[]
    onClick?: (e: any) => void
    slideChange?: () => void
}> = ({ carouselData, onClick, slideChange }) => {
    return (
        <>
            {carouselData.length !== 0 && (
                <>
                    <Swiper
                        pagination={{
                            type: 'fraction',
                        }}
                        effect={'coverflow'}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={'auto'}
                        coverflowEffect={{
                            rotate: 50,
                            stretch: 0,
                            depth: 100,
                            modifier: 1,
                            slideShadows: true,
                        }}
                        navigation={true}
                        modules={[EffectCoverflow, Pagination, Navigation]}
                        onSlideChange={() => {
                            slideChange && slideChange()
                        }}
                    >
                        {carouselData &&
                            carouselData.map((data, i) => (
                                <SwiperSlide key={i} onClick={onClick}>
                                    <h1 className='text-grey-daylight'>{data.title}</h1>
                                    <Image src={data.image} alt={data.title} width={250} height={250} />
                                </SwiperSlide>
                            ))}
                    </Swiper>
                </>
            )}
        </>
    )
}

export default Carousel
