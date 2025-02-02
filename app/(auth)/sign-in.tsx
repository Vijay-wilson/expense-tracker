import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const Signin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { setEmail: setGlobalEmail } = useAuthStore();

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const userSession = await AsyncStorage.getItem("userSession");
      if (userSession) {
        router.replace("/(root)/(tabs)/home");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const handleSignIn = async (): Promise<void> => {
    // Reset errors
    setEmailError(false);
    setPasswordError(false);

    // Validate inputs
    if (!email || !password) {
      if (!email) setEmailError(true);
      if (!password) setPasswordError(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(true);
      return;
    }

    try {
      setLoading(true);

      // Get stored user data
      const storedUsers = await AsyncStorage.getItem("users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Find user with matching credentials
      const user = users.find(
        (u: any) => u.email === email.trim() && u.password === password
      );

      if (user) {
        // Store session data
        const sessionData = {
          email: user.email,
          userName: user.user_name,
          isAuthenticated: true,
          timestamp: new Date().toISOString(),
        };
        await AsyncStorage.setItem("userSession", JSON.stringify(sessionData));
        setGlobalEmail(email);

        // Navigate to home
        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert("Error", "Invalid email or password");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/(auth)/sign-up");
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#8EC5FC", "#3949AB", "#3949AB"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.container}>
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  onChangeText={(text: string) => {
                    setEmail(text);
                    setEmailError(false);
                  }}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailError && (
                  <Text style={styles.errorText}>
                    Please enter a valid email
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.input, passwordError && styles.inputError]}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  onChangeText={(text: string) => {
                    setPassword(text);
                    setPasswordError(false);
                  }}
                  value={password}
                  secureTextEntry
                />
                {passwordError && (
                  <Text style={styles.errorText}>
                    Please enter your password
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#e0e0e0",
    marginBottom: 32,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    color: "white",
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    width: "100%",
    height: 60,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "black",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  errorText: {
    color: "white",
    marginTop: 4,
  },
  button: {
    width: "100%",
    height: 60,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#453a94",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  signupText: {
    color: "white",
    fontSize: 16,
  },
  signupLink: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default Signin;
