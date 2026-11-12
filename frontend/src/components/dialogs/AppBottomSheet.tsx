
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
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
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
              paddingBottom: Math.max(insets.bottom, 20),
              borderColor: theme.colors.border,
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
                  { flex: 1 },
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
                style={({ pressed }) => [styles.closeButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceSecondary, opacity: pressed ? 0.7 : 1 }]}
              >
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={20} tintColor={theme.colors.textPrimary} />
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
    alignItems: 'center',
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
    maxWidth: 600,
    borderWidth: 1,
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
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flexGrow: 0,
  },
});
