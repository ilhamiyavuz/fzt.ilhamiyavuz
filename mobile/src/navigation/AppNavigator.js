import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AccessibilityScreen } from '../screens/AccessibilityScreen';
import { CameraTrackingScreen } from '../screens/CameraTrackingScreen';
import { ExerciseDetailScreen } from '../screens/ExerciseDetailScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PainLogScreen } from '../screens/PainLogScreen';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { TodayPlanScreen } from '../screens/TodayPlanScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Giris"
      screenOptions={{
        headerTitleStyle: { fontSize: 20, fontWeight: '600' },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="Giris" component={LoginScreen} options={{ title: 'Giriş' }} />
      <Stack.Screen name="Kayit" component={RegisterScreen} options={{ title: 'Kayıt Ol' }} />
      <Stack.Screen name="SifremiUnuttum" component={ForgotPasswordScreen} options={{ title: 'Şifremi Unuttum' }} />
      <Stack.Screen name="AnaSayfa" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
      <Stack.Screen name="BugunkuPlan" component={TodayPlanScreen} options={{ title: 'Bugünkü Planım' }} />
      <Stack.Screen name="EgzersizDetay" component={ExerciseDetailScreen} options={{ title: 'Egzersiz Detayı' }} />
      <Stack.Screen name="KameraTakip" component={CameraTrackingScreen} options={{ title: 'Kamera Takibi' }} />
      <Stack.Screen name="Ilerleme" component={ProgressScreen} options={{ title: 'İlerleme' }} />
      <Stack.Screen name="AgriGunlugu" component={PainLogScreen} options={{ title: 'Ağrı Günlüğü' }} />
      <Stack.Screen name="Bildirimler" component={NotificationsScreen} options={{ title: 'Bildirimler' }} />
      <Stack.Screen name="ProfilAyarlar" component={ProfileSettingsScreen} options={{ title: 'Profil ve Ayarlar' }} />
      <Stack.Screen name="Erisilebilirlik" component={AccessibilityScreen} options={{ title: 'Erişilebilirlik Ayarları' }} />
    </Stack.Navigator>
  );
}
