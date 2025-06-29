import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from './ThemeContext';
import { useUser } from '../auth/UserContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from '@expo/vector-icons/Ionicons';
import { account } from '../App';

// Definizione dei tipi
type RootStackParamList = {
  Login: undefined;
  MainTabs: { screen: string };
  SettingsMain: undefined;
  Profiles: undefined;
  Settings: undefined;
};

type SettingsNavigationProp = StackNavigationProp<RootStackParamList, 'SettingsMain'>;

interface SettingItemProps {
  icon: string;
  title: string;
  value?: boolean;
  onPress: () => void;
  isSwitch?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  value, 
  onPress, 
  isSwitch = false 
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <View className="flex-row items-center">
        <Icon 
          name={icon} 
          size={24} 
          color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
          className="mr-3"
        />
        <Text className={`text-lg ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {title}
        </Text>
      </View>
      {isSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: '#767577', true: '#60A5FA' }}
          thumbColor={value ? '#3B82F6' : '#f4f3f4'}
        />
      ) : (
        <Icon 
          name="chevron-forward" 
          size={24} 
          color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
        />
      )}
    </TouchableOpacity>
  );
};

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { setUserToken } = useUser();
  const navigation = useNavigation<SettingsNavigationProp>();

  const handleLogout = async (): Promise<void> => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler effettuare il logout?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await account.deleteSession('current');
              setUserToken(null);
              navigation.navigate('Login');
            } catch (error) {
              console.error('Errore durante il logout:', error);
            }
          },
        },
      ]
    );
  };

  // Definizione delle sezioni delle impostazioni
  interface SettingsSection {
    id: string;
    items: Array<{
      id: string;
      icon: string;
      title: string;
      value?: boolean;
      isSwitch?: boolean;
      onPress: () => void;
    }>;
  }

  const settingsSections: SettingsSection[] = [
    {
      id: 'preferences',
      items: [
        {
          id: 'theme',
          icon: 'moon-outline',
          title: 'Tema Scuro',
          value: isDarkMode,
          isSwitch: true,
          onPress: toggleTheme
        },
        {
          id: 'accounts',
          icon: 'wallet-outline',
          title: 'I Miei Conti',
          onPress: () => {
            navigation.navigate('Profiles')
          }
        },
        {
          id: 'notifications',
          icon: 'notifications-outline',
          title: 'Notifiche',
          onPress: () => {}
        },
        {
          id: 'language',
          icon: 'language-outline',
          title: 'Lingua',
          onPress: () => {}
        }
      ]
    },
    {
      id: 'info',
      items: [
        {
          id: 'privacy',
          icon: 'shield-checkmark-outline',
          title: 'Privacy',
          onPress: () => {}
        },
        {
          id: 'help',
          icon: 'help-circle-outline',
          title: 'Aiuto',
          onPress: () => {}
        },
        {
          id: 'about',
          icon: 'information-circle-outline',
          title: 'Info App',
          onPress: () => {}
        }
      ]
    }
  ];

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-light_blue' : 'bg-light_blue'}`}>
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

      <ScrollView className="z-10">
        <View className="px-4 py-6">
          <Text className={`text-2xl font-bold mb-6 ${
            isDarkMode ? 'text-whitecream' : 'text-whitecream'
          }`}>
            Settings
          </Text>

          {settingsSections.map((section) => (
            <View 
              key={section.id}
              className={`rounded-2xl overflow-hidden shadow-lg mb-6 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              {section.items.map((item) => (
                <SettingItem
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  value={item.value}
                  onPress={item.onPress}
                  isSwitch={item.isSwitch}
                />
              ))}
            </View>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            className={`mt-4 p-4 rounded-2xl ${
              isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Icon 
                name="log-out-outline" 
                size={24} 
                color="#EF4444" 
                className="mr-2"
              />
              <Text className="text-red-500 font-semibold text-lg">
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings; 