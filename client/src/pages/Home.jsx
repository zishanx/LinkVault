import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from "@gsap/react"
import heroVid from '../assets/heroVid.mp4';
import unlimited from '../assets/unlimited.png'
import theme from '../assets/theme.png'
import analytics from '../assets/analytics.png'

import { useRef } from "react"
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

const freeFeatures = [
    "Up to 5 links",
    "Public profile page",
    "Simple link dashboard",
]

gsap.registerPlugin(ScrollTrigger);





export default function Home() {

    const videoRef = useRef(null)

    const handleVideoEnd = () => {
        videoRef.current.currentTime = 2.5;
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

        const cards = gsap.utils.toArray(".feature-card")

        const cardT1 = gsap.timeline({
            scrollTrigger: {
                trigger: ".features",
                start: "top 50%",
                toggleActions: "play none none reverse"
            }
        })

        cardT1
            .from(cards[1], {
                opacity: 0,
                scale: 0.8,
                duration: 0.5,
                ease: "power3.out"
            })
            .from(cards[0], {
                x: 250,
                opacity: 0,
                duration: 0.7,
                ease: "power3.out"
            }, "-=0.2")
            .from(cards[2], {
                x: -250,
                opacity: 0,
                duration: 0.7,
                ease: "power3.out"
            }, "-=0.5");

    }, []);

    return (
        <div className='flex flex-col gap-5'>
            <div id="nav-bar" className="flex justify-between items-center p-2 backdrop-blur bg-background/70  border-b border-transparent sticky top-0 z-50 h-16 px-4 md:px-20">
                <h1 className="text-xl font-bold font-heading text-primary text-center">LinkVault</h1>
                <div className="flex gap-4 font-heading">
                    <Link to="/login"><button className="px-4 py-2 rounded-xl font-bold hover:bg-primary-hover hover:text-white border-primary border-2 ">Log in</button></Link>
                    <Link to="/register"><button className="px-4 py-2  rounded-xl font-bold hover:bg-primary-hover text-white bg-primary">Get Started</button></Link>
                </div>
            </div>

            <div id="hero" className='h-[80vh] flex justify-between items-center p-4 flex-col md:flex-row mb-10 md:mb-20'>
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
                        <Link to="/login"><button className='bg-primary px-4 py-2 rounded-xl text-white font-bold hover:bg-primary-hover'>Start for free</button></Link>
                        <button className='px-4 py-2 rounded-xl border-2 font-bold hover:bg-primary-hover hover:text-white'>See pricing</button>
                    </div>
                </div>
                <div className='flex items-center justify-center md:w-1/2'>
                    <video src={heroVid} ref={videoRef} autoPlay muted playsInline onEnded={handleVideoEnd} className="w-[80%] h-full  p-2"></video>
                </div>


            </div>

            <div className="features px-4 md:px-10 lg:px-20 mb-10 md:mb-20">
                <h2 className='font-bold text-3xl text-center text-primary mb-20'>Features</h2>

                <h3 className='text-3xl md:text-4xl font-heading w-4/5 md:w-1/2 mb-5'>

                    <span className='block'>Everything your links need:</span>
                    <span className='block text-primary'>all in one <span className='text-black'>vault.</span></span></h3>
                <p className='text-muted font-body text-lg max-w-md'>Organize your links, understand your audience, and make your page look like you, all from one calm dashboard.</p>

                <div className="flex flex-col md:flex-row gap-8 md:gap-20 p-4 md:p-20">


                    <div className="feature-card rounded-2xl bg-mint shadow-[0_10px_30px_rgba(79,184,166,0.15)] border-mint-deep  p-10 text-center flex
                    flex-col justify-center items-center gap-5  border-2  w-full md:w-1/3 relative hover:bg-mint-deep ">
                        <img src={unlimited} alt="unlimited image" className='w-20' />
                        <h3 className='text-2xl font-bold text-black font-heading'>Unlimited links</h3>
                        <p className='text-muted'> One page for all your links with a free tier of 5</p>
                    </div>

                    <div className="feature-card rounded-2xl bg-mint shadow-[0_10px_30px_rgba(79,184,166,0.15)] border-mint-deep  p-10 text-center flex
                    flex-col justify-center items-center gap-5  border-2  w-full md:w-1/3 relative bottom-15 hover:bg-mint-deep">
                        <img src={analytics} alt="analytics image" className='w-20' />
                        <h3 className='text-2xl font-bold text-black font-heading'>Click analytics</h3>
                        <p className='text-muted'>See which links get clicks and which countries they come from.</p>
                    </div>

                    <div className="feature-card rounded-2xl bg-mint shadow border-mint-deep  p-10 text-center flex
                    flex-col justify-center items-center gap-5  border-2  w-full md:w-1/3 relative bottom-30 hover:bg-mint-deep">
                        <img src={theme} alt="themes image" className='w-20' />
                        <h3 className='text-2xl font-bold text-black font-heading'>Custom themes</h3>
                        <p className='text-muted'>Make your page look like you.</p>
                    </div>
                </div>

            </div>


            <div className="pricing px-4 md:px-10 lg:px-20 mb-10 md:mb-20">

                <h2 className='font-bold text-3xl text-center text-primary mb-20'>Pricing</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-200 p-5 rounded-xl'>


                    <h3 className='text-3xl md:text-4xl font-heading w-4/5 md:w-1/2 mb-5 self-center'>
                        Start free. Upgrade when you grow.
                    </h3>

                    <div className="free bg-mint  border-2 border-mint-deep shadow-lg  p-6 md:p-8 flex gap-5 flex-col">

                        <p className='font-heading text-xl text-textmain'>Free</p>

                        <p className='font-heading text-4xl text-textmain'>$0<span className='text-muted text-sm'>/month</span></p>

                        <p className='font-bold text-muted'>Everything you need to get started.</p>

                        <ul className='flex flex-col gap-3'>
                            {freeFeatures.map((feature) => (
                                <li key={feature} className='flex items-center gap-3 font-body text-textmain'>
                                    <Check className='text-primary size-5 shrink-0' /> {feature}
                                </li>
                            ))}
                        </ul>

                    </div>

                    <div className="pro bg-mint-deep border-2 border-primary md:p-8 flex gap-5 flex-col shadow-lg transition hover:-translate-y-1 md:col-span-2">

                        <p className='font-heading text-xl text-textmain bg-primary text-white font-bold rounded-full px-5 py-1 w-max'>Pro</p>

                        <p className='font-heading text-4xl text-primary'>$10<span className='text-muted text-sm'>/month</span></p>

                        <p className='font-bold text-muted'>For people who want to know what their links are doing.</p>

                    </div>
                </div>
            </div>


            <div>
                We will have a footer here . 
            </div>



        </div>
    )
}