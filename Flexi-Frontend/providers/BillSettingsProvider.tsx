import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BillCardMode = 'products' | 'project';

interface BillSettingsContextType {
  billCardMode: BillCardMode;
  setBillCardMode: (mode: BillCardMode) => Promise<void>;
}

const BillSettingsContext = createContext<BillSettingsContextType | undefined>(undefined);

export const BillSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [billCardMode, setBillCardModeState] = useState<BillCardMode>('products');

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem('billCardMode');
        if (saved === 'products' || saved === 'project') {
          setBillCardModeState(saved);
        }
      } catch {}
    };
    load();
  }, []);

  const setBillCardMode = async (mode: BillCardMode) => {
    try {
      await AsyncStorage.setItem('billCardMode', mode);
      setBillCardModeState(mode);
    } catch {}
  };

  return (
    <BillSettingsContext.Provider value={{ billCardMode, setBillCardMode }}>
      {children}
    </BillSettingsContext.Provider>
  );
};

export const useBillSettings = (): BillSettingsContextType => {
  const context = useContext(BillSettingsContext);
  if (!context) throw new Error('useBillSettings must be used within BillSettingsProvider');
  return context;
};
