"use client";

import * as React from "react";
import Link from "next/link";
import type { Order } from "@/types/order";
import type { PageInfo } from "@/lib/commerce/types";
import { Price } from "@/components/commerce/Price";
import { PaginationControls } from "@/components/commerce/PaginationControls";
import { AccountNav } from "./AccountNav";

export interface OrderHistoryViewProps {
  orders: Order[];
  pageInfo?: PageInfo;
  error?: boolean;
}

function renderStatusBadge(label: string, variant: "positive" | "warning" | "neutral" | "negative") {
  const styles = {
    positive: "bg-[var(--color-bg-secondary)] text-[var(--color-fg-primary)] border border-[var(--color-border-default)]",
    warning: "bg-[var(--color-bg-secondary)] text-[var(--color-fg-muted)] border border-[var(--color-border-subtle)]",
    neutral: "bg-[var(--color-bg-secondary)] text-[var(--color-fg-muted)]",
    negative: "bg-[var(--color-bg-secondary)] text-[var(--color-fg-primary)] border border-[var(--color-border-default)]",
  };

  return (
    <span
      className={`inline-flex items-center px-[var(--spacing-2)] py-[var(--spacing-1)] font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase font-semibold ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

function getFinancialStatusBadge(status?: string) {
  if (!status || status === "UNKNOWN") return null;
  if (status === "PAID") return renderStatusBadge("Paid", "positive");
  if (status === "PENDING" || status === "AUTHORIZED") return renderStatusBadge(status, "warning");
  if (status === "REFUNDED" || status === "PARTIALLY_REFUNDED") return renderStatusBadge(status, "neutral");
  return renderStatusBadge(status, "neutral");
}

function getFulfillmentStatusBadge(status?: string) {
  if (!status || status === "UNKNOWN") return null;
  if (status === "FULFILLED") return renderStatusBadge("Fulfilled", "positive");
  if (status === "UNFULFILLED") return renderStatusBadge("Unfulfilled", "warning");
  if (status === "PARTIALLY_FULFILLED") return renderStatusBadge("Partial", "warning");
  if (status === "ON_HOLD") return renderStatusBadge("On Hold", "negative");
  return renderStatusBadge(status, "neutral");
}

export const OrderHistoryView = ({ orders, pageInfo, error }: OrderHistoryViewProps) => {
  return (
    <div className="flex flex-col gap-[var(--spacing-6)]">
      <AccountNav />

      {error ? (
        <div
          role="alert"
          className="border border-[var(--color-border-default)] p-[var(--spacing-8)] text-center flex flex-col items-center gap-[var(--spacing-4)]"
        >
          <h2 className="font-serif text-[length:var(--text-subtitle)] text-[var(--color-fg-primary)]">
            Unable to Load Order History
          </h2>
          <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-muted)] max-w-md">
            We encountered an issue retrieving your purchase history from our system. Please refresh the page or contact client services.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-[var(--spacing-6)] h-[var(--spacing-10)] bg-[var(--color-gensis-black)] text-[var(--color-fg-inverse)] font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase font-semibold hover:bg-[var(--color-gensis-charcoal)] transition-colors"
          >
            Refresh Orders
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-[var(--spacing-16)] gap-[var(--spacing-4)] border border-[var(--color-border-subtle)]">
          <h2 className="font-serif text-[length:var(--text-subtitle)] text-[var(--color-fg-primary)]">
            No Orders Placed Yet
          </h2>
          <p className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-muted)] max-w-md">
            When you purchase garments from GENSIS, your order history and tracking details will appear here.
          </p>
          <Link
            href="/shop"
            className="mt-[var(--spacing-2)] px-[var(--spacing-6)] h-[var(--spacing-12)] inline-flex items-center justify-center bg-[var(--color-gensis-black)] text-[var(--color-fg-inverse)] font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase font-semibold hover:bg-[var(--color-gensis-charcoal)] transition-colors"
          >
            Explore Shop →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-[var(--spacing-6)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-[var(--spacing-4)]">
            <span className="font-serif text-[length:var(--text-subtitle)] text-[var(--color-fg-primary)]">
              Your Garment Purchases
            </span>
            <span className="font-sans text-[length:var(--text-caption)] text-[var(--color-fg-muted)]">
              Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>

          <div className="flex flex-col gap-[var(--spacing-4)]">
            {orders.map((order) => {
              const dateStr = new Date(order.processedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <article
                  key={order.id}
                  className="border border-[var(--color-border-subtle)] p-[var(--spacing-6)] flex flex-col gap-[var(--spacing-4)] hover:border-[var(--color-border-default)] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[var(--spacing-3)] border-b border-[var(--color-border-subtle)] pb-[var(--spacing-4)]">
                    <div className="flex flex-col gap-[var(--spacing-1)]">
                      <div className="flex items-center gap-[var(--spacing-3)] flex-wrap">
                        <h3 className="font-serif text-[length:var(--text-subtitle)] text-[var(--color-fg-primary)]">
                          Order #{order.orderNumber}
                        </h3>
                        {getFinancialStatusBadge(order.financialStatus)}
                        {getFulfillmentStatusBadge(order.fulfillmentStatus)}
                      </div>
                      <p className="font-sans text-[length:var(--text-caption)] text-[var(--color-fg-muted)]">
                        Placed on {dateStr}
                      </p>
                    </div>

                    <div className="flex items-center gap-[var(--spacing-4)]">
                      <Price money={order.totalPrice} className="font-semibold" />
                      <Link
                        href={`/account/orders/${encodeURIComponent(order.id)}`}
                        className="font-sans text-[length:var(--text-caption)] tracking-[var(--tracking-label)] uppercase underline text-[var(--color-fg-primary)] hover:text-[var(--color-fg-muted)] transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Line items preview */}
                  <div className="flex flex-col gap-[var(--spacing-2)]">
                    {order.lineItems.map((item) => (
                      <div key={item.id} className="flex justify-between font-sans text-[length:var(--text-small)]">
                        <span className="text-[var(--color-fg-primary)]">
                          {item.title} {item.variantTitle ? `(${item.variantTitle})` : ""} × {item.quantity}
                        </span>
                        <Price money={item.price} className="text-[var(--color-fg-muted)]" />
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {pageInfo && <PaginationControls pageInfo={pageInfo} baseUrl="/account/orders" />}
        </div>
      )}
    </div>
  );
};
