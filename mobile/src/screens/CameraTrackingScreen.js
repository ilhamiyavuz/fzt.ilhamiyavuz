import { Text, View } from 'react-native';
import { tr } from '../localization/tr';
import { commonStyles } from '../theme/styles';

export function CameraTrackingScreen() {
  return (
    <View style={commonStyles.screen}>
      <Text style={commonStyles.title}>{tr.kameraTakip}</Text>
      <View style={commonStyles.card}>
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Anlık AI Geri Bildirim</Text>
        <Text style={{ fontSize: 20, color: '#146C94' }}>{tr.geriBildirimOrnek}</Text>
      </View>
      <View style={commonStyles.card}>
        <Text style={{ fontSize: 18 }}>Tekrar: 6 / 10</Text>
        <Text style={{ fontSize: 18 }}>Hareket Puanı: 82/100</Text>
      </View>
    </View>
  );
}
