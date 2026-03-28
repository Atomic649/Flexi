import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { t } from "i18next";

interface DashboardMetrics {
  income: number;
  expense: number;
  profitloss: number;
  orders: number;
  allOrders?: number;
  adscost?: number;
  forcastProfitloss?: number;
  adsPercentage?: number;
  conversion?: number;
}

interface SalesChartData {
  date: string;
  income: number;
  expense: number;
  adsCost: number;
  profit: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  orders: number;
}

interface TopStore {
  id: number;
  name: string;
  platform: string;
  sales: number;
  revenue: number;
  orders: number;
}

interface PlatformRevenue {
  platform: string;
  revenue: number;
  sales: number;
  orders: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
  type: 'expense' | 'ads';
}

interface DashboardFilters {
  memberId: string;
  startDate?: string;
  endDate?: string;
  productName?: string;
  storeId?: number;
  period?: 'today' | 'thisMonth' | 'lastMonth' | 'last30Days' | 'custom';
}

class CallAPIDashboard {
  // Build query string from filters
  private buildQueryString(filters: Partial<DashboardFilters>): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return params.toString();
  }

  // Get Dashboard Metrics
  async getDashboardMetricsAPI(filters: DashboardFilters): Promise<DashboardMetrics> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const queryString = this.buildQueryString(filters);
      const response = await axiosInstance.get(`/dashboard/metrics?${queryString}`);

    //  console.log("🚀Dashboard Metrics API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Dashboard Metrics API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get Sales Chart Data
  async getSalesChartDataAPI(filters: Partial<DashboardFilters>): Promise<SalesChartData[]> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const queryString = this.buildQueryString(filters);
      const response = await axiosInstance.get(`/dashboard/sales-chart?${queryString}`);

    //  console.log("🚀Sales Chart Data API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Sales Chart Data API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get Top Products
  async getTopProductsAPI(filters: Partial<DashboardFilters> & { limit?: number }): Promise<TopProduct[]> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const queryString = this.buildQueryString(filters);
      const response = await axiosInstance.get(`/dashboard/top-products?${queryString}`);

      // console.log("🚀Top Products API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Top Products API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get Top Stores
  async getTopStoresAPI(filters: Partial<DashboardFilters> & { limit?: number }): Promise<TopStore[]> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const queryString = this.buildQueryString(filters);
      const response = await axiosInstance.get(`/dashboard/top-stores?${queryString}`);

   //   console.log("🚀Top Stores API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Top Stores API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get Revenue by Platform
  async getRevenueByPlatformAPI(filters: Partial<DashboardFilters>): Promise<PlatformRevenue[]> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const queryString = this.buildQueryString(filters);
      const response = await axiosInstance.get(`/dashboard/revenue-by-platform?${queryString}`);

      console.log("🚀Revenue by Platform API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Revenue by Platform API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get Accounts Payable and Receivable
  async getAccountsPayableReceivableAPI(filters: Partial<DashboardFilters>): Promise<{ accountsPayable: number; accountsReceivable: number }> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const queryString = this.buildQueryString(filters);
      const response = await axiosInstance.get(`/dashboard/accounts-payable-receivable?${queryString}`);

    //  console.log("🚀Accounts Payable/Receivable API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Accounts Payable/Receivable API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get Income / Expense Detail Lists
  async getIncomeExpenseDetailAPI(filters: Partial<DashboardFilters>): Promise<{
    bills: { id: number; name: string; date: string; amount: number; note: string | null; platform: string }[];
    expenses: { id: number; name: string | null; date: string; amount: number; note: string | null; desc: string | null }[];
  }> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const queryString = this.buildQueryString(filters);
      const response = await axiosInstance.get(`/dashboard/income-expense-detail?${queryString}`);
      return response.data;
    } catch (error) {
      console.error("🚨 Get Income/Expense Detail API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get AP/AR Detail Lists
  async getAPARDetailAPI(filters: Partial<DashboardFilters>): Promise<{
    invoiceBills: { id: number; name: string; date: string; amount: number; dueDate: string | null; note: string | null; invoiceId: string | null }[];
    invoiceExpenses: { id: number; name: string | null; date: string; amount: number; dueDate: string | null; note: string | null }[];
  }> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const queryString = this.buildQueryString(filters);
      const response = await axiosInstance.get(`/dashboard/accounts-payable-receivable-detail?${queryString}`);
      return response.data;
    } catch (error) {
      console.error("🚨 Get AP/AR Detail API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get Expense Breakdown
  async getExpenseBreakdownAPI(filters: Partial<DashboardFilters>): Promise<ExpenseBreakdown[]> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const queryString = this.buildQueryString(filters);
      const response = await axiosInstance.get(`/dashboard/expense-breakdown?${queryString}`);

   //   console.log("🚀Expense Breakdown API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Expense Breakdown API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }
}

export default new CallAPIDashboard();