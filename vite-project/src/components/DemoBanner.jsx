import Icon from "./Icon";
import { useDemoMode } from "../demo/demoStore";

function DemoBanner() {
  const isDemo = useDemoMode();

  if (!isDemo) return null;

  return (
    <div className="demo-banner" role="status">
      <span className="demo-banner-icon">
        <Icon name="info" size={16} />
      </span>
      <span>وضع تجريبي — جميع البيانات المعروضة وهمية ولا تُحفظ في قاعدة البيانات.</span>
      <span className="demo-banner-note">إجراءات الحجز والكشف معطّلة في هذا الوضع.</span>
    </div>
  );
}

export default DemoBanner;
