
import type { ReactNode } from 'react';

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';

interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  height?: ViewStyle['height'];
  closeOnBackdropPress?: boolean;
}

export function AppBottomSheet({
  visible,
  onClose,
  children,
  title,
  height,
  closeOnBackdropPress = true,
}: AppBottomSheetProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Fondo oscuro */}
        <Pressable
          style={[
            styles.overlay,
            { backgroundColor: theme.colors.overlay },
          ]}
          onPress={
            closeOnBackdropPress ? onClose : undefined
          }
          accessible={closeOnBackdropPress}
          accessibilityRole="button"
          accessibilityLabel="Cerrar panel"
        />

        {/* Panel inferior */}
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius:
                theme.bottomSheet.borderTopLeftRadius,
              borderTopRightRadius:
                theme.bottomSheet.borderTopRightRadius,
              padding: theme.bottomSheet.padding,
              height,
            },
          ]}
        >
          {/* Encabezado */}
          {title ? (
            <View style={styles.header}>
              <Text
                style={[
                  theme.typography.subheading,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {title}
              </Text>

              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                hitSlop={10}
              >
                <Text
                  style={[
                    styles.closeButton,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  ×
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Contenido desplazable */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  sheet: {
    width: '100%',
    maxHeight: '90%',
    gap: 16,
    elevation: 6,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  closeButton: {
    fontSize: 26,
    fontWeight: '400',
  },

  content: {
    flexGrow: 0,
  },
});
