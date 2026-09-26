"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Order } from "@/types/order";
import { Price } from "@/components/commerce/Price";
import { AccountNav } from "./AccountNav";

export interface OrderDetailViewProps {
  order: Order;
}

function renderBadge(label: string, isPositive: boolean) {
  return (
    <span
      className={`inline-flex items-center px-[var(--spacing-2)] py-[var(--spacing-1)] font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase font-semibold ${
        isPositive
          ? "bg-[var(--color-bg-secondary)] text-[var(--color-fg-primary)] border border-[var(--color-border-default)]"
          : "bg-[var(--color-bg-secondary)] text-[var(--color-fg-muted)] border border-[var(--color-border-subtle)]"
      }`}
    >
      {label}
    </span>
  );
}

export const OrderDetailView = ({ order }: OrderDetailViewProps) => {
  const dateStr = new Date(order.processedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-[var(--spacing-6)]">
      <AccountNav />

      <div className="flex items-center gap-[var(--spacing-2)]">
        <Link
          href="/account/orders"
          className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] transition-colors"
        >
          ← Back to Order History
        </Link>
      </div>

      {/* Header */}
      <div className="border border-[var(--color-border-subtle)] p-[var(--spacing-6)] md:p-[var(--spacing-8)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[var(--spacing-4)]">
        <div className="flex flex-col gap-[var(--spacing-2)]">
          <div className="flex items-center gap-[var(--spacing-3)] flex-wrap">
            <h2 className="font-serif text-[length:var(--text-title)] text-[var(--color-fg-primary)] font-normal">
              Order #{order.orderNumber}
            </h2>
            {order.financialStatus &&
              order.financialStatus !== "UNKNOWN" &&
              renderBadge(order.financialStatus, order.financialStatus === "PAID")}
            {order.fulfillmentStatus &&
              order.fulfillmentStatus !== "UNKNOWN" &&
              renderBadge(order.fulfillmentStatus, order.fulfillmentStatus === "FULFILLED")}
          </div>
          <p className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)]">
            Placed on {dateStr}
          </p>
        </div>

        {order.statusUrl && (
          <a
            href={order.statusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-[var(--spacing-4)] h-[var(--spacing-10)] inline-flex items-center justify-center border border-[var(--color-border-default)] font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Order Status ↗
          </a>
        )}
      </div>

      {/* Real Fulfillment & Tracking Information (render ONLY when available) */}
      {order.fulfillments && order.fulfillments.length > 0 && (
        <div className="border border-[var(--color-border-subtle)] p-[var(--spacing-6)] flex flex-col gap-[var(--spacing-4)]">
          <h3 className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
            Shipment & Tracking Information
          </h3>
          <div className="flex flex-col gap-[var(--spacing-4)]">
            {order.fulfillments.map((fulfillment) => (
              <div
                key={fulfillment.id}
                className="flex flex-col gap-[var(--spacing-2)] border-t border-[var(--color-border-subtle)] pt-[var(--spacing-3)] first:border-t-0 first:pt-0"
              >
                {fulfillment.status && (
                  <div className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-primary)]">
                    <span className="text-[var(--color-fg-muted)]">Status: </span>
                    <span className="font-medium">{fulfillment.status}</span>
                  </div>
                )}
                {fulfillment.trackingInfo && fulfillment.trackingInfo.length > 0 && (
                  <div className="flex flex-col gap-[var(--spacing-2)] mt-[var(--spacing-1)]">
                    {fulfillment.trackingInfo.map((info, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center gap-[var(--spacing-4)] font-sans text-[length:var(--text-small)]"
                      >
                        {info.company && (
                          <span className="text-[var(--color-fg-primary)] font-medium">
                            Carrier: {info.company}
                          </span>
                        )}
                        {info.number && (
                          <span className="text-[var(--color-fg-muted)]">
                            Tracking #: {info.number}
                          </span>
                        )}
                        {info.url && (
                          <a
                            href={info.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-[var(--color-fg-primary)] hover:text-[var(--color-fg-muted)] transition-colors"
                          >
                            Track Package ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Summary & Line Items */}
      <div className="border border-[var(--color-border-subtle)] p-[var(--spacing-6)] md:p-[var(--spacing-8)] flex flex-col gap-[var(--spacing-6)]">
        <h3 className="font-serif text-[length:var(--text-subtitle)] text-[var(--color-fg-primary)]">
          Items Ordered ({order.lineItems.length})
        </h3>

        <div className="flex flex-col gap-[var(--spacing-4)] border-b border-[var(--color-border-subtle)] pb-[var(--spacing-6)]">
          {order.lineItems.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-[var(--spacing-4)]">
              <div className="flex items-start gap-[var(--spacing-4)]">
                {item.image?.url && (
                  <div className="relative w-16 h-20 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] shrink-0 overflow-hidden">
                    <Image
                      src={item.image.url}
                      alt={item.image.alt || item.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-[var(--spacing-1)]">
                  <p className="font-serif text-[length:var(--text-subtitle)] text-[var(--color-fg-primary)] font-normal">
                    {item.title}
                  </p>
                  {item.variantTitle && (
                    <p className="font-sans text-[length:var(--text-caption)] text-[var(--color-fg-muted)]">
                      {item.variantTitle}
                    </p>
                  )}
                  <p className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)]">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
              <Price money={item.price} className="font-medium text-[length:var(--text-body)]" />
            </div>
          ))}
        </div>

        {/* Cost breakdown */}
        <div className="flex flex-col gap-[var(--spacing-2)] max-w-xs self-end w-full">
          {order.subtotalPrice && (
            <div className="flex justify-between font-sans text-[length:var(--text-small)]">
              <span className="text-[var(--color-fg-muted)]">Subtotal</span>
              <Price money={order.subtotalPrice} />
            </div>
          )}
          {order.totalTax && (
            <div className="flex justify-between font-sans text-[length:var(--text-small)]">
              <span className="text-[var(--color-fg-muted)]">Tax</span>
              <Price money={order.totalTax} />
            </div>
          )}
          <div className="flex justify-between font-sans text-[length:var(--text-body)] font-semibold border-t border-[var(--color-border-subtle)] pt-[var(--spacing-3)] mt-[var(--spacing-1)]">
            <span>Total</span>
            <Price money={order.totalPrice} />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="border border-[var(--color-border-subtle)] p-[var(--spacing-6)] flex flex-col gap-[var(--spacing-2)] max-w-md">
          <h3 className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)]">
            Shipping Address
          </h3>
          <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-primary)] font-medium">
            {[order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(" ")}
          </p>
          <p className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)]">
            {order.shippingAddress.address1}
            {order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ""}
            <br />
            {order.shippingAddress.city}
            {order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ""}{" "}
            {order.shippingAddress.zip}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>
      )}
    </div>
  );
};
