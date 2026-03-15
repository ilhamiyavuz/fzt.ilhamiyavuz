import { Text, View } from 'react-native';
import { tr } from '../localization/tr';
import { commonStyles } from '../theme/styles';

export function AccessibilityScreen() {
  return (
    <View style={commonStyles.screen}>
      <Text style={commonStyles.title}>{tr.erisilebilirlik}</Text>
      <View style={commonStyles.card}>
        <Text style={{ fontSize: 18 }}>• Yazı Boyutunu Büyüt</Text>
        <Text style={{ fontSize: 18 }}>• Yüksek Kontrast</Text>
        <Text style={{ fontSize: 18 }}>• Sesli Yönlendirme</Text>
        <Text style={{ fontSize: 18 }}>• Titreşimli Onay</Text>
      </View>
    </View>
  );
}
