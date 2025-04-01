import { View, Text } from "react-native";
import React from "react";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DailyCard({
  date,
  amount,
  sale,
  adsCost,
  profit,
  percentageAds,
  ROI,
  tableColor,
}: any) {
  return (
    <View className="flex ">
      <View className={`flex flex-col items-end `} style={{ backgroundColor: tableColor,
        borderBottomWidth: 1,
        borderColor: "rgba(92, 91, 91, 0.45)",        
        borderStyle: "solid",
        marginTop: 5,
       }}>
        <View className="flex flex-row m-2 items-start justify-evenly w-full pl-5 px-5">
          <View className="flex flex-col items-start w-1/5">
            <Text
              className="text-sm text-zinc-500 font-normal "
              numberOfLines={1}
            >
              {formatDate(date)}
            </Text>
          </View>
          
          <View className="flex flex-col items-center w-1/6">
            <Text
              className="text-sm text-zinc-500 font-normal justify-center"
              numberOfLines={1}
            >
              {amount}
            </Text>
          </View>

          <View className="flex flex-col items-center w-1/6">
            <Text
              className="font-normal text-sm text-zinc-500 items-end justify-end"
              numberOfLines={3}
            >
              {sale}
            </Text>
          </View>
        
          <View className="flex flex-col items-center w-1/6">
            <Text
              className="text-sm text-zinc-500  font-normal justify-end"
              style={{}}
              numberOfLines={1}
            >
              {adsCost}
            </Text>
          </View>

          <View className="flex flex-col items-center w-1/6">
            <Text
              className={`text-base font-bold justify-end ${profit >= 0 ? 'text-teal-500' : 'text-[#FF006E]'}`}
              numberOfLines={1}
            >
              {profit}
            </Text>
          </View>
          <View className="flex flex-col items-center w-1/6">
            <Text
              className={`text-sm font-normal justify-end text-zinc-500   `}
              numberOfLines={1}
            >
              {percentageAds}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
