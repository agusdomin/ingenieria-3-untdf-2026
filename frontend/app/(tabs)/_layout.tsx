import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
        }}
      />
    </Tabs>
  );
}