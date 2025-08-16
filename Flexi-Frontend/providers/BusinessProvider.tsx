import React, { createContext, useContext, useState, useEffect } from "react";
import CallAPIBusiness from "@/api/business_api";
import { getMemberId } from "@/utils/utility";

interface BusinessContextProps {
  businessAvatar: string | null;
  businessName: string | null;
  businessType: string | null;
  DocumentType: string[] | null;
  vat: boolean | null;
  fetchBusinessData: () => void;
  triggerFetch: () => void;
}

const BusinessContext = createContext<BusinessContextProps>({
  businessAvatar: null,
  businessName: null,
  businessType: null,
  DocumentType: null,
  vat: null,
  fetchBusinessData: () => {},
  triggerFetch: () => {},
});

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businessAvatar, setBusinessAvatar] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [DocumentType, setDocumentType] = useState<string[] | null>(null);
  const [vat, setVat] = useState<boolean | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState<boolean>(false);

  const fetchBusinessData = async () => {
    try {
      const memberId = await getMemberId();
      if (memberId !== null) {
        const response = await CallAPIBusiness.getBusinessAvatarAPI(memberId);
        setBusinessAvatar(response.businessAvatar);
        setBusinessName(response.businessName);
        setBusinessType(response.businessType ?? null);
        setDocumentType(response.DocumentType ?? null);
        setVat(response.vat ?? null);
      }
    } catch (error) {
      console.error("Error fetching business data:", error);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, [fetchTrigger]);

  const triggerFetch = () => {
    setFetchTrigger((prev) => !prev);
  };

  return (
    <BusinessContext.Provider value={{ businessAvatar, businessName, businessType, DocumentType, vat, fetchBusinessData, triggerFetch }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => useContext(BusinessContext);
