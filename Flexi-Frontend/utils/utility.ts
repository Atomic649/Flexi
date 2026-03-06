import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

// Platform-aware secure storage: SecureStore on native, AsyncStorage on web
const secureGet = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};
const secureSet = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
  return SecureStore.setItemAsync(key, value);
};
const secureDelete = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') return AsyncStorage.removeItem(key);
  return SecureStore.deleteItemAsync(key);
};


// Function to check the network status
export const checkNetwork = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected ?? false;
  } catch (error) {
    console.error('Error checking network status:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

// Function to save the token
export const saveToken = async (token: string) => {
  try {
    await secureSet('token', token);
  } catch (error) {
    console.error('Error saving token:', error instanceof Error ? error.message : 'Unknown error');
  }
};

// Function to get the token — migrates from legacy AsyncStorage on native if needed
export const getToken = async (): Promise<string | null> => {
  try {
    const value = await secureGet('token');
    if (value) return value;

    // Migration (native only): token was previously stored in plain AsyncStorage
    if (Platform.OS !== 'web') {
      const legacy = await AsyncStorage.getItem('token');
      if (legacy) {
        await SecureStore.setItemAsync('token', legacy);
        await AsyncStorage.removeItem('token');
        return legacy;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting token:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

// Function to remove the token
export const removeToken = async () => {
  try {
    await secureDelete('token');
    if (Platform.OS !== 'web') await AsyncStorage.removeItem('token'); // clean up legacy location
  } catch (error) {
    console.error('Error removing token:', error instanceof Error ? error.message : 'Unknown error');
  }
};

// Function to save userId to AsyncStorage
export const saveUserId = async (userId: number) => {
  try {
    await AsyncStorage.setItem('userId', userId.toString());
  } catch (error) {
    console.error('Error saving userId:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Function to get userId from AsyncStorage and convert it to number
export const getUserId = async (): Promise<number | null> => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  } catch (error) {
    console.error('Error getting userId:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Function to save memberId
export const saveMemberId = async (memberId: string) => {
  try {
    await secureSet('memberId', String(memberId));
  } catch (error) {
    console.error('Error saving memberId:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Function to get memberId — migrates from legacy AsyncStorage on native if needed
export const getMemberId = async (): Promise<string | null> => {
  try {
    const value = await secureGet('memberId');
    if (value) return value;

    if (Platform.OS !== 'web') {
      const legacy = await AsyncStorage.getItem('memberId');
      if (legacy) {
        await SecureStore.setItemAsync('memberId', legacy);
        await AsyncStorage.removeItem('memberId');
        return legacy;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting memberId:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Function to remove memberId
export const removeMemberId = async () => {
  try {
    await secureDelete('memberId');
    if (Platform.OS !== 'web') await AsyncStorage.removeItem('memberId');
  } catch (error) {
    console.error('Error removing memberId:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Function to replace memberId
export const replaceMemberId = async (memberId: string) => {
  try {
    await secureSet('memberId', String(memberId));
    if (Platform.OS !== 'web') await AsyncStorage.removeItem('memberId');
  } catch (error) {
    console.error('Error replacing memberId:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Function to save businessId
export const saveBusinessId = async (businessId: number) => {
  try {
    await secureSet('businessId', businessId.toString());
  } catch (error) {
    console.error('Error saving businessId:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Function to get businessId — migrates from legacy AsyncStorage on native if needed
export const getBusinessId = async (): Promise<number | null> => {
  try {
    const value = await secureGet('businessId');
    if (value) return parseInt(value);

    if (Platform.OS !== 'web') {
      const legacy = await AsyncStorage.getItem('businessId');
      if (legacy) {
        await SecureStore.setItemAsync('businessId', legacy);
        await AsyncStorage.removeItem('businessId');
        return parseInt(legacy);
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting businessId:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Function to remove businessId
export const removeBusinessId = async () => {
  try {
    await secureDelete('businessId');
    if (Platform.OS !== 'web') await AsyncStorage.removeItem('businessId');
  } catch (error) {
    console.error('Error removing businessId:', error instanceof Error ? error.message : 'Unknown error');
  }
}

//Function to save paymentTermCondition
export const savePaymentTermCondition = async (paymentTermCondition: string, memberId: string) => {
  try {
    await AsyncStorage.setItem(`paymentTermCondition_${memberId}`, paymentTermCondition);
  } catch (error) {
    console.error('Error saving paymentTermCondition:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Function to get paymentTermCondition from AsyncStorage
export const getPaymentTermCondition = async (memberId: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(`paymentTermCondition_${memberId}`);
  } catch (error) {
    console.error('Error getting paymentTermCondition:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Function to remove paymentTermCondition from AsyncStorage
export const removePaymentTermCondition = async (memberId: string) => {
  try {
    await AsyncStorage.removeItem(`paymentTermCondition_${memberId}`);
  } catch (error) {
    console.error('Error removing paymentTermCondition:', error instanceof Error ? error.message : 'Unknown error');
  }
}

//Function to save remark
export const saveRemark = async (remark: string, memberId: string) => {
  try {
    await AsyncStorage.setItem(`remark_${memberId}`, remark);
  } catch (error) {
    console.error('Error saving remark:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Function to get remark from AsyncStorage
export const getRemark = async (memberId: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(`remark_${memberId}`);
  } catch (error) {
    console.error('Error getting remark:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Function to remove remark from AsyncStorage
export const removeRemark = async (memberId: string) => {
  try {
    await AsyncStorage.removeItem(`remark_${memberId}`);
  } catch (error) {
    console.error('Error removing remark:', error instanceof Error ? error.message : 'Unknown error');
  }
}
