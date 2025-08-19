import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";

class CallAPIBill {
    // Get Bills
    async getBillsAPI(memberId: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/bill/member/${memberId}`);

            console.log("🚀BillAPI:", response.data);

            return response.data;
        } catch (error) {
            console.error("🚨 Get Bills API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }

    // Get Bill by ID
    async getBillByIdAPI(billId: number): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.get(`/bill/${billId}`);
            console.log("🚀Get Bill by ID API:", response.data)
            return response.data;
        } catch (error) {
            console.error("🚨 Get Bill by ID API Error:", error)    
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
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
        payment: "COD" | "Transfer" | "CreditCard" | "Cash";
        cashStatus: boolean;
        memberId: string;
        businessAcc: number;
        storeId: number;
        image?: string;
        productItems: Array<{
            product: string;
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
                throw new Error("Network Error");
            }
        }
    }

    // Update Bill (multi-product)
    async updateBillAPI(data: {
        id: number;
        purchaseAt: Date;
        cName: string;
        cLastName: string;
        cPhone: string;
        cGender: "Female" | "Male"| "NotSpecified";
        cAddress: string;
        cPostId: string;
        cProvince: string;
        cTaxId : string;
        payment: "COD" | "Transfer" | "CreditCard" | "Cash";
        cashStatus: boolean;
        memberId: string;
        businessAcc: number;
        storeId: number;
        image?: string;
        productItems: Array<{
            product: string;
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
                throw new Error("Network Error");
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
                throw new Error("Network Error");
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
                throw new Error("Network Error");
            }
        }
    }

    // Update Document Type by ID
    async updateDocumentTypeAPI(billId: number, documentType: string): Promise<any> {
        try {
            const axiosInstance = await getAxiosWithAuth();
            const response = await axiosInstance.put(`/bill/document-type/${billId}`, {
                DocumentType: documentType
            });
            console.log("🚀Update Document Type API:", response.data);
            return response.data;
        } catch (error) {
            console.error("🚨 Update Document Type API Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw error.response.data;
            } else {
                throw new Error("Network Error");
            }
        }
    }
}
export default new CallAPIBill();