/**
 * CMS Development Content Fixtures — Barrel Entry Point
 *
 * Provider-neutral content fixtures for local development and unit/integration testing.
 *
 * Rules:
 * - Fixtures are DEVELOPMENT / TEST DATA ONLY.
 * - Do NOT import these fixtures into CMS provider code or production commerce adapters.
 * - Do NOT use these fixtures as default responses in production CmsClient implementations.
 */

export { mediaFixtures } from "./media";
export { taxonomyFixtures } from "./taxonomy";
export { contributorFixtures } from "./contributors";
export {
  editorialFixtures,
  richtextFixture,
  headingFixture,
  imageFixture,
  pullquoteFixture,
  dividerFixture,
  splitFixture,
  galleryFixture,
} from "./editorial";
export { journalFixtures } from "./journal";
export { lookbookFixtures } from "./lookbooks";
export { campaignFixtures } from "./campaigns";
export { aboutFixture } from "./about";
