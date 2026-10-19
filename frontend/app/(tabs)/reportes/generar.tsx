import { FeaturePlaceholder } from '../../../src/components/navigation/FeaturePlaceholder';

export default function GenerateReportRoute() {
  return (
    <FeaturePlaceholder
      icon={{ ios: 'square.and.pencil', android: 'edit_note', web: 'edit_note' }}
      eyebrow="Nuevo reporte"
      title="Formulario en preparación"
      description="La carga de reportes todavía no está conectada con la API."
    />
  );
}
