import { View, Text } from "react-native";
import React from "react";


const formatDate = (dateString: string) => {
  const month = new Date(dateString);
  // const year = month.getFullYear();
  const monthName = month.toLocaleString("default", { month: "long" });
  return `${monthName} `;
  // return `${monthName} ${year}`;
};

export default function MonthlyCard({
  month,
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
              {formatDate(month)}
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
              numberOfLines={1}
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
