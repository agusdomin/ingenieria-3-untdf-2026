import { FeaturePlaceholder } from '../../../src/components/navigation/FeaturePlaceholder';

export default function PlanningTab() {
  return (
    <FeaturePlaceholder
      icon={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
      eyebrow="Prepará la salida"
      title="Planificar"
      description="Organizá itinerario, horarios y participantes antes de salir a la montaña."
    />
  );
}
