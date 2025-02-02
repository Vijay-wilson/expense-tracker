import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
interface UserData {
  email: string;
  userName: string;
  timestamp: string;
  profilePicture?: string;
  phoneNumber?: string;
  accountType?: string;
  lastActive?: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setError(null);
      const sessionData = await AsyncStorage.getItem("userSession");
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        setUserData(parsedData);
      } else {
        setError("No user session found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserData().finally(() => setRefreshing(false));
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userSession");
            router.replace("/(auth)/sign-in");
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const ProfileItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.profileItem}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#3949AB", "#3949AB", "#8EC5FC"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={styles.logoutButton}
                >
                  <MaterialIcons name="logout" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={48} color="white" />
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchUserData}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : userData ? (
                <View style={styles.profileContainer}>
                  <View style={styles.avatarContainer}>
                    {userData.profilePicture ? (
                      <Image
                        source={{ uri: userData.profilePicture }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {userData.userName?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <ProfileItem label="Email" value={userData.email} />
                  <ProfileItem label="Username" value={userData.userName} />
                  {userData.phoneNumber && (
                    <ProfileItem label="Phone" value={userData.phoneNumber} />
                  )}
                  {userData.accountType && (
                    <ProfileItem
                      label="Account Type"
                      value={userData.accountType}
                    />
                  )}
                  <ProfileItem
                    label="Last Login"
                    value={new Date(userData.timestamp).toLocaleString()}
                  />
                  {userData.lastActive && (
                    <ProfileItem
                      label="Last Active"
                      value={userData.lastActive}
                    />
                  )}
                </View>
              ) : (
                <Text style={styles.noDataText}>No user data found.</Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  profileContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "white",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  avatarText: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
  },
  editButton: {
    position: "absolute",
    right: -10,
    bottom: 0,
    backgroundColor: "#3949AB",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  profileItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 8,
  },
  label: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  noDataText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3949AB",
  },
  loadingText: {
    color: "white",
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginTop: 12,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#3949AB",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    padding: 8,
  },
});

export default Profile;
