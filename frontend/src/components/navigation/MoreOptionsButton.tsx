import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";

import { useTheme } from "../../theme/useTheme";
import { useAuth } from '../../contexts/AuthContext';

export function MoreOptionsButton({ onAccountPress }: { onAccountPress?: () => void }) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const goToUser = () => {
    setOpen(false);
    if (onAccountPress) onAccountPress();
    else router.push("/(tabs)/usuario" as never);
  };

  const goToOffline = () => {
    setOpen(false);
    router.push("/(tabs)/offline" as never);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Más opciones"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          name={{
            ios: "ellipsis",
            android: "more_vert",
            web: "more_vert",
          }}
          tintColor={theme.colors.textPrimary}
          size={22}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={[
            styles.backdrop,
            { backgroundColor: theme.colors.overlay },
          ]}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => {}}
          >
            <Text
              style={[
                styles.title,
                { color: theme.colors.textPrimary },
              ]}
            >
              Más opciones
            </Text>

            <Pressable
              onPress={goToUser}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.option,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{
                  ios: "person.crop.circle",
                  android: "account_circle",
                  web: "account_circle",
                }}
                tintColor={theme.colors.primary}
                size={22}
              />

              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {isAuthenticated ? 'Mi cuenta' : 'Ingresar / Crear cuenta'}
                </Text>

                <Text
                  style={[
                    styles.optionDescription,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Perfil, sesión y opciones de cuenta
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={goToOffline}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{
                  ios: "arrow.triangle.2.circlepath",
                  android: "sync",
                  web: "sync",
                }}
                tintColor={theme.colors.primary}
                size={22}
              />

              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Sincronización
                </Text>

                <Text
                  style={[
                    styles.optionDescription,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Estado offline, cola local y sincronización manual
                </Text>
              </View>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.7,
  },

  backdrop: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 16,
  },

  card: {
    width: 280,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  option: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },

  optionText: {
    flex: 1,
    gap: 2,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  optionDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
});
