import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity } from 'react-native';
import { RowCategory, MoneyTrackerItem } from '../interfaces/moneyTrackerInterfaces';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from '@expo/vector-icons/Ionicons';
import { formatDateToISO, isFieldValid } from '../utils/utils';
import { useTheme } from './ThemeContext';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddEditItem: (item: MoneyTrackerItem) => void;
  itemToEdit?: MoneyTrackerItem;
}

const AddEditMoneyTrackerItem: React.FC<AddItemModalProps> = ({ visible, onClose, onAddEditItem, itemToEdit }) => {
  const [formData, setFormData] = useState({
    target: itemToEdit?.target || '',
    amount: itemToEdit?.amount.toString() || '',
    category: itemToEdit?.category || RowCategory.BILLS,
    date: itemToEdit ? new Date(itemToEdit.date) : new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        target: itemToEdit.target,
        amount: itemToEdit.amount.toString(),
        category: itemToEdit.category,
        date: new Date(itemToEdit.date),
      });
    } else {
      resetFormData();
    }
  }, [itemToEdit]);

  const handleConfirmDate = (selectedDate: Date) => {
    setShowDatePicker(false);
    setFormData({ ...formData, date: selectedDate });
  };

  const handleCancelDate = () => {
    setShowDatePicker(false);
  };

  const resetFormData = () => {
    setFormData({
      target: '',
      amount: '',
      category: RowCategory.BILLS,
      date: new Date(),
    });
  };

  const handleCancel = () => {
    resetFormData();
    setSubmitClicked(false);
    setIsFormValid(false);
    onClose();
  };

  const handleAddOrEdit = () => {
    setSubmitClicked(true);
    if (!validateFields(formData as unknown as MoneyTrackerItem)) {
      setIsFormValid(false);
      return;
    };
    setIsFormValid(true);
    const newItem: MoneyTrackerItem = {
      ...formData,
      id: itemToEdit?.id,
      amount: parseFloat(formData.amount),
      date: formatDateToISO(formData.date),
    };
    onAddEditItem(newItem);
    onClose();
  };

  const validateFields = (formData: MoneyTrackerItem) => {
    const values = Object.values(formData);
    const isValid = values.every(isFieldValid);
    if (!isValid) {
      console.log('Invalid form data');
    }
    return isValid;
  }

  const getCategoryStyles = () => {
    switch (formData.category) {
      case RowCategory.BILLS:
        return {
          backgroundColor: formData.category === RowCategory.BILLS ?'bg-red-500' : 'bg-red-300',
        };
      case RowCategory.EARNINGS:
        return {
          backgroundColor: formData.category === RowCategory.EARNINGS ? 'bg-green' : 'bg-mint',
        };  
      case RowCategory.SAVINGS:
        return {
          backgroundColor: formData.category === RowCategory.SAVINGS ? 'bg-blue-500' : 'bg-blue-200',
        };
    }
  };

  const categoryStyles = getCategoryStyles();
  const backgroundColor = categoryStyles?.backgroundColor;

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View className={`flex-1 justify-end bg-black/20`}>
        <View className={`rounded-t-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-whitecream'}`}>
          <Text className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {itemToEdit && Object.keys(itemToEdit).length > 0 ? 'Edit Item' : 'Add New Item'}
          </Text>
          
          <View className={`flex-row justify-between p-1 rounded-xl mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-400'}`}>
            {[RowCategory.BILLS, RowCategory.EARNINGS, RowCategory.SAVINGS].map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setFormData({ ...formData, category })}
                className={`flex-1 py-3 rounded-lg ${formData.category === category ? backgroundColor : 'bg-transparent'}`}
              >
                <Text className={`text-center font-medium ${formData.category === category ? 'text-white' : 'text-gray-600'}`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Selection */}
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            className="border rounded-xl p-4 mb-4 flex-row items-center justify-between ${isDarkMode ? 'text-white' : 'text-gray-900'}"
          >
            <Text className={`text-gray-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formData.date.toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
            <Icon name="calendar" size={24} color={isDarkMode ? 'white' : 'black'} />
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={handleCancelDate}
            minimumDate={new Date()}
            cancelTextIOS="Annulla"
            confirmTextIOS="Conferma"
            locale="it"
          />

          <TextInput
            className={`border rounded-xl p-4 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} ${!isFieldValid(formData.target) && submitClicked ? 'border-red-500' : 'border-black'}`}
            placeholder="Target"
            placeholderTextColor={isDarkMode ? 'white' : 'black'}
            maxLength={40}
            value={formData.target}
            onChangeText={(value) => setFormData({ ...formData, target: value })}
          />
          <TextInput
            className={`border rounded-xl p-4 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} ${!isFieldValid(formData.amount) && submitClicked ? 'border-red-500' : 'border-black'}`}
            placeholder="Amount"
            placeholderTextColor={isDarkMode ? 'white' : 'black'}
            value={formData.amount}
            maxLength={15}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9.]/g, '');
              setFormData({ ...formData, amount: numericValue });
            }}
            keyboardType="numeric"
          />
          <View className={`flex-row justify-between space-x-4`}>
            <TouchableOpacity className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} flex-1 items-center justify-center rounded-xl elevation-8 shadow-sm shadow-black`} 
            onPress={handleCancel}>
              <Text className={`text-center font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`${itemToEdit ? 'bg-blue-400' : 'bg-green'} flex-1 p-4 rounded-xl shadow-sm shadow-black`} onPress={handleAddOrEdit}>
              <Text className={`text-white text-center font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{itemToEdit ? 'Edit' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddEditMoneyTrackerItem; 