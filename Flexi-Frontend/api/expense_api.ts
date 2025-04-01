import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";

class CallAPIExpense {
  // Extract expenses from PDF
  async extractPDFExpenseAPI(formData: FormData): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(`/pdf/pdfExtract`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("🚀PDFExtractAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Extract PDF Expense API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("API endpoint not found (404)");
        }
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }
// Get all expenses by memberId in body req
  async getAllExpensesAPI(memberId: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/expense/all/${memberId}`);

      console.log("🚀GetAllExpensesAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get All Expenses API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("API endpoint not found (404)");
        }
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }
  // auto delete if save is false
  async autoDeleteExpenseAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.delete(`/pdf/autoDelete`);

      console.log("🚀AutoDeleteExpenseAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Auto Delete Expense API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("API endpoint not found (404)");
        }
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // set save to true multiple id
  async saveDetectExpenseAPI(ids: number[]): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.put(`/pdf/saveDetect`, {
        ids,
      });

      console.log("🚀SaveDetectExpenseAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Save Detect Expense API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("API endpoint not found (404)");
        }
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // get expense by id
  async getExpenseByIdAPI(id: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/expense/${id}`);

      console.log("🚀GetExpenseByIdAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Expense By Id API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("API endpoint not found (404)");
        }
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  //update expense by id
  async updateExpenseAPI(id: number, data: any): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.put(`/expense/${id}`, data);

      console.log("🚀UpdateExpenseAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Update Expense API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("API endpoint not found (404)");
        }
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // delete expense by id
  async deleteExpenseAPI(id: number, memberId: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.delete(`/expense/${id}`, {
        data: { memberId },
      });

      console.log("🚀DeleteExpenseAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Delete Expense API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("API endpoint not found (404)");
        }
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // create expense
  async createAExpenseAPI(data: any): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(`/expense`, data);

      console.log("🚀CreateExpenseAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Create Expense API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("API endpoint not found (404)");
        }
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }
 
}

export default new CallAPIExpense();