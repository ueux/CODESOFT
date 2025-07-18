'use client'
import { MoveRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Hero = () => {
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    return (
        <section className="relative bg-[#115061] h-[85vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#115061] to-transparent z-10" />

            <div className="container h-full mx-auto px-4 md:px-6 flex items-center relative z-20">
                <div className="grid md:grid-cols-2 gap-8 items-center w-full">
                    {/* Text Content */}
                    <div className={`space-y-4 transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <p className="font-Roboto font-normal text-white/80 pb-2 text-xl md:text-2xl animate-fade-in">
                            Starting from <span className="font-bold text-white">$40</span>
                        </p>

                        <h1 className="text-white text-4xl md:text-6xl font-extrabold font-Roboto leading-tight">
                            <span className="inline-block animate-slide-up delay-100">The best watch</span>
                            <br />
                            <span className="inline-block animate-slide-up delay-200">Collection 2025</span>
                        </h1>

                        <p className="font-Oregano text-2xl md:text-3xl pt-4 text-white animate-fade-in delay-300">
                            Exclusive offer <span className="text-yellow-400 font-bold">10%</span> this week
                        </p>

                        <button
                            onClick={() => router.push("/products")}
                            className="group relative w-40 h-12 flex items-center justify-center gap-2 font-semibold text-[#115061] hover:text-white bg-white hover:bg-transparent border-2 border-white rounded-full transition-all duration-300 overflow-hidden mt-6 animate-fade-in delay-500"
                            aria-label="Shop Now"
                        >
                            <span className="relative z-10">Shop Now</span>
                            <MoveRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                            <span className="absolute inset-0 bg-[#115061] w-0 group-hover:w-full transition-all duration-300"></span>
                        </button>
                    </div>

                    {/* Image */}
                    <div className={`relative h-full w-full transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <Image
                            src="https://ik.imagekit.io/Ueux/products/azuredragonscape.png"
                            alt="Premium watch collection 2025"
                            width={600}
                            height={600}
                            className="object-contain w-full h-auto animate-float"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Animated background elements */}
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/10 to-transparent z-10" />
        </section>
    )
}

export default Hero