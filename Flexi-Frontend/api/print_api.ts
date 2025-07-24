import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";

class CallAPIPrint {
  // Get Monthly Report Data
  async getMonthlyReportAPI(memberId: string, year?: number, month?: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/print/monthly-report`, {
        params: {
          memberId,
          year,
          month
        }
      });

      console.log("🚀 Monthly Report API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Monthly Report API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // Get Bills By Date Range
  async getBillsByDateRangeAPI(memberId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/print/bills-by-date`, {
        params: {
          memberId,
          startDate,
          endDate
        }
      });

      console.log("🚀 Get Bills By Date Range API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Bills By Date Range API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // Search Bills By Customer
  async searchBillsByCustomerAPI(memberId: string, customerName: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/print/search-by-customer`, {
        params: {
          memberId,
          customerName
        }
      });

      console.log("🚀 Search Bills By Customer API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Search Bills By Customer API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // Get Bill By ID
  async getBillByIdAPI(memberId: string, billId: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/print/bill/`, {
        params: {
          memberId,
          billId
        }
      });

      console.log("🚀 Get Bill By ID API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Bill By ID API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // Generate Invoice PDF
  async generateInvoicePDFAPI(billId: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/print/invoice/${billId}`, {
        responseType: 'blob'
      });

      console.log("🚀 Generate Invoice PDF API:", "PDF blob received");
      
      // Create a blob URL for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      return { url, success: true };
    } catch (error) {
      console.error("🚨 Generate Invoice PDF API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }
}

export default new CallAPIPrint();