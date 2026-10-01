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
    backgroundColor: 'rgba(10, 18, 42, 0.75)',
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
    borderColor: '#FFC928',
    elevation: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFC928',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  popupSub: {
    fontSize: 13,
    color: '#7B8AB8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    fontWeight: '600',
  },
  popupBtn: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFC928',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupBtnText: {
    color: '#5A3800',
    fontWeight: '900',
    fontSize: 14,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
