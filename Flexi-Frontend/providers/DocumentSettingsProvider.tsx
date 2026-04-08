import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'documentSettings';

export interface DocumentSettingsState {
  // Bill form fields
  showNote: boolean;
  showPaymentTerms: boolean;
  showRemark: boolean;
  showWithholdingTax: boolean;
  showBillLevelDiscount: boolean;
  showProject: boolean;
  showProductDescription: boolean;
  // PDF display
  pdfShowProject: boolean;
  pdfShowWithholdingTax: boolean;
  pdfShowBranch: boolean;
}

const defaults: DocumentSettingsState = {
  showNote: true,
  showPaymentTerms: true,
  showRemark: true,
  showWithholdingTax: true,
  showBillLevelDiscount: true,
  showProject: true,
  showProductDescription: false,
  pdfShowProject: true,
  pdfShowWithholdingTax: true,
  pdfShowBranch: true,
};

interface DocumentSettingsContextType {
  settings: DocumentSettingsState;
  setSetting: (key: keyof DocumentSettingsState, value: boolean) => Promise<void>;
}

const DocumentSettingsContext = createContext<DocumentSettingsContextType | undefined>(undefined);

export const DocumentSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<DocumentSettingsState>(defaults);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSettings({ ...defaults, ...JSON.parse(saved) });
        }
      } catch {}
    };
    load();
  }, []);

  const setSetting = async (key: keyof DocumentSettingsState, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  return (
    <DocumentSettingsContext.Provider value={{ settings, setSetting }}>
      {children}
    </DocumentSettingsContext.Provider>
  );
};

export const useDocumentSettings = (): DocumentSettingsContextType => {
  const context = useContext(DocumentSettingsContext);
  if (!context) throw new Error('useDocumentSettings must be used within DocumentSettingsProvider');
  return context;
};
