import { View, Text, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTheme } from '@/providers/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBackgroundColorClass } from '@/utils/themeUtils';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getMemberId } from '@/utils/utility';
import CallAPIStore from '@/api/store_api';
import StoreCard from '@/components/StoreCard';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import connection from '../../../backend/db';
import { CustomText } from '@/components/CustomText';

type Store = {
  id: number,
  platform: string,
  accName: string,
  accId: string,
  memberId: string
};

export default function Store() {
  const { theme } = useTheme();
    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [store, setStore] = useState<Store[]>([]);

    useEffect(() => {
      const fetchStore = async () => {
        try {
          const memberId = await getMemberId();
          if (memberId) {
            const response = await CallAPIStore.getStoresAPI(memberId);
            setStore(response);
          }
        } catch (error) {
          console.error("Error fetching store:", error);
        }
      };

      fetchStore();
    }, []);

    const onRefresh = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId) {
          const response = await CallAPIStore.getStoresAPI(memberId);
          setStore(response);
        }
      } catch (error) {
        console.error("Error fetching store:", error);
      }
      setRefreshing(false);
    };

    const handleDeleteStore = async (id: number) => {
        Alert.alert(
          "Delete",
          "Are you sure you want to delete this Store Connection?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await CallAPIStore.deleteStoreAPI(id);
                  setStore(store.filter((item) => item.id !== id));
                } catch (error) {
                  console.error("Error deleting  store connection:", error);
                }
              },
            },
          ]
        );
      };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
         <FlatList
           data={store}
           keyExtractor={(item) => item.id.toString()}
           renderItem={({ item }) => (
             <StoreCard
               platform={item.platform}
               accName={item.accName}
               accId={item.accId}
               id={item.id}
               color={theme === "dark" ? "#616161" : "#aeadac"}
               cardColor={theme === "dark" ? "#1b1b1b" : "#f2f2f2"}
               onDelete={() => handleDeleteStore(item.id)}
             />
           )}
           ListHeaderComponent={() => (
             <View className="flex my-6 px-4 space-y-6 items-center">
              {/* <Text className={`text-xl my-6 font-bold ${theme === "dark" ? "text-white" : "text-[#5d5a54]"}`}>
                 {t('store.title')}
               </Text> */}
               <CustomText className={`text-sm font-normal ${theme === "dark" ? "text-white" : "text-[#5d5a54]"}`}>
                 {t('store.limit')}
               </CustomText>
               <TouchableOpacity onPress={() => router.push("roadmap")}>
                 <Text className={`mt-1 text-base font-bold text-[#FF006E]`}>
                   {t('store.help')}
                 </Text>
               </TouchableOpacity>
             </View>
           )}
           ListEmptyComponent={() => (
             <CustomText className="pt-10 text-center text-white">{t("common.notfound")}</CustomText>
           )}
           refreshControl={
             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
           }
         />
         {/* Setting Limit Ads Connection Acc "4" */}
         {store.length < 4 && (
           <TouchableOpacity
             style={{
               position: "absolute",
               bottom: 65,
               right: 30,
               backgroundColor: "#04eccd",
               borderRadius: 50,
               padding: 15,
               elevation: 5,
             }}
             onPress={() => {
               router.push("/createstore");
             }}
           >
             <Ionicons
               name="add"
               size={24}
               color={theme === "dark" ? "#ffffff" : "#444541"}
             />
           </TouchableOpacity>
         )}
       </SafeAreaView>
    </GestureHandlerRootView>
     );
   }
