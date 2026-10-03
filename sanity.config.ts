'use client';

/**
 * Root Sanity Studio Configuration
 *
 * Exposes the canonical GENSIS Studio configuration to Sanity CLI tools.
 * Uses a relative path import for maximum CLI module resolution compatibility.
 */
import { gensisStudioConfig } from "./src/lib/cms/providers/sanity/studio/config";

export default gensisStudioConfig;
