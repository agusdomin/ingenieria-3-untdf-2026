import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { FeaturePlaceholder } from '../../../src/components/navigation/FeaturePlaceholder';
import { useTheme } from '../../../src/theme/useTheme';

const previewImage = require('../../../assets/images/reportes-preview.jpeg');

export default function ReportsTab() {
  const { theme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <FeaturePlaceholder
        icon={{ ios: 'waveform.path.ecg', android: 'monitoring', web: 'monitoring' }}
        eyebrow="Bitácora de montaña"
        title="Reportes"
        description="Los reportes de terreno y sus actualizaciones van a aparecer acá."
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver maqueta del boletín en pantalla completa"
          onPress={() => setIsFullscreen(true)}
          style={({ pressed }) => [
            styles.cardContainer,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.border,
            },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.cardHeader}>
            <SymbolView
              name={{ ios: 'doc.richtext', android: 'article', web: 'article' }}
              size={15}
              tintColor={theme.colors.primary}
            />
            <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
              Boletín Público de Avalanchas
            </Text>
          </View>

          <View style={styles.imageWrapper}>
            <Image
              source={previewImage}
              style={styles.image}
              contentFit="contain"
              accessibilityLabel="Boletín público de avalanchas cordillera de Ushuaia"
            />
          </View>

          <View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}>
            <SymbolView
              name={{ ios: 'arrow.up.left.and.arrow.down.right', android: 'zoom_in', web: 'zoom_in' }}
              size={14}
              tintColor={theme.colors.textSecondary}
            />
            <Text style={[styles.cardFooterText, { color: theme.colors.textSecondary }]}>
              Tocar para ver en tamaño completo
            </Text>
          </View>
        </Pressable>
      </FeaturePlaceholder>

      <Modal
        visible={isFullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setIsFullscreen(false)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar vista completa"
          >
            <SymbolView
              name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
              size={32}
              tintColor="#FFFFFF"
            />
          </Pressable>
          <View style={styles.modalImageContainer}>
            <Image
              source={previewImage}
              style={styles.modalImage}
              contentFit="contain"
              accessibilityLabel="Boletín público de avalanchas en pantalla completa"
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1080 / 1101,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardFooterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalImageContainer: {
    width: '100%',
    height: '82%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
