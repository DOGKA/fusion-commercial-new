import PowerCalculator from '@/components/power-calculator/PowerCalculator';
import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.powerCalculator;

export default function GucHesaplayiciPage() {
  return (
    <div data-page-root className="min-h-screen bg-background pb-16" style={{ paddingTop: '120px' }}>
      <PowerCalculator />
    </div>
  );
}
