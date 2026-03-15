import { ScreenTemplate } from '../components/ScreenTemplate';
import { tr } from '../localization/tr';

export function RegisterScreen() {
  return <ScreenTemplate title={tr.kayit} subtitle="Yeni hasta hesabınızı hızlıca oluşturun." />;
}
