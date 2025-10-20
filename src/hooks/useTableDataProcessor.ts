import { useMemo, useState } from 'react';
import { 
    applySearchFilter, 
    applyColumnFilters, 
    applySorting, 
    applyPagination 
} from '../utils/dataUtils';

export type SortDirection = 'asc' | 'desc' | null;

export interface ProcessedData<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    sortColumn: string | null;
    sortDirection: SortDirection;
}

interface UseTableDataProcessorProps<T> {
    data: T[];
    searchQuery: string;
    searchableKeys: string[];
    filters: Record<string, string>;
    sortColumn: string | null;
    sortDirection: SortDirection;
    currentPage: number;
    pageSize: number;
}

/**
 * Custom hook for processing table data with filtering, sorting, and pagination
 * Handles the complete data processing pipeline in a reusable way
 */
export const useTableDataProcessor = <T>({
    data,
    searchQuery,
    searchableKeys,
    filters,
    sortColumn,
    sortDirection,
    currentPage,
    pageSize
}: UseTableDataProcessorProps<T>): ProcessedData<T> => {
    
    return useMemo(() => {
        // Step 1: Apply search filter
        let processedItems = applySearchFilter(data, searchQuery, searchableKeys);
        
        // Step 2: Apply column filters
        processedItems = applyColumnFilters(processedItems, filters);
        
        // Step 3: Apply sorting
        processedItems = applySorting(processedItems, sortColumn, sortDirection);
        
        // Step 4: Apply pagination
        const paginationResult = applyPagination(processedItems, currentPage, pageSize);
        
        return {
            items: paginationResult.items,
            totalItems: paginationResult.totalItems,
            totalPages: paginationResult.totalPages,
            currentPage: paginationResult.currentPage,
            pageSize: paginationResult.pageSize,
            sortColumn,
            sortDirection
        };
    }, [
        data, 
        searchQuery, 
        searchableKeys, 
        filters, 
        sortColumn, 
        sortDirection, 
        currentPage, 
        pageSize
    ]);
};

/**
 * Hook for managing table state (search, filters, sorting, pagination)
 * Provides all the state and handlers needed for table controls
 */
export const useTableState = (initialPageSize: number = 10) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    
    // Handle sorting
    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(current => {
                if (current === 'asc') return 'desc';
                if (current === 'desc') return null;
                return 'asc';
            });
            if (sortDirection === 'desc') {
                setSortColumn(null);
            }
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };
    
    // Handle filter change
    const handleFilterChange = (filterKey: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        setCurrentPage(1);
    };
    
    // Handle search change
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };
    
    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    
    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };
    
    return {
        // State
        searchQuery,
        filters,
        currentPage,
        pageSize,
        sortColumn,
        sortDirection,
        
        // Handlers
        handleSort,
        handleFilterChange,
        handleSearchChange,
        handlePageChange,
        handlePageSizeChange
    };
};
