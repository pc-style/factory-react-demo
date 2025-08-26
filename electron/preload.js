// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('docs', {
  /**
   * Get metadata about available documents (categories, years)
   * @returns {Promise<Object>} - Object with categories and years arrays
   */
  meta: async () => {
    try {
      return await ipcRenderer.invoke('docs:meta');
    } catch (error) {
      console.error('Error fetching document metadata:', error);
      return { categories: [], years: [] };
    }
  },

  /**
   * List documents with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {string} [filter.category] - Category to filter by
   * @param {string} [filter.year] - Year to filter by
   * @returns {Promise<Array>} - Filtered array of document objects
   */
  list: async (filter = {}) => {
    try {
      return await ipcRenderer.invoke('docs:list', filter);
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    }
  },

  /**
   * Search documents by query, category, and year
   * @param {Object} params - Search parameters
   * @param {string} [params.q] - Search query
   * @param {string} [params.category] - Category to filter by
   * @param {string} [params.year] - Year to filter by
   * @returns {Promise<Array>} - Array of matching document objects
   */
  search: async ({ q = '', category = '', year = '' } = {}) => {
    try {
      return await ipcRenderer.invoke('docs:search', { q, category, year });
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  },

  /**
   * Open a document with the default PDF viewer
   * @param {string} absPath - Absolute path to the document
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  open: async (absPath) => {
    if (!absPath || typeof absPath !== 'string') {
      console.error('Invalid document path');
      return false;
    }

    try {
      return await ipcRenderer.invoke('docs:open', absPath);
    } catch (error) {
      console.error('Error opening document:', error);
      return false;
    }
  }
});
