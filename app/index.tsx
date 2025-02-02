import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar, View } from "react-native";
import useUserStore from "@/store/useUserStore";

interface UserSession {
  email: string;
  userName: string;
  isAuthenticated: boolean;
  timestamp: string;
}

const Page = () => {
  const { setUserData, clearUserData } = useUserStore();
  const [status, setStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async (): Promise<void> => {
      try {
        const data = await AsyncStorage.getItem("userSession");
        
        if (!data) {
          setStatus(false);
          setIsLoading(false);
          return;
        }

        const parsedData: UserSession = JSON.parse(data);
        
        // Check isAuthenticated directly from the root level
        if (parsedData && parsedData.isAuthenticated) {
          setUserData(parsedData);
          setStatus(true);
        } else {
          setStatus(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        clearUserData();
        setStatus(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [setUserData, clearUserData]);

  if (isLoading || status === null) {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <StatusBar backgroundColor="grey" barStyle="dark-content" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="grey" barStyle="dark-content" />
      {status ? (
        <Redirect href="/(root)/(tabs)/home" />
      ) : (
        <Redirect href="/(auth)/sign-in" />
      )}
    </View>
  );
};

export default Page;