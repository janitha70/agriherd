'use client';

import { useEffect } from 'react';
import { processSyncQueue } from '@/lib/sync';

export default function SyncProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // 1. Run sync immediately when the application first loads (if online)
        processSyncQueue();

        // 2. Set up the event listener for when the farmer walks back into Wi-Fi range
        const handleOnline = () => {
            console.log('Network connection restored. Processing offline sync queue...');
            processSyncQueue();
        };

        window.addEventListener('online', handleOnline);

        // 3. Cleanup the listener to prevent memory leaks
        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    return <>{children}</>;
}