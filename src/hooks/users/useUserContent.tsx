import User, { UserForm } from "../../models/user/User";
import { useEffect, useState, useMemo } from "react";
import { getAllUsers, addUser, deleteUser, editUserById, getTotalMembers } from "../../api/UserApi";

export function useUserContent() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalMembers, setTotalMembers] = useState<number>(0);
    // Memoize configuration arrays to prevent unnecessary re-renders
    const displayKeys = useMemo(() => ['name', 'email', 'telephone', 'address'], []);
    const searchableKeys = useMemo(() => [
        'name', 'email', 'telephone', 'address.street', 'address.city', 'address.state', 'address.country'
    ], []);
    const innerObjectKeys = useMemo(() => ['street', 'city'], []);
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                setUsers(response);
                // setTotalMembers(response.length);
                setLoading(false);
            } catch (error) {
                setError(error as string);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchTotalMembers = async () => {
            try {
                const response = await getTotalMembers();
                setTotalMembers(response);
            } catch (error) {
                setError(error as string);
            }
        };
        fetchTotalMembers();
    }, []);


    // Memoize the return object to prevent unnecessary re-renders
    return useMemo(() => ({
        users,
        loading,
        error,
        displayKeys,
        searchableKeys,
        innerObjectKeys,
        totalMembers
    }), [users, loading, error, displayKeys, searchableKeys, innerObjectKeys, totalMembers]);
}


export async function AddUserContent(user: UserForm): Promise<void> {
    try {
        await addUser(user);
        // Trigger a refresh by updating the component state
        window.location.reload(); // Simple refresh for now
    } catch (error) {
        console.error('Failed to add user:', error);
        throw error;
    }
}

export async function DeleteUserContent(userId: string): Promise<void> {
    try {
        await deleteUser(userId);
        // Trigger a refresh by updating the component state
        window.location.reload(); // Simple refresh for now
    } catch (error) {
        console.error('Failed to delete user:', error);
        throw error;
    }
}

export async function EditUserContent(userId: string, user: User): Promise<void> {
    try {
         // console.log('final edit: ', userId);
        await editUserById(userId, user);
        // Trigger a refresh by updating the component state
        window.location.reload(); // Simple refresh for now
    } catch (error) {
        console.error('Failed to edit user:', error);
        throw error;
    }
}