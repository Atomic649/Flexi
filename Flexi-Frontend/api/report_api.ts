import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";

class CallAPIReport {
    // Get Reports
    async getDailyReportsAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/report/daily/${memberId}`);

            console.log("🚀DailyReportAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Reports API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }
    // Get Monthly Reports
    async getMonthlyReportsAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/report/monthly/${memberId}`);

            console.log("🚀MonthlyReportAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Reports API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }
    // Get ads&expense Reports
    async getAdsExpenseReportsAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/report/ads&expense/${memberId}`);

            console.log("🚀AdsExpenseReportAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Reports API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }

    // Get Report Details by Date
    async getDetailsEachDateAPI(memberId: string, date: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/report/${memberId}/${date}`);

            console.log("🚀DetailsEachDateAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Report Details API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }
}
export default new CallAPIReport();