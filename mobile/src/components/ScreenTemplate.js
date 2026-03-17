import { Text, TouchableOpacity, View } from 'react-native';
import { commonStyles } from '../theme/styles';

export function ScreenTemplate({ title, subtitle, actionLabel = 'Devam Et', onAction }) {
  return (
    <View style={commonStyles.screen}>
      <Text style={commonStyles.title}>{title}</Text>
      <Text style={commonStyles.subtitle}>{subtitle}</Text>

      <View style={commonStyles.card}>
        <Text style={{ fontSize: 18, lineHeight: 26 }}>
          Bu ekran MVP aşamasında sade ve erişilebilir kullanım için tasarlanmıştır.
        </Text>
      </View>

      {onAction ? (
        <TouchableOpacity style={commonStyles.button} onPress={onAction}>
          <Text style={commonStyles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
