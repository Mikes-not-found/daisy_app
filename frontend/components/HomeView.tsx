import { StyleSheet, Text, View, Animated, ActivityIndicator, ScrollView, RefreshControl } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useUser } from '../auth/UserContext'
import { useTheme } from './ThemeContext'
import Icon from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native'
import { useGoCardless } from '../contexts/GoCardlessContext'
import { BankCardDetails } from '../interfaces/profileInterfaces'
import { TransactionsData } from '../interfaces/transactionsInterfaces'
import { account } from '../App'
import { MoneyTrackerItem, RowCategory } from '../interfaces/moneyTrackerInterfaces';
import { getCurrentMonthName } from '../utils/utils'


const HomeView = () => {
  const [transactionsData, setTransactionsData] = useState<TransactionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode } = useTheme();
  const { userToken, user } = useUser();
  const { profileBankData, listTransactionData, listMoneyTracker} = useGoCardless();
  const navigation = useNavigation();
  const [currentCardsBalance, setCurrentCardsBalance] = useState<number>(0);
  const [listMoneyTrackerData, setListMoneyTrackerData] = useState<MoneyTrackerItem[] | null>(null);
  const [deltaTransactions, setDeltatransactions] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<string | null>();
  const [showChart, setShowChart] = useState(false);
  const currentMonth = getCurrentMonthName();

  // Animazioni
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;


  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ];

    Animated.parallel(animations).start();
  }, []);



  useEffect(() => {
    getCurrentCardsBalance();
    getListTransactionsData();
    getListMoneyTrackerData();
  }, [profileBankData, listTransactionData, listMoneyTracker])

  const getListMoneyTrackerData = () => {
    if(listMoneyTracker) {
      setListMoneyTrackerData(listMoneyTracker);
      console.log("listMoneyTrackerData", listMoneyTrackerData);
    }
  }

  const getCurrentCardsBalance = () => {
    if(profileBankData) {
      const totalBalance = profileBankData?.reduce((totale, element: BankCardDetails) => totale + Number(element.card_balance), 0).toFixed(2);
      setCurrentCardsBalance(Number(totalBalance))
    }
  }

  const getListTransactionsData = () => {
    if (listTransactionData) {
      setTransactionsData(listTransactionData);
      const delta = calculateTransactionDelta();
      setDeltatransactions(delta);
      console.log("totale: ", delta);
    } else {
      console.log("Dati delle transazioni non disponibili");
    }
  };

  useEffect(() => {
    const effect = async () => {
      const result = await account.get();
        console.log("AAAAAA", result)
        setUserInfo(result.email)
    };
    effect();
  }, [account])


  const onRefresh = useCallback(async () => {
    if (!userToken) {
      return;
    }
    setRefreshing(true);
    setIsLoading(true);
    try {
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [userToken, account]);

  

  // ------- Returns day left in month ------ //
  const calculateDailyBudget = useCallback(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    const daysLeftInMonth = lastDayOfMonth.getDate() - today.getDate() + 1;
    return (currentCardsBalance / daysLeftInMonth);
  }, [currentCardsBalance]);

  const calculateDailyLeft = useCallback(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    const daysLeftInMonth = lastDayOfMonth.getDate() - today.getDate() + 1;
    return daysLeftInMonth;
  }, [currentCardsBalance]);

  const calculateTransactionDelta = () => {
    if (listTransactionData?.booked && listTransactionData.booked.length > 0) {
      const positiveTotal = listTransactionData.booked
        .filter(transaction => Number(transaction.transactionAmount.amount) > 0)
        .reduce((acc, transaction) => acc + Number(transaction.transactionAmount.amount), 0);
      const negativeTotal = listTransactionData.booked
        .filter(transaction => Number(transaction.transactionAmount.amount) < 0)
        .reduce((acc, transaction) => acc + Number(transaction.transactionAmount.amount), 0);

      return positiveTotal + negativeTotal; // Il totale dei valori positivi e negativi
    } else {
      return 0;
    }
  };

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
        <Text className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Caricamento dati...
        </Text>
      </View>
    );
  }

  // if (!isInitialized || !areDataReady(data)) {
  //   return (
  //     <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
  //       <ActivityIndicator size="large" color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
  //       <Text className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
  //         Inizializzazione...
  //       </Text>
  //     </View>
  //   );
  // }

  const getExpectedFinalBalance = () => {
    if(listMoneyTrackerData && listMoneyTrackerData.length > 0) {
      return getExpectedIncome() + (currentCardsBalance || 0) - getExpectedBills()  - getExpectedSavings();
    } else {
      return 0;
    }
  }

  const calculateExpectedAmount = (category: RowCategory) => {
    if (listMoneyTrackerData && listMoneyTrackerData.length > 0) {
      return listMoneyTrackerData
        .filter(item => item.category === category && new Date(item.date) > new Date() && new Date(item.date).getMonth() < new Date().getMonth())
        .reduce((acc, item) => acc + Number(item.amount), 0);
    } else {
      return 0;
    }
  };

  const getExpectedIncome = () => {
    return calculateExpectedAmount(RowCategory.EARNINGS);
  };

  const getExpectedBills = () => {
    return calculateExpectedAmount(RowCategory.BILLS);
  };

  const getExpectedSavings = () => {
    return calculateExpectedAmount(RowCategory.SAVINGS);
  };

  const calculateTransactionPercentages = () => {
    if (listTransactionData?.booked && listTransactionData.booked.length > 0) {
      const totalIncome = listTransactionData.booked
        .filter(transaction => Number(transaction.transactionAmount.amount) > 0)
        .reduce((acc, transaction) => acc + Number(transaction.transactionAmount.amount), 0);

      const totalExpenses = listTransactionData.booked
        .filter(transaction => Number(transaction.transactionAmount.amount) < 0)
        .reduce((acc, transaction) => acc + Math.abs(Number(transaction.transactionAmount.amount)), 0);

      const total = totalIncome + totalExpenses;
      const incomePercentage = (totalIncome / total) * 100;
      const expensesPercentage = (totalExpenses / total) * 100;

      return { incomePercentage, expensesPercentage, totalIncome, totalExpenses };
    } else {
      return { incomePercentage: 0, expensesPercentage: 0, totalIncome: 0, totalExpenses: 0 };
    }
  };

  const { incomePercentage, expensesPercentage, totalIncome, totalExpenses } = calculateTransactionPercentages();

  return (
    <ScrollView
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-light_blue'}`}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex-row justify-between items-center">
        <Text className={`${isDarkMode ? 'text-whitecream' : 'text-whitecream'} text-3xl font-bold pl-6`}>{currentMonth}</Text>
        <View className="flex-row justify-end pr-4 align-center">
          <TouchableOpacity
          className="items-center my-2.5 p-3 shadow-lg rounded-lg bg-whitecream"
          onPress={() => setShowChart(!showChart)}
        >
          <Icon name="stats-chart" size={30} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center my-2.5 p-3 shadow-lg rounded-lg bg-whitecream ml-2"
          // onPress={() => navigation.navigate('MonthlyHistory' as never)}
        >
          <Icon name="document-text-outline" size={30} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
        </TouchableOpacity>
        </View>
      </View>
      {/* Card per Delta Transazioni */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View className={`mx-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`} style={styles.shadowStyle}>
          <View className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <View className="flex-row justify-between items-center">
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Delta Income/Expenses
              </Text>
            </View>
            <Text className={`text-xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              €{deltaTransactions?.toFixed(2)}
            </Text>
            <View className="flex-row mt-4 h-4 rounded-full overflow-hidden">
              <View style={{ flex: incomePercentage, backgroundColor: '#177AD5', justifyContent: 'center', alignItems: 'center' }}>
                <Text className="text-xs text-white">{incomePercentage.toFixed(1)}%</Text>
              </View>
              <View style={{ flex: expensesPercentage, backgroundColor: '#ED6665', justifyContent: 'center', alignItems: 'center' }}>
                <Text className="text-xs text-white">{expensesPercentage.toFixed(1)}%</Text>
              </View>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Income: €{totalIncome.toFixed(2)}
              </Text>
              <Text className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Expenses: €{totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Prima Sezione: Daily Budget e Totale Carte */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View className={`flex-row justify-between px-4 mt-2`}>
          <View className={`flex-1 p-4 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-whitecream'}`} style={styles.shadowStyle}>
            <View className="flex-row justify-between items-center">
              <Text className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Daily Budget</Text>
            </View>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              €{calculateDailyBudget().toFixed(2)}
            </Text>
            <Text className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Available for {calculateDailyLeft()} days
            </Text>
          </View>
          <View className={`flex-1 p-4 ml-4 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-whitecream'}`} style={styles.shadowStyle}>
            <View className="flex-row justify-between items-center">
              <Text className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Expected Savings</Text>
            </View>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              €{getExpectedSavings().toFixed(2)}
            </Text>
          </View>
        </View>
      </Animated.View>
      {/* Current Balance */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View className={`mx-4 mt-2 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`} style={styles.shadowStyle}>
            <View className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Profiles' as never)}
                className="flex-row justify-between items-center"
              >
                <View>
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Current Cards Balance
                  </Text>
                  <Text className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>€{currentCardsBalance}</Text>
                </View>
                <View className={`rounded-full p-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <Icon 
                    name="chevron-forward-outline" 
                    size={20} 
                    color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                  />
                </View>
              </TouchableOpacity>
            </View>
        </View>
      </Animated.View>
      {/* Monthly Summary */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View className={`mx-4 mt-2 mb-2 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`} style={styles.shadowStyle}>
          <View className="flex-row justify-between items-center">
            <Text className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Monthly Summary</Text>
            <Icon name="stats-chart-outline" size={20} color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
          </View>
          <View className="space-y-4">
            {/* Monthly Overview */}
            <View className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <Text className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Monthly Overview
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Balance</Text>
                  <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    €{(currentCardsBalance || 0).toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Expected Income</Text>
                  <Text className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    €{(getExpectedIncome() || 0).toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fixed Expenses</Text>
                  <Text className={`font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    €{(getExpectedBills() || 0).toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monthly Savings</Text>
                  <Text className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    €{(getExpectedSavings() || 0).toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-600">
                  <Text className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Expected Final Balance</Text>
                  <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    €{getExpectedFinalBalance().toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
  
      {/* Monthly History */}
      {/* <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View className={`mx-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`} style={styles.shadowStyle}>
          <Text className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>Monthly History</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.from({ length: 6 }).map((_, index) => {
              const date = new Date();
              date.setMonth(date.getMonth() - index);
              const monthName = date.toLocaleString('it-IT', { month: 'long' });
              const year = date.getFullYear();
              
              const monthData = (data?.lastMonthsData || []).find(
                record => record.month === `${monthName} ${year}`
              ) || {
                month: `${monthName} ${year}`,
                currentBalance: 0,
                earnings: 0,
                bills: 0,
                savings: 0,
                finalBalance: 0
              };

              return (
                <View 
                  key={index}
                  className={`mr-4 p-4 rounded-lg w-72 ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <Text className={`text-sm font-medium mb-2 capitalize ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>{monthData.month}</Text>

                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Initial Balance</Text>
                      <Text className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                        €{monthData.currentBalance?.toFixed(2) ?? '0.00'}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Income</Text>
                      <Text className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>
                        +€{monthData.earnings?.toFixed(2) ?? '0.00'}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Expenses</Text>
                      <Text className={isDarkMode ? 'text-red-400' : 'text-red-600'}>
                        -€{monthData.bills?.toFixed(2) ?? '0.00'}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Savings</Text>
                      <Text className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>
                        -€{monthData.savings?.toFixed(2) ?? '0.00'}
                      </Text>
                    </View>

                    <View className="mt-2 pt-2 border-t border-gray-600">
                      <View className="flex-row justify-between">
                        <Text className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Final Balance
                        </Text>
                        <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          €{monthData.finalBalance?.toFixed(2) ?? '0.00'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>
      <View className="h-6" /> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  shadowStyle: {
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeView;