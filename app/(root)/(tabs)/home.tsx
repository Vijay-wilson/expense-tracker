import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Header";
import ExpenseManagement from "@/components/ExpenseManagement";
import { LinearGradient } from "expo-linear-gradient";
const Home = () => {


  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

    })();
  }, []);



  return (
    <LinearGradient
      colors={[ "#3949AB", "#3949AB","#8EC5FC",]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header />
        <ExpenseManagement />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Home;
