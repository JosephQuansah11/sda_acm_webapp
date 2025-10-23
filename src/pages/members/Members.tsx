import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { ListView } from "../../components/common/ListView";
import User from "../../models/user/User";
import { useUserContent } from "../../hooks/users/useUserContent";
import { DeleteUserContent } from "../../hooks/users/useUserContent";
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../security/withAuth';
import { useNavigate } from 'react-router-dom';

// Filter options for the ListView
const filterOptions = [
    {
        key: 'address.city',
        label: 'City',
        values: ['Springfield', 'New York', 'Los Angeles', 'Chicago', 'Miami', 'Seattle', 'Denver']
    },
    {
        key: 'role',
        label: 'Role',
        values: ['ADMIN', 'MODERATOR', 'USER']
    }
];

export default function Members() {
    const { state } = useAuth();
    const { canAccess, isAdmin } = usePermissions();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const navigate = useNavigate();

    const handleUserEdit = (user: User) => {
        // Check if user can edit other users
        if (!canAccess(['ADMIN', 'MODERATOR'])) {
            setMessage({ 
                type: 'error', 
                text: 'You do not have permission to edit user profiles.' 
            });
            return;
        }
        
         // console.log('Editing user:', user);
        setMessage({ 
            type: 'success', 
            text: `Editing profile for ${user.userName}` 
        });
    };
    
    const handleUserDelete = (userId: string) => {
        // Only admins can delete users
        if (!isAdmin) {
            setMessage({ 
                type: 'error', 
                text: 'Only administrators can delete user accounts.' 
            });
            return;
        }
        
         // console.log('Deleting user with ID:', userId);
        DeleteUserContent(userId);
        setMessage({ 
            type: 'success', 
            text: 'User account has been deleted successfully.' 
        });
    };

    const handleAddNewMember = () => {
        if (!canAccess(['ADMIN', 'MODERATOR'])) {
            setMessage({ 
                type: 'error', 
                text: 'You do not have permission to add new members.' 
            });
            return;
        }
        
        // Navigate to add member form or open modal
         // console.log('Opening add member form');
        navigate('/add-member');
        setMessage({ 
            type: 'success', 
            text: 'Add member form will be implemented soon.' 
        });
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'danger';
            case 'MODERATOR': return 'warning';
            default: return 'primary';
        }
    };

    return (
        <Container fluid className="py-4">
            {/* Page Header */}
            <Row className="mb-4">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 className="mb-2">
                                        <i className="bi bi-people me-2"></i>
                                        Members Management
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Manage church members, view profiles, and track membership data
                                    </p>
                                </div>
                                <div className="text-end">
                                    <Badge bg={getRoleBadgeVariant(state.user?.role || 'USER')} className="fs-6 mb-2">
                                        {state.user?.role?.toUpperCase()}
                                    </Badge>
                                    <br />
                                    {canAccess(['ADMIN', 'MODERATOR']) && (
                                        <Button 
                                            variant="primary" 
                                            size="sm"
                                            onClick={handleAddNewMember}
                                        >
                                            <i className="bi bi-person-plus me-2"></i>
                                            Add New Member
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Alert Messages */}
            {message && (
                <Row className="mb-3">
                    <Col>
                        <Alert 
                            variant={message.type === 'success' ? 'success' : 'danger'}
                            dismissible
                            onClose={() => setMessage(null)}
                        >
                            {message.text}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Permission Info */}
            <Row className="mb-3">
                <Col>
                    <Card className="border-0 bg-light">
                        <Card.Body className="py-2">
                            <small className="text-muted">
                                <i className="bi bi-info-circle me-2"></i>
                                <strong>Your Permissions:</strong>
                                {isAdmin && <Badge bg="danger" className="ms-2">Full Access</Badge>}
                                {canAccess(['MODERATOR']) && !isAdmin && <Badge bg="warning" className="ms-2">Edit Members</Badge>}
                                {!canAccess(['ADMIN', 'MODERATOR']) && <Badge bg="secondary" className="ms-2">View Only</Badge>}
                                <span className="ms-3">
                                    Can Edit: {canAccess(['ADMIN', 'MODERATOR']) ? '✅' : '❌'} | 
                                    Can Delete: {isAdmin ? '✅' : '❌'} | 
                                    Can Add: {canAccess(['ADMIN', 'MODERATOR']) ? '✅' : '❌'}
                                </span>
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Members List */}
            <Row>
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-table me-2"></i>
                                Members Directory
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <ListView<User>
                                hook={useUserContent}
                                onEdit={handleUserEdit}
                                onDelete={handleUserDelete}
                                filterOptions={filterOptions}
                                initialPageSize={10}
                                pageSizeOptions={[5, 10, 25, 50]}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Stats */}
            <Row className="mt-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <i className="bi bi-people-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                            <h6 className="mt-2 mb-1">Total Members</h6>
                            <small className="text-muted">Active membership count</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <i className="bi bi-person-plus text-success" style={{ fontSize: '1.5rem' }}></i>
                            <h6 className="mt-2 mb-1">New This Month</h6>
                            <small className="text-muted">Recent registrations</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <i className="bi bi-geo-alt text-info" style={{ fontSize: '1.5rem' }}></i>
                            <h6 className="mt-2 mb-1">Locations</h6>
                            <small className="text-muted">City represented</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <i className="bi bi-activity text-warning" style={{ fontSize: '1.5rem' }}></i>
                            <h6 className="mt-2 mb-1">Active Rate</h6>
                            <small className="text-muted">Engagement percentage</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}