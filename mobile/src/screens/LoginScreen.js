import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../state/AuthContext';
import { commonStyles } from '../theme/styles';

export function LoginScreen({ navigation }) {
  const { login, loading, error } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      await login(emailOrPhone, password);
      navigation.navigate('AnaSayfa');
    } catch {
      // Hata metni context içinde yönetiliyor.
    }
  }

  return (
    <View style={commonStyles.screen}>
      <Text style={commonStyles.title}>Giriş</Text>
      <Text style={commonStyles.subtitle}>Hesabınıza güvenli şekilde erişin.</Text>

      <View style={commonStyles.card}>
        <TextInput
          placeholder="E-posta veya Telefon"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 10 }}
        />
        <TextInput
          placeholder="Şifre"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12 }}
        />
      </View>

      {error ? <Text style={{ color: '#be123c', marginBottom: 8 }}>{error}</Text> : null}

      <TouchableOpacity style={commonStyles.button} onPress={handleLogin} disabled={loading}>
        <Text style={commonStyles.buttonText}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 10 }} onPress={() => navigation.navigate('Kayit')}>
        <Text style={{ fontSize: 16, color: '#146C94' }}>Kayıt Ol</Text>
      </TouchableOpacity>
    </View>
  );
}
