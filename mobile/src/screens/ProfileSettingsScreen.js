import { ScreenTemplate } from '../components/ScreenTemplate';
import { tr } from '../localization/tr';

export function ProfileSettingsScreen() {
  return <ScreenTemplate title={tr.profilAyarlar} subtitle="Hesap, güvenlik ve kişisel tercihlerinizi yönetin." />;
}
