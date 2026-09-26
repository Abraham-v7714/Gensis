/**
 * Sanity Seed Dataset
 * Stage 4.3 - Real Editorial Data Validation
 *
 * This dataset contains realistic editorial content for the GENSIS brand.
 * All IDs are deterministic and prefixed with `seed-` (except about-singleton).
 *
 * Media Note: Since we don't have an automated asset upload pipeline in this
 * seed script, media fields are left empty or use external URLs if supported,
 * but our schemas currently expect Sanity asset references. We will omit them
 * for the seed and document that assets must be attached via Studio.
 */

export const categories = [
  {
    _id: "seed-category-style",
    _type: "category",
    title: "Style",
    slug: { current: "style", _type: "slug" },
    description: "Explorations of contemporary fashion, tailoring, and aesthetics.",
  },
  {
    _id: "seed-category-culture",
    _type: "category",
    title: "Culture",
    slug: { current: "culture", _type: "slug" },
    description: "Intersections of art, architecture, and modern living.",
  },
  {
    _id: "seed-category-design",
    _type: "category",
    title: "Design",
    slug: { current: "design", _type: "slug" },
    description: "Insights into our creative process, materials, and form.",
  },
];

export const tags = [
  {
    _id: "seed-tag-minimalism",
    _type: "tag",
    title: "Minimalism",
    slug: { current: "minimalism", _type: "slug" },
  },
  {
    _id: "seed-tag-editorial",
    _type: "tag",
    title: "Editorial",
    slug: { current: "editorial", _type: "slug" },
  },
  {
    _id: "seed-tag-materials",
    _type: "tag",
    title: "Materials",
    slug: { current: "materials", _type: "slug" },
  },
  {
    _id: "seed-tag-focus",
    _type: "tag",
    title: "Focus",
    slug: { current: "focus", _type: "slug" },
  },
];

export const contributors = [
  {
    _id: "seed-contributor-elena",
    _type: "contributor",
    name: "Elena Rostova",
    slug: { current: "elena-rostova", _type: "slug" },
    role: "Editorial Director",
    bio: "Elena oversees the creative narrative of GENSIS, bridging the gap between structural design and everyday wearability.",
  },
  {
    _id: "seed-contributor-marcus",
    _type: "contributor",
    name: "Marcus Chen",
    slug: { current: "marcus-chen", _type: "slug" },
    role: "Lead Photographer",
    bio: "Marcus brings a cinematic eye to the GENSIS collections, focusing on light, texture, and movement.",
  },
];

// Blocks
const richtextBlock = (text: string, key: string) => ({
  _key: key,
  _type: "blockRichtext",
  content: [
    {
      _key: `${key}-p`,
      _type: "block",
      style: "normal",
      children: [{ _key: `${key}-span`, _type: "span", text, marks: [] }],
    },
  ],
});

const headingBlock = (text: string, level: "h2" | "h3", key: string) => ({
  _key: key,
  _type: "blockHeading",
  text,
  level,
});

const pullquoteBlock = (quote: string, author: string, key: string) => ({
  _key: key,
  _type: "blockPullquote",
  quote,
  author,
});

const dividerBlock = (key: string) => ({
  _key: key,
  _type: "blockDivider",
  style: "solid",
});

export const journalArticles = [
  {
    _id: "seed-article-1",
    _type: "journalArticle",
    title: "The Architecture of Silence",
    slug: { current: "architecture-of-silence", _type: "slug" },
    status: "published",
    publishedAt: new Date().toISOString(),
    excerpt: "Exploring the role of negative space in modern tailoring and how absence defines form.",
    description: "A deep dive into the philosophy behind our Autumn/Winter outerwear collection.",
    author: { _type: "reference", _ref: "seed-contributor-elena" },
    category: { _type: "reference", _ref: "seed-category-design" },
    tags: [
      { _type: "reference", _key: "tag-1", _ref: "seed-tag-minimalism" },
      { _type: "reference", _key: "tag-2", _ref: "seed-tag-materials" },
    ],
    seo: {
      _type: "seo",
      title: "The Architecture of Silence | GENSIS Journal",
      description: "Exploring the role of negative space in modern tailoring.",
    },
    body: [
      headingBlock("Form and Void", "h2", "b1"),
      richtextBlock("In tailoring, what is removed is often as important as what remains. The architecture of silence refers to the intentional use of negative space to allow the garment to breathe, creating a silhouette that moves with the wearer rather than constraining them.", "b2"),
      pullquoteBlock("Silence is not empty. It is full of answers.", "Anonymous", "b3"),
      dividerBlock("b4"),
      richtextBlock("By focusing on essential lines and eliminating superfluous details, we achieve a balance that feels both contemporary and timeless.", "b5"),
    ],
  },
  {
    _id: "seed-article-2",
    _type: "journalArticle",
    title: "Textural Landscapes",
    slug: { current: "textural-landscapes", _type: "slug" },
    status: "published",
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    excerpt: "A visual essay on the sourcing and weaving of our signature heavy linens.",
    author: { _type: "reference", _ref: "seed-contributor-marcus" },
    category: { _type: "reference", _ref: "seed-category-culture" },
    tags: [
      { _type: "reference", _key: "tag-1", _ref: "seed-tag-materials" },
      { _type: "reference", _key: "tag-2", _ref: "seed-tag-editorial" },
    ],
    body: [
      richtextBlock("We traveled to the northern weavers to understand the origin of the texture that defines our spring collection.", "b1"),
    ],
  },
  {
    _id: "seed-article-3",
    _type: "journalArticle",
    title: "Movement and Structure",
    slug: { current: "movement-and-structure", _type: "slug" },
    status: "published",
    publishedAt: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    excerpt: "Balancing rigid forms with fluid materials for everyday wear.",
    author: { _type: "reference", _ref: "seed-contributor-elena" },
    category: { _type: "reference", _ref: "seed-category-style" },
    tags: [
      { _type: "reference", _key: "tag-1", _ref: "seed-tag-focus" },
    ],
    body: [
      headingBlock("The Dichotomy", "h2", "b1"),
      richtextBlock("Structured garments often restrict. Fluid garments often lack definition. Finding the exact midpoint between these two extremes is the core challenge of modern design.", "b2"),
    ],
  },
  // The Draft Article
  {
    _id: "drafts.seed-article-draft", // Drafts in Sanity use the 'drafts.' prefix on ID
    _type: "journalArticle",
    title: "Draft: Upcoming Collection Preview",
    slug: { current: "upcoming-collection-preview", _type: "slug" },
    status: "draft", // And our domain status is draft
    excerpt: "This is a draft article and should not appear on the production site.",
    author: { _type: "reference", _ref: "seed-contributor-elena" },
    category: { _type: "reference", _ref: "seed-category-style" },
    body: [
      richtextBlock("This content is currently being written.", "b1"),
    ],
  },
];

