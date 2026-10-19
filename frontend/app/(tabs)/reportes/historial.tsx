import { FeaturePlaceholder } from '../../../src/components/navigation/FeaturePlaceholder';

export default function ReportHistoryRoute() {
  return (
    <FeaturePlaceholder
      icon={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }}
      eyebrow="Actividad"
      title="Historial"
      description="El historial de reportes aparecerá acá cuando se conecte con la API."
    />
  );
}
