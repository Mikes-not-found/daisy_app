import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../auth/UserContext';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LoadingOverlay from './LoadingOverlay';
import Icon from '@expo/vector-icons/Ionicons';
import { useTheme } from './ThemeContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { goCardlessService } from '../services/goCardlessService';
import { useGoCardless } from '../contexts/GoCardlessContext';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { BankCardDetails } from '../interfaces/profileInterfaces';
import { BankInstitutionRequisition, BankList } from '../interfaces/bankSelectorInterfaces';
import BankSelector from './BankSelector';

export default function Profiles() {
  const [data, setData] = useState<BankCardDetails[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [bankSelectorFlag, setBankSelectorFlag] = useState(false);
  const [refreshBankList, setRefreshBankList] = useState(false);
  const { accessToken, syncAccounts, profileBankData, refreshProfileBankData } = useGoCardless();
  const { userToken } = useUser();
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [goCardlessLoading, setGoCardlessLoading] = useState(false);
  const [goCardlessError, setGoCardlessError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<BankCardDetails | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [bankList, setBankList] = useState<BankList[]>()

  useEffect(() => {
    setData(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log("syncAcocunts in profile: ", syncAccounts)
  }, [syncAccounts])

  useEffect(() => {
    getProfileBankData();
  }, [accessToken, syncAccounts, userToken, profileBankData]);

  // ---------------- GET BANK ACCOUNTS ------------------ //
  const getProfileBankData = async () => {
    setData(profileBankData);
  }

  // ---------------- GET BANK LISTS ------------------ //
  const handleGoCardlessConnect = async () => {
    setGoCardlessLoading(true);
    await goCardlessService.getBankList(userToken, accessToken!.access_token)
    .then((response) => {
      setBankList(response)
      setBankSelectorFlag(true)
    })
    .catch(() => setGoCardlessError('Failed to connect to bank: GET BANK LISTS'))
    .finally(() => setGoCardlessLoading(false))
  };
  
  const setFlagBankSelector = (value: boolean) => {
    setBankSelectorFlag(value);
  }

  const updateBankLists = async (bankData: BankInstitutionRequisition) => {
    console.log("vidiamo come si fa", bankData);
    setFlagBankSelector(false)
    setLoading(true);
    await goCardlessService.saveBankDetails(userToken, accessToken?.access_token!, bankData.requisitionId, bankData.institutionId)
    .then(() => {
      refreshProfileBankData()
    })
    .catch((err) => {
      console.log("response syncAllData: ", err);
      setGoCardlessError(err);
    })
    .finally(() => {
      setLoading(false);
    });
    }

  const handleDeleteCard = async () => {
    if (selectedCard) {
      setLoading(true);
      await goCardlessService.deleteCard(userToken, selectedCard.id_account)
      .then(() => refreshProfileBankData())
      .catch((err) => setGoCardlessError(err))
      .finally(() => {
        setIsDeleteModalVisible(false);
        setSelectedCard(null);
        setLoading(false);
      })
    }
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Pattern di sfondo */}
      <View className={`absolute inset-0 
        ${isDarkMode 
          ? 'bg-[#111827] bg-opacity-95' 
          : 'bg-gray-50 bg-opacity-95'
        }`}
      >
        <View className={`w-full h-full 
          ${isDarkMode
            ? 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-gray-900'
            : 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-gray-50 to-gray-50'
          }`}
        />
      </View>

      {loading ? (
        <LoadingOverlay />
      ) : (
        bankSelectorFlag 
        ? 
          <BankSelector banks={bankList!} setFlagBankSelector={setFlagBankSelector} saveBankDetails={updateBankLists}/>
        : 
        <ScrollView className="z-10">
          <View className="px-4 py-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className={`mr-3 rounded-full p-2 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  } shadow`}
                >
                  <Icon 
                    name="chevron-back-outline" 
                    size={24} 
                    color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                  />
                </TouchableOpacity>
                <Text className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Profile
                </Text>
              </View>
            </View>

            {/* Sezione Add Bank */}
            <View className={`p-8 rounded-2xl mb-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg items-center`}>
              <TouchableOpacity
                onPress={handleGoCardlessConnect}
                disabled={goCardlessLoading}
                className={`w-20 h-20 rounded-full ${
                  isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
                } items-center justify-center mb-4 ${
                  goCardlessLoading ? 'opacity-50' : ''
                }`}
              >
                {goCardlessLoading ? (
                  <ActivityIndicator color={isDarkMode ? '#60A5FA' : '#3B82F6'} />
                ) : (
                  <Icon 
                    name="add-circle-outline" 
                    size={40} 
                    color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                  />
                )}
              </TouchableOpacity>
              <Text className={`text-lg font-semibold mb-4 text-center ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Collega il tuo conto bancario
              </Text>
              
              {goCardlessError && (
                <Text className="text-red-500 mb-4 text-center">
                  {goCardlessError}
                </Text>
              )}
            </View>

            {/* Account Cards */}
            {data && data?.length > 0 ? (
              data.map((element: BankCardDetails, index: number) => (
                <View
                  key={index}
                  className={`mb-4 rounded-2xl p-6 shadow-lg ${
                    isDarkMode 
                      ? 'bg-gray-800/80 backdrop-blur-lg shadow-gray-900/50' 
                      : 'bg-white/90 backdrop-blur-lg shadow-gray-200/50'
                  }`}
                >
                  {/* Header della card */}
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                      <View className={`w-14 h-14 rounded-2xl ${
                        isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
                      } items-center justify-center mr-4`}>
                        <Icon 
                          name="wallet-outline" 
                          size={28} 
                          color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                        />
                      </View>
                      <View>
                        <Text className={`text-xl font-bold ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {element?.card_name || 'Nome Conto'}
                        </Text>
                        <Text className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Conto Corrente
                        </Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedCard(element);
                        setIsDeleteModalVisible(true);
                      }}
                      className={`absolute top-2 right-2 p-2 rounded-full ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <Icon 
                        name="close-outline" 
                        size={24} 
                        color={isDarkMode ? '#EF4444' : '#DC2626'} 
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Saldo */}
                  <View className={`p-5 rounded-2xl ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <Text className={`text-sm mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Saldo Disponibile
                    </Text>
                    <Text className={`text-3xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {element?.card_balance || '0.00'} {element?.card_currency || 'EUR'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className={`p-6 rounded-2xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <Text className={
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }>
                  Nessuna banca configurata
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => {
          setIsDeleteModalVisible(false)
        }}
        onConfirm={handleDeleteCard}
      />
    </View>
  );
}

