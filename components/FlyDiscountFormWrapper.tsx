"use client";

import { FlyDiscountForm, useFlyDiscountForm } from "@/components/FlyDiscountForm";

export function FlyDiscountFormWrapper() {
  const { isVisible, hideForm } = useFlyDiscountForm();

  return <FlyDiscountForm isVisible={isVisible} onClose={hideForm} />;
}





