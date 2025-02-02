import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  count?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, count }) => (
  <View className="items-center">
    <View className={`p-2 rounded-full ${focused ? "bg-blue-100" : ""}`}>
      <Ionicons 
        name={name} 
        size={24} 
        color={focused ? "#3b82f6" : "#6b7280"} 
      />
      {count !== undefined && count > 0 && (
        <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
          <Text className="text-white text-xs font-bold">{count}</Text>
        </View>
      )}
    </View>
    {focused && (
      <View className="mt-1 w-1 h-1 rounded-full bg-blue-500" />
    )}
  </View>
);

interface CartItem {
  id: string;
  name: string;
  price: number;
}

export default function Layout() {

  const [selectedItemsList, setSelectedItemsList] = useState<CartItem[]>([]);

  useEffect(() => {
    fetchSelectedItemsListFromAsyncStorage();
  }, [selectedItemsList]);

  const fetchSelectedItemsListFromAsyncStorage = async () => {
    try {
      const storedSelectedItemsList = await AsyncStorage.getItem("cartItems");
      if (storedSelectedItemsList !== null) {
        const parsedSelectedItemsList: CartItem[] = JSON.parse(
          storedSelectedItemsList
        );
        setSelectedItemsList(parsedSelectedItemsList);
      }
    } catch (error) {
      console.error(
        "Error retrieving selectedItemsList from AsyncStorage:",
        error
      );
    }
  };

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}