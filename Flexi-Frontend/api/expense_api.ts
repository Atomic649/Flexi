// Download WHT Document PDF from backend
export async function downloadWHTDocAPI({ taxpayerName, taxpayerId, amount, date }: {
  taxpayerName: string;
  taxpayerId: string;
  amount: string;
  date: string;
}) {
  const response = await fetch("http://localhost:3001/api/expense/generate-wht-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taxpayerName, taxpayerId, amount, date }),
  });
  if (!response.ok) throw new Error("Failed to download WHT document");
  return await response.blob();
}
import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";

class CallAPIExpense {
  // Download WHT Document PDF from backend
  async downloadWHTDocAPI({ sName, sTaxId, amount, date, taxInvoiceNo }: {
    sName: string;
    sTaxId: string;
    sAddress: string;
    amount: string;
    date: string;
    taxInvoiceNo: string;
  }): Promise<Blob> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(
        `/expense/generate-wht-document`,
        { sName, sTaxId, amount, date, taxInvoiceNo },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error("🚨 Download WHT Document API Error:", error);
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
  async updateExpenseAPI(id: number, data: FormData): Promise<any> {
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
  async createAExpenseAPI(formData: FormData): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(`/expense`,  formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
  // get this year expenses by memberId
  async getThisYearExpensesAPI(memberId: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/expense/year/expense`, {
        params: { memberId },
      });

      console.log("🚀Get This Year Expenses API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get This Year Expenses API Error:", error);
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