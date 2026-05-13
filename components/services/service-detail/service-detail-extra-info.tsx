"use client";

import { Card, CardBody, CardHeader, Tab, Tabs } from "@heroui/react";
import type { ServiceExtraSection } from "./service-detail-utils";


import {
  buildExtraSections,
  egpCardSurface,
  proseDetailClass,
} from "./service-detail-utils";

import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailExtraInfoProps = {
  details: string | null;
  preparation: string | null;
  aftercare: string | null;
};

export function ServiceDetailExtraInfo({
  details,
  preparation,
  aftercare,
}: ServiceDetailExtraInfoProps) {
  const extraSections: ServiceExtraSection[] = buildExtraSections(
    details,
    preparation,
    aftercare,
  );

  if (extraSections.length === 0) return null;

  return (
    <section
      className={`${layout.sectionPy} bg-white dark:bg-egp-green-darker`}
    >
      <div className={layout.container}>
        <div className="mx-auto max-w-4xl">
          <h2
            className={`${typography.headingSection} ${textColors.heading} mb-5 text-center sm:mb-6`}
          >
            More information
          </h2>
          {extraSections.length === 1 ? (
            <Card className={egpCardSurface}>
              <CardHeader className="px-4 pt-4 sm:px-5 sm:pt-5">
                <h3
                  className={`${typography.headingSmall} ${textColors.heading}`}
                >
                  {extraSections[0].title}
                </h3>
              </CardHeader>
              <CardBody className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                <p className={proseDetailClass()}>{extraSections[0].content}</p>
              </CardBody>
            </Card>
          ) : (
            <Card className={egpCardSurface}>
              <CardBody className="p-3 sm:p-5">
                <Tabs
                  aria-label="Treatment information"
                  classNames={{
                    tabList:
                      "w-full flex-wrap gap-1 rounded-lg border border-gray-200 bg-egp-beige-lighter/80 p-1 dark:border-egp-green-dark dark:bg-egp-green-darker/80",
                    cursor: "bg-egp-green shadow-sm dark:bg-egp-beige",
                    tab: "text-gray-700 data-[selected=true]:text-white dark:text-egp-beige/90 dark:data-[selected=true]:text-egp-green-darker",
                    tabContent: "group-data-[selected=true]:text-white",
                  }}
                  variant="bordered"
                >
                  {extraSections.map((tab) => (
                    <Tab key={tab.key} title={tab.title}>
                      <div className="pt-3 sm:pt-4">
                        <p className={proseDetailClass()}>{tab.content}</p>
                      </div>
                    </Tab>
                  ))}
                </Tabs>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
