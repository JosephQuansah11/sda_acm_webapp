import React from 'react';
import { Form, Dropdown } from 'react-bootstrap';

export interface FilterOption {
    key: string;
    label: string;
    values: string[];
}

interface SearchAndFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchPlaceholder?: string;
    filters: Record<string, string>;
    onFilterChange: (filterKey: string, value: string) => void;
    filterOptions?: FilterOption[];
}

/**
 * Reusable search and filter controls component
 * Handles search input and dropdown filters
 */
export function SearchAndFilters({
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Search...",
    filters,
    onFilterChange,
    filterOptions
}: SearchAndFiltersProps) {
    
    return (
        <div className="d-flex gap-3 align-items-center flex-wrap mb-3">
            {/* Search Input */}
            <Form.Control
                type="text"
                style={{ maxWidth: '300px' }}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            
            {/* Filter Dropdowns */}
            {filterOptions?.map((filter) => (
                <Dropdown key={filter.key}>
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                        {filter.label}: {filters[filter.key] || 'All'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => onFilterChange(filter.key, 'all')}>
                            All
                        </Dropdown.Item>
                        {filter.values.map((value) => (
                            <Dropdown.Item 
                                key={value}
                                onClick={() => onFilterChange(filter.key, value)}
                            >
                                {value}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            ))}
        </div>
    );
}
