"use server";

import { cookies } from "next/headers";
import { commerce } from "@/lib/commerce";
import type { CommerceResult } from "@/lib/commerce/types";
import type { Cart } from "@/types/cart";

const CART_COOKIE_NAME = "gensis_cart_id";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export type AddToBagInput = {
  variantId: string;
  quantity?: number;
};

export type UpdateQuantityInput = {
  lineId: string;
  quantity: number;
};

export type RemoveItemInput = {
  lineId: string;
};

/**
 * Server Action: Adds a merchandise variant to the customer's Bag.
 * Validates inputs, handles cookie management, and transparently initializes a new cart if required.
 */
export async function addToBagAction({
  variantId,
  quantity = 1,
}: AddToBagInput): Promise<CommerceResult<Cart>> {
  if (!variantId || typeof variantId !== "string") {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "A valid variant ID is required." },
    };
  }

  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid quantity requested. Quantity must be a whole number between 1 and 99.",
      },
    };
  }

  const cookieStore = await cookies();
  const existingCartId = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (existingCartId) {
    const addResult = await commerce.addCartLines(existingCartId, [{ variantId, quantity }]);
    if (addResult.ok) {
      return addResult;
    }

    // If existing cart is not found or expired on Shopify, transparently clear stale cookie and fallback to cart creation
    if (addResult.error.code === "NOT_FOUND") {
      cookieStore.delete(CART_COOKIE_NAME);
    } else {
      return addResult;
    }
  }

  // Create new cart when no cart exists or previous cart expired
  const createResult = await commerce.createCart([{ variantId, quantity }]);
  if (createResult.ok) {
    cookieStore.set(CART_COOKIE_NAME, createResult.data.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }

  return createResult;
}

/**
 * Server Action: Updates quantity for an existing line item in the Bag.
 */
export async function updateQuantityAction({
  lineId,
  quantity,
}: UpdateQuantityInput): Promise<CommerceResult<Cart>> {
  if (!lineId || typeof lineId !== "string") {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "A valid line item ID is required." },
    };
  }

  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid quantity requested. Quantity must be a whole number between 0 and 99.",
      },
    };
  }

  if (quantity === 0) {
    return removeItemAction({ lineId });
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "No active Bag session found." },
    };
  }

  const updateResult = await commerce.updateCartLines(cartId, [{ id: lineId, quantity }]);
  if (!updateResult.ok && updateResult.error.code === "NOT_FOUND") {
    cookieStore.delete(CART_COOKIE_NAME);
  }

  return updateResult;
}

/**
 * Server Action: Removes a line item from the Bag.
 */
export async function removeItemAction({
  lineId,
}: RemoveItemInput): Promise<CommerceResult<Cart>> {
  if (!lineId || typeof lineId !== "string") {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "A valid line item ID is required." },
    };
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "No active Bag session found." },
    };
  }

  const removeResult = await commerce.removeCartLines(cartId, [lineId]);
  if (!removeResult.ok && removeResult.error.code === "NOT_FOUND") {
    cookieStore.delete(CART_COOKIE_NAME);
  }

  return removeResult;
}
