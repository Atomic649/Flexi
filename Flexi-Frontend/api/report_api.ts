import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { t } from "i18next";

class CallAPIReport {
    // Get Reports
    async getDailyReportsAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/report/daily/${memberId}`);

          //  console.log("🚀DailyReportAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Reports API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }
    // Get Monthly Reports
    async getMonthlyReportsAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/report/monthly/${memberId}`);

           // console.log("🚀MonthlyReportAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Reports API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }
    // Get ads&expense Reports
    async getAdsExpenseReportsAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/report/ads&expense/${memberId}`);

            // console.log("🚀AdsExpenseReportAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Reports API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Get Report Details by Date
    async getDetailsEachDateAPI(memberId: string, date: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/report/${memberId}/${date}`);

           // console.log("🚀DetailsEachDateAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Report Details API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Get Report Details by Month
    async getDetailsEachMonthAPI(memberId: string, month: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/report/month/${memberId}/${month}`);

         //   console.log("🚀DetailsEachMonthAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Monthly Report Details API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }
}
export default new CallAPIReport();