"use client";

import * as React from "react";
import type { CustomerAddress } from "@/types/customer";
import type { CommerceResult } from "@/lib/commerce/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";

export interface AddressFormProps {
  initialData?: CustomerAddress;
  onSubmit: (address: Partial<CustomerAddress>) => Promise<CommerceResult<unknown>>;
  onCancel: () => void;
  submitLabel?: string;
}

export const AddressForm = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save Address",
}: AddressFormProps) => {
  const [firstName, setFirstName] = React.useState(initialData?.firstName || "");
  const [lastName, setLastName] = React.useState(initialData?.lastName || "");
  const [company, setCompany] = React.useState(initialData?.company || "");
  const [address1, setAddress1] = React.useState(initialData?.address1 || "");
  const [address2, setAddress2] = React.useState(initialData?.address2 || "");
  const [city, setCity] = React.useState(initialData?.city || "");
  const [province, setProvince] = React.useState(initialData?.province || "");
  const [country, setCountry] = React.useState(initialData?.country || "US");
  const [zip, setZip] = React.useState(initialData?.zip || "");
  const [phone, setPhone] = React.useState(initialData?.phone || "");
  const [isDefault, setIsDefault] = React.useState(Boolean(initialData?.isDefault));

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!address1.trim()) errs.address1 = "Address line 1 is required.";
    if (!city.trim()) errs.city = "City is required.";
    if (!country.trim()) errs.country = "Country code (e.g. US) is required.";
    if (!zip.trim()) errs.zip = "Postal / ZIP code is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    startTransition(async () => {
      const payload: Partial<CustomerAddress> = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        company: company.trim() || undefined,
        address1: address1.trim(),
        address2: address2.trim() || undefined,
        city: city.trim(),
        province: province.trim() || undefined,
        country: country.trim().toUpperCase(),
        zip: zip.trim(),
        phone: phone.trim() || undefined,
        isDefault,
      };

      if (initialData?.id) {
        payload.id = initialData.id;
      }

      const result = await onSubmit(payload);
      if (!result.ok) {
        setServerError(result.error.message || "Failed to save address. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[var(--spacing-4)]">
      {serverError && (
        <FormMessage type="error" className="mb-[var(--spacing-2)]">
          {serverError}
        </FormMessage>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--spacing-4)]">
        <Field label="First Name" htmlFor="addr-first-name" message={errors.firstName} messageType="error">
          <Input
            id="addr-first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isPending}
            autoComplete="given-name"
          />
        </Field>

        <Field label="Last Name" htmlFor="addr-last-name" message={errors.lastName} messageType="error">
          <Input
            id="addr-last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isPending}
            autoComplete="family-name"
          />
        </Field>
      </div>

      <Field label="Company (Optional)" htmlFor="addr-company">
        <Input
          id="addr-company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          disabled={isPending}
          autoComplete="organization"
        />
      </Field>

      <Field
        label="Address Line 1"
        htmlFor="addr-address1"
        required
        message={errors.address1}
        messageType="error"
      >
        <Input
          id="addr-address1"
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
          aria-invalid={Boolean(errors.address1)}
          disabled={isPending}
          autoComplete="address-line1"
        />
      </Field>

      <Field label="Address Line 2 (Apartment, Suite, etc.)" htmlFor="addr-address2">
        <Input
          id="addr-address2"
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
          disabled={isPending}
          autoComplete="address-line2"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--spacing-4)]">
        <Field label="City" htmlFor="addr-city" required message={errors.city} messageType="error">
          <Input
            id="addr-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-invalid={Boolean(errors.city)}
            disabled={isPending}
            autoComplete="address-level2"
          />
        </Field>

        <Field label="State / Province" htmlFor="addr-province">
          <Input
            id="addr-province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            disabled={isPending}
            autoComplete="address-level1"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--spacing-4)]">
        <Field label="Postal / ZIP Code" htmlFor="addr-zip" required message={errors.zip} messageType="error">
          <Input
            id="addr-zip"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            aria-invalid={Boolean(errors.zip)}
            disabled={isPending}
            autoComplete="postal-code"
          />
        </Field>

        <Field
          label="Country Code (e.g. US, CA, GB)"
          htmlFor="addr-country"
          required
          message={errors.country}
          messageType="error"
        >
          <Input
            id="addr-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-invalid={Boolean(errors.country)}
            disabled={isPending}
            autoComplete="country"
            maxLength={2}
          />
        </Field>
      </div>

      <Field label="Phone Number (Optional)" htmlFor="addr-phone">
        <Input
          id="addr-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isPending}
          autoComplete="tel"
        />
      </Field>

      <div className="flex items-center gap-[var(--spacing-2)] my-[var(--spacing-2)]">
        <Checkbox
          id="addr-is-default"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          disabled={isPending}
        />
        <label
          htmlFor="addr-is-default"
          className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-primary)] select-none cursor-pointer"
        >
          Set as default delivery address
        </label>
      </div>

      <div className="flex items-center justify-end gap-[var(--spacing-3)] mt-[var(--spacing-4)]">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving\u2026" : submitLabel}
        </Button>
      </div>
    </form>
  );
};
