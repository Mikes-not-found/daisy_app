import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../components/ThemeContext';

interface ErrorScreenProps {
  route?: {
    params?: {
      error?: Error;
    };
  };
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const errorMessage = route?.params?.error?.message;

  return (
    <View className={`flex-1 justify-center items-center px-6 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Icon 
        name="alert-circle-outline" 
        size={100} 
        color={isDarkMode ? '#EF4444' : '#DC2626'} 
      />
      
      <Text className={`text-2xl font-bold mt-6 text-center ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Ops! Qualcosa è andato storto
      </Text>
      
      <Text className={`mt-3 text-center ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {errorMessage ?? 'Si è verificato un errore durante la connessione alla banca'}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('Profiles')}
        className={`mt-8 px-6 py-3 rounded-xl flex-row items-center ${
          isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
        }`}
      >
        <Icon 
          name="person-outline" 
          size={20} 
          color="white" 
          style={{ marginRight: 8 }} 
        />
        <Text className="text-white font-semibold text-base">
          Torna al Profilo
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorScreen;
