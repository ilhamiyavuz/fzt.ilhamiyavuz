import { ScreenTemplate } from '../components/ScreenTemplate';
import { tr } from '../localization/tr';

export function TodayPlanScreen() {
  return <ScreenTemplate title={tr.bugunkuPlan} subtitle="Set, tekrar ve dinlenme süreleri burada." actionLabel={tr.basla} />;
}
