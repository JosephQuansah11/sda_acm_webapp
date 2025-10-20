import { useState } from 'react';

/**
 * Generic modal management hook
 * Handles state for edit and delete modals with type safety
 */
export function useModalManager<T>() {
    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    
    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingItem, setDeletingItem] = useState<T | null>(null);
    
    // Edit modal handlers
    const openEditModal = (item: T) => {
        setEditingItem(item);
        setShowEditModal(true);
    };
    
    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingItem(null);
    };
    
    // Delete modal handlers
    const openDeleteModal = (item: T) => {
        setDeletingItem(item);
        setShowDeleteModal(true);
    };
    
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingItem(null);
    };
    
    // Confirm delete handler
    const confirmDelete = (onDelete?: (item: T) => void) => {
        if (deletingItem && onDelete) {
            onDelete(deletingItem);
        }
        closeDeleteModal();
    };
    
    return {
        // Edit modal
        showEditModal,
        editingItem,
        openEditModal,
        closeEditModal,
        
        // Delete modal
        showDeleteModal,
        deletingItem,
        openDeleteModal,
        closeDeleteModal,
        confirmDelete
    };
}
