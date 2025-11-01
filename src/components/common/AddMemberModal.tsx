import { Modal, Tab, Tabs } from 'react-bootstrap';
import { AddForm } from './AddForm';
import { FormBaseEntity } from '../../models/FormBaseEntity';
import { useState } from 'react';
import FormFile from './FormFile';
interface AddMemberModalsProps<T extends FormBaseEntity> {
    // Edit modal props
    showEditModal: boolean;
    addMember: T | null;
    onCloseEditModal: () => void;
    onEditSubmit?: (updatedItem: T & FormBaseEntity) => void;
}

/**
 * Reusable table modals component
 * Handles both edit and delete modals for any entity type
 */
export function AddMemberModal<T extends FormBaseEntity>({
    showEditModal,
    addMember,
    onCloseEditModal,
    onEditSubmit,
}: AddMemberModalsProps<T>) {
    const [activeTab, setActiveTab] = useState<'customAdd' | 'FormInput'>('customAdd');
    const handleEditSubmit = (updatedItem: T & FormBaseEntity) => {
        if (onEditSubmit) {
            onEditSubmit(updatedItem);
        }
        onCloseEditModal();
    };

    return (
        <>
            {/* Add Member Modal */}
            <Modal show={showEditModal} onHide={onCloseEditModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add New Member</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {addMember && (

                        <Tabs
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k as 'customAdd' | 'FormInput')}
                            className="mb-4"
                            justify
                        >
                            <Tab eventKey="customAdd" title="Add Member">
                                <AddForm<T & FormBaseEntity>
                                    items={addMember as T & FormBaseEntity}
                                    onSubmit={handleEditSubmit}
                                    buttonName="Add"
                                />
                            </Tab>
                            <Tab eventKey="FormInput" title="Form Input">
                                <FormFile />
                            </Tab>
                        </Tabs>
                    )}
                </Modal.Body>
            </Modal>

        </>
    );
}
