/**
 * Utility functions for data manipulation and processing
 * Used across table components for consistent data handling
 */

/**
 * Get nested value from object using dot notation path
 * @param obj - Object to extract value from
 * @param path - Dot notation path (e.g., 'address.street')
 * @returns The nested value or undefined
 */
export const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Convert any value to a searchable string
 * Handles objects by concatenating their string values
 * @param value - Value to convert
 * @returns Searchable string representation
 */
export const getSearchableString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
        // For nested objects, concatenate all string values
        return Object.values(value).filter(v => typeof v === 'string').join(' ');
    }
    return String(value);
};

/**
 * Apply search filter to array of items
 * @param items - Array of items to filter
 * @param searchQuery - Search query string
 * @param searchableKeys - Keys to search in
 * @returns Filtered array
 */
export const applySearchFilter = <T>(
    items: T[], 
    searchQuery: string, 
    searchableKeys: string[]
): T[] => {
    if (!searchQuery.trim()) return items;
    
    return items.filter((item: T) => {
        return searchableKeys.some(key => {
            const value = getNestedValue(item, key);
            const searchableText = getSearchableString(value);
            return searchableText.toLowerCase().includes(searchQuery.toLowerCase());
        });
    });
};

/**
 * Apply column filters to array of items
 * @param items - Array of items to filter
 * @param filters - Filter object with key-value pairs
 * @returns Filtered array
 */
export const applyColumnFilters = <T>(
    items: T[], 
    filters: Record<string, string>
): T[] => {
    let result = [...items];
    
    Object.entries(filters).forEach(([filterKey, filterValue]) => {
        if (filterValue && filterValue !== 'all') {
            result = result.filter((item: T) => {
                const value = getNestedValue(item, filterKey);
                const stringValue = getSearchableString(value).toLowerCase();
                return stringValue.includes(filterValue.toLowerCase());
            });
        }
    });
    
    return result;
};

/**
 * Apply sorting to array of items
 * @param items - Array of items to sort
 * @param sortColumn - Column to sort by
 * @param sortDirection - Sort direction ('asc' | 'desc')
 * @returns Sorted array
 */
export const applySorting = <T>(
    items: T[], 
    sortColumn: string | null, 
    sortDirection: 'asc' | 'desc' | null
): T[] => {
    if (!sortColumn || !sortDirection) return items;
    
    return [...items].sort((a, b) => {
        const aValue = getNestedValue(a, sortColumn);
        const bValue = getNestedValue(b, sortColumn);
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
        } else {
            const aStr = getSearchableString(aValue);
            const bStr = getSearchableString(bValue);
            comparison = aStr.localeCompare(bStr);
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
    });
};

/**
 * Apply pagination to array of items
 * @param items - Array of items to paginate
 * @param currentPage - Current page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Object with paginated items and pagination info
 */
export const applyPagination = <T>(
    items: T[], 
    currentPage: number, 
    pageSize: number
) => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);
    
    return {
        items: paginatedItems,
        totalItems,
        totalPages,
        currentPage,
        pageSize
    };
};
