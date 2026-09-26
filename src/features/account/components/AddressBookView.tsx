"use client";

import * as React from "react";
import type { CustomerAddress } from "@/types/customer";
import type { CommerceResult } from "@/lib/commerce/types";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { AccountNav } from "./AccountNav";
import { AddressForm } from "./AddressForm";
import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "../actions";

export interface AddressBookViewProps {
  addresses: CustomerAddress[];
}

export const AddressBookView = ({ addresses }: AddressBookViewProps) => {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<CustomerAddress | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleCreate = async (address: Partial<CustomerAddress>): Promise<CommerceResult<unknown>> => {
    const res = await createAddressAction(address as Omit<CustomerAddress, "id">);
    if (res.ok) {
      setIsAddOpen(false);
    }
    return res;
  };

  const handleUpdate = async (address: Partial<CustomerAddress>): Promise<CommerceResult<unknown>> => {
    if (!address.id) {
      return { ok: false, error: { code: "VALIDATION_ERROR", message: "Missing address ID." } };
    }
    const res = await updateAddressAction(address.id, address);
    if (res.ok) {
      setEditingAddress(null);
    }
    return res;
  };

  const handleDelete = (addressId: string) => {
    setErrorMessage(null);
    setDeletingId(addressId);
    startTransition(async () => {
      const res = await deleteAddressAction(addressId);
      setDeletingId(null);
      if (!res.ok) {
        setErrorMessage(res.error.message || "Failed to delete address.");
      }
    });
  };

  const handleSetDefault = (addressId: string) => {
    setErrorMessage(null);
    setSettingDefaultId(addressId);
    startTransition(async () => {
      const res = await setDefaultAddressAction(addressId);
      setSettingDefaultId(null);
      if (!res.ok) {
        setErrorMessage(res.error.message || "Failed to set default address.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-[var(--spacing-6)]">
      <AccountNav />

      <div className="flex flex-wrap items-center justify-between gap-[var(--spacing-4)] border-b border-[var(--color-border-subtle)] pb-[var(--spacing-4)]">
        <div>
          <h2 className="font-serif text-[length:var(--text-subtitle)] text-[var(--color-fg-primary)] font-normal">
            Saved Delivery Locations
          </h2>
          <p className="font-sans text-[length:var(--text-caption)] text-[var(--color-fg-muted)]">
            {addresses.length} {addresses.length === 1 ? "saved address" : "saved addresses"}
          </p>
        </div>

        <Button type="button" variant="primary" onClick={() => setIsAddOpen(true)}>
          + Add New Address
        </Button>
      </div>

      {errorMessage && (
        <FormMessage type="error" className="my-[var(--spacing-2)]">
          {errorMessage}
        </FormMessage>
      )}

      {addresses.length === 0 ? (
        <div className="border border-[var(--color-border-subtle)] p-[var(--spacing-8)] text-center flex flex-col items-center gap-[var(--spacing-4)]">
          <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-muted)]">
            No saved addresses found. Keep your delivery locations updated for seamless checkout.
          </p>
          <Button type="button" variant="secondary" onClick={() => setIsAddOpen(true)}>
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-6)]">
          {addresses.map((address) => {
            const isDeleting = deletingId === address.id;
            const isSettingDefault = settingDefaultId === address.id;

            return (
              <div
                key={address.id}
                className="border border-[var(--color-border-subtle)] p-[var(--spacing-6)] flex flex-col justify-between gap-[var(--spacing-4)] relative hover:border-[var(--color-border-default)] transition-colors"
              >
                <div className="flex flex-col gap-[var(--spacing-2)]">
                  {address.isDefault && (
                    <span className="self-start px-[var(--spacing-2)] py-[var(--spacing-1)] bg-[var(--color-bg-secondary)] text-[var(--color-fg-primary)] border border-[var(--color-border-default)] font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase font-semibold">
                      Default Delivery Location
                    </span>
                  )}

                  <p className="font-sans text-[length:var(--text-body)] font-medium text-[var(--color-fg-primary)] mt-[var(--spacing-1)]">
                    {[address.firstName, address.lastName].filter(Boolean).join(" ") || "Saved Address"}
                  </p>

                  {address.company && (
                    <p className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)] font-normal">
                      {address.company}
                    </p>
                  )}

                  <p className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)]">
                    {address.address1}
                    {address.address2 ? `, ${address.address2}` : ""}
                    <br />
                    {address.city}
                    {address.province ? `, ${address.province}` : ""} {address.zip}
                    <br />
                    {address.country}
                  </p>

                  {address.phone && (
                    <p className="font-sans text-[length:var(--text-caption)] text-[var(--color-fg-muted)] mt-[var(--spacing-1)]">
                      Phone: {address.phone}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-[var(--spacing-3)] border-t border-[var(--color-border-subtle)] pt-[var(--spacing-4)]">
                  <button
                    type="button"
                    onClick={() => setEditingAddress(address)}
                    disabled={isPending}
                    className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase underline text-[var(--color-fg-primary)] hover:text-[var(--color-fg-muted)] transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    disabled={isPending || isDeleting}
                    className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase underline text-[var(--color-fg-primary)] hover:text-[var(--color-fg-muted)] transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting\u2026" : "Delete"}
                  </button>

                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={isPending || isSettingDefault}
                      className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase underline text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] transition-colors ml-auto disabled:opacity-50"
                    >
                      {isSettingDefault ? "Updating\u2026" : "Make Default"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Address Dialog */}
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Address">
        <AddressForm
          onSubmit={handleCreate}
          onCancel={() => setIsAddOpen(false)}
          submitLabel="Save Address"
        />
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog
        open={Boolean(editingAddress)}
        onClose={() => setEditingAddress(null)}
        title="Edit Address"
      >
        {editingAddress && (
          <AddressForm
            initialData={editingAddress}
            onSubmit={handleUpdate}
            onCancel={() => setEditingAddress(null)}
            submitLabel="Update Address"
          />
        )}
      </Dialog>
    </div>
  );
};
