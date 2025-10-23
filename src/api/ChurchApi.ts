import axios from "axios";
import {Church} from "../models/church/Church";
import {ChurchForm} from "../models/church/Church";

export async function getAllChurches(): Promise<Church[]> {
    try {
        const response = await axios.get<Church[]>('http://localhost:8080/churches/all', {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("getAllChurches function calls: ", response);

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getTotalChurches(): Promise<number> {
    try {
        const response = await axios.get('http://localhost:8080/api/data/churches/count', {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `bearer ${localStorage.getItem('authToken')}`
            }
        });
        console.log("getTotalChurches function calls: ", response);

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function addChurch(church: ChurchForm): Promise<ChurchForm> {
    try {
        console.log("addChurch function calls: ", church);
        const response = await axios.post<ChurchForm>('http://localhost:8080/churches', church,{
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        console.log("addChurch function calls: ", response);
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
