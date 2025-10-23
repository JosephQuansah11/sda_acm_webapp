import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Tab, Tabs, Modal, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { withRequireAuth } from '../../security/withAuth';
import { PageHeader } from '../../components/common';
import User from '../../models/user/User';

function UserProfileComponent() {
    const { state, updateUser } = useAuth();
    const { state: themeState } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [formData, setFormData] = useState({
        name: state.user?.userName || '',
        email: state.user?.email || '',
        telephone: state.user?.telephone || '',
        firstName: state.user?.profile?.firstName || '',
        lastName: state.user?.profile?.lastName || '',
        avatar: state.user?.profile?.avatar || '',
        notifications: state.user?.profile?.preferences?.notifications || false,
    });

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            // Prepare updated user data
            const updatedUser: Partial<User> = {
                userName: formData.name,
                email: formData.email,
                telephone: formData.telephone,
                profile: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    avatar: formData.avatar,
                    preferences: {
                        language: "EN",
                        theme: state.user?.profile?.preferences?.theme || themeState.currentTheme.id,
                        notifications: formData.notifications,
                    },
                },
            };

            // Call API to update user profile
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(updatedUser),
            });

            if (response.ok) {
                const updatedUserData = await response.json();
                updateUser(updatedUserData);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setIsEditing(false);
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: errorData.message || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Handle cancel editing
    const handleCancel = () => {
        setFormData({
            name: state.user?.userName || '',
            email: state.user?.email || '',
            telephone: state.user?.telephone || '',
            firstName: state.user?.profile?.firstName || '',
            lastName: state.user?.profile?.lastName || '',
            avatar: state.user?.profile?.avatar || '',
            notifications: state.user?.profile?.preferences?.notifications || false,
        });
        setIsEditing(false);
        setMessage(null);
    };

    // Handle password change
    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
            return;
        }

        try {
            setSaving(true);
            const response = await fetch('/api/user/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: errorData.message || 'Failed to change password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // Get role badge variant
    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'danger';
            case 'MODERATOR': return 'warning';
            default: return 'primary';
        }
    };

    if (!state.user) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    User information not available. Please try logging in again.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <PageHeader 
                title="User Profile"
                subtitle="Manage your account information and preferences"
                icon="bi-person-circle"
            >
                <Badge bg={getRoleBadgeVariant(state.user.role)} className="fs-6">
                    {state.user.role.toUpperCase()}
                </Badge>
            </PageHeader>
            
            <Row className="justify-content-center">
                <Col xs={12} lg={8}>
                    <Card className="shadow-sm">
                        <Card.Body className="p-4">
                            {message && (
                                <Alert 
                                    variant={message.type === 'success' ? 'success' : 'danger'}
                                    dismissible
                                    onClose={() => setMessage(null)}
                                >
                                    {message.text}
                                </Alert>
                            )}

                            <Tabs defaultActiveKey="profile" className="mb-4">
                                <Tab eventKey="profile" title="Profile Information">
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Display Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Role</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={state.user.role}
                                                        disabled
                                                        className="bg-light"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>First Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Last Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Email Address</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Phone Number</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="telephone"
                                                        value={formData.telephone}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Avatar URL</Form.Label>
                                            <Form.Control
                                                type="url"
                                                name="avatar"
                                                value={formData.avatar}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="https://example.com/avatar.jpg"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Check
                                                type="checkbox"
                                                name="notifications"
                                                label="Enable email notifications"
                                                checked={formData.notifications}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </Form.Group>

                                        <div className="d-flex gap-2">
                                            {!isEditing ? (
                                                <Button
                                                    variant="primary"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    <i className="bi bi-pencil me-2"></i>
                                                    Edit Profile
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        type="submit"
                                                        disabled={isSaving}
                                                    >
                                                        {isSaving ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-check-lg me-2"></i>
                                                                Save Changes
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={handleCancel}
                                                        disabled={isSaving}
                                                    >
                                                        <i className="bi bi-x-lg me-2"></i>
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </Form>
                                </Tab>

                                <Tab eventKey="security" title="Security">
                                    <div className="text-center py-4">
                                        <h5>Account Security</h5>
                                        <p className="text-muted mb-4">
                                            Manage your password and security settings
                                        </p>
                                        
                                        <div className="d-grid gap-2 col-md-6 mx-auto">
                                            <Button 
                                                variant="outline-primary" 
                                                size="lg"
                                                onClick={() => setShowPasswordModal(true)}
                                            >
                                                <i className="bi bi-key me-2"></i>
                                                Change Password
                                            </Button>
                                            <Button variant="outline-secondary" size="lg">
                                                <i className="bi bi-shield-check me-2"></i>
                                                Two-Factor Authentication
                                            </Button>
                                            <Button variant="outline-info" size="lg">
                                                <i className="bi bi-clock-history me-2"></i>
                                                Login History
                                            </Button>
                                        </div>
                                    </div>
                                </Tab>

                                <Tab eventKey="activity" title="Activity">
                                    <div className="text-center py-4">
                                        <h5>Recent Activity</h5>
                                        <p className="text-muted">
                                            Your recent activity will be displayed here
                                        </p>
                                        <div className="bg-light rounded p-4">
                                            <i className="bi bi-activity text-muted" style={{ fontSize: '3rem' }}></i>
                                            <p className="text-muted mt-3 mb-0">No recent activity to display</p>
                                        </div>
                                    </div>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Password Change Modal */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-key me-2"></i>
                        Change Password
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                placeholder="Enter your current password"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="Enter your new password"
                            />
                            <Form.Text className="text-muted">
                                Password must be at least 6 characters long.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirm your new password"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handlePasswordChange}
                        disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    >
                        {isSaving ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Changing...
                            </>
                        ) : (
                            'Change Password'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

// Export the component wrapped with authentication HOC
export default withRequireAuth(UserProfileComponent);
