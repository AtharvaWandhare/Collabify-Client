'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiLock } from 'react-icons/fi';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useUser } from '@/context/context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [text, setText] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
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
        let email = '';
        let username = '';

        if (text.includes('@')) {
            email = text.trim();
        } else {
            username = text.trim();
        }
        setPassword(password.trim());

        await axios.post('https://localhost:8000/api/v1/user/login',
            { email, username, password },
            { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, withCredentials: true })
            .then((response) => {
                const JsonData = response.data;
                if (response.status === 200) {
                    // document.cookie = `AuthToken=${JsonData.data.AuthToken}; path=/;`;
                    Cookies.set('AuthToken', JsonData.data.AuthToken, { path: '/' });
                    const res = JsonData.data;
                    console.log('\nResponse Data:\n', res);
                    const userData = {
                        id: res.user._id,
                        username: res.user.username,
                        email: res.user.email,
                        avatar: res.user.avatar,
                        AuthToken: res.AuthToken,
                        isLoggedIn: true
                    };
                    login(userData);
                    redirect('/document');
                }
            }).catch((error) => {
                console.error('(By me from catch block in login) Error during login:', error);
                if (error.status === 401) {
                    setError('Username or Email is required!');
                } else if (error.status === 402) {
                    setError('Password is required!');
                } else if (error.status === 404) {
                    setError('User not found!');
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
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>

                {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <FiMail className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Email / Username"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
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
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    <Link href="/register" className="text-black">
                        Don&apos;t have an account?{' '}
                        <span className='text-blue-600 hover:underline'>Sign up</span>
                    </Link>
                </p>
            </div>
        </div>
    );
}