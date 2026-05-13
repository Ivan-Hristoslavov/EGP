import { Card, CardBody, CardHeader } from "@heroui/react";
import { CheckCircle } from "lucide-react";

import { egpCardSurface } from "./service-detail-utils";

import { typography, textColors } from "@/config/typography";

type ServiceDetailBenefitsProps = {
  serviceBenefits: string[];
};

export function ServiceDetailBenefits({
  serviceBenefits,
}: ServiceDetailBenefitsProps) {
  if (serviceBenefits.length === 0) return null;

  return (
    <Card className={egpCardSurface}>
      <CardHeader className="pb-0 pt-4 px-4 sm:pt-5 sm:px-5">
        <h2 className={`${typography.headingCard} ${textColors.heading}`}>
          Treatment benefits
        </h2>
      </CardHeader>
      <CardBody className="gap-3 px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
        <ul className="flex flex-col gap-3">
          {serviceBenefits.map((benefit, index) => (
            <li
              key={`${index}-${benefit.slice(0, 24)}`}
              className="flex items-start gap-3"
            >
              <CheckCircle
                aria-hidden
                className="mt-0.5 h-5 w-5 shrink-0 text-egp-green dark:text-egp-beige"
              />
              <span className={`${typography.body} ${textColors.body}`}>
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
