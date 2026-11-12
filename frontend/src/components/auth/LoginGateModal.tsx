import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { useTheme } from '../../theme/useTheme';
import { AuthForm } from './AuthForm';

interface LoginGateModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function LoginGateModal({ visible, onDismiss }: LoginGateModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
      >
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.header}>
            <View style={[styles.brandMark, { backgroundColor: theme.colors.primarySoft }]}>
              <SymbolView
                name={{ ios: 'mountain.2.fill', android: 'landscape', web: 'landscape' }}
                tintColor={theme.colors.primary}
                size={23}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar inicio de sesión"
              onPress={onDismiss}
              style={({ pressed }) => [styles.closeButton, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={20} tintColor={theme.colors.textPrimary} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <AuthForm onGuest={onDismiss} onSuccess={onDismiss} />
            <Text style={[styles.footnote, { color: theme.colors.textMuted }]}>
              El mapa se puede consultar sin iniciar sesión.
            </Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  sheet: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '92%',
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#64748B55',
    marginBottom: 15,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brandMark: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  closeButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 4 },
  footnote: { textAlign: 'center', fontSize: 12, marginTop: 12 },
});
