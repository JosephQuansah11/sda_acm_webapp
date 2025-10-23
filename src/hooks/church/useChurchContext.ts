import { useEffect, useMemo, useState } from "react";
import { Church } from "../../models/church/Church";
import { getAllChurches, getTotalChurches } from "../../api/ChurchApi";


export function useChurchContext() {
    const [churches, setChurches] = useState<Church[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalChurches, setTotalChurches] = useState<number>(0);
    const displayKeys = useMemo(() => ['name', 'address'], []);
    const searchableKeys = useMemo(() => [
        'name', 'address.street', 'address.city', 'address.state', 'address.country'
    ], []);
    const innerObjectKeys = useMemo(() => ['street', 'city'], []);
    
 useEffect(()=>{
    const fetchChurches = async () => {
        try {
            const response = await getAllChurches();
            setChurches(response);
            setLoading(false);
        } catch (error) {
            setError(error as string);
            setLoading(false);
        }
    };
    fetchChurches();
 }, []);

    useEffect(() => {
        const fetchTotalChurches = async () => {
            try {
                const response = await getTotalChurches();
                setTotalChurches(response);
            } catch (error) {
                setError(error as string);
            }
        };
        fetchTotalChurches();
    }, []);

    return useMemo(() => ({
        churches,
        loading,
        error,
        displayKeys,
        searchableKeys,
        innerObjectKeys,
        totalChurches
    }), [churches, loading, error, displayKeys, searchableKeys, innerObjectKeys, totalChurches]);
}