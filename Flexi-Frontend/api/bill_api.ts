import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { t } from "i18next";

class CallAPIBill {
    // Get Bills
    async getBillsAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/bill/member/${memberId}`);

         //   console.log("🚀BillAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Bills API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Get Bill by ID
    async getBillByIdAPI(billId: number): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/bill/${billId}`);
        //    console.log("🚀Get Bill by ID API:", response.data)
            return response.data;
        } catch (error) {
            console.error("🚨 Get Bill by ID API Error:", error)    
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }
    
    // Create Bill (multi-product)
    async createBillAPI(data: {
        id?: number;
        createdAt?: Date;
        updatedAt?: Date;
        purchaseAt: Date;
        cName: string;
        cLastName: string;
        cPhone: string;
        cGender: "Female" | "Male"| "NotSpecified";
        cAddress: string;
        cPostId: string;
        cTaxId: string;
        cProvince: string;
        cCountry?: string;
        updateCustomer?: boolean;
        payment: "COD" | "Transfer" | "CreditCard" | "Cash"| "NotSpecified";
        memberId: string;
        businessAcc: number;
        platform: string;
        image?: string;
        productItems: Array<{
            product: number;
            unitPrice: number;
            quantity: number;
            unitDiscount?: number;
        }>;
        repeat: boolean;
        repeatMonths: number;
        DocumentType: ("Bill" | "Invoice" | "Receipt" | "Quotation")[];
        note?: string; // Optional note field
        discount?: number; // Optional discount field
        priceValid?: Date; // Optional price validity field
        validContactUntil?: Date; // Optional valid contact date
        paymentTermCondition?: string; // Optional payment term condition
        remark?: string; // Optional remark
        taxType?: "Juristic" | "Individual"; // Optional tax type
        withholdingTax?: boolean; // Optional withholding tax
        withholdingPercent?: number; // Optional withholding
        WHTAmount?: number; // Optional WHT amount
        isExport?: boolean; // Optional export flag (non-Thai address)
    }): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.post("/bill", data);

            console.log("🚀Create Bill API:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Create Bill API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Update Bill (multi-product)
    async updateBillAPI(data: {
        id: number;
        purchaseAt: Date;
        quotationAt?: Date;
        invoiceAt?: Date;
        cName: string;
        cLastName: string;
        cPhone: string;
        cGender: "Female" | "Male"| "NotSpecified";
        cAddress: string;
        cPostId: string;
        cProvince: string;
        cCountry?: string;
        cTaxId : string;
        payment: "COD" | "Transfer" | "CreditCard" | "Cash"| "NotSpecified";
        memberId: string;
        businessAcc: number;
        platform: string;
        image?: string;
        productItems: Array<{
            product: number;
            unitPrice: number;
            quantity: number;
            unitDiscount?: number;
        }>;
        repeat: boolean;
        repeatMonths: number;
        DocumentType: ("Bill" | "Invoice" | "Receipt" | "Quotation")[];
        note?: string; // Optional note field
        discount?: number; // Optional discount field
        priceValid?: Date; // Optional price validity field
        validContactUntil?: Date; // Optional valid contact date
        paymentTermCondition?: string; // Optional payment term condition
        remark?: string; // Optional remark
        taxType?: "Juristic" | "Individual"; // Optional tax type
        withholdingTax?: boolean; // Optional withholding tax
        withholdingPercent?: number; // Optional withholding
        WHTAmount?: number; // Optional WHT amount
        projectId?: number; // Optional project link
        isExport?: boolean; // Optional export flag (non-Thai address)
    }): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.put(`/bill/${data.id}`, data);

            console.log("🚀Update Bill API:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Update Bill API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Delete Bill
    async deleteBillAPI(billId: number): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.delete(`/bill/${billId}`);
            
            console.log("🚀Delete Bill API:", response.data);
            
            return response.data;
        } catch (error) {
            console.error("🚨 Delete Bill API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Get whole year sales from bills by memberId
    async getYearlySalesAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/bill/yearly/sales`, {
                params: { memberId }
            });
            console.log("🚀Get Yearly Sales API:", response.data);
            return response.data;
        } catch (error) {
            console.error("🚨 Get Yearly Sales API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Get distinct country values used in bills for a member (export dropdown history)
    async getCountryEnumAPI(memberId: string): Promise<string[]> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/bill/countryEnum/${memberId}`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error("🚨 Get Country Enum API Error:", error);
            return [];
        }
    }

    // Update Document Type by ID
    async updateDocumentTypeAPI(billId: number, documentType: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.put(`/bill/document-type/${billId}`, {
                DocumentType: documentType
            });
          //  console.log("🚀Update Document Type API:", response.data);
            return response.data;
        } catch (error) {
            console.error("🚨 Update Document Type API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Lookup Bill by flexiId (no auth — B2B expense auto-fill)
    async lookupBillByFlexiIdAPI(flexiId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/bill/lookup/${encodeURIComponent(flexiId.trim())}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Create split children from a parent Invoice bill
    async createSplitChildrenAPI(
        parentId: number,
        children: { splitPercent: number; splitPercentMax: number }[],
    ): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.post(`/bill/split/${parentId}`, { children });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Reset split parent back to Quotation (deletes all children)
    async resetParentSplitAPI(parentId: number): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.delete(`/bill/split/${parentId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }

    // Get full bill data by flexiId — authenticated, for PDF rendering
    async getBillByFlexiIdAPI(flexiId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/bill/flexi/${encodeURIComponent(flexiId.trim())}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error(t("common.networkError"));
            }
        }
    }
}
export default new CallAPIBill();