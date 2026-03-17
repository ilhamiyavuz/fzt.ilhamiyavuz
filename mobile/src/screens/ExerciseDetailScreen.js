import { ScreenTemplate } from '../components/ScreenTemplate';
import { tr } from '../localization/tr';

export function ExerciseDetailScreen() {
  return (
    <ScreenTemplate
      title={tr.egzersizDetay}
      subtitle="Türkçe açıklama, profesyonel video ve hareket yönergeleri."
      actionLabel={tr.kameraTakip}
    />
  );
}
