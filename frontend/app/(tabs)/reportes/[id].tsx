import { useLocalSearchParams } from 'expo-router';

import { FeaturePlaceholder } from '../../../src/components/navigation/FeaturePlaceholder';

export default function ReportDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <FeaturePlaceholder
      icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
      eyebrow="Reporte"
      title={`Reporte ${id ?? ''}`}
      description="El detalle del reporte todavía no está conectado con la API."
    />
  );
}
