import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

// Define the shape of the context
interface MarketingContextType {
  marketingPreference: string;
  setMarketingPreference: (value: string) => Promise<void>;
}

// Create the context with a default value
const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

interface MarketingProviderProps {
  children: ReactNode;
}

export const MarketingProvider: React.FC<MarketingProviderProps> = ({ children }) => {
  const [marketingPreference, setMarketingPreferenceState] = useState<string>('ads'); // Default to 'ads'

  // Load the preference when the provider mounts
  useEffect(() => {
    const loadPreference = async () => {
      try {
        // Try to load from API/server in the future
        const savedPreference = await AsyncStorage.getItem('marketingPreference');
        if (savedPreference) {
          setMarketingPreferenceState(savedPreference);
        }
      } catch (error) {
        console.error('Error loading marketing preference:', error);
      }
    };

    loadPreference();
  }, []);

  // Function to update the preference
  const setMarketingPreference = async (value: string) => {
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('marketingPreference', value);
      
      // Update local state
      setMarketingPreferenceState(value);
      
      // Emit an event that components can listen for
      DeviceEventEmitter.emit('marketingPreferenceChanged', { preference: value });
      
      console.log('Marketing preference saved:', value);
    } catch (error) {
      console.error('Error saving marketing preference:', error);
    }
  };

  return (
    <MarketingContext.Provider
      value={{
        marketingPreference,
        setMarketingPreference,
      }}
    >
      {children}
    </MarketingContext.Provider>
  );
};

// Custom hook to use the marketing context
export const useMarketing = (): MarketingContextType => {
  const context = useContext(MarketingContext);
  if (context === undefined) {
    throw new Error('useMarketing must be used within a MarketingProvider');
  }
  return context;
};