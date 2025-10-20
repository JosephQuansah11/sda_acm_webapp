import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useTheme, themes } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { withRequireAuth } from '../../security/withAuth';
import axiosInstance from '../../api/authPromise';

function SettingsComponent() {
    const { state: themeState, setTheme, toggleDarkMode, resetTheme } = useTheme();
    const { state: authState, updateUser } = useAuth();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSaving, setSaving] = useState(false);

    // Handle theme selection
    const handleThemeChange = async (themeId: string) => {
        setSaving(true);
        setMessage(null);

        try {
            // Update theme in context
            setTheme(themeId);

            // Save theme preference to user profile if authenticated
            if (authState.isAuthenticated && authState.user) {
                const response = await axiosInstance.put('/api/user/preferences', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                    data: JSON.stringify({
                        theme: themeId,
                    }),
                });
                console.log(response);
                if (response.status === 200) {
                    // Update user context with new theme preference
                    updateUser({
                        profile: {
                            firstName: authState.user.profile?.firstName || '',
                            lastName: authState.user.profile?.lastName || '',
                            avatar: authState.user.profile?.avatar,
                            preferences: {
                                ...authState.user.profile?.preferences,
                                theme: themeId,
                                notifications: authState.user.profile?.preferences?.notifications || false,
                            },
                        },
                    });
                    setMessage({ type: 'success', text: 'Theme updated successfully!' });
                } else {
                    setMessage({ type: 'error', text: 'Failed to save theme preference' });
                }
            } else {
                setMessage({ type: 'success', text: 'Theme updated successfully!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update theme' });
        } finally {
            setSaving(false);
        }
    };

    // Handle reset theme
    const handleResetTheme = () => {
        resetTheme();
        setMessage({ type: 'success', text: 'Theme reset to default!' });
    };

    // Get theme preview style
    const getThemePreviewStyle = (theme: any) => ({
        background: theme.colors.background,
        border: `2px solid ${theme.colors.primary}`,
        borderRadius: '8px',
        minHeight: '80px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative' as const,
        overflow: 'hidden' as const,
    });

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col xs={12} lg={10}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h4 className="mb-0">
                                <i className="bi bi-gear me-2"></i>
                                Settings
                            </h4>
                        </Card.Header>
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

                            {/* Theme Settings Section */}
                            <section className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="mb-0">
                                        <i className="bi bi-palette me-2"></i>
                                        Theme Settings
                                    </h5>
                                    <Badge bg="info">
                                        Current: {themeState.currentTheme.name}
                                    </Badge>
                                </div>

                                <Row className="g-3">
                                    {Object.values(themes).map((theme) => (
                                        <Col key={theme.id} xs={12} sm={6} md={4} lg={3}>
                                            <Card 
                                                className={`h-100 ${themeState.currentTheme.id === theme.id ? 'border-primary border-3' : ''}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleThemeChange(theme.id)}
                                            >
                                                <div 
                                                    style={getThemePreviewStyle(theme)}
                                                    className="position-relative"
                                                >
                                                    {/* Theme Preview Content */}
                                                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                                                        <div 
                                                            className="rounded-circle mx-auto mb-2"
                                                            style={{
                                                                width: '30px',
                                                                height: '30px',
                                                                backgroundColor: theme.colors.primary,
                                                            }}
                                                        ></div>
                                                        <div 
                                                            className="rounded mx-auto"
                                                            style={{
                                                                width: '40px',
                                                                height: '8px',
                                                                backgroundColor: theme.colors.secondary,
                                                            }}
                                                        ></div>
                                                    </div>

                                                    {/* Selected Indicator */}
                                                    {themeState.currentTheme.id === theme.id && (
                                                        <div className="position-absolute top-0 end-0 m-2">
                                                            <i className="bi bi-check-circle-fill text-primary fs-4"></i>
                                                        </div>
                                                    )}

                                                    {/* Dark Mode Indicator */}
                                                    {theme.isDark && (
                                                        <div className="position-absolute top-0 start-0 m-2">
                                                            <i className="bi bi-moon-fill text-warning"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <Card.Body className="text-center py-2">
                                                    <small className="fw-bold">{theme.name}</small>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                                <div className="mt-4 d-flex gap-2 flex-wrap">
                                    <Button
                                        variant="outline-primary"
                                        onClick={toggleDarkMode}
                                        disabled={isSaving}
                                    >
                                        <i className="bi bi-moon me-2"></i>
                                        Toggle Dark Mode
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleResetTheme}
                                        disabled={isSaving}
                                    >
                                        <i className="bi bi-arrow-clockwise me-2"></i>
                                        Reset to Default
                                    </Button>
                                </div>
                            </section>

                            {/* Application Settings Section */}
                            <section className="mb-5">
                                <h5 className="mb-4">
                                    <i className="bi bi-sliders me-2"></i>
                                    Application Settings
                                </h5>

                                <Row>
                                    <Col md={6}>
                                        <Card className="border-0 bg-light">
                                            <Card.Body>
                                                <h6 className="card-title">
                                                    <i className="bi bi-bell me-2"></i>
                                                    Notifications
                                                </h6>
                                                <Form.Check
                                                    type="switch"
                                                    id="email-notifications"
                                                    label="Email notifications"
                                                    defaultChecked={authState.user?.profile?.preferences?.notifications}
                                                />
                                                <Form.Check
                                                    type="switch"
                                                    id="push-notifications"
                                                    label="Push notifications"
                                                    className="mt-2"
                                                />
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6}>
                                        <Card className="border-0 bg-light">
                                            <Card.Body>
                                                <h6 className="card-title">
                                                    <i className="bi bi-display me-2"></i>
                                                    Display
                                                </h6>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Language</Form.Label>
                                                    <Form.Select>
                                                        <option value="en">English</option>
                                                        <option value="es">Español</option>
                                                        <option value="fr">Français</option>
                                                    </Form.Select>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Form.Label>Time Zone</Form.Label>
                                                    <Form.Select>
                                                        <option value="UTC">UTC</option>
                                                        <option value="EST">Eastern Time</option>
                                                        <option value="PST">Pacific Time</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </section>

                            {/* Privacy & Security Section */}
                            <section className="mb-5">
                                <h5 className="mb-4">
                                    <i className="bi bi-shield-lock me-2"></i>
                                    Privacy & Security
                                </h5>

                                <Row>
                                    <Col md={6}>
                                        <Card className="border-0 bg-light">
                                            <Card.Body>
                                                <h6 className="card-title">Data & Privacy</h6>
                                                <div className="d-grid gap-2">
                                                    <Button variant="outline-primary" size="sm">
                                                        <i className="bi bi-download me-2"></i>
                                                        Export My Data
                                                    </Button>
                                                    <Button variant="outline-warning" size="sm">
                                                        <i className="bi bi-trash me-2"></i>
                                                        Delete Account
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6}>
                                        <Card className="border-0 bg-light">
                                            <Card.Body>
                                                <h6 className="card-title">Session Management</h6>
                                                <div className="d-grid gap-2">
                                                    <Button variant="outline-secondary" size="sm">
                                                        <i className="bi bi-list me-2"></i>
                                                        Active Sessions
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm">
                                                        <i className="bi bi-power me-2"></i>
                                                        Sign Out All Devices
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </section>

                            {/* About Section */}
                            <section>
                                <h5 className="mb-4">
                                    <i className="bi bi-info-circle me-2"></i>
                                    About
                                </h5>

                                <Card className="border-0 bg-light">
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <p><strong>Application:</strong> SDA ACM Web App</p>
                                                <p><strong>Version:</strong> 1.0.0</p>
                                                <p><strong>Build:</strong> 2025.01.17</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><strong>Login Method:</strong> {authState.loginMethod || 'N/A'}</p>
                                                <p><strong>User Role:</strong> {authState.user?.role || 'N/A'}</p>
                                                <p><strong>Theme:</strong> {themeState.currentTheme.name}</p>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </section>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

// Export the component wrapped with authentication HOC
export default withRequireAuth(SettingsComponent);
