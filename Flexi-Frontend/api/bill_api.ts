import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";

class CallAPIBill {
    // Get Bills
    async getBillsAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/bill/member/${memberId}`);

            console.log("🚀BillAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Bills API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }
    // Create Bill
    async createBillAPI(data: {
        id?: number;
        createdAt?: Date;
        updatedAt?: Date;
        purchaseAt: Date;
        cName: string;
        cLastName: string;
        cPhone: string;
        cGender: "Female" | "Male";
        cAddress: string;
        cPostId: string;
        cProvince: string;
        product: string;
        payment: "COD" | "Transfer" | "CreditCard";
        amount: number;       
        cashStatus: boolean;
        price: number;
        memberId: string;
        businessAcc: number;
        storeId: number;
        image?: string;       
    }): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.post("/bill", data);

            console.log("🚀Create Bill API:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Create Bill API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }
}
export default new CallAPIBill();