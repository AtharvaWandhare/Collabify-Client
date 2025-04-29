import Link from 'next/link';
import { APP_NAME, APP_DESCRIPTION } from '@/config/keys.js';
import Image from 'next/image';
import Logo from '@/public/logos/Center/logo-png.png';
// import Logo from '@/public/logos/CenLeft_Stacked/logo-png.png';

export default function Navbar() {

    const loggedIn = false;

    const logo = <Image
        src={Logo}
        alt="Logo"
        priority={true}
        layout="fixed"
        objectFit="cover"
        quality={100}
        width={60}
    />

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
                        <Link href="/documents" className="hover:text-gray-400">Documents</Link>
                    </li>
                    <li>
                        <Link href="/about" className="hover:text-gray-400">Account</Link>
                    </li>
                    <li>
                        <button className="hover:text-gray-400 bg-amber-50 text-black font-bold py-1 px-2 rounded-lg">
                            {loggedIn ? 'Logout' : 'Login'}
                        </button>
                    </li>
                </ul>
            </div>
        </nav >
    );
}