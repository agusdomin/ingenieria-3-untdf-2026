import { FeaturePlaceholder } from '../../../src/components/navigation/FeaturePlaceholder';

export default function OfflineTab() {
  return (
    <FeaturePlaceholder
      icon={{ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }}
      eyebrow="Sincronización"
      title="Modo offline"
      description="La descarga de mapas y la sincronización de observaciones todavía no están conectadas."
    />
  );
}
