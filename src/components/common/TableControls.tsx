import { useEffect } from "react";
import { SearchAndFilters, FilterOption } from "./SearchAndFilters";
import { PaginationControls } from "./PaginationControls";
import { useTableState, useTableDataProcessor, ProcessedData } from "../../hooks/useTableDataProcessor";

interface TableControlsProps<T = any> {
    // Data
    data: T[];
    searchableKeys: string[];
    onDataProcessed: (processedData: ProcessedData<T>) => void;
    
    // Configuration
    searchPlaceholder?: string;
    filterOptions?: FilterOption[];
    initialPageSize?: number;
    pageSizeOptions?: number[];
    
    // Sorting
    onSort?: (column: string) => void;
    getSortIcon?: (column: string) => string;
}

// Re-export types for backward compatibility
export type { FilterOption, ProcessedData };

export function TableControls<T = any>({
    data,
    searchableKeys,
    onDataProcessed,
    searchPlaceholder = "Search...",
    filterOptions,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 25, 50, 100],
    onSort,
    getSortIcon
}: TableControlsProps<T>) {
    // Use table state management hook
    const tableState = useTableState(initialPageSize);
    
    // Process data using the data processor hook
    const processedData = useTableDataProcessor({
        data,
        searchQuery: tableState.searchQuery,
        searchableKeys,
        filters: tableState.filters,
        sortColumn: tableState.sortColumn,
        sortDirection: tableState.sortDirection,
        currentPage: tableState.currentPage,
        pageSize: tableState.pageSize
    });
    
    // Notify parent component of processed data
    useEffect(() => {
        onDataProcessed(processedData);
    }, [processedData]); // Remove onDataProcessed from dependencies to prevent infinite loop
    
    // Handle sort with optional callback
    const handleSort = (column: string) => {
        tableState.handleSort(column);
        if (onSort) onSort(column);
    };

    return (
        <div className="mb-3">
            {/* Search and Filter Controls */}
            <SearchAndFilters
                searchQuery={tableState.searchQuery}
                onSearchChange={tableState.handleSearchChange}
                searchPlaceholder={searchPlaceholder}
                filters={tableState.filters}
                onFilterChange={tableState.handleFilterChange}
                filterOptions={filterOptions}
            />

            {/* Pagination Controls */}
            <PaginationControls
                currentPage={processedData.currentPage}
                totalPages={processedData.totalPages}
                pageSize={processedData.pageSize}
                totalItems={processedData.totalItems}
                onPageChange={tableState.handlePageChange}
                onPageSizeChange={tableState.handlePageSizeChange}
                pageSizeOptions={pageSizeOptions}
            />
        </div>
    );
}
