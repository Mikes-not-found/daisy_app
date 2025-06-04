import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, Image } from 'react-native';
import { useUser } from '../auth/UserContext';
import { loginAndGetJWT } from '../auth/authUser';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from './ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

// Definizione dei tipi per la navigazione
type RootStackParamList = {
Login: undefined;
SignUp: undefined;
MainTabs: { screen: string };
Profiles: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
    const { userToken, setUserToken } = useUser();
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { isDarkMode } = useTheme();

    const signIn = async (): Promise<void> => {
        try {
            const jwt = await loginAndGetJWT(email, password);
            if (jwt) {
                console.log('JWT ottenuto:', jwt);
                setUserToken({ jwt });
                navigation.navigate('MainTabs', { screen: 'HomeView' });
            } else {
                throw new Error('JWT non ricevuto');
            }
        } catch (error) {
            console.error('Errore durante il login:', error);
            Alert.alert('Accesso fallito', 'Email o password non corretti');
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

            <SafeAreaView className="flex-1">
                <View className="flex-1 justify-end items-center pb-4">
                    <Image
                        source={{
                            uri: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Blossom.png'
                        }}
                        className="w-24 h-24 mb-2"
                        resizeMode="contain"
                    />
                    <Text className={`text-4xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                        Daisy
                    </Text>
                    <Text className={`text-lg mt-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        I am your financial assistant
                    </Text>
                </View>

                <View className={`px-6 pt-8 pb-16 rounded-t-3xl shadow-xl ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <View className="space-y-4">
                        <View>
                            <Text className={`text-lg font-medium ml-1 mb-2 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Email
                            </Text>
                            <View className={`flex-row items-center ${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            } rounded-xl px-4 py-3`}>
                                <Icon 
                                    name="mail-outline" 
                                    size={20} 
                                    color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                                />
                                <TextInput
                                    className={`flex-1 ml-2 ${
                                        isDarkMode ? 'text-white' : 'text-gray-800'
                                    }`}
                                    placeholder="Inserisci email"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View>
                            <Text className={`text-lg font-medium ml-1 mb-2 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Password
                            </Text>
                            <View className={`flex-row items-center ${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            } rounded-xl px-4 py-3`}>
                                <Icon 
                                    name="lock-closed-outline" 
                                    size={20} 
                                    color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                                />
                                <TextInput
                                    className={`flex-1 ml-2 ${
                                        isDarkMode ? 'text-white' : 'text-gray-800'
                                    }`}
                                    placeholder="Inserisci password"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Icon 
                                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                                        size={20} 
                                        color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity 
                            className="bg-blue-500 py-4 rounded-xl items-center mt-6 mb-4"
                            onPress={signIn}
                        >
                            <Text className="text-white text-lg font-semibold">
                                Accedi
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center space-x-1">
                            <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                Non hai un account?
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                <Text className="text-blue-500 font-semibold">
                                    Registrati
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default Login;
