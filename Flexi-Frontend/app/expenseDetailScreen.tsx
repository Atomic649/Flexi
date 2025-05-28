import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import ExpenseDetail from './expenseDetail';
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";

export default function ExpenseDetailScreen() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  
  // Extract and validate parameters from the router
  const id = typeof params.id === 'string' ? parseInt(params.id, 10) : 0;
  const date = typeof params.date === 'string' ? params.date : '';
  const expenses = typeof params.expenses === 'string' ? params.expenses : '';
  const note = typeof params.note === 'string' ? params.note : '';
  const desc = typeof params.desc === 'string' ? params.desc : '';
  const image = typeof params.image === 'string' ? params.image : '';
  const type = typeof params.type === 'string' ? params.type : '';

  // For debugging purposes
  useEffect(() => {
    console.log('ExpenseDetailScreen params:', params);
  }, [params]);

  // Function to close the modal and navigate back
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.back();
    }, 100);
  };

  // If any required parameter is missing, show an error and navigate back
  if (!id || !date) {
    return (
      <View className={`flex-1 justify-center items-center`}
        style={{ backgroundColor: theme === "dark" ? "#000000aa" : "#bfbfbfaa"}}>
        <Text style={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}>
          Invalid expense data. Missing required parameters.
        </Text>
        {setTimeout(() => router.back(), 2000)}
      </View>
    );
  }

  return (
    <View className={`flex-1 ${useBackgroundColorClass()}`}>
      <ExpenseDetail
        visible={isVisible}
        onClose={handleClose}
        expense={{
          id,
          date,
          amount: expenses,
          note,
          desc,
          image,
          group: '' // The group might not be passed through params, get it from the API call
        }}
      />
    </View>
  );
}