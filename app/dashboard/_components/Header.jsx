'use client'

import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const Header = () => {
    const path = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/dashboard/faq', label: 'About' }
    ];

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled 
                ? 'bg-white/95 backdrop-blur-sm shadow-md py-2' 
                : 'bg-transparent py-4'
        }`}>
            <div className='flex items-center justify-between px-4 mx-auto md:px-8 max-w-7xl'>
                <div className="flex items-center">
                    <Link href="/">
                        <Image 
                            src={'/logo.svg'} 
                            width={160} 
                            height={160} 
                            alt="Logo"
                            className="transition-all duration-300 hover:opacity-80"
                        />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <ul className='hidden gap-8 md:flex'>
                    {navItems.map((item, index) => (
                        <Link href={item.path} key={index}>
                            <li 
                                className={`relative group ${
                                    path === item.path 
                                    ? 'text-primary font-bold' 
                                    : 'text-gray-600 hover:text-primary'
                                } transition-all duration-300 cursor-pointer`}
                            >
                                {item.label}
                                <span 
                                    className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${
                                        path === item.path ? 'w-full' : 'w-0'
                                    }`}
                                ></span>
                            </li>
                        </Link>
                    ))}
                </ul>

                <div className="flex items-center gap-4">
                    <UserButton 
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: "h-9 w-9 rounded-full ring-2 ring-white/20 transition-all duration-300 hover:ring-primary/50",
                            },
                        }}
                    />
                    
                    {/* Mobile menu button */}
                    <button 
                        className="transition-all duration-300 md:hidden focus:outline-none"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? 
                            <X className="w-6 h-6 text-gray-600" /> : 
                            <Menu className="w-6 h-6 text-gray-600" />
                        }
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className={`md:hidden fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${
                mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="flex flex-col h-full p-8 pt-20">
                    <ul className='space-y-6 text-lg'>
                        {navItems.map((item, index) => (
                            <Link 
                                href={item.path} 
                                key={index}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <li className={`${
                                    path === item.path 
                                    ? 'text-primary font-bold' 
                                    : 'text-gray-600'
                                } transition-all duration-300 hover:translate-x-2`}>
                                    {item.label}
                                </li>
                            </Link>
                        ))}
                    </ul>
                </div>
            </div>
        </header>
    )
}

export default Header