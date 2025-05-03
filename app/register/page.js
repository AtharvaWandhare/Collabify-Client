'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUser } from '@/context/context';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const redirect = (path) => {
        router.push(path);
    }

    const { login } = useUser();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        await axios.post('https://localhost:8000/api/v1/user/register',
            { username, email, password },
            { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, withCredentials: true })
            .then((response) => {
                if (response.status === 201) {
                    setMessage('Registration successful! Please log in.');
                    setTimeout(() => {
                        redirect('/login');
                    }, 2000);
                }
            }).catch((error) => {
                // console.error('Error during login:', error);
                if (error.status === 401) {
                    setError('Invalid Username. Please try again.');
                } else if (error.status === 402) {
                    setError('Invalid Email. Please try again.');
                } else if (error.status === 403) {
                    setError('Invalid Password. Please try again.');
                } else {
                    setError(error.response?.data?.message || 'Login failed. Please try again.(From Catch Block)');
                }
            }).finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center px-4 text-black">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md animate-fadeIn">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome to Collabify</h2>

                {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
                {message && <p className="mb-4 text-green-500 text-sm">{message}</p>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <FiUser className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <FiMail className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="email"
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <FiLock className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="password"
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Saving your Info...' : 'Register'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    <Link href="/login" className="text-black">
                        Already have an account?{' '}
                        <span className='text-blue-600 hover:underline'>Log in</span>
                    </Link>
                </p>
            </div>
        </div>
    );
}