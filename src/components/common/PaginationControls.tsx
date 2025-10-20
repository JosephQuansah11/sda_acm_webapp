import React from 'react';
import { Pagination, Form } from 'react-bootstrap';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
}

/**
 * Reusable pagination controls component
 * Handles page navigation and page size selection
 */
export function PaginationControls({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 25, 50, 100]
}: PaginationControlsProps) {
    
    // Generate pagination items with smart ellipsis
    const getPaginationItems = (): React.ReactElement[] => {
        const items: React.ReactElement[] = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= 1) return items;
        
        // Always show first page
        items.push(
            <Pagination.Item
                key={1}
                active={currentPage === 1}
                onClick={() => onPageChange(1)}
            >
                1
            </Pagination.Item>
        );
        
        if (totalPages === 1) return items;
        
        // Calculate range of pages to show
        let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
        
        // Adjust start if we're near the end
        if (endPage - startPage < maxVisiblePages - 3) {
            startPage = Math.max(2, endPage - maxVisiblePages + 3);
        }
        
        // Add ellipsis if there's a gap
        if (startPage > 2) {
            items.push(<Pagination.Ellipsis key="start-ellipsis" />);
        }
        
        // Add middle pages
        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item
                    key={page}
                    active={currentPage === page}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </Pagination.Item>
            );
        }
        
        // Add ellipsis if there's a gap
        if (endPage < totalPages - 1) {
            items.push(<Pagination.Ellipsis key="end-ellipsis" />);
        }
        
        // Always show last page
        if (totalPages > 1) {
            items.push(
                <Pagination.Item
                    key={totalPages}
                    active={currentPage === totalPages}
                    onClick={() => onPageChange(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }
        
        return items;
    };

    return (
        <div className="d-flex justify-content-between align-items-center flex-wrap">
            {/* Page Size Selector and Info */}
            <div className="d-flex align-items-center gap-2">
                <span className="text-muted">Show</span>
                <Form.Select
                    size="sm"
                    style={{ width: 'auto' }}
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {pageSizeOptions.map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </Form.Select>
                <span className="text-muted">
                    entries (showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems})
                </span>
            </div>

            {/* Pagination Navigation */}
            {totalPages > 1 && (
                <Pagination className="mb-0">
                    <Pagination.Prev 
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    />
                    {getPaginationItems()}
                    <Pagination.Next 
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    />
                </Pagination>
            )}
        </div>
    );
}
