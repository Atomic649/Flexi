
import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { getToken } from "@/utils/utility";
import { API_URL } from "@/utils/config";
import { t } from "i18next";

class CallAPIExpense {
  // Download WHT Document PDF from backend
  async downloadWHTDocAPI({ sName, sTaxId, sAddress, amount, date, taxInvoiceNo,memberId,WHTAmount,group,taxType,note }: {
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
    note?: string;
  }): Promise<Blob> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(
        `/expense/generate-wht-document`,
        { sName, sTaxId, sAddress, amount, date, taxInvoiceNo, memberId, WHTAmount, group, taxType, note },
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

    //  console.log("🚀GetAllExpensesAPI:", response.data);

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

    //  console.log("🚀AutoDeleteExpenseAPI:", response.data);

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

    //  console.log("🚀SaveDetectExpenseAPI:", response.data);

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

 //    console.log("🚀GetExpenseByIdAPI:", response.data);

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

    //  console.log("🚀UpdateExpenseAPI:", response.data);

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

   //   console.log("🚀DeleteExpenseAPI:", response.data);

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

  // duplicate expense by id (server will duplicate without image and set save=true)
  async duplicateExpenseAPI(id: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(`/expense/duplicate/${id}`);

   //   console.log("🚀DuplicateExpenseAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Duplicate Expense API Error:", error);
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

  async createAExpenseWithOCRStream(
    formData: FormData,
    onProgress: (stage: string, progress: number, message: string) => void
  ): Promise<any> {
    const token = await getToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}expense/ocr-stream`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      let result: any = null;
      let processedLength = 0;

      const parseSSELine = (line: string) => {
        if (!line.startsWith("data: ")) return;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.event === "progress") {
            onProgress(data.stage, data.progress, data.message ?? "");
          } else if (data.event === "result") {
            result = data.data;
          } else if (data.event === "error") {
            reject(new Error(data.message ?? "OCR stream error"));
          }
        } catch {
          // ignore partial/malformed lines
        }
      };

      // Fires as each SSE chunk arrives — real-time progress
      xhr.onprogress = () => {
        const newText = xhr.responseText.slice(processedLength);
        processedLength = xhr.responseText.length;
        for (const line of newText.split("\n")) {
          parseSSELine(line);
        }
      };

      xhr.onload = () => {
        // Parse any remaining text not caught by onprogress
        const remaining = xhr.responseText.slice(processedLength);
        for (const line of remaining.split("\n")) {
          parseSSELine(line);
        }
        if (xhr.status < 200 || xhr.status >= 300) {
          return reject(new Error(`OCR request failed: ${xhr.status}`));
        }
        if (!result) return reject(new Error(t("common.networkError")));
        resolve(result);
      };

      xhr.onerror = () => {
        console.error("🚨 Create Expense OCR Stream Error");
        reject(new Error(t("common.networkError")));
      };

      xhr.send(formData);
    });
  }

    // create expense
  async createAExpenseWithOCRAPI(formData: FormData): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      // OCR requests can be slow (HEIC conversion + EasyOCR) — use a longer timeout
      const response = await axiosInstance.post(`/expense/ocr`, formData, { timeout: 90000 });
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
  //    console.log("🚀CreateExpenseAPI:", response.data);

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

   //   console.log("🚀Get This Year Expenses API:", response.data);

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

    //  console.log("🚀 Update Expense with OCR Data API:", response.data);
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

  // Create a new project for a business
  async createProjectAPI(memberId: string, name: string): Promise<{ id: number; name: string }> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(`/expense/projects`, { memberId, name });
      return response.data;
    } catch (error) {
      console.error("🚨 Create Project API Error:", error);
      throw error;
    }
  }

  // Get project suggestions sorted by most-used for a business
  async getProjectSuggestionsAPI(memberId: string): Promise<{ id: number; name: string }[]> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/expense/project-suggestions/${memberId}`);
      return response.data.projects ?? [];
    } catch (error) {
      console.error("🚨 Get Project Suggestions API Error:", error);
      return [];
    }
  }

  // Get custom group suggestions sorted by most-used for a business
  async getCustomGroupSuggestionsAPI(memberId: string): Promise<string[]> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/expense/custom-group-suggestions/${memberId}`);
      return response.data.suggestions ?? [];
    } catch (error) {
      console.error("🚨 Get Custom Group Suggestions API Error:", error);
      return [];
    }
  }

  // Get note suggestions sorted by most-used for a business
  async getExpenseNoteSuggestionsAPI(memberId: string): Promise<{ note: string; sName: string; sAddress: string; sTaxId: string; group: string; taxType: string }[]> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/expense/note-suggestions/${memberId}`);
      return response.data.suggestions ?? [];
    } catch (error) {
      console.error("🚨 Get Note Suggestions API Error:", error);
      return [];
    }
  }

}

export default new CallAPIExpense();