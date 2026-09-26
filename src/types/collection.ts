export type Collection = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image?: string;
};

/** Pagination information for a collection's products */
export interface PaginatedCollectionResult {
  collection: Collection;
  hasNextPage: boolean;
  endCursor?: string;
}
