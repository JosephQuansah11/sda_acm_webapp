import { Modal, Button } from 'react-bootstrap';
import { AddForm } from './AddForm';
import { BaseEntity } from '../../models/BaseEntity';
import { getNestedValue } from '../../utils/dataUtils';
import { ConfirmationModal } from './ConfirmationModal';

interface EditModalsProps<T extends BaseEntity> {
    // Edit modal props
    showEditModal: boolean;
    editingItem: T | null;
    onCloseEditModal: () => void;
    onEditSubmit?: (updatedItem: T & BaseEntity) => void;
    // Delete modal props
    showDeleteModal: boolean;
    deletingItem: T | null;
    onCloseDeleteModal: () => void;
    onConfirmDelete: () => void;
}

/**
 * Reusable table modals component
 * Handles both edit and delete modals for any entity type
 */
export function EditModals<T extends BaseEntity>({
    showEditModal,
    editingItem,
    onCloseEditModal,
    onEditSubmit,
    showDeleteModal,
    deletingItem,
    onCloseDeleteModal,
    onConfirmDelete
}: EditModalsProps<T>) {
    
    const handleEditSubmit = (updatedItem: T & BaseEntity) => {
        if (onEditSubmit) {
            onEditSubmit(updatedItem);
        }
        onCloseEditModal();
    };
    
    return (
        <>
            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={onCloseEditModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingItem && (
                        <AddForm<T & BaseEntity>
                            items={editingItem as T & BaseEntity}
                            onSubmit={handleEditSubmit}
                            buttonName="Edit"
                        />
                    )}
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={showDeleteModal}
                onHide={onCloseDeleteModal}
                onConfirm={onConfirmDelete}
                title="Confirm Delete"
                message={`Are you sure you want to delete this item? This action cannot be undone.${
                    deletingItem ? `\n\nItem: ${getNestedValue(deletingItem, 'name') || `ID: ${deletingItem.id}`}` : ''
                }`}
                confirmText="Delete"
                confirmVariant="danger"
                icon="bi-trash"
                iconColor="text-danger"
            />
        </>
    );
}
