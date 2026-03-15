import { ScreenTemplate } from '../components/ScreenTemplate';
import { tr } from '../localization/tr';

export function PainLogScreen() {
  return <ScreenTemplate title={tr.agriGunlugu} subtitle="Ağrı, yorgunluk, sertlik ve şişlik durumunu kaydedin." actionLabel={tr.kaydet} />;
}
