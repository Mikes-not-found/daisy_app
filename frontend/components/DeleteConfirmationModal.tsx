import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-opacity-50 shadow-lg shadow-black">
        <View className="bg-white rounded-lg p-5 w-80">
          <Text className="text-lg font-bold mb-4">Confirm Delete</Text>
          <Text className="text-base mb-4">Are you sure you want to delete this item?</Text>
          <View className="flex-row justify-end">
            <TouchableOpacity onPress={onClose} className="mr-4">
              <Text className="text-blue-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm}>
              <Text className="text-red-500">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteConfirmationModal; 