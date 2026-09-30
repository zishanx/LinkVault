import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from "@gsap/react"
import heroVid from '../assets/heroVid.mp4';
import { useRef } from "react"


gsap.registerPlugin(ScrollTrigger);





export default function Home() {

    const videoRef = useRef(null)

    const handleVideoEnd = () => {
        videoRef.current.currentTime = 2.5;
        videoRef.current.play()
    }

    const handleMouseEnter = () => {
        videoRef.current.pause()
    }

    const handleMouseLeave = () => {
        videoRef.current.play()
    }
    useGSAP(() => {

        const tl = gsap.timeline();

        tl.from("#nav-bar", {
            y: -80,
            duration: 0.6,
            ease: "power3.out"
        })

            .from("#badge", {
                y: 20,
                opacity: 0,
                duration: 0.5,
                ease: "power2.out"
            }, "-=0.2")

            .from(".hero-line", {
                yPercent: 110,
                duration: 0.8,
                stagger: 0.12,
                ease: "power3.out"
            }, "-=0.2")

            .from(["#hero-subheading", "#hero-btn"], {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.3");


        gsap.to("#nav-bar", {
            borderBottomColor: "#9CA6A5",
            duration: 0.3,
            scrollTrigger: {
                trigger: document.body,
                start: "top -10",
                toggleActions: "play reverse play reverse"
            }
        });

    }, []);

    return (
        <>
            <div id="nav-bar" className="flex justify-between items-center p-2 backdrop-blur bg-background/70  border-b border-transparent sticky top-0 z-50 h-16 px-4 md:px-20">
                <h1 className="text-xl font-bold font-heading text-primary text-center">LinkVault</h1>
                <div className="flex gap-4 font-heading">
                    <button className="px-4 py-2 rounded-xl font-bold hover:bg-primary-hover hover:text-white border-primary border-2 ">Log in</button>
                    <button className="px-4 py-2  rounded-xl font-bold hover:bg-primary-hover text-white bg-primary">Get Started</button>
                </div>
            </div>

            <div id="hero" className='h-[80vh] flex justify-between items-center p-4 flex-col md:flex-row'>
                <div className='md:px-20 px-2  flex flex-col gap-4 md:w-1/2'>
                    <span id='badge' className='bg-mint text-primary rounded-full px-4 py-1.5 text-sm font-bold font-body w-max'> ✦ Free forever</span>
                    <h1 id="hero-heading" className="text-5xl md:text-7xl font-heading">

                        <span className="block overflow-hidden">
                            <span className="block hero-line">
                                All your links.
                            </span>
                        </span>

                        <span className="block overflow-hidden">
                            <span className="block hero-line text-primary">
                                One calm place
                            </span>
                        </span>

                    </h1>
                    <p id='hero-subheading' className='text-muted font-body text-lg max-w-md'>Share one link, track every click, know where they came from.</p>
                    <div id='hero-btn' className='flex gap-4'>
                        <button className='bg-primary px-4 py-2 rounded-xl text-white font-bold'>Start for free</button>
                        <button className='px-4 py-2 rounded-xl border-2 font-bold'>See pricing</button>
                    </div>
                </div>
                <div className='flex items-center justify-center md:w-1/2'>
                    <video src={heroVid} ref={videoRef} autoPlay muted playsInline onEnded={handleVideoEnd} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="w-[80%] h-full  p-2"></video>
                </div>

                {/* //blob */}

    
            </div>

        </>
    )
}