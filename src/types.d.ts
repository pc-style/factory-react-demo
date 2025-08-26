// Type definitions for document browser application

/**
 * Represents a document category
 */
interface Category {
  /** Original folder name (e.g., "01_Badania_Krwi") */
  key: string;
  /** Formatted display name (e.g., "Badania Krwi") */
  label: string;
}

/**
 * Represents metadata about available documents
 */
interface DocsMeta {
  /** List of available document categories */
  categories: Category[];
  /** List of available document years */
  years: string[];
}

/**
 * Filter criteria for listing documents
 */
interface DocsFilter {
  /** Category to filter by */
  category?: string;
  /** Year to filter by */
  year?: string;
}

/**
 * Search parameters for document search
 */
interface SearchParams {
  /** Search query text */
  q?: string;
  /** Category to filter by */
  category?: string;
  /** Year to filter by */
  year?: string;
}

/**
 * Represents a document item
 */
interface DocumentItem {
  /** Unique document identifier (relative path) */
  id: string;
  /** Absolute file path */
  absPath: string;
  /** Relative file path */
  relPath: string;
  /** Document filename */
  filename: string;
  /** Category folder name (e.g., "01_Badania_Krwi") */
  category: string;
  /** Formatted category label (e.g., "Badania Krwi") */
  categoryLabel: string;
  /** Document year (extracted from path or filename) */
  year: string | null;
}

/**
 * Document API exposed by Electron preload script
 */
interface DocsAPI {
  /**
   * Get metadata about available documents
   * @returns Promise resolving to document metadata
   */
  meta(): Promise<DocsMeta>;

  /**
   * List documents with optional filtering
   * @param filter Optional filter criteria
   * @returns Promise resolving to array of document items
   */
  list(filter?: DocsFilter): Promise<DocumentItem[]>;

  /**
   * Search documents by query, category, and year
   * @param params Search parameters
   * @returns Promise resolving to array of matching document items
   */
  search(params?: SearchParams): Promise<DocumentItem[]>;

  /**
   * Open a document with the default PDF viewer
   * @param absPath Absolute path to the document
   * @returns Promise resolving to true if successful, false otherwise
   */
  open(absPath: string): Promise<boolean>;

  /**
   * Reveal the document in the operating-system file manager
   * @param absPath Absolute path to the document
   * @returns Promise resolving to true if successful, false otherwise
   */
  reveal(absPath: string): Promise<boolean>;

  /**
   * Copy the absolute path of the document to the clipboard
   * @param absPath Absolute path to the document
   * @returns Promise resolving to true if successful, false otherwise
   */
  copyPath(absPath: string): Promise<boolean>;
}

// Extend Window interface to include our docs API
interface Window {
  docs: DocsAPI;
}
