import { getAxiosWithAuth } from "@/utils/axiosInstance";

export type FacebookAdAccount = {
  id: string;
  name: string;
  status?: number | string | null;
  currency?: string;
  businessName?: string;
};

export type FacebookCampaign = {
  id: string;
  name: string;
  status?: string;
  effectiveStatus?: string;
  objective?: string;
  startTime?: string | null;
  stopTime?: string | null;
};

export type FacebookAdSet = {
  id: string;
  name: string;
  status?: string;
  effectiveStatus?: string;
  optimizationGoal?: string;
  dailyBudget?: number | null;
  lifetimeBudget?: number | null;
  startTime?: string | null;
  endTime?: string | null;
};

export type FacebookAd = {
  id: string;
  name: string;
  status?: string;
  effectiveStatus?: string;
  adSetId?: string;
  campaignId?: string;
  bidStrategy?: string | null;
  dailyBudget?: number | null;
  lifetimeBudget?: number | null;
  creative?: { id?: string; name?: string } | null;
};

class FacebookApi {
  async getAdAccounts() {
    const axios = await getAxiosWithAuth();
    const res = await axios.get("/facebook/ad-accounts");
    return (res.data?.accounts ?? []) as FacebookAdAccount[];
  }

  async getCampaigns(adAccountId: string) {
    const axios = await getAxiosWithAuth();
    const res = await axios.get("/facebook/campaigns", {
      params: { adAccountId },
    });
    return (res.data?.campaigns ?? []) as FacebookCampaign[];
  }

  async getAdSets(campaignId: string) {
    const axios = await getAxiosWithAuth();
    const res = await axios.get("/facebook/adsets", {
      params: { campaignId },
    });
    return (res.data?.adSets ?? []) as FacebookAdSet[];
  }

  async getAds(adSetId: string) {
    const axios = await getAxiosWithAuth();
    const res = await axios.get("/facebook/ads", {
      params: { adSetId },
    });
    return (res.data?.ads ?? []) as FacebookAd[];
  }
}

export default new FacebookApi();
