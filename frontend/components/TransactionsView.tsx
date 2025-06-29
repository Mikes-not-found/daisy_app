import { Alert, Image, SafeAreaView, ScrollView, Text, View, TextInput, TouchableOpacity, Modal } from 'react-native'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { goCardlessService } from '../services/goCardlessService';
import { useUser } from '../auth/UserContext';
import { useTheme } from './ThemeContext';
import Icon from '@expo/vector-icons/Ionicons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { getFormattedDateYYYYMMDD } from '../utils/utils';
import { debounce } from 'lodash';
import LoadingOverlay from './LoadingOverlay';
import { Transaction, TransactionsData } from '../interfaces/transactionsInterfaces'
import { useGoCardless } from '../contexts/GoCardlessContext';
 
const TransactionsView = () => {
  const [transactionsData, setTransactionsData] = useState<TransactionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<TransactionsData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const { isDarkMode } = useTheme();
  const { userToken } = useUser();
  const { listTransactionData, refreshListTransactionData } = useGoCardless();
  const [dateChanged, setDateChanged] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'completed'>('completed');

  const today = new Date();
  const maximumDate = today;
  const minimumDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
  
  const [datePickerState, setDatePickerState] = useState({
    isVisible: false,
    startDate: new Date(),
    endDate: new Date(),
    showStartPicker: true
  });

  const [displayLimit, setDisplayLimit] = useState(20);
  const transactionsPerLoad = 20;

  const toggleMenu = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  useEffect(() => {
      getListTransactionsData()
  }, [userToken, listTransactionData]);


  useEffect(() => {
    if(transactionsData && filteredData) {
      setLoading(false);
    }
}, [userToken, listTransactionData]);

  // ---------------- GET BANK ACCOUNTS ------------------ //
  const getListTransactionsData = async () => {
    setTransactionsData(listTransactionData);
    setFilteredData(listTransactionData);
  }

  // Function to apply the selected filter
  const applyFilter = (filter: string) => {
    setFilterModalVisible(false);
    if (!filteredData) return;

    let sortedBooked = [...filteredData.booked];
    let sortedPending = [...filteredData.pending];

    switch (filter) {
      case 'ESC':
        sortedBooked.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
        sortedPending.sort((a, b) => new Date(a.valueDate).getTime() - new Date(b.valueDate).getTime());
        break;
      case 'DESC':
        sortedBooked.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
        sortedPending.sort((a, b) => new Date(b.valueDate).getTime() - new Date(a.valueDate).getTime());
        break;
    }

    setFilteredData({
      booked: sortedBooked,
      pending: sortedPending
    });
  };

  // Ottimizziamo filterTransactions con useCallback
  const filterTransactions = useCallback((query: string) => {
    if (!transactionsData) return;
    
    const searchText = query.toLowerCase().trim();
    
    if (searchText === '') {
      setFilteredData(transactionsData);
      return;
    }

    const filteredBooked = transactionsData.booked.filter(transaction => {
      const creditorName = transaction.debtorName || 'Transaction';
      return creditorName.toLowerCase().includes(searchText) ||
        transaction.remittanceInformationUnstructured?.toLowerCase().includes(searchText) ||
        transaction.transactionAmount.amount.toString().includes(searchText);
    });

    const filteredPending = transactionsData.pending.filter(transaction => {
      const creditorName = transaction.debtorName || 'Transaction';
      return creditorName.toLowerCase().includes(searchText) ||
        transaction.remittanceInformationUnstructured?.toLowerCase().includes(searchText) ||
        transaction.transactionAmount.amount.toString().includes(searchText);
    });

    setFilteredData({
      booked: filteredBooked,
      pending: filteredPending
    });
  }, [transactionsData]);

  // Memorizziamo renderTransactionItem
  const renderTransactionItem = useCallback((transaction: Transaction) => {
    const amountIsNegative = parseFloat(transaction.transactionAmount.amount) < 0;
    const amount = Math.abs(parseFloat(transaction.transactionAmount.amount));
    const transactionDate = transaction.bookingDate || transaction.valueDate;
    
    return (
      <TouchableOpacity 
        className={`
          m-2 rounded-2xl px-4 py-3
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        `}
        style={{
          elevation: isDarkMode ? 3 : 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: isDarkMode ? 4 : 8,
        }}
      >
        <View className="flex-row items-center">
          <View className={`
            w-12 h-12 rounded-full items-center justify-center
            ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'}
          `}>
            <Icon 
              name="card-outline" 
              size={24} 
              color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
            />
          </View>
          
          <View className="flex-1 ml-4">
            <View className="flex-row justify-between items-center">
              <Text className={`
                text-lg font-semibold
                ${isDarkMode ? 'text-white' : 'text-gray-900'}
              `}>
                {transaction.debtorName || 'Transaction'}
              </Text>
              <Text className={`
                text-sm
                ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
              `}>
                {new Date(transactionDate).toLocaleDateString('it-IT')}
              </Text>
            </View>
            
            <Text className={`
              text-lg font-bold mt-1
              ${amountIsNegative ? 'text-red-500' : 'text-emerald-500'}
            `}>
              {amount.toFixed(2)} {transaction.transactionAmount.currency}
            </Text>
            
            <Text className={`
              text-sm mt-1
              ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
            `}>
              {transaction.remittanceInformationUnstructured || 'Nessuna descrizione'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [isDarkMode]);

  // Memorizziamo le transazioni filtrate e ordinate
  const memoizedTransactions = useMemo(() => {
    if (!filteredData) return null;

    return {
      pending: filteredData?.pending?.slice(0, 50) || [], // Aggiunto controllo per undefined
      booked: filteredData?.booked?.slice(0, displayLimit) || [] // Aggiunto controllo per undefined
    }
  }, [filteredData, displayLimit]);

  // Memorizziamo il contenuto renderizzato
  const content = useMemo(() => {
    if (loading) {
      return <LoadingOverlay />;
    }

    if (!memoizedTransactions) {
      return (
        <Text className={`
          text-center text-lg
          ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
        `}>
          No transactions found
        </Text>
      );
    }

    const hasNoResults = memoizedTransactions.booked.length === 0 && memoizedTransactions.pending.length === 0;
    const totalTransactions = memoizedTransactions.booked.length + memoizedTransactions.pending.length;
    
    if (hasNoResults && searchQuery) {
      return (
        <View className="items-center justify-center py-8">
          <Icon 
            name="search-outline" 
            size={48} 
            color={isDarkMode ? '#4B5563' : '#9CA3AF'} 
          />
          <Text className={`
            text-center text-lg mt-4
            ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
          `}>
            No transactions found for "{searchQuery}"
          </Text>
        </View>
      );
    }

    return (
      <>
        {!!searchQuery && (
          <Text className={`
            text-center text-lg mb-4
            ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            Found {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
          </Text>
        )}

        {selectedTab === 'completed' && memoizedTransactions.booked.length > 0 && (
          <View className="mb-6">
            <Text className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-whitecream' : 'text-whitecream'}`}>
              Completed Transactions ({memoizedTransactions.booked.length})
            </Text>
            {memoizedTransactions.booked.map((transaction, index) => (
              <View key={index}>
                {renderTransactionItem(transaction)}
              </View>
            ))}

            {/* Load More Button */}
            {filteredData && displayLimit < filteredData.booked.length && (
              <TouchableOpacity 
                onPress={() => setDisplayLimit(prev => prev + transactionsPerLoad)}
                className={`
                  mt-4 p-4 rounded-xl
                  ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                  border border-gray-200
                `}
              >
                <Text className={`
                  text-center font-medium
                  ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}
                `}>
                  Load More Transactions
                </Text>
                <Text className={`
                  text-center text-sm mt-1
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  Showing {Math.min(displayLimit, filteredData.booked.length)} of {filteredData.booked.length}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {selectedTab === 'pending' && memoizedTransactions.pending.length > 0 && (
          <View className="mb-6">
            <Text className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Pending Transactions ({memoizedTransactions.pending.length})
            </Text>
            {memoizedTransactions.pending.map((transaction, index) => (
              <View key={index}>
                {renderTransactionItem(transaction)}
              </View>
            ))}
          </View>
        )}

        {/* Aggiungi il messaggio per le transazioni pending */}
        {selectedTab === 'pending' && memoizedTransactions.pending.length === 0 && (
          <Text className={`
            text-center text-lg
            ${isDarkMode ? 'text-whitecream' : 'text-whitecream'}
          `}>
            No pending transactions found
          </Text>
        )}
      </>
    );
  }, [memoizedTransactions, isDarkMode, searchQuery, loading, renderTransactionItem, displayLimit, filteredData, selectedTab]);

  // Sostituiamo renderContent con il contenuto memorizzato
  const renderContent = () => content;

  // Aggiungi queste nuove funzioni per gestire il date picker
  const quickDateRanges = [
    { label: 'Last month', days: 30 },
    { label: 'Last 3 months', days: 90 },
    { label: 'Last 6 months', days: 180 },
    { label: 'Last year', days: 365 }
  ];

  const handleQuickSelect = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    if (!userToken) return;
    
    // Chiudi subito il modale
    setDatePickerState(prev => ({ ...prev, isVisible: false }));
    
    setLoading(true);
    setFilteredData(null);
    setTransactionsData(null);
    const startDateFormatted = getFormattedDateYYYYMMDD(startDate);
    const endDateFormatted = getFormattedDateYYYYMMDD(endDate);
    
    const dateRange = {
      start_date: startDateFormatted,
      end_date: endDateFormatted
    }
    refreshListTransactionData(dateRange);
    setTransactionsData(listTransactionData);
    setFilteredData(listTransactionData);
  };

  const handleConfirmDateRange = (startDate: Date, endDate: Date) => {
    if (endDate < startDate) {
      Alert.alert('Data non valida', 'La data di fine deve essere successiva alla data di inizio');
      return;
    }
    setLoading(true);
    const startDateFormatted = getFormattedDateYYYYMMDD(startDate);
    const endDateFormatted = getFormattedDateYYYYMMDD(endDate); 
    console.log("startDateFormatted: ", startDateFormatted);
    console.log("endDateFormatted: ", endDateFormatted);
    const dateRange = {
      start_date: startDateFormatted,
      end_date: endDateFormatted
    }
    refreshListTransactionData(dateRange);
    setTransactionsData(listTransactionData);
    setFilteredData(listTransactionData);
    setDatePickerState(prev => ({ ...prev, isVisible: false }));
  };

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      filterTransactions(text);
    }, 300),
    [filterTransactions]
  );


  const getBackgroundColor = (isStartPicker: boolean, isDark: boolean) => {
    if (isStartPicker) {
      return isDark ? 'bg-blue-900/30' : 'bg-blue-100';
    }
    return isDark ? 'bg-gray-700' : 'bg-gray-100';
  };

  return (
    <View className={`flex-1 bg-light_blue`}>
      <ScrollView className="flex-1">
        {/* Header Section - Fuori dallo ScrollView */}
        <SafeAreaView>
          <View className="items-center my-5 px-4">
            <Image
              source={require('../assets/transactionsImage.png')}
              className="shadow-lg shadow-black"
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'transparent'
              }}
            />
            <Text className={`
              text-lg font-bold text-center mt-4
              ${isDarkMode ? 'text-whitecream' : 'text-whitecream'}
            `}>
              Track your transactions
            </Text>
          </View>

          {/* Search and Filter Section */}
          <View className="mx-4 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1 mr-4">
                <TextInput
                  className={` 
                    ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} 
                    px-4 py-3 rounded-xl shadow-sm border border-gray-200
                  `}
                  style={{
                    elevation: isDarkMode ? 3 : 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDarkMode ? 0.3 : 0.1,
                    shadowRadius: isDarkMode ? 4 : 8,
                  }}
                  placeholder="Find transactions..."
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    debouncedSearch(text);
                  }}
                />
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity 
                  onPress={() => setDatePickerState(prev => ({ ...prev, isVisible: true }))}
                  className={` 
                    p-3 rounded-xl
                    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                    shadow-sm border border-gray-200
                  `}
                  style={{
                    elevation: isDarkMode ? 3 : 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDarkMode ? 0.3 : 0.1,
                    shadowRadius: isDarkMode ? 4 : 8,
                  }}
                >
                  <Icon 
                    name="calendar-outline" 
                    size={24} 
                    color={isDarkMode ? '#FFFFFF' : '#000000'} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={toggleMenu}
                  className={` 
                    p-3 rounded-xl
                    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                    shadow-sm border border-gray-200
                  `}
                  style={{
                    elevation: isDarkMode ? 3 : 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDarkMode ? 0.3 : 0.1,
                    shadowRadius: isDarkMode ? 4 : 8,
                  }}
                >
                  <Icon name="options-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#000000'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter Dropdown */}
            {filterModalVisible && (
              <View className={`
                absolute right-0 top-16 rounded-xl shadow-xl z-20 w-40
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
              `}>
                <TouchableOpacity 
                  onPress={() => applyFilter('ESC')}
                  className="px-4 py-3 border-b border-gray-200"
                >
                  <Text className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                    ↑ Più vecchie
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => applyFilter('DESC')}
                  className="px-4 py-3"
                >
                  <Text className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                    ↓ Più recenti
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>

        {/* Tab Switch for Pending and Completed Transactions */}
        <View className="flex-row justify-around mb-4 mx-4">
          <TouchableOpacity 
            onPress={() => setSelectedTab('completed')}
            className={`flex-1 py-3 rounded-lg ${selectedTab === 'completed' ? 'bg-blue-500' : 'bg-transparent'}`}
          >
            <Text className={`text-center font-semibold ${selectedTab === 'completed' ? 'text-whitecream' : 'text-whitecream'}`}>
              Completed Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectedTab('pending')}
            className={`flex-1 py-3 rounded-lg ${selectedTab === 'pending' ? 'bg-blue-500' : 'bg-transparent'}`}
          >
            <Text className={`text-center font-semibold ${selectedTab === 'pending' ? 'text-whitecream' : 'text-whitecream'}`}>
              Pending Transactions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List in ScrollView */}
        <View className="px-2">
          {renderContent()}
        </View>
      </ScrollView>

      {/* Aggiungi il Modal del Date Picker */}
      <Modal 
        visible={datePickerState.isVisible} 
        transparent={true} 
        animationType="slide"
      >
        <View className="flex-1 justify-end">
          <TouchableOpacity 
            className="absolute inset-0 bg-black/60"
            activeOpacity={1}
            onPress={() => setDatePickerState(prev => ({ ...prev, isVisible: false }))}
          />
          <View className={`
            ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
            rounded-t-3xl px-6 py-6 shadow-xl
          `}>
            <Text className={`
              text-lg font-bold text-center mb-4
              ${isDarkMode ? 'text-white' : 'text-gray-900'}
            `}>
              Select Period
            </Text>

            {/* Quick Access Buttons */}
            <View className="mb-6">
              <View className="flex-row flex-wrap justify-between">
                {quickDateRanges.map((range, index) => (
                  <TouchableOpacity
                    key={range.label}
                    className={`
                      mb-2 px-3 py-2 rounded-lg w-[48%]
                      ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}
                    `}
                    onPress={() => handleQuickSelect(range.days)}
                  >
                    <Text className={`
                      text-center text-sm font-medium
                      ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}
                    `}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Range Display */}
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity 
                onPress={() => setDatePickerState(prev => ({ ...prev, showStartPicker: true }))}
                className={`
                  flex-1 p-3 rounded-xl mr-2
                  ${getBackgroundColor(datePickerState.showStartPicker, isDarkMode)}
                `}
              >
                <Text className={`
                  text-center text-sm font-medium mb-1
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  Start Date
                </Text>
                <Text className={`
                  text-center font-bold
                  ${isDarkMode ? 'text-white' : 'text-gray-900'}
                `}>
                  {datePickerState.startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setDatePickerState(prev => ({ ...prev, showStartPicker: false }))}
                className={`
                  flex-1 p-3 rounded-xl ml-2
                  ${getBackgroundColor(!datePickerState.showStartPicker, isDarkMode)}
                `}
              >
                <Text className={`
                  text-center text-sm font-medium mb-1
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  End Date
                </Text>
                <Text className={`
                  text-center font-bold
                  ${isDarkMode ? 'text-white' : 'text-gray-900'}
                `}>
                  {datePickerState.endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker */}
            {/* <View className="w-full flex items-center justify-center">
              <DateTimePickerAndroid
                date={datePickerState.showStartPicker ? datePickerState.startDate : datePickerState.endDate}
                onDateChange={(date) => {
                  setDatePickerState(prev => ({
                    ...prev,
                    [datePickerState.showStartPicker ? 'startDate' : 'endDate']: date
                  }));
                  setDateChanged(true);
                }}
                mode="date"
                locale="it"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={{ 
                  width: 320,
                  height: 120,
                  marginVertical: 10
                }}
                theme={isDarkMode ? 'dark' : 'light'}
              />
            </View> */}

            {/* Action Buttons */}
            <View className="flex-row justify-between space-x-2">
              <TouchableOpacity 
                className={`
                  flex-1 px-3 py-2.5 rounded-xl
                  ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                `}
                onPress={() => setDatePickerState(prev => ({ ...prev, isVisible: false }))}
              >
                <Text className={`
                  text-center font-medium text-sm
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className={`
                  flex-1 px-3 py-2.5 rounded-xl
                  ${!dateChanged ? 'bg-blue-300' : 'bg-blue-500'}
                `}
                onPress={() => handleConfirmDateRange(datePickerState.startDate, datePickerState.endDate)}
                disabled={!dateChanged}
              >
                <Text className="text-white font-medium text-sm text-center">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TransactionsView