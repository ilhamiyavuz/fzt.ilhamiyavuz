import { ScreenTemplate } from '../components/ScreenTemplate';
import { tr } from '../localization/tr';

export function NotificationsScreen() {
  return <ScreenTemplate title={tr.bildirimler} subtitle="Egzersiz hatırlatmalarınızı buradan takip edin." />;
}
