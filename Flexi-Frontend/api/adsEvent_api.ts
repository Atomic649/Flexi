import { getAxiosWithAuth } from "@/utils/axiosInstance";
import axios from "axios";
import { t } from "i18next";

export interface AdsEventPayload {
    productId: number;
    viewerId: string;
    type: "IMPRESSION" | "CLICK" | "VIEW";
    campaignId?: number | null;
}

class CallAPIAdsEvent {
    async createAdsEvent(data: AdsEventPayload): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.post(`/ads-tracking`, data);
            console.log("🚀 Create Ads Event API Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("🚨 Create Ads Event API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            }
            throw new Error(t("common.networkError"));
        }
    }
}

export default new CallAPIAdsEvent();