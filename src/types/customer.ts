/**
 * Customer Domain Model — Stage 4.11
 *
 * Provider-neutral domain models for customer profile and saved addresses.
 */

export type CustomerAddress = {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
  isDefault?: boolean;
};

export type CustomerProfile = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  defaultAddress?: CustomerAddress;
  addresses: CustomerAddress[];
};

/** @deprecated Legacy minimal model kept for backwards compatibility */
export type Customer = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};
