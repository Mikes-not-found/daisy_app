import { ActivityIndicator, Modal, Text, View } from 'react-native'
import React from 'react'
import { useColorScheme } from 'nativewind'

export default function LoadingOverlay() {
  const { colorScheme } = useColorScheme()
  const isDarkMode = colorScheme === 'dark'

  return (
    <Modal transparent={true}>
      <View className={`flex-1 justify-center items-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <View className={`p-8 rounded-3xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-2xl items-center border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <ActivityIndicator 
            size={60} 
            color={isDarkMode ? '#60A5FA' : '#3B82F6'} 
          />
          <Text className={`mt-6 text-lg font-semibold ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Caricamento attendere...
          </Text>
          <Text className={`mt-2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Attendere prego
          </Text>
        </View>
      </View>
    </Modal>
  )
}