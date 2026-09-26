/**
 * Sanity Studio Structure Builder — Stage 4.2
 *
 * Defines the editorial navigation structure for GENSIS Studio.
 * Strictly inside the Sanity provider boundary.
 *
 * Sections:
 *   CONTENT   — Journal Articles, Lookbooks, Campaigns, About (singleton)
 *   TAXONOMY  — Categories, Tags
 *   PEOPLE    — Contributors
 *
 * About singleton:
 *   The aboutPage document type has exactly one record. The structure hides
 *   the list view and surfaces a direct link to that single document instead.
 *   This prevents editors from accidentally creating multiple About records.
 *
 * Note: This file is imported only by studio/config.ts inside the provider
 * boundary. It must NOT be imported by src/app, src/components, or src/types.
 */

import type { StructureResolver } from "sanity/structure";
import { SANITY_DOCUMENT_TYPES } from "../schemas";

export const gensisStructure: StructureResolver = (S) =>
  S.list()
    .title("GENSIS Editorial")
    .items([
      // ── CONTENT ───────────────────────────────────────────────
      S.listItem()
        .title("Content")
        .child(
          S.list()
            .title("Content")
            .items([
              S.listItem()
                .title("Journal Articles")
                .schemaType(SANITY_DOCUMENT_TYPES.JOURNAL_ARTICLE)
                .child(
                  S.documentList()
                    .title("Journal Articles")
                    .filter(`_type == "${SANITY_DOCUMENT_TYPES.JOURNAL_ARTICLE}"`)
                ),

              S.listItem()
                .title("Lookbooks")
                .schemaType(SANITY_DOCUMENT_TYPES.LOOKBOOK)
                .child(
                  S.documentList()
                    .title("Lookbooks")
                    .filter(`_type == "${SANITY_DOCUMENT_TYPES.LOOKBOOK}"`)
                ),

              S.listItem()
                .title("Campaigns")
                .schemaType(SANITY_DOCUMENT_TYPES.CAMPAIGN)
                .child(
                  S.documentList()
                    .title("Campaigns")
                    .filter(`_type == "${SANITY_DOCUMENT_TYPES.CAMPAIGN}"`)
                ),

              S.divider(),

              // About singleton — direct link to single document, no list
              S.listItem()
                .title("About")
                .id("about-singleton")
                .child(
                  S.document()
                    .schemaType(SANITY_DOCUMENT_TYPES.ABOUT_PAGE)
                    .documentId("about-singleton")
                    .title("About GENSIS")
                ),
            ])
        ),

      S.divider(),

      // ── TAXONOMY ──────────────────────────────────────────────
      S.listItem()
        .title("Taxonomy")
        .child(
          S.list()
            .title("Taxonomy")
            .items([
              S.listItem()
                .title("Categories")
                .schemaType(SANITY_DOCUMENT_TYPES.CATEGORY)
                .child(
                  S.documentList()
                    .title("Categories")
                    .filter(`_type == "${SANITY_DOCUMENT_TYPES.CATEGORY}"`)
                ),

              S.listItem()
                .title("Tags")
                .schemaType(SANITY_DOCUMENT_TYPES.TAG)
                .child(
                  S.documentList()
                    .title("Tags")
                    .filter(`_type == "${SANITY_DOCUMENT_TYPES.TAG}"`)
                ),
            ])
        ),

      S.divider(),

      // ── PEOPLE ────────────────────────────────────────────────
      S.listItem()
        .title("People")
        .child(
          S.list()
            .title("People")
            .items([
              S.listItem()
                .title("Contributors")
                .schemaType(SANITY_DOCUMENT_TYPES.CONTRIBUTOR)
                .child(
                  S.documentList()
                    .title("Contributors")
                    .filter(`_type == "${SANITY_DOCUMENT_TYPES.CONTRIBUTOR}"`)
                ),
            ])
        ),
    ]);
