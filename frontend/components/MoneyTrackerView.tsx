import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useUser } from '../auth/UserContext';
import { useTheme } from './ThemeContext';
import { MoneyTrackerItem, RowCategory } from '../interfaces/moneyTrackerInterfaces';
import LoadingOverlay from './LoadingOverlay';
import AddEditMoneyTrackerItem from './AddEditMoneyTrackerItem';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGoCardless } from '../contexts/GoCardlessContext';
import { deleteMoneyTrackerItemService, insertOrUpdateMoneyTrackerItem } from '../services/moneyTrackerService';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { formatDateString } from '../utils/utils';

const MoneyTrackerView = () => {
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const { userToken } = useUser();
  const { listMoneyTracker, refreshMoneyTracker } = useGoCardless();
  const [listMoneyTrackerData, setListMoneyTrackerData] = useState<MoneyTrackerItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<RowCategory>(RowCategory.BILLS);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<RowCategory | 'Expired' | null>(RowCategory.SAVINGS);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [itemToEdit, setItemToEdit] = useState<MoneyTrackerItem | null>(null);

  useEffect(() => {
    if (listMoneyTracker) {
      setListMoneyTrackerData(listMoneyTracker);
      console.log("listMoneyTrackerData", listMoneyTrackerData);
    }
  }, [listMoneyTracker]);

  const toggleAccordion = (category: RowCategory | 'Expired') => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getCategoryIcon = (category: RowCategory) => {
    switch (category) {
      case RowCategory.BILLS:
        return 'card-outline';
      case RowCategory.EARNINGS:
        return 'cash-outline';
      case RowCategory.SAVINGS:
        return 'wallet-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const addEditMoneyTrackerItem = async (MoneyTrackerItem: MoneyTrackerItem) => {
    setLoading(true);
    console.log("MoneyTrackerItem", MoneyTrackerItem);
    await insertOrUpdateMoneyTrackerItem(userToken, MoneyTrackerItem)
    .then((result) => {
      console.log("result", result);
      refreshMoneyTracker();
    }).catch((err) => {
      console.log("err", err);
    })
    .finally(() => {
      setLoading(false);
    });  
  }

  const deleteMoneyTrackerItem = async (id: number) => {
    setLoading(true);
    await deleteMoneyTrackerItemService(userToken, id)
    .then((result) => {
      console.log("result", result);
      refreshMoneyTracker();
    }).catch((err) => {
      console.log("err", err);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  const handleEditPress = (item: MoneyTrackerItem) => {
    setShowModalAdd(true);
    setItemToEdit(item);
  };

  const handleDeletePress = (id: number) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete !== null) {
      await deleteMoneyTrackerItem(itemToDelete);
      setItemToDelete(null);
    }
    setShowDeleteModal(false);
  };

  const isItemDisabled = (itemDate: string) => {
    const currentDate = new Date();
    const recordDate = new Date(itemDate);
    return currentDate >= recordDate;
  };

  const getExpectedSavings = () => {
    if (Array.isArray(listMoneyTrackerData)) {
      const expectedSavings = listMoneyTrackerData.filter(
        item => item.category === RowCategory.SAVINGS
      );
      return expectedSavings;
    } else {
      console.error("listMoneyTrackerData non è un array", listMoneyTrackerData);
      return [];
    }
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-light_blue' : 'bg-light_blue'}`}>
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
      <View className={`flex-1 ${isDarkMode ? 'bg-light_blue' : 'bg-light_blue'}`}>
        <View className='items-center my-5'>
          <Image
          source={require('../assets/billsEarningsImage.png')}
          className="shadow-lg shadow-black"
          style={{
            width: 100,
            height: 100,
            backgroundColor: 'transparent'
          }}
          onError={() => console.log('Immagine non caricata')}
        />
        <Text 
          className={`${isDarkMode ? 'text-whitecream' : 'text-whitecream'} text-lg font-bold text-center`}
        >Track your bills and earnings</Text>
      </View>
        <View className={`flex-1 ${isDarkMode ? 'bg-light_blue' : 'bg-light_blue'}`}>
          {loading && <LoadingOverlay />}
          {!loading && (
            <>
              {Object.values(RowCategory).map((category) => (
                <View key={category} className="mx-4 my-2">
                  <TouchableOpacity
                    onPress={() => toggleAccordion(category)}
                    className={`p-4 rounded-lg flex-row justify-between items-center shadow-sm shadow-black ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                  >
                    <View className="flex-row items-center">
                      <Icon
                        name={getCategoryIcon(category)}
                        size={20}
                        color={isDarkMode ? 'white' : 'black'}
                        style={{ marginRight: 10 }}
                      />
                      <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {category}
                      </Text>
                    </View>
                    <Icon
                      name={expandedCategory === category ? 'chevron-up-outline' : 'chevron-down-outline'}
                      size={20}
                      color={isDarkMode ? 'white' : 'black'}
                    />
                  </TouchableOpacity>
                  {expandedCategory === category && (
                    <View className="overflow-hidden transition-all duration-300 ease-in-out">
                      {listMoneyTrackerData
                        .filter(item => item.category === category && !isItemDisabled(item.date))
                        .map(item => (
                          <View key={item.id} className={` 
                          flex-row justify-between items-center m-2 elevation-8 
                          shadow-sm shadow-black shadow-offset-2  rounded-2xl px-4 py-3 
                          ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <View>
                              <View className="flex-row items-center flex-wrap" style={{maxWidth: '90%'}}>
                                <Icon
                                  name={getCategoryIcon(item.category)}
                                  size={20}
                                  color={isDarkMode ? 'white' : 'black'}
                                />
                                <Text 
                                  className={`text-lg ml-2 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                  style={{ maxWidth: '75%' }}
                                >
                                  {item.target}
                                </Text>
                              </View>
                              <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>€ {item.amount}</Text>
                              <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Due date: {formatDateString(item.date)}</Text>
                            </View>  
                            <View className="flex-row items-center">
                              <TouchableOpacity 
                                onPress={() => handleEditPress(item)} 
                                className="mr-2 bg-blue-400 shadow-md shadow-black rounded-full p-2 shadow-md"
                              >
                                <Icon name="create-outline" size={20} color={isDarkMode ? 'white' : 'black'} />
                              </TouchableOpacity>
                              <TouchableOpacity 
                                onPress={() => handleDeletePress(item.id!)} 
                                className="mr-2 bg-gray-300 shadow-md shadow-black rounded-full p-2 shadow-md"
                              >
                                <Icon name="remove-circle-outline" size={20} color={isDarkMode ? 'red' : 'red'} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                    </View>
                  )}
                </View>
              ))}
              {/* Accordion per i record scaduti */}
              <View className="mx-4 my-2">
                <TouchableOpacity
                  onPress={() => toggleAccordion('Expired')}
                  className={`p-4 rounded-lg flex-row justify-between items-center shadow-sm shadow-black ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                >
                  <View className="flex-row items-center">
                    <Icon
                      name="time-outline"
                      size={20}
                      color={isDarkMode ? 'white' : 'black'}
                      style={{ marginRight: 10 }}
                    />
                    <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Expired
                    </Text>
                  </View>
                  <Icon
                    name={expandedCategory === 'Expired' ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={20}
                    color={isDarkMode ? 'white' : 'black'}
                  />
                </TouchableOpacity>
                {expandedCategory === 'Expired' && (
                  <View className="overflow-hidden transition-all duration-300 ease-in-out">
                    {listMoneyTrackerData
                      .filter(item => isItemDisabled(item.date))
                      .map(item => (
                        <View key={item.id} className={` 
                        flex-row justify-between items-center m-2 elevation-8 
                        shadow-sm shadow-black shadow-offset-2  rounded-2xl px-4 py-3 
                        ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} opacity-50 border border-red-500`}>
                          <View>
                            <View className="flex-row items-center flex-wrap" style={{maxWidth: '90%'}}>
                              <Icon
                                name={getCategoryIcon(item.category)}
                                size={20}
                                color={isDarkMode ? 'white' : 'black'}
                              />
                              <Text 
                                className={`text-lg ml-2 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                style={{ maxWidth: '75%', textDecorationLine: 'line-through', textDecorationColor: 'red' }}
                              >
                                {item.target}
                              </Text>
                            </View>
                            <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>€ {item.amount}</Text>
                            <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Due date: {formatDateString(item.date)}</Text>
                          </View>  
                          <View className="flex-row items-center">
                            <TouchableOpacity 
                              onPress={() => handleEditPress(item)} 
                              className="mr-2 bg-blue-400 shadow-md shadow-black rounded-full p-2 shadow-md"
                              disabled
                            >
                              <Icon name="create-outline" size={20} color={isDarkMode ? 'white' : 'black'} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              onPress={() => handleDeletePress(item.id!)} 
                              className="mr-2 bg-gray-300 shadow-md shadow-black rounded-full p-2 shadow-md"
                            >
                              <Icon name="remove-circle-outline" size={20} color={isDarkMode ? 'red' : 'red'} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </View>
                )}
              </View>
              {/* Fine accordion per i record scaduti */}
              <AddEditMoneyTrackerItem
                visible={showModalAdd}
                onClose={() => {
                  setShowModalAdd(false);
                  setItemToEdit(null);
                }}
                onAddEditItem={(newItem) => addEditMoneyTrackerItem(newItem)}
                itemToEdit={itemToEdit || undefined}
              />
            </>
          )}
        </View>
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </View>
    </ScrollView>
    <View className="w-full absolute bottom-0">
    {/* Floating Add Button */}
    {!showModalAdd && (
      <TouchableOpacity
        onPress={() => setShowModalAdd(true)}
        className="w-full absolute bottom-0  py-2 self-center items-center rounded-t-lg justify-center bg-[#20AB6E] shadow-lg"
        style={{
          elevation: 8,
          zIndex: 50
        }}
      >
        <View className="flex-row items-center">
          <Icon className="m-3" name="add-circle-outline" size={24} color="white" />
          <Text className='text-white text-lg font-semibold'>Add tracker</Text>
        </View>
      </TouchableOpacity>
    )}
    </View>
    </View>


  );
};

export default MoneyTrackerView;