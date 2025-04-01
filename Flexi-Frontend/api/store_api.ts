import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";

class CallAPIStore{
    // Get Stores
    async getStoresAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/store/member/${memberId}`);

            console.log("🚀StoreAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Stores API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }

    // Get a Store
    async getAStoreAPI(id: number): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/store/${id}`);
            return response.data;
        } catch (error) {
            console.error("🚨 Get Store API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }

    // Create Store
    async createStoreAPI(data: {
        platform: string;
        accName: string;
        accId: string;
        memberId: string;
    }): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.post("/store/", data);
            return response.data;
        } catch (error) {
            console.error("🚨 Create Store API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }

    // Update Store
    async updateStoreAPI(
        id: number, 
        data: {
        platform: string;
        accName: string;
        accId: string;
        memberId: string;
    }): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.put(`/store/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("🚨 Update Store API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }

    // Delete Store
    async deleteStoreAPI(id: number): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.post(`/store/delete/${id}`);
            return response.data;
        } catch (error) {
            console.error("🚨 Delete Store API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }

    
}

export default new CallAPIStore();