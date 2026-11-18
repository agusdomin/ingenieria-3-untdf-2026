import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../../theme/useTheme";

interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function AppBottomSheet({
  visible,
  onClose,
  title,
  headerRight,
  children,
}: AppBottomSheetProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.handle,
              { backgroundColor: theme.colors.border },
            ]}
          />

          {title || headerRight ? (
            <View style={styles.header}>
              {title ? (
                <Text
                  style={[
                    styles.title,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {title}
                </Text>
              ) : <View />}
              {headerRight}
            </View>
          ) : null}

          <ScrollView
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
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  sheet: {
    maxHeight: "48%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    minHeight: 180,
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },
});