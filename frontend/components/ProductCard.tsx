import { View, Text, Image } from 'react-native'
import React from 'react'
import { icons } from '@/constants'

export default function ProductCard({
    productname, 
    productprice,
    productimage
}: any) {
  return (
    <View className="flex flex-col items-center px-4 my-2">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[90px] h-[90px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={{uri: productimage}}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-lg text-white"
              numberOfLines={3}
            >
              {productname}
            </Text>
            <Text
              className="text-xl text-gray-100 font-pregular"
              numberOfLines={1}
            >
             {productprice}
            </Text>
          </View>
        </View>

        <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>
    </View>
  )
}