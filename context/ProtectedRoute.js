'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/context';
import { redirect, useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
    const { user } = useUser();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!user) {
            console.log('User not Authenticated: ', user);
            router.push('/login');
        }
        setIsChecking(false);
    }, [user, router]);

    if (isChecking) {
        return null;
    }

    if (!user) {
        return null;
    }

    return children;
}