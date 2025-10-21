import User, { UserForm } from "../models/user/User";
import axios from "axios";

export async function editUserById(id: string, user: User): Promise<User> {
    // console.log("editUserById function calls: ", user);
    try {
        const response = await axios.put(`/api/users/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(user)
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getLoginPasswordEncoded(email: string, password: string): Promise<string>{
    try {
        const response = await axios.get(`http://localhost:8080/users/loginPasswordEncoded/${email}/${password}`, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const response = await axios.get('http://localhost:8080/users/all', {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function addUser(user: UserForm): Promise<UserForm> {
    try {
        const response = await axios.post('http://localhost:8080/users', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(user)
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deleteUser(userId: string): Promise<void> {
    try {
        const response = await axios.delete(`http://localhost:8080/users/${userId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getUserDetail(userId: string): Promise<User> {
    try {
        const response = await axios.get(`http://localhost:8080/users/${userId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `bearer ${localStorage.getItem('authToken')}`
            }
        });

        if ( response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}