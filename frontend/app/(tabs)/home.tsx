// rnf
import React, { useState } from 'react'
import { FlatList, View, Text, RefreshControl } from 'react-native'
import { SafeAreaView } from "react-native-safe-area-context"
import ProductCard from '@/components/ProductCard'

export default function Home() {

  // Product Data
  const products = [
    {
      id: 1,
      name: "Python Django 5 with Next.JS 15 and Supabase",
      price: 535,
      imgurl:
        "https://www.itgenius.co.th/assets/frondend/images/picturecourse/workshop_django_nextjs.jpg",
    },
    {
      id: 2,
      name: "React Native with Expo",
      price: 299,
      imgurl:
        "https://www.itgenius.co.th/assets/frondend/images/picturecourse/Basic_React_Native_Expo_Pic_Course.jpg",
    },
    {
      id: 3,
      name: "Basic Vue and Nuxt 3 with Prisma and Supabase",
      price: 399,
      imgurl:
        "https://www.itgenius.co.th/assets/frondend/images/picturecourse/Basic_Vue_Nuxt_Pic_Course.jpg",
    },
    {
      id: 4,
      name: "Basic Kubernetes (K8s) for Web Developer",
      price: 599,
      imgurl:
        "https://www.itgenius.co.th/assets/frondend/images/picturecourse/k8s-for-dev-cover.jpg",
    },
    {
      id: 5,
      name: "Internet of Things with MicroPython สำหรับผู้เริ่มต้น",
      price: 499,
      imgurl:
        "https://www.itgenius.co.th/assets/frondend/images/picturecourse/IOT_MicroPython_Cover.jpg",
    },
    {
      id: 6,
      name: "Full Stack Web Application with Go and React",
      price: 329,
      imgurl:
        "https://www.itgenius.co.th/assets/frondend/images/picturecourse/Go_and_React_PicCourse.jpg",
    },
    {
      id: 7,
      name: "Workshop Web API Spring Boot 3 Kotlin with Nuxt 3 and Docker",
      price: 379,
      imgurl:
        "https://www.itgenius.co.th/assets/frondend/images/picturecourse/SpringBoot3_With_Nuxt3_PicCourse.jpg",
    },
    {
      id: 8,
      name: "Workshop Laravel 11 with Vue 3",
      price: 389,
      imgurl:
        "https://www.itgenius.co.th/assets/frondend/images/picturecourse/Laravel11_Vue3_Pic_Course.jpg",
    },
    {
      id: 9,
      name: "Workshop Angular 17 with .NET Core 8",
      price: 989,
      imgurl:
        "https://www.itgenius.co.th/assets/frondend/images/picturecourse/Angular_with_NET8_PictureCourse.jpg",
    },
    {
      id: 10,
      name: "สร้างรายงานด้วย Power BI ร่วมกับ Power Query สำหรับผู้เริ่มต้น",
      price: 890,
      imgurl:
        "https://www.itgenius.co.th/assets/frondend/images/picturecourse/PowerBI_With_Power_Query_Pic_Course.jpg",
    },
  ]

  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    // Fetch Data from API
    console.log('Fetching Data...')
    setRefreshing(false)
  }

  return (
    <SafeAreaView className='px-4 bg-primary h-full'>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            productname={item.name}
            productprice={item.price}
            productimage={item.imgurl}
          />
        )}
        ListHeaderComponent={() => (
          <View className="flex my-6 px-4 space-y-6">
              <Text className="text-2xl font-semibold text-white">Products</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text className="text-center text-white">No products found</Text>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  )
}