import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';




// Function to check the network status
export const checkNetwork = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected ?? false;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
};

// Function to save the token to AsyncStorage
export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('token', token);
    // console.log('💾 Token saved:', token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Function to get the token from AsyncStorage
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    // console.log('✅ Token Get :', token);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Function to remove the token from AsyncStorage
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    // console.log('🗑️ Token removed');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Function to save userId  to AsyncStorage
export const saveUserId = async (userId: number) => {
  try {
    await AsyncStorage.setItem('userId', userId.toString());
    // console.log('💾 userId saved:', userId);
  } catch (error) {
    console.error('Error saving userId:', error);
  }
}

// Function to get userId from AsyncStorage and convert it to number
export const getUserId = async (): Promise<number | null> => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    console.log('✅ userId Get :', userId);
    return userId ? parseInt(userId) : null;
  } catch (error) {
    console.error('Error getting userId:', error);
    return null;
  }
}

// Fuction to save meberId to AsyncStorage
export const saveMemberId = async (memberId: string) => {
  try {
    // Ensure a plain string is stored to avoid AsyncStorage warnings
    const value = String(memberId);
    await AsyncStorage.setItem('memberId', value);
    // console.log('💾 memberId saved:', memberId);
  } catch (error) {
    console.error('Error saving memberId:', error);
  }
}

// Function to get memberId from AsyncStorage
export const getMemberId = async (): Promise<string | null> => {
  try {
    const memberId = await AsyncStorage.getItem('memberId');
   // console.log('✅ memberId Get :', memberId);
    return memberId;
  } catch (error) {
    console.error('Error getting memberId:', error);
    return null;
  }
}

// Function to remove memberId from AsyncStorage
export const removeMemberId = async () => {
  try {
    await AsyncStorage.removeItem('memberId');
    // console.log('🗑️ memberId removed');
  } catch (error) {
    console.error('Error removing memberId:', error);
  }
}

// Function to replace memberId from AsyncStorage
export const replaceMemberId = async (memberId: string) => {
  try {
    await AsyncStorage.removeItem('memberId');
    const value = String(memberId);
    await AsyncStorage.setItem('memberId', value);       
    // console.log('🔄 memberId replaced:', memberId);
  } catch (error) {
    console.error('Error replacing memberId:', error);
  }
}

// Function to save businessId to AsyncStorage
export const saveBusinessId = async (businessId: number) => {
  try {
    await AsyncStorage.setItem('businessId', businessId.toString());
    console.log('💾 businessId saved:', businessId);
  } catch (error) {
    console.error('Error saving businessId:', error);
  }
}

// Function to get businessId from AsyncStorage
export const getBusinessId = async (): Promise<number | null> => {
  try {
    const businessId = await AsyncStorage.getItem('businessId');
    // console.log('✅ businessId Get :', businessId);
    return businessId ? parseInt(businessId) : null;
  } catch (error) {
    console.error('Error getting businessId:', error);
    return null;
  }
}

// Function to remove businessId from AsyncStorage
export const removeBusinessId = async () => {
  try {
    await AsyncStorage.removeItem('businessId');
    console.log('🗑️ businessId removed');
  } catch (error) {
    console.error('Error removing businessId:', error);
  }
}

//Function to save paymentTermCondition
export const savePaymentTermCondition = async (paymentTermCondition: string, memberId: string) => {
  try {
    await AsyncStorage.setItem(`paymentTermCondition_${memberId}`, paymentTermCondition);
    // console.log(`💾 paymentTermCondition saved for member ${memberId}:`, paymentTermCondition);
  } catch (error) {
    console.error('Error saving paymentTermCondition:', error);
  }
}

// Function to get paymentTermCondition from AsyncStorage
export const getPaymentTermCondition = async (memberId: string): Promise<string | null> => {
  try {
    const paymentTermCondition = await AsyncStorage.getItem(`paymentTermCondition_${memberId}`);
    // console.log(`✅ paymentTermCondition Get for member ${memberId}:`, paymentTermCondition);
    return paymentTermCondition;
  } catch (error) {
    console.error('Error getting paymentTermCondition:', error);
    return null;
  }
}

// Function to remove paymentTermCondition from AsyncStorage
export const removePaymentTermCondition = async (memberId: string) => {
  try {
    await AsyncStorage.removeItem(`paymentTermCondition_${memberId}`);
    // console.log(`🗑️ paymentTermCondition removed for member ${memberId}`);
  } catch (error) {
    console.error('Error removing paymentTermCondition:', error);
  }
}

//Function to save remark
export const saveRemark = async (remark: string, memberId: string) => {
  try {
    await AsyncStorage.setItem(`remark_${memberId}`, remark);
    // console.log(`💾 remark saved for member ${memberId}:`, remark);
  } catch (error) {
    console.error('Error saving remark:', error);
  }
}

// Function to get remark from AsyncStorage
export const getRemark = async (memberId: string): Promise<string | null> => {
  try {
    const remark = await AsyncStorage.getItem(`remark_${memberId}`);
    // console.log(`✅ remark Get for member ${memberId}:`, remark);
    return remark;
  } catch (error) {
    console.error('Error getting remark:', error);
    return null;
  }
}

// Function to remove remark from AsyncStorage
export const removeRemark = async (memberId: string) => {
  try {
    await AsyncStorage.removeItem(`remark_${memberId}`);
    // console.log(`🗑️ remark removed for member ${memberId}`);
  } catch (error) {
    console.error('Error removing remark:', error);
  }
}