export const lookbooks = [
  {
    _id: "seed-lookbook-1",
    _type: "lookbook",
    title: "AW26: Brutalism Softened",
    slug: { current: "aw26-brutalism-softened", _type: "slug" },
    status: "published",
    publishedAt: new Date().toISOString(),
    season: "Autumn / Winter 2026",
    description: "A study in heavy wools, stark silhouettes, and uncompromising warmth.",
    items: [
      { _key: "lb1-item1", order: 1, caption: "Look 01: The Overcoat" },
      { _key: "lb1-item2", order: 2, caption: "Look 02: Layered Wool" },
    ],
  },
  {
    _id: "seed-lookbook-2",
    _type: "lookbook",
    title: "SS26: Ethereal Light",
    slug: { current: "ss26-ethereal-light", _type: "slug" },
    status: "published",
    publishedAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    season: "Spring / Summer 2026",
    description: "Lightweight linens, semi-sheer silks, and garments that capture the breeze.",
    items: [
      { _key: "lb2-item1", order: 1, caption: "Look 01: The Silk Shirt" },
    ],
  },
];

export const campaigns = [
  {
    _id: "seed-campaign-1",
    _type: "campaign",
    title: "The Urban Uniform",
    slug: { current: "the-urban-uniform", _type: "slug" },
    status: "published",
    publishedAt: new Date().toISOString(),
    description: "Redefining everyday wear for the modern metropolis.",
    body: [
      headingBlock("A New Standard", "h2", "c1-b1"),
      richtextBlock("The city demands versatility. Our new campaign focuses on garments that transition seamlessly from morning commutes to evening engagements.", "c1-b2"),
    ],
  },
  {
    _id: "seed-campaign-2",
    _type: "campaign",
    title: "Escape to the Coast",
    slug: { current: "escape-to-the-coast", _type: "slug" },
    status: "published",
    publishedAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    description: "Transitional pieces designed for changing climates.",
    body: [
      richtextBlock("Leaving the city behind shouldn't mean leaving your style behind.", "c2-b1"),
    ],
  },
];

export const aboutSingleton = {
  _id: "about-singleton",
  _type: "aboutPage",
  title: "About GENSIS",
  status: "published",
  publishedAt: new Date().toISOString(),
  description: "GENSIS is a premium global fashion brand focused on architectural minimalism.",
  intro: "Founded on the principles of architectural minimalism, GENSIS creates garments that serve as the foundation of a modern wardrobe.",
  seo: {
    _type: "seo",
    title: "About GENSIS | Architectural Minimalism",
    description: "GENSIS is a premium global fashion brand.",
  },
  body: [
    headingBlock("Our Philosophy", "h2", "a-b1"),
    richtextBlock("We believe in the power of restraint. In a world of noise, true luxury is found in quiet, confident design.", "a-b2"),
    pullquoteBlock("Simplicity is the ultimate sophistication.", "Leonardo da Vinci", "a-b3"),
    dividerBlock("a-b4"),
    headingBlock("Materials and Craft", "h3", "a-b5"),
    richtextBlock("We source our materials globally, partnering with mills that share our commitment to longevity and tactile excellence.", "a-b6"),
  ],
};

export const allSeedDocuments = [
  ...categories,
  ...tags,
  ...contributors,
  ...journalArticles,
  ...lookbooks,
  ...campaigns,
  aboutSingleton,
];
