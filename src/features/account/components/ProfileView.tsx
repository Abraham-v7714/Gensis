"use client";

/**
 * ProfileView — Stage 4.12
 *
 * Renders authenticated customer profile overview, account navigation,
 * default address preview, and quick access to order history and saved addresses.
 */

import * as React from "react";
import Link from "next/link";
import type { CustomerProfile } from "@/types/customer";
import { AccountNav } from "./AccountNav";

export interface ProfileViewProps {
  profile: CustomerProfile;
}

export const ProfileView = ({ profile }: ProfileViewProps) => {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-[var(--spacing-6)]">
      <AccountNav />

      {/* Account Welcome & Details */}
      <div className="border border-[var(--color-border-subtle)] p-[var(--spacing-6)] md:p-[var(--spacing-8)] flex flex-col gap-[var(--spacing-4)]">
        <span className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
          Account Overview
        </span>
        <h2 className="font-serif text-[length:var(--text-title)] text-[var(--color-fg-primary)] font-normal">
          Welcome back, {fullName || "Valued Client"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[var(--spacing-4)] border-t border-[var(--color-border-subtle)] pt-[var(--spacing-4)] mt-[var(--spacing-2)] font-sans text-[length:var(--text-small)]">
          <div>
            <span className="text-[var(--color-fg-muted)] block">Email</span>
            <span className="text-[var(--color-fg-primary)] font-medium">{profile.email}</span>
          </div>
          {profile.phone && (
            <div>
              <span className="text-[var(--color-fg-muted)] block">Phone</span>
              <span className="text-[var(--color-fg-primary)] font-medium">{profile.phone}</span>
            </div>
          )}
          <div>
            <span className="text-[var(--color-fg-muted)] block">Saved Locations</span>
            <span className="text-[var(--color-fg-primary)] font-medium">
              {profile.addresses.length} {profile.addresses.length === 1 ? "address" : "addresses"}
            </span>
          </div>
        </div>
      </div>

      {/* Account Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-6)]">
        <Link
          href="/account/orders"
          className="group border border-[var(--color-border-subtle)] p-[var(--spacing-6)] hover:border-[var(--color-border-default)] transition-colors flex flex-col justify-between min-h-[160px]"
        >
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <span className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
              Purchases
            </span>
            <h3 className="font-serif text-[length:var(--text-subtitle)] text-[var(--color-fg-primary)] group-hover:text-[var(--color-fg-muted)] transition-colors">
              Order History →
            </h3>
          </div>
          <p className="font-sans text-[length:var(--text-caption)] text-[var(--color-fg-muted)]">
            Review past garment orders, financial status, and fulfillment details.
          </p>
        </Link>

        <Link
          href="/account/addresses"
          className="group border border-[var(--color-border-subtle)] p-[var(--spacing-6)] hover:border-[var(--color-border-default)] transition-colors flex flex-col justify-between min-h-[160px]"
        >
          <div className="flex flex-col gap-[var(--spacing-2)]">
            <span className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
              Delivery
            </span>
            <h3 className="font-serif text-[length:var(--text-subtitle)] text-[var(--color-fg-primary)] group-hover:text-[var(--color-fg-muted)] transition-colors">
              Address Book ({profile.addresses.length}) →
            </h3>
          </div>
          <p className="font-sans text-[length:var(--text-caption)] text-[var(--color-fg-muted)]">
            Manage your saved shipping addresses and default delivery location.
          </p>
        </Link>
      </div>

      {/* Default Address Preview */}
      {profile.defaultAddress && (
        <div className="border border-[var(--color-border-subtle)] p-[var(--spacing-6)] flex flex-col gap-[var(--spacing-2)]">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
              Default Delivery Location
            </span>
            <Link
              href="/account/addresses"
              className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase underline text-[var(--color-fg-primary)] hover:text-[var(--color-fg-muted)] transition-colors"
            >
              Edit
            </Link>
          </div>
          <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-primary)] font-medium">
            {[profile.defaultAddress.firstName, profile.defaultAddress.lastName].filter(Boolean).join(" ")}
          </p>
          <p className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)]">
            {profile.defaultAddress.address1}
            {profile.defaultAddress.address2 ? `, ${profile.defaultAddress.address2}` : ""}
            <br />
            {profile.defaultAddress.city}
            {profile.defaultAddress.province ? `, ${profile.defaultAddress.province}` : ""}{" "}
            {profile.defaultAddress.zip}
            <br />
            {profile.defaultAddress.country}
          </p>
        </div>
      )}
    </div>
  );
};
