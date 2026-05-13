"use client";

import { Tooltip } from "@heroui/tooltip";

import {
  isAdminLabelTruncated,
  truncateAdminLabel,
} from "@/lib/admin-truncate-text";

type AdminTruncatedTextProps = {
  text: string;
  /** Visible character budget including ellipsis when truncated. Default 22. */
  maxChars?: number;
  className?: string;
};

/**
 * Short label in tables with native `title` + optional HeroUI tooltip when truncated.
 */
export function AdminTruncatedText({
  text,
  maxChars = 22,
  className = "",
}: AdminTruncatedTextProps) {
  const full = text.trim();
  const short = truncateAdminLabel(full, maxChars);
  const truncated = isAdminLabelTruncated(full, maxChars);

  if (!truncated) {
    return <span className={className}>{short}</span>;
  }

  return (
    <Tooltip closeDelay={0} content={full} delay={350} placement="top">
      <span className={`cursor-default ${className}`} title={full}>
        {short}
      </span>
    </Tooltip>
  );
}
