
import { useMemo, useState } from 'react';

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { SymbolView } from 'expo-symbols';

export interface SelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export function AppSelect({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = 'Seleccioná una opción',
  searchPlaceholder = 'Buscar...',
  disabled = false,
}: AppSelectProps) {
  const { theme } = useTheme();

  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  // Busca la opción que coincide con el valor seleccionado.
  const selectedOption = options.find(
    (option) => option.value === value
  );

  // Filtra las opciones según el texto ingresado.
  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch)
    );
  }, [options, search]);

  const openModal = () => {
    if (disabled) return;

    setSearch('');
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    setSearch('');
  };

  const selectOption = (option: SelectOption) => {
    onChange(option.value);
    closeModal();
  };

  const showSearch = options.length > 8;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {/* Etiqueta del campo */}
      <Text
        style={[
          theme.typography.bodySmall,
          { color: theme.colors.textSecondary },
        ]}
      >
        {label}
      </Text>

      {/* Campo selector */}
      <Pressable
        onPress={openModal}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Abre la lista de opciones disponibles"
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.selector,
          {
            height: theme.input.height,
            borderRadius: theme.input.borderRadius,
            borderWidth: theme.input.borderWidth,
            paddingHorizontal: theme.input.paddingHorizontal,
            backgroundColor: theme.colors.inputBackground,
            borderColor: error
              ? theme.colors.danger
              : pressed
                ? theme.colors.primary
                : theme.colors.inputBorder,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            theme.typography.body,
            {
              flex: 1,
              color: selectedOption
                ? theme.colors.textPrimary
                : theme.colors.inputPlaceholder,
            },
          ]}
        >
          {selectedOption?.label ?? placeholder}
        </Text>

        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 18,
          }}
        >
          ▼
        </Text>
      </Pressable>

      {/* Mensaje de error */}
      {error ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.danger },
          ]}
        >
          {error}
        </Text>
      ) : null}

      {/* Modal de selección */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={[
               styles.overlay,
              { backgroundColor: theme.colors.overlay },
            ]}
            onPress={closeModal}
            accessibilityLabel="Cerrar selector"
          />

          <View
            style={[
              styles.bottomSheet,
              {
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius:
                  theme.bottomSheet.borderTopLeftRadius,
                borderTopRightRadius:
                  theme.bottomSheet.borderTopRightRadius,
                padding: theme.bottomSheet.padding,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {/* Encabezado */}
            <View style={styles.header}>
              <Text
                style={[
                  theme.typography.subheading,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {label}
              </Text>

              <Pressable
                onPress={closeModal}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                style={({ pressed }) => [styles.closeButton, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border, opacity: pressed ? 0.7 : 1 }]}
              >
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={20} tintColor={theme.colors.textPrimary} />
              </Pressable>
            </View>

            {/* Buscador: aparece cuando hay más de 8 opciones */}
            {showSearch ? (
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={searchPlaceholder}
                accessibilityLabel={searchPlaceholder}
                placeholderTextColor={
                  theme.colors.inputPlaceholder
                }
                style={[
                  styles.searchInput,
                  {
                    height: theme.input.height,
                    borderRadius: theme.input.borderRadius,
                    borderWidth: theme.input.borderWidth,
                    paddingHorizontal:
                      theme.input.paddingHorizontal,
                    backgroundColor:
                      theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.textPrimary,
                  },
                ]}
              />
            ) : null}

            {/* Lista de opciones */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              style={styles.optionsList}
              contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
              renderItem={({ item }) => {
                const isSelected = item.value === value;

                return (
                  <Pressable
                    onPress={() => selectOption(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{
                      selected: isSelected,
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primarySoft
                          : pressed
                            ? theme.colors.surfaceSecondary
                            : theme.colors.surfaceSecondary,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        theme.typography.body,
                        {
                          flex: 1,
                          color: theme.colors.textPrimary,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>

                    {isSelected ? (
                      <Text
                        style={{
                          color: theme.colors.primary,
                          fontWeight: '700',
                        }}
                      >
                        ✓
                      </Text>
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text
                  style={[
                    theme.typography.bodySmall,
                    styles.emptyMessage,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  No se encontraron opciones.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  bottomSheet: {
    width: '100%',
    maxWidth: 600,
    borderWidth: 1,
    maxHeight: '75%',
    gap: 16,
    elevation: 6,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  searchInput: {
    width: '100%',
  },

  optionsList: {
    flexGrow: 0,
  },

  option: {
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  emptyMessage: {
    textAlign: 'center',
    padding: 20,
  },
  closeButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  overlay: {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
},
});
