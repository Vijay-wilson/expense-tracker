import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

// Category Icons and Colors
const CATEGORIES = {
  food: { icon: "restaurant-outline", color: "#F59E0B" },
  transport: { icon: "car-outline", color: "#3B82F6" },
  shopping: { icon: "cart-outline", color: "#EC4899" },
  entertainment: { icon: "film-outline", color: "#8B5CF6" },
  bills: { icon: "receipt-outline", color: "#EF4444" },
  other: { icon: "ellipsis-horizontal-outline", color: "#6B7280" },
};

// Enhanced Header Component with Chart
const Header = ({ totalBalance, transactions }) => {
  const getChartData = () => {
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      })
      .reverse();

    const data = last7Days.map((date) => {
      const dayTotal = transactions
        .filter((t) => t.date.startsWith(date))
        .reduce((sum, t) => sum + t.amount, 0);
      return dayTotal;
    });

    return {
      labels: last7Days.map((date) => date.split("-")[2]),
      datasets: [{ data }],
    };
  };

  return (
    <View className="bg-white p-4 rounded-b-3xl shadow-lg mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-gray-500">Total Balance</Text>
          <Text className="text-3xl font-bold">
            ₹{totalBalance.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity className="bg-indigo-100 p-3 rounded-full">
          <Ionicons name="notifications-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <View className="h-200">
        <LineChart
          data={getChartData()}
          width={screenWidth - 40}
          height={180}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          bezier
          style={{ borderRadius: 16 }}
        />
      </View>

      <View className="flex-row justify-between mt-6">
        <View className="bg-green-100 p-4 rounded-2xl flex-1 mr-2">
          <View className="bg-green-200 self-start p-2 rounded-full mb-2">
            <Ionicons name="trending-up" size={20} color="#059669" />
          </View>
          <Text className="text-green-800">Income</Text>
          <Text className="text-green-800 font-bold text-lg">
            ₹
            {transactions
              .filter((t) => t.amount > 0)
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString()}
          </Text>
        </View>
        <View className="bg-red-100 p-4 rounded-2xl flex-1 ml-2">
          <View className="bg-red-200 self-start p-2 rounded-full mb-2">
            <Ionicons name="trending-down" size={20} color="#DC2626" />
          </View>
          <Text className="text-red-800">Expenses</Text>
          <Text className="text-red-800 font-bold text-lg">
            ₹
            {Math.abs(
              transactions
                .filter((t) => t.amount < 0)
                .reduce((sum, t) => sum + t.amount, 0)
            ).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Enhanced Add Transaction Component
const AddTransaction = ({ onTransactionAdded, visible, onClose }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [isExpense, setIsExpense] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    if (!title || !amount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const userSession = await AsyncStorage.getItem("userSession");
      const userId = JSON.parse(userSession).id;

      const transaction = {
        id: Date.now().toString(),
        userId,
        title,
        amount: parseFloat(isExpense ? -amount : amount),
        category,
        date: date.toISOString(),
      };

      const existingTransactions = await AsyncStorage.getItem("transactions");
      const transactions = existingTransactions
        ? JSON.parse(existingTransactions)
        : [];
      transactions.push(transaction);

      await AsyncStorage.setItem("transactions", JSON.stringify(transactions));
      onTransactionAdded();
      onClose();

      // Clear form
      setTitle("");
      setAmount("");
      setCategory("other");
      setDate(new Date());
    } catch (error) {
      console.error("Error saving transaction:", error);
      Alert.alert("Error", "Failed to save transaction");
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-end">
      <View className="bg-white p-6 ">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-bold">Add Transaction</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            className={`flex-1 p-3 rounded-xl mr-2 ${!isExpense ? "bg-green-100" : "bg-gray-100"}`}
            onPress={() => setIsExpense(false)}
          >
            <Text
              className={`text-center ${!isExpense ? "text-green-800" : "text-gray-600"}`}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 p-3 rounded-xl ml-2 ${isExpense ? "bg-red-100" : "bg-gray-100"}`}
            onPress={() => setIsExpense(true)}
          >
            <Text
              className={`text-center ${isExpense ? "text-red-800" : "text-gray-600"}`}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-4"
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          className="bg-gray-50 rounded-xl p-4 mb-4"
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {Object.entries(CATEGORIES).map(([key, { icon, color }]) => (
            <TouchableOpacity
              key={key}
              className={`mr-4 items-center ${category === key ? "opacity-100" : "opacity-50"}`}
              onPress={() => setCategory(key)}
            >
              <View
                style={{ backgroundColor: color }}
                className="p-3 rounded-full mb-1"
              >
                <Ionicons name={icon} size={20} color="white" />
              </View>
              <Text className="text-xs capitalize">{key}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          className="bg-gray-50 rounded-xl p-4 mb-6"
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <TouchableOpacity
          className="bg-indigo-600 p-4 rounded-xl"
          onPress={handleSave}
        >
          <Text className="text-white text-center font-semibold">
            Save Transaction
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Enhanced Transaction List Component
const TransactionList = ({ onDelete, transactions }) => {
  const renderTransaction = ({ item }) => (
    <TouchableOpacity className="flex-row items-center bg-white p-4 mb-3 rounded-xl shadow-sm">
      <View
        style={{
          backgroundColor:
            CATEGORIES[item.category]?.color || CATEGORIES.other.color,
        }}
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
      >
        <Ionicons
          name={CATEGORIES[item.category]?.icon || CATEGORIES.other.icon}
          size={24}
          color="white"
        />
      </View>

      <View className="flex-1">
        <Text className="font-semibold text-gray-900">{item.title}</Text>
        <Text className="text-gray-500 text-sm">
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className={`font-bold ${item.amount > 0 ? "text-green-600" : "text-red-600"}`}
        >
          {item.amount > 0 ? "+" : ""}₹{Math.abs(item.amount).toLocaleString()}
        </Text>
        <TouchableOpacity onPress={() => onDelete(item.id)} className="mt-1">
          <Ionicons name="trash-outline" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 px-4">
      <Text className="text-xl font-bold mb-4">Recent Transactions</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// Main Expense Management Screen
const ExpenseManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  const loadTransactions = async () => {
    try {
      const userSession = await AsyncStorage.getItem("userSession");
      const userId = JSON.parse(userSession).id;

      const storedTransactions = await AsyncStorage.getItem("transactions");
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        const userTransactions = parsedTransactions.filter(
          (t) => t.userId === userId
        );
        setTransactions(userTransactions);
        setTotalBalance(userTransactions.reduce((sum, t) => sum + t.amount, 0));
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleDelete = async (id) => {
    try {
      const storedTransactions = await AsyncStorage.getItem("transactions");
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        const updatedTransactions = parsedTransactions.filter(
          (t) => t.id !== id
        );
        await AsyncStorage.setItem(
          "transactions",
          JSON.stringify(updatedTransactions)
        );
        loadTransactions();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <>
      <View className="flex-1 w-full bg-gray-50 min-h-screen">
        <Header totalBalance={totalBalance} transactions={transactions} />

        <TransactionList transactions={transactions} onDelete={handleDelete} />

        <AddTransaction
          visible={showAddTransaction}
          onClose={() => setShowAddTransaction(false)}
          onTransactionAdded={loadTransactions}
        />
      </View>

      <View className="absolute bottom-6 left-0 right-0 items-center">
        <TouchableOpacity
          className="bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={() => setShowAddTransaction(true)}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ExpenseManagement;
