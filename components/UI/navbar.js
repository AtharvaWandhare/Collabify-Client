'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { APP_NAME, APP_DESCRIPTION } from '@/config/keys.js';
import Image from 'next/image';
import Logo from '@/public/logos/Center/logo-png.png';
import { useUser } from '@/context/context.js';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function Navbar() {

    const { user, logout } = useUser();
    const router = useRouter();

    const redirect = (path) => {
        router.push(path);
    }

    const logo = <Image
        src={Logo}
        alt="Logo"
        priority={true}
        layout="fixed"
        objectFit="cover"
        quality={100}
        width={60}
    />

    async function handleClick() {
        if (user) {
            const token = Cookies.get('AuthToken');
            await axios.post('https://localhost:8000/api/v1/user/logout',
                { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }, withCredentials: true })
                .then((response) => {
                    if (response.status === 200) {
                        console.log('Logout successful:', response.data);
                        Cookies.remove('AuthToken', { path: '/' });
                        logout();
                        setLoggedIn(false);
                    } else {
                        console.log('Logout failed:', response.data);
                    }
                }).catch((error) => {
                    console.log('Error during logout:', error);
                });
        }
        redirect('/login');
    }

    return (
        <nav className="text-white p-4 border">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link href={'/'} className="text-lg font-bold">
                        {logo ? logo :
                            <>
                                {APP_NAME}
                                <p className="text-sm text-gray-400">{APP_DESCRIPTION}</p>
                            </>
                        }
                    </Link>
                </div>
                <ul className="flex space-x-4 justify-center items-center gap-4">
                    <li>
                        <Link href="/" className="hover:text-gray-400">Home</Link>
                    </li>
                    <li>
                        <Link href="/document" className="hover:text-gray-400">Documents</Link>
                    </li>
                    <li>
                        <Link href="/account" className="hover:text-gray-400">Account</Link>
                    </li>
                    <li>
                        <button onClick={handleClick} className="hover:text-gray-400 bg-amber-50 text-black font-bold py-1 px-2 rounded-lg cursor-pointer">
                            {user ? 'Logout' : 'Login'}
                        </button>
                    </li>
                </ul>
            </div>
        </nav >
    );
}