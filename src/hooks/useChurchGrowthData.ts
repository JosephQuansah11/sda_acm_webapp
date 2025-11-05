import { useState, useEffect } from 'react';
// import { getNewUsersByChurch, getActiveUsersByChurch } from '../api/UserApi';

interface GrowthData {
    churchId: string;
    newUsersCount: number;
    growthRate: number;
}

interface ActiveUsersData {
    churchId: string;
    activeUsersCount: number;
    activePercentage: number;
}

export function useChurchGrowthData(churchId?: string) {
    const [growthData, setGrowthData] = useState<GrowthData[]>([]);
    const [activeUsersData, setActiveUsersData] = useState<ActiveUsersData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch growth data (new users)
                // In a real implementation, you would pass churchId to filter by church
                const newUsersData = await getNewUsersByChurch(churchId);
                setGrowthData(newUsersData);
                
                // Fetch active users data
                const activeUsersData = await getActiveUsersByChurch(churchId);
                setActiveUsersData(activeUsersData);
                
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch church growth data');
                setLoading(false);
            }
        };

        if (churchId) {
            fetchData();
        }
    }, [churchId]);

    // Calculate overall growth rate
    const calculateGrowthRate = (churchId: string): number => {
        const churchData = growthData.find(data => data.churchId === churchId);
        return churchData ? churchData.growthRate : 0;
    };

    // Calculate active members percentage
    const calculateActiveMembersPercentage = (churchId: string): number => {
        const churchData = activeUsersData.find(data => data.churchId === churchId);
        return churchData ? churchData.activePercentage : 0;
    };

    return {
        growthData,
        activeUsersData,
        loading,
        error,
        calculateGrowthRate,
        calculateActiveMembersPercentage
    };
}

// These would be API functions that you would implement in UserApi
// For now, I'm providing mock implementations:

export async function getNewUsersByChurch(churchId?: string): Promise<GrowthData[]> {
    // Mock implementation - in a real app, this would call your API
    return [
        { churchId: churchId || '1', newUsersCount: 15, growthRate: 12 },
        { churchId: churchId || '2', newUsersCount: 8, growthRate: 8 },
        { churchId: churchId || '3', newUsersCount: 5, growthRate: 5 }
    ];
}

export async function getActiveUsersByChurch(churchId?: string): Promise<ActiveUsersData[]> {
    // Mock implementation - in a real app, this would call your API
    return [
        { churchId: churchId || '1', activeUsersCount: 120, activePercentage: 65 },
        { churchId: churchId || '2', activeUsersCount: 85, activePercentage: 72 },
        { churchId: churchId || '3', activeUsersCount: 45, activePercentage: 58 }
    ];
}
