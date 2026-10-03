import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  icon = 'info',
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.alertPopup}>
          <MaterialIcons name={icon} size={42} color="#FFC928" />
          <Text style={styles.popupTitle}>{title.toUpperCase()}</Text>
          <Text style={styles.popupSub}>{message}</Text>
          
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.popupBtn, pressed && styles.pressed]}
          >
            <Text style={styles.popupBtnText}>GOT IT</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(46, 16, 101, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  alertPopup: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#7C3AED',
    elevation: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7C3AED',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  popupSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    fontWeight: '600',
  },
  popupBtn: {
    width: '100%',
    height: 44,
    backgroundColor: '#7C3AED',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
