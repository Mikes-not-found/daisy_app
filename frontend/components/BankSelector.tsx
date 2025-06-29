import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  AppState,
  Animated,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useTheme } from './ThemeContext';
import { BankInstitutionRequisition, BankList, BankNavigationParams } from '../interfaces/bankSelectorInterfaces';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { goCardlessService } from '../services/goCardlessService';
import { useUser } from '../auth/UserContext';
import { useGoCardless } from '../contexts/GoCardlessContext';
import LoadingOverlay from './LoadingOverlay';
import { BankSelectorProps } from '../interfaces/bankSelectorInterfaces';


const PLACEHOLDER_IMAGE = 'https://placehold.co/100x100/png';

const BankSelector: React.FC<BankSelectorProps> = ({ banks, setFlagBankSelector, saveBankDetails }) => {
  const navigation = useNavigation<NavigationProp<BankNavigationParams>>();
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode } = useTheme();
  const { accessToken, setSyncAccounts } = useGoCardless();
  const { userToken } = useUser();
  const [requisitionId, setRequisitionId] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [testSuccess, setTestSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const filteredBanks = useMemo(() => {
    if (!Array.isArray(banks)) return [];
    return banks.filter(bank => 
      bank.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [banks, searchQuery]);

  const handleDeepLink = async (url: string) => {
    console.log("handleDeepLink called with URL:", url);
    try {
      if (url.includes('profiles')) {
        console.log("ci sono riuscito!!!");
        const bankData: BankInstitutionRequisition = {
          institutionId: institutionId,
          requisitionId: requisitionId
        }
        saveBankDetails(bankData)
        setTestSuccess(true);
      } else {
        console.log("URL does not include 'profiles'");
      }
    } catch (error) {
      console.error('Errore durante la gestione del deep link:', error);
      navigation.navigate('ErrorScreen', {
        error: {
          message: 'Errore durante il collegamento',
          details: error instanceof Error ? error.message : 'Errore sconosciuto'
        }
      });
    }
  };

  useEffect(() => {
    console.log("BankSelector mounted - Setting up deep link handlers");
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => {
      linkingSubscription.remove();
    };
  }, [requisitionId, userToken, accessToken, navigation, setSyncAccounts]);

  const handleBankSelection = async (bank: BankList) => {
      const sandbox_id = 'SANDBOXFINANCE_SFIN0000';
      console.log('Requesting link for bank:', bank.name);
      setInstitutionId(bank.id)
      await goCardlessService.buildLink(userToken, bank.id, accessToken!.access_token)
      .then(async (response) => {
        console.log('GoCardless response:', response);
        setRequisitionId(response.id);
        const finalUrl = response.link;
        console.log('Opening URL:', finalUrl);
        await Linking.openURL(finalUrl);
      })
      .catch((error) => {
        console.error('Errore durante la gestione del link:', error);
        navigation.navigate('ErrorScreen', { 
          error: {
            message: 'Impossibile connettersi alla banca. Riprova più tardi.',
            details: error instanceof Error ? error.message : 'Errore sconosciuto'
          }
        });
      }) 
  };

  const renderBankItem = ({ item }: { item: BankList }) => (
    <TouchableOpacity
      onPress={() => handleBankSelection(item)}
      className={`flex-row items-center p-5 mb-3 rounded-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-sm border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-100'
      }`}
    >
      <Image
        source={{ uri: item.logo || PLACEHOLDER_IMAGE }}
        className="w-14 h-14 rounded-xl"
        style={{ 
          borderWidth: 1,
          borderColor: isDarkMode ? '#374151' : '#F3F4F6'
        }}
      />
      <View className="ml-4 flex-1">
        <Text className={`font-semibold text-lg mb-1 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {item.name}
        </Text>
        <Text className={`text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {item.bic}
        </Text>
      </View>
      <View className={`rounded-full p-2 ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <Icon 
          name="chevron-forward-outline" 
          size={20} 
          color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }} className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header con Back Button */}
      <View className={`px-6 pt-6 pb-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => setFlagBankSelector(false)}
            className={`mr-4 rounded-full p-2 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-sm`}
          >
            <Icon 
              name="arrow-back-outline" 
              size={24} 
              color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
            />
          </TouchableOpacity>
          <Text className={`text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Select your Bank
            {testSuccess && <Text className="text-green-500">Success</Text>}
          </Text>
        </View>

        {/* Search Bar */}
        <View className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-xl p-3 shadow-sm flex-row items-center border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <Icon 
            name="search-outline" 
            size={20} 
            color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
            className="mx-2" 
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="es. Banca Popolare Italiana"
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            className={`flex-1 text-base ml-2 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              className={`rounded-full p-1 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <Icon 
                name="close-circle-outline" 
                size={20} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Banks List */}
      <FlatList
        data={filteredBanks}
        renderItem={renderBankItem}
        keyExtractor={item => item.id.toString()}
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 12 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-8">
            <Icon name="search" size={48} color={isDarkMode ? '#374151' : '#E5E7EB'} />
            <Text className={`text-lg mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Nessuna banca trovata
            </Text>
          </View>
        }
      />
    </Animated.View>
  );
};

export default BankSelector; 