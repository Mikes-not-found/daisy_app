import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ID } from 'appwrite';
import { account } from '../App';
import { useTheme } from './ThemeContext';
import Icon from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: { screen: string };
};

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUp() {
    const navigation = useNavigation<SignUpScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { isDarkMode } = useTheme();

    async function signUp() {
        if (!email || !password || !name) {
            Alert.alert('Errore', 'Tutti i campi sono obbligatori');
            return;
        }

        try {
            await account.create(ID.unique(), email, password, name);
            Alert.alert(
                'Registrazione completata', 
                'Account creato con successo! Effettua il login.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (err) {
            console.error(err);
            Alert.alert('Errore', 'Registrazione fallita. Verifica i dati inseriti e riprova.');
        }
    }

    return (
        <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Pattern di sfondo */}
            <View className={`absolute inset-0 
                ${isDarkMode ? 'bg-[#111827] bg-opacity-95' : 'bg-gray-50 bg-opacity-95'}`}
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
                    <Text className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Daisy
                    </Text>
                    <Text className={`text-lg mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Crea il tuo account
                    </Text>
                </View>

                <View className={`px-6 pt-8 pb-8 rounded-t-3xl shadow-xl ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <View className="space-y-4">
                        {/* Username Input */}
                        <View>
                            <Text className={`text-lg font-medium ml-1 mb-2 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Username
                            </Text>
                            <View className={`flex-row items-center ${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            } rounded-xl px-4 py-3`}>
                                <Icon 
                                    name="person-outline" 
                                    size={20} 
                                    color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                                />
                                <TextInput
                                    className={`flex-1 ml-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                                    placeholder="Inserisci username"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        {/* Email Input */}
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
                                    className={`flex-1 ml-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                                    placeholder="Inserisci email"
                                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
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
                                    className={`flex-1 ml-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
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
                            onPress={signUp}
                        >
                            <Text className="text-white text-lg font-semibold">
                                Registrati
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center space-x-1">
                            <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                Hai già un account?
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text className="text-blue-500 font-semibold">
                                    Accedi
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
