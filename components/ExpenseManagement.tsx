import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const CATEGORIES = {
  food: { icon: "restaurant-outline", color: "#F59E0B" },
  transport: { icon: "car-outline", color: "#3B82F6" },
  shopping: { icon: "cart-outline", color: "#EC4899" },
  entertainment: { icon: "film-outline", color: "#8B5CF6" },
  bills: { icon: "receipt-outline", color: "#EF4444" },
  other: { icon: "ellipsis-horizontal-outline", color: "#6B7280" },
};

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
    <View style={styles.headerContainer}>
      <View style={styles.balanceContainer}>
        <View>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{totalBalance.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
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
          style={styles.chart}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.incomeContainer}>
          <View style={styles.incomeIconContainer}>
            <Ionicons name="trending-up" size={20} color="#059669" />
          </View>
          <Text style={styles.incomeLabel}>Income</Text>
          <Text style={styles.incomeAmount}>
            ₹
            {transactions
              .filter((t) => t.amount > 0)
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString()}
          </Text>
        </View>
        <View style={styles.expenseContainer}>
          <View style={styles.expenseIconContainer}>
            <Ionicons name="trending-down" size={20} color="#DC2626" />
          </View>
          <Text style={styles.expenseLabel}>Expenses</Text>
          <Text style={styles.expenseAmount}>
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
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Transaction</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.transactionTypeContainer}>
          <TouchableOpacity
            style={[
              styles.transactionTypeButton,
              !isExpense && styles.transactionTypeButtonActive,
            ]}
            onPress={() => setIsExpense(false)}
          >
            <Text
              style={[
                styles.transactionTypeText,
                !isExpense && styles.transactionTypeTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.transactionTypeButton,
              isExpense && styles.transactionTypeButtonActive,
            ]}
            onPress={() => setIsExpense(true)}
          >
            <Text
              style={[
                styles.transactionTypeText,
                isExpense && styles.transactionTypeTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {Object.entries(CATEGORIES).map(([key, { icon, color }]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.categoryButton,
                { opacity: category === key ? 1 : 0.5 },
              ]}
              onPress={() => setCategory(key)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: color }]}>
                <Ionicons name={icon} size={20} color="white" />
              </View>
              <Text style={styles.categoryText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.dateButton}
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TransactionList = ({ onDelete, transactions }) => {
  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View
        style={[
          styles.transactionIcon,
          {
            backgroundColor:
              CATEGORIES[item.category]?.color || CATEGORIES.other.color,
          },
        ]}
      >
        <Ionicons
          name={CATEGORIES[item.category]?.icon || CATEGORIES.other.icon}
          size={24}
          color="white"
        />
      </View>

      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.amount,
            item.amount > 0 ? styles.incomeAmount : styles.expenseAmount,
          ]}
        >
          {item.amount > 0 ? "+" : ""}₹{Math.abs(item.amount).toLocaleString()}
        </Text>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.transactionList}>
      <Text style={styles.transactionListTitle}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

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
      <View style={styles.container}>
        <Header totalBalance={totalBalance} transactions={transactions} />
        <TransactionList transactions={transactions} onDelete={handleDelete} />
        <AddTransaction
          visible={showAddTransaction}
          onClose={() => setShowAddTransaction(false)}
          onTransactionAdded={loadTransactions}
        />
      </View>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddTransaction(true)}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f9fafb",
    minHeight: "100%",
  },
  headerContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  balanceLabel: {
    color: "#6B7280",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
  },
  notificationButton: {
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 9999,
  },
  chartContainer: {
    height: 200,
  },
  chart: {
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  incomeContainer: {
    backgroundColor: "#D1FAE5",
    padding: 16,
    borderRadius: 16,
    flex: 1,
    marginRight: 8,
  },
  expenseContainer: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 16,
    flex: 1,
    marginLeft: 8,
  },
  incomeIconContainer: {
    backgroundColor: "#A7F3D0",
    alignSelf: "flex-start",
    padding: 8,
    borderRadius: 9999,
    marginBottom: 8,
  },
  expenseIconContainer: {
    backgroundColor: "#FECACA",
    alignSelf: "flex-start",
    padding: 8,
    borderRadius: 9999,
    marginBottom: 8,
  },

  incomeAmount: {
    color: "#065F46",
    fontWeight: "bold",
    fontSize: 18,
  },
  expenseLabel: {
    color: "#991B1B",
  },
  expenseAmount: {
    color: "#991B1B",
    fontWeight: "bold",
    fontSize: 18,
  },
  modalOverlay: {
    position: "absolute",
    // top: 0,
    // bottom: 300,
    // left: 0,
    // right: 0,
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    // justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  transactionTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  transactionTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "#F3F4F6",
  },
  transactionTypeButtonActive: {
    backgroundColor: "#57ff57",
  },
  transactionTypeText: {
    textAlign: "center",
  },
  transactionTypeTextActive: {
    color: "#991B1B",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    marginRight: 16,
    alignItems: "center",
  },
  categoryIcon: {
    padding: 12,
    borderRadius: 9999,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  dateButton: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionListTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontWeight: "600",
    color: "#111827",
  },
  transactionDate: {
    color: "#6B7280",
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amount: {
    fontWeight: "bold",
  },
  deleteButton: {
    marginTop: 4,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#4F46E5",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default ExpenseManagement;
