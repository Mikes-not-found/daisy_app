import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, Text, TouchableOpacity, Image } from 'react-native';
import Login from './components/Login';
import Profiles from './components/Profiles';
import Icon from '@expo/vector-icons/Ionicons';
import { UserProvider, useUser } from './auth/UserContext';
import { useTheme, ThemeProvider } from './components/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import { Account, Client } from 'appwrite';
import SignUp from './components/SignUp';
import TransactionsView from './components/TransactionsView';
import Settings from './components/Settings';
import BankSelector from './components/BankSelector';
import { GoCardlessProvider } from './contexts/GoCardlessContext';
import ErrorScreen from './components/ErrorScreen';
import HomeView from './components/HomeView';
import MoneyTrackerView from './components/MoneyTrackerView';
import { getCurrentMonthName } from './utils/utils';

//Appwrite entrypoint
const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1')
.setProject('670245750030181233f6');
const account = new Account(client);
export { account };

const BottomTabNab = createBottomTabNavigator();
const StackNav = createStackNavigator();


// Top Navigation only in the Home bottom Section
const HomeViewWithTabBar = () => {
  return <HomeView />;
};

const SettingsStack = createStackNavigator();

const SettingsStackScreen = () => {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen 
        name="SettingsMain" 
        component={Settings} 
      />
    </SettingsStack.Navigator>
  );
};

//Bottom global tab navigaition
const BottomTabNav = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <BottomTabNab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: isDarkMode ? '#000000' : '#CBD5E1',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 55,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: isDarkMode ? '#9CA3AF' : '#6B7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 3,
        },
        headerShown: false,
      }}
    >
      <BottomTabNab.Screen
        name="Home"
        component={HomeViewWithTabBar}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <BottomTabNab.Screen
        name="Transactions"
        component={TransactionsView}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? "swap-horizontal" : "swap-horizontal-outline"} size={24} color={color} />
          ),
        }}
      />
      <BottomTabNab.Screen
        name="Money Tracker"
        component={MoneyTrackerView}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? "document-text" : "document-text-outline"} size={24} color={color} />
          ),
        }}
      />
      <BottomTabNab.Screen
        name="SettingsTab"
        component={SettingsStackScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
          tabBarLabel: 'Settings'
        }}
      />
    </BottomTabNab.Navigator>
  );
};

const Header = () => {
  const { isDarkMode } = useTheme();

  return (
    <View className={`flex-row justify-between p-4 bg-light_blue ${isDarkMode ? 'bg-gray-900' : 'bg-light_blue'}`}>
      <View className="flex-1 flex-row items-center">
        <Image
          source={{
            uri: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Blossom.png'
          }}
          className="w-10 h-10 mr-2"
          resizeMode="contain"
        />
        <Text className={`${isDarkMode ? 'text-whitecream' : 'text-whitecream'} text-2xl font-bold`}>Daisy</Text>
      </View>
      <TouchableOpacity className="flex-1 items-end">
        <Icon name="menu" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

//----------------------- App/Main entrance -------------------
const App = (): React.ReactElement => {
  const { isDarkMode } = useTheme();
  const { userToken, setUserToken } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      console.log('🔍 [App] Verifica sessione...');
      const session = await account.getSession('current');
      if (session) {
        const token = await account.createJWT();
        setUserToken(token);
        console.log('✅ [App] Sessione valida');
      } else {
        console.log('❌ [App] Nessuna sessione attiva');
        setUserToken(null);
      }
    } catch (error) {
      console.log('❌ [App] Errore sessione:', error);
      setUserToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();

  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A8E6CF" />
      </View>
    );
  }



  return (
    <NavigationContainer>
      <ThemeToggle />
      {userToken && <Header />}
      <StackNav.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={userToken ? "MainTabs" : "Login"}
      >
        {userToken ? (
          <>
            <StackNav.Screen name="MainTabs" component={BottomTabNav} />
            <StackNav.Screen name="Profiles" component={Profiles} />
            <StackNav.Screen name="BankSelector" component={BankSelector} />
            <StackNav.Screen name="ErrorScreen" component={ErrorScreen} />
          </>
        ) : (
          <>
            <StackNav.Screen 
              name="Login" 
              component={Login} 
              options={{ headerShown: false }} 
            />
            <StackNav.Screen 
              name="SignUp" 
              component={SignUp} 
              options={{ headerShown: false }} 
            />
          </>
        )}
      </StackNav.Navigator>
    </NavigationContainer>
  );
};


// Root Project
const Root = (): React.ReactElement => {
  return (
    <ThemeProvider>
      <UserProvider>
        <GoCardlessProvider>
          <App />
        </GoCardlessProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default Root;
