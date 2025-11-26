
import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { t } from "i18next";

class CallAPIExpense {
  // Download WHT Document PDF from backend
  async downloadWHTDocAPI({ sName, sTaxId, sAddress, amount, date, taxInvoiceNo,memberId,WHTAmount,group,taxType }: {
    sName: string;
    sTaxId: string;
    sAddress: string;
    amount: string;
    date: string;
    taxInvoiceNo: string;
    memberId: string;
    WHTAmount: string;
    group:string;
    taxType: string;
  }): Promise<Blob> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(
        `/expense/generate-wht-document`,
        { sName, sTaxId, sAddress, amount, date, taxInvoiceNo, memberId, WHTAmount, group, taxType },
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
        throw new Error(t("common.networkError"));
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
        throw new Error(t("common.networkError"));
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
        throw new Error(t("common.networkError"));
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
        throw new Error(t("common.networkError"));
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
        throw new Error(t("common.networkError"));
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
        throw new Error(t("common.networkError"));
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
        throw new Error(t("common.networkError"));
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
        throw new Error(t("common.networkError"));
      }
    }
  }

    // create expense
  async createAExpenseWithOCRAPI(formData: FormData): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
  // Let axios set the Content-Type (including boundary) for FormData
  const response = await axiosInstance.post(`/expense/ocr`, formData);
      console.log("🚀CreateExpenseAPI - Full Response:", response.data);
      console.log("🔍 OCR Alert in API Response:", response.data.ocrAlert ? "Present" : "Missing");
      if (response.data.ocrAlert) {
        console.log("📋 OCR Alert Details:", JSON.stringify(response.data.ocrAlert, null, 2));
      }

      return response.data;
    } catch (error) {
      console.error("🚨 Create Expense WithOCRAPI API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("OCR API endpoint not found (404)");
        }
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // create expense
  async createAExpenseAPI(formData: FormData): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
  // Let axios set the Content-Type (including boundary) for FormData
  const response = await axiosInstance.post(`/expense`, formData);
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
        throw new Error(t("common.networkError"));
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
        throw new Error(t("common.networkError"));
      }
    }
  }
 
  // Update expense with selected OCR data
  async updateExpenseWithOCRDataAPI(expenseId: number, selectedData: {
    sName?: string;
    sTaxId?: string;
    taxInvoiceId?: string;
    vatAmount?: string;
    amount?: string;
    date?: string;
    address?: string;
  }): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(`/expense/update-ocr-data`, {
        expenseId,
        selectedData
      });

      console.log("🚀 Update Expense with OCR Data API:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨 Update Expense with OCR Data API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("API endpoint not found (404)");
        }
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

}

export default new CallAPIExpense();