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
}
export default new CallAPIBill();