import { FeaturePlaceholder } from '../../../src/components/navigation/FeaturePlaceholder';

export default function ReportsTab() {
  return (
    <FeaturePlaceholder
      icon={{ ios: 'waveform.path.ecg', android: 'monitoring', web: 'monitoring' }}
      eyebrow="Bitácora de montaña"
      title="Reportes"
      description="Los reportes de terreno y sus actualizaciones van a aparecer acá."
    />
  );
}
