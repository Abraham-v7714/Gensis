/**
 * Sanity Schema Definition Helpers
 *
 * Lightweight, zero-dependency schema definition helpers for GENSIS Sanity Studio.
 * Provides standard Sanity Studio type structures without requiring external SDK types
 * across application boundaries.
 */

/** Minimal schema reference — used in array `of` and reference `to` arrays. */
export interface SchemaTypeRef {
  type: string;
  to?: Array<{ type: string }>;
  [key: string]: unknown;
}

export interface SchemaField {
  name: string;
  title: string;
  type: string;
  description?: string;
  hidden?: boolean | ((context: Record<string, unknown>) => boolean);
  readOnly?: boolean;
  validation?: (rule: SchemaRule) => SchemaRule;
  options?: Record<string, unknown>;
  /** Array member types — may be full SchemaField or minimal {type} references */
  of?: SchemaTypeRef[];
  to?: Array<{ type: string }>;
  fields?: SchemaField[];
  initialValue?: unknown;
}

export interface SchemaRule {
  required: () => SchemaRule;
  min: (min: number) => SchemaRule;
  max: (max: number) => SchemaRule;
  regex: (pattern: RegExp, name?: string) => SchemaRule;
  custom: (fn: (val: unknown) => boolean | string) => SchemaRule;
}

export interface SchemaDefinition {
  name: string;
  title: string;
  type: "document" | "object";
  icon?: unknown;
  fields: SchemaField[];
  preview?: Record<string, unknown>;
}

export function defineType<T extends SchemaDefinition>(schema: T): T {
  return schema;
}

export function defineField<T extends SchemaField>(field: T): T {
  return field;
}

export function defineArrayMember<T extends SchemaField>(member: T): T {
  return member;
}
