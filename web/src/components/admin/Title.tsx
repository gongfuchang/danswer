import { HealthCheckBanner } from "../health/healthcheck";
import { Divider } from "@tremor/react";

export function AdminPageTitle({
  icon,
  title,
  farRightElement,
  includeDivider = false,
}: {
  icon: JSX.Element;
  title: string | JSX.Element;
  farRightElement?: JSX.Element;
  includeDivider?: boolean;
}) {
  return (
    <div>
      <div className="mb-4">
        <HealthCheckBanner />
      </div>
      <div className="flex pb-6 pt-2">
        <h1 className="text-xl text-strong font-bold flex gap-x-2">
          {icon} {title}
        </h1>
        {farRightElement && <div className="ml-auto">{farRightElement}</div>}
      </div>
      {includeDivider && <Divider />}
    </div>
  );
}
