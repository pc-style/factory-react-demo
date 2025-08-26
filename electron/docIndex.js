// electron/docIndex.js
const fs = require('fs').promises;
const path = require('path');
const glob = require('fast-glob');
const pdfParse = require('pdf-parse');

// Compute absolute path to documents directory
const DOCUMENTS_DIR = path.join(__dirname, '../documents');

// In-memory cache
let documentsIndex = null;
const textCache = new Map();

/**
 * Extract category label from folder name by removing numeric prefix and replacing underscores
 * @param {string} category - Raw category folder name (e.g., "01_Badania_Krwi")
 * @returns {string} - Formatted category label (e.g., "Badania Krwi")
 */
function formatCategoryLabel(category) {
  // Remove numeric prefix (e.g., "01_") and replace underscores with spaces
  return category.replace(/^\d+_/, '').replace(/_/g, ' ');
}

/**
 * Extract year from path or filename
 * @param {string} relPath - Relative path to document
 * @param {string} filename - Document filename
 * @returns {string|null} - Extracted year or null if not found
 */
function extractYear(relPath, filename) {
  // Try to find 4-digit year in path segments
  const pathSegments = relPath.split(path.sep);
  for (const segment of pathSegments) {
    if (/^\d{4}$/.test(segment)) {
      return segment;
    }
  }
  
  // Try to extract year from filename (YYYY-MM-DD pattern)
  const yearMatch = filename.match(/^(\d{4})-/);
  if (yearMatch) {
    return yearMatch[1];
  }
  
  return null;
}

/**
 * Build index of all PDF documents
 * @returns {Promise<Array>} - Array of document objects
 */
async function buildIndex() {
  try {
    // Find all PDF files recursively
    const files = await glob('**/*.pdf', {
      cwd: DOCUMENTS_DIR,
      onlyFiles: true,
      absolute: false
    });
    
    // Process each file to extract metadata
    return files.map(relPath => {
      const filename = path.basename(relPath);
      const absPath = path.join(DOCUMENTS_DIR, relPath);
      
      // Extract category from first path segment
      const pathSegments = relPath.split(path.sep);
      const category = pathSegments[0] || '';
      const categoryLabel = formatCategoryLabel(category);
      
      // Extract year from path or filename
      const year = extractYear(relPath, filename);
      
      return {
        id: relPath, // Use relative path as stable ID
        absPath,
        relPath,
        filename,
        category,
        categoryLabel,
        year
      };
    });
  } catch (error) {
    console.error('Error building document index:', error);
    return [];
  }
}

/**
 * Get document index, building it if necessary
 * @returns {Promise<Array>} - Array of document objects
 */
async function getIndex() {
  if (!documentsIndex) {
    documentsIndex = await buildIndex();
  }
  return documentsIndex;
}

/**
 * Extract text from PDF file
 * @param {string} filePath - Absolute path to PDF file
 * @returns {Promise<string>} - Extracted text or empty string on failure
 */
async function extractPdfText(filePath) {
  // Return from cache if available
  if (textCache.has(filePath)) {
    return textCache.get(filePath);
  }
  
  try {
    const data = await fs.readFile(filePath);
    const result = await pdfParse(data);
    const text = result.text || '';
    
    // Cache the result
    textCache.set(filePath, text);
    return text;
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    // Cache empty string on failure
    textCache.set(filePath, '');
    return '';
  }
}

/**
 * Get metadata about available documents
 * @returns {Promise<Object>} - Object with categories and years
 */
async function getMeta() {
  const docs = await getIndex();
  
  // Extract unique categories with labels
  const categoriesMap = new Map();
  docs.forEach(doc => {
    if (doc.category && !categoriesMap.has(doc.category)) {
      categoriesMap.set(doc.category, {
        key: doc.category,
        label: doc.categoryLabel
      });
    }
  });
  
  // Extract unique years and sort descending
  const years = [...new Set(docs.filter(doc => doc.year).map(doc => doc.year))];
  years.sort((a, b) => b - a); // Sort descending
  
  return {
    categories: Array.from(categoriesMap.values()),
    years
  };
}

/**
 * List documents with optional filtering
 * @param {Object} filter - Filter criteria
 * @param {string} [filter.category] - Category to filter by
 * @param {string} [filter.year] - Year to filter by
 * @returns {Promise<Array>} - Filtered array of document objects
 */
async function listDocs(filter = {}) {
  const docs = await getIndex();
  
  return docs.filter(doc => {
    // Filter by category if specified
    if (filter.category && doc.category !== filter.category) {
      return false;
    }
    
    // Filter by year if specified
    if (filter.year && doc.year !== filter.year) {
      return false;
    }
    
    return true;
  });
}

/**
 * Search documents by query, category, and year
 * @param {Object} params - Search parameters
 * @param {string} [params.q] - Search query
 * @param {string} [params.category] - Category to filter by
 * @param {string} [params.year] - Year to filter by
 * @returns {Promise<Array>} - Array of matching document objects
 */
async function searchDocs({ q, category, year } = {}) {
  // If no query, just list documents with filters
  if (!q || q.trim() === '') {
    return listDocs({ category, year });
  }
  
  // Get filtered documents
  const filteredDocs = await listDocs({ category, year });
  const query = q.toLowerCase().trim();
  
  // First pass: check filenames (fast)
  const filenameMatches = filteredDocs.filter(doc => 
    doc.filename.toLowerCase().includes(query)
  );
  
  // Second pass: check document content (slow, lazy)
  const contentSearchPromises = filteredDocs
    .filter(doc => !filenameMatches.includes(doc)) // Skip filename matches
    .map(async doc => {
      const text = await extractPdfText(doc.absPath);
      return text.toLowerCase().includes(query) ? doc : null;
    });
  
  const contentMatches = (await Promise.all(contentSearchPromises))
    .filter(Boolean); // Remove nulls
  
  // Combine results, with filename matches first
  return [...filenameMatches, ...contentMatches];
}

module.exports = {
  getMeta,
  listDocs,
  searchDocs
};
