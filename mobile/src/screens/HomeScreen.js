import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { API_BASE_URL } from '../config/api';
import { useAuth } from '../state/AuthContext';
import { tr } from '../localization/tr';
import { commonStyles } from '../theme/styles';

export function HomeScreen() {
  const { accessToken } = useAuth();
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchPlan() {
      if (!accessToken) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/patients/me/today-plan`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.detail || 'Plan alınamadı');
        if (active) setPlan(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Plan alınamadı');
          setPlan([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchPlan();
    return () => {
      active = false;
    };
  }, [accessToken]);

  return (
    <View style={commonStyles.screen}>
      <Text style={commonStyles.title}>{tr.anaSayfa}</Text>
      <Text style={commonStyles.subtitle}>{tr.hosGeldiniz}</Text>

      <View style={commonStyles.card}>
        <Text style={{ fontSize: 18, marginBottom: 8 }}>Bugünkü Egzersiz Planı</Text>
        {loading ? <Text>Yükleniyor...</Text> : null}
        {error ? <Text style={{ color: '#be123c' }}>{error}</Text> : null}

        {!loading && !error && plan.length === 0 ? <Text>Bugün için atanmış egzersiz bulunmuyor.</Text> : null}

        {plan.map((item) => (
          <Text key={item.program_item_id} style={{ fontSize: 16 }}>
            • Set {item.sets} x Tekrar {item.reps} (Dinlenme: {item.rest_seconds ?? 0} sn)
          </Text>
        ))}
      </View>

      <TouchableOpacity style={commonStyles.button}>
        <Text style={commonStyles.buttonText}>{tr.basla}</Text>
      </TouchableOpacity>
    </View>
  );
}
