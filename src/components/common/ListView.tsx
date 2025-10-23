import { useState, useCallback, useMemo } from "react";
import { Table, Button } from "react-bootstrap";
import { BaseEntity } from "../../models/BaseEntity";
import { TableControls, ProcessedData, FilterOption } from "./TableControls";
import { useModalManager } from "../../hooks/useModalManager";
import { EditModals } from "./EditModals";
import { getNestedValue } from "../../utils/dataUtils";
import { EditUserContent } from "../../hooks/users/useUserContent";
import User from "../../models/user/User";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorAlert } from "./ErrorAlert";
import '../../App.scss';
import { usePermissions } from '../../security/withAuth';

interface ListViewProps<T extends BaseEntity> {
    hook: () => { users: T[], loading: boolean, error: string | null, displayKeys: string[], searchableKeys: string[], innerObjectKeys: string[] };
    onEdit?: (item: T) => void;
    onDelete?: (id: string) => void;
    filterOptions?: FilterOption[];
    initialPageSize?: number;
    pageSizeOptions?: number[];
}

export function ListView<T extends BaseEntity>({
    hook,
    onEdit,
    onDelete,
    filterOptions,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 25, 50, 100]
}: ListViewProps<T>) {
    const { users, loading, error, displayKeys, searchableKeys, innerObjectKeys } = hook();
    const [processedData, setProcessedData] = useState<ProcessedData<T>>({
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: initialPageSize,
        sortColumn: null,
        sortDirection: null
    });
    const { canAccess } = usePermissions();
    // Use modal management hook
    const modalManager = useModalManager<T>();

    // Memoize columns to prevent unnecessary re-renders
    const columns = useMemo(() =>
        displayKeys.map(key => ({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1)
        })), [displayKeys]
    );

    // Handle processed data from TableControls
    const handleDataProcessed = useCallback((data: ProcessedData<T>) => {
        setProcessedData(data);
    }, []); // Empty dependency array since setProcessedData is stable

    // Memoize sort icon function
    const getSortIcon = useCallback((column: string) => {
        if (processedData.sortColumn !== column) return '↕️';
        if (processedData.sortDirection === 'asc') return '↑';
        if (processedData.sortDirection === 'desc') return '↓';
        return '↕️';
    }, [processedData.sortColumn, processedData.sortDirection]);

    // Memoize sorting handler
    const handleSort = useCallback((column: string) => {
        // TableControls handles the actual sorting logic
    }, []);

    // Memoize edit handler
    const handleEdit = useCallback((item: T) => {
        modalManager.openEditModal(item);
        if (onEdit) onEdit(item);
    }, [modalManager.openEditModal, onEdit]);

    // Memoize delete handler
    const handleDelete = useCallback((item: T) => {
        modalManager.openDeleteModal(item);
    }, [modalManager.openDeleteModal]);

    // Memoize delete confirmation handler
    const handleDeleteConfirm = useCallback(() => {
        if (modalManager.deletingItem && onDelete) {
            onDelete(modalManager.deletingItem.id as unknown as string);
        }
        modalManager.closeDeleteModal();
    }, [modalManager.deletingItem, modalManager.closeDeleteModal, onDelete]);

    // Memoize edit submission handler
    const handleEditSubmit = useCallback((updatedItem: T & BaseEntity) => {
        // console.log('Updated item:', updatedItem);
        EditUserContent(updatedItem.id as unknown as string, updatedItem as unknown as User);

        // Handle update logic here
        modalManager.closeEditModal();
    }, [modalManager.closeEditModal]);

    return (
        <div className="custom-div">
            {/* Table Controls */}
            <TableControls<T>
                data={users}
                searchableKeys={searchableKeys}
                onDataProcessed={handleDataProcessed}
                searchPlaceholder={useMemo(() =>
                    `Search ${columns.length > 0 ? columns.map((c: any) => c.label.toLowerCase()).join(', ') : 'items'}...`,
                    [columns]
                )}
                filterOptions={filterOptions}
                initialPageSize={initialPageSize}
                pageSizeOptions={pageSizeOptions}
                onSort={handleSort}
                getSortIcon={getSortIcon}
            />

            {loading && <LoadingSpinner text="Loading data..." />}
            <ErrorAlert error={error} />

            <Table variant="primary" striped hover summary="users table" title="User's Data"  >
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => handleSort(column.key)}
                                className="position-relative"
                            >
                                {column.label}
                                <span className="ms-1">{getSortIcon(column.key)}</span>
                            </th>
                        ))}
                        {canAccess(['ADMIN', 'MODERATOR']) && (
                            <th colSpan={2} className="text-center">Manage</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {processedData.items.map((item: T) => (
                        <tr key={item.id}>
                            {columns.map((column) => (
                                <td key={column.key}>
                                    {(() => {
                                        const value = getNestedValue(item, column.key);
                                        if (typeof value === 'object' && value !== null) {
                                            // For objects like address, show a formatted string
                                            return innerObjectKeys.map((key: any) => value[key] + ' ');
                                        }
                                        return String(value || '');
                                    })()}
                                </td>
                            ))}
                            {canAccess(['ADMIN', 'MODERATOR']) && (
                                <>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleEdit(item)}>
                                            Edit
                                        </Button>
                                    </td><td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(item)}>
                                            Delete
                                        </Button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Table Modals */}
            <EditModals<T>
                showEditModal={modalManager.showEditModal}
                editingItem={modalManager.editingItem}
                onCloseEditModal={modalManager.closeEditModal}
                onEditSubmit={handleEditSubmit}
                showDeleteModal={modalManager.showDeleteModal}
                deletingItem={modalManager.deletingItem}
                onCloseDeleteModal={modalManager.closeDeleteModal}
                onConfirmDelete={handleDeleteConfirm}
            />
        </div>
    )
}