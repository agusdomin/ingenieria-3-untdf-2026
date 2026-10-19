import { FeaturePlaceholder } from '../../components/navigation/FeaturePlaceholder';

export function NewObservationScreen() {
  return (
    <FeaturePlaceholder
      icon={{ ios: 'plus.app', android: 'add_box', web: 'add_box' }}
      eyebrow="Observación de terreno"
      title="Carga en preparación"
      description="El formulario de observaciones todavía no está conectado con la API. No se enviará ningún dato."
    />
  );
}
