import React, { useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";


const SignUp = () => {
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [userNameError, setUserNameError] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [confirmPasswordError, setConfirmPasswordError] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignUp = async () => {
    // Reset error states
    setUserNameError(false);
    setEmailError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);

    // Validate inputs
    let hasError = false;

    if (!userName) {
      setUserNameError(true);
      hasError = true;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      hasError = true;
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      hasError = true;
    }

    if (!confirmPassword || confirmPassword !== password) {
      setConfirmPasswordError(true);
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      // Get existing users or initialize empty array
      const existingUsers = await AsyncStorage.getItem("users");
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      // Check if email already exists
      if (users.some((user: any) => user.email === email)) {
        Alert.alert("Error", "Email already registered");
        return;
      }

      // Create new user object
      const newUser = {
        user_name: userName,
        email: email,
        password: password,
        timestamp: new Date().toISOString(),
      };

      // Add new user to users array
      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));

      // Create session for new user
      const sessionData = {
        email: email,
        userName: userName,
        isAuthenticated: true,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem("userSession", JSON.stringify(sessionData));
      // Navigate to home screen
      router.replace("/(root)/(tabs)/home");
    } catch (error) {
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.replace("/(auth)/sign-in");
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>User Name</Text>
                <TextInput
                  style={[styles.input, userNameError && styles.inputError]}
                  placeholder="Enter your user name"
                  placeholderTextColor="#999"
                  onChangeText={(text: string) => {
                    setUserName(text);
                    setUserNameError(false);
                  }}
                  value={userName}
                />
                {userNameError && (
                  <Text style={styles.errorText}>
                    Please enter your user name
                  </Text>
                )}
              </View>

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
                  placeholder="Enter your password (min 6 characters)"
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
                    Password must be at least 6 characters
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    confirmPasswordError && styles.inputError,
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  onChangeText={(text: string) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError(false);
                  }}
                  value={confirmPassword}
                  secureTextEntry
                />
                {confirmPasswordError && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginLink}>Login</Text>
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
    marginBottom: 16,
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
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#453a94",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  loginText: {
    color: "white",
    fontSize: 16,
  },
  loginLink: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default SignUp;
