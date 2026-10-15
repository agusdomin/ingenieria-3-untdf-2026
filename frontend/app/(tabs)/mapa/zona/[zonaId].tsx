import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ZoneDetailPage() {
  const { zonaId } = useLocalSearchParams<{
    zonaId: string;
  }>();

  return (
    <View>
      <Text>Detalle de zona</Text>
      <Text>Zona: {zonaId}</Text>
    </View>
  );
}