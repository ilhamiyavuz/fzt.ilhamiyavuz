import { ScreenTemplate } from '../components/ScreenTemplate';
import { tr } from '../localization/tr';

export function ForgotPasswordScreen() {
  return <ScreenTemplate title={tr.sifremiUnuttum} subtitle="E-posta adresinize sıfırlama bağlantısı gönderelim." />;
}
