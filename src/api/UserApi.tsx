import User, { UserForm } from "../models/user/User";

export async function editUserById(id: string, user: User): Promise<User> {
     // console.log("editUserById function calls: ", user);
    try {
        const response = await fetch(`/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(user)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const response = await fetch('/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function addUser(user: UserForm): Promise<UserForm> {
    try {
        const response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(user)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deleteUser(userId: string): Promise<void> {
    try {
        const response = await fetch(`/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getUserDetail(userId: string): Promise<User> {
    try {
        const response = await fetch(`/users/${userId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}