// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { Leaf } from "lucide-react";
import { LoginButton } from '@/components/LoginButton';
import { useAuth } from '@/contexts/AuthProvider';


export const Header = () => {
    const { token } = useAuth(); 
    return (
        <header className="sticky top-0 z-50 w-full shadow-lg backdrop-blur-md">
            <div className="container h-16 mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
                <div className="flex justify-between items-center shrink-0">
                    <div className="flex h-8 w-8 rounded-lg bg-[linear-gradient(135deg,_hsl(158,64%,25%),_hsl(158,45%,45%))] items-center justify-center w-10 h-10">
                        <Leaf className="text-white h-8 w-8" />
                    </div>
                    <span className="ml-2 text-xl font-bold text-green-700">CommEfficient</span>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex sm:space-x-8">
                    <Link href="/" className="border-green-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-lg font-medium">
                        Home
                    </Link>
                    <Link href="/projects" className="border-transparent text-gray-500 hover:border-green-300 hover:text-green-700 inline-flex items-center px-1 pt-1 border-b-2 text-lg font-medium">
                        Projects
                    </Link>
                    <Link href="/howItWorks" className="border-transparent text-gray-500 hover:border-green-300 hover:text-green-700 inline-flex items-center px-1 pt-1 border-b-2 text-lg font-medium">
                        How It Works
                    </Link>
                    <Link href="/about" className="border-transparent text-gray-500 hover:border-green-300 hover:text-green-700 inline-flex items-center px-1 pt-1 border-b-2 text-lg font-medium">
                        About
                    </Link>
                </div>

                <div className='flex flex-row justify-end items-center flex-shrink-0 gap-4'>
                    {!token && (
                        <button className='hover:bg-[hsl(45_93%_55%)] hover:text-[hsl(210_12%_8%)] hover:rounded-lg px-4 py-1 text-lg font-medium text-green-700 transition-shadow]'>
                            <Link href="/register">Get Started</Link>
                        </button>
                    )}
                    <LoginButton />
                </div>
            </div>
        </header>
    );
}