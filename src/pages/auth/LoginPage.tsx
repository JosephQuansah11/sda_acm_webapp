import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, LoginCredentials } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { VerificationCodeInput } from '../../components/VerificationCodeInput';

interface LocationState {
    from?: string;
}

export default function LoginPage() {
    const { state, login, clearError, completeVerification } = useAuth();
    const { state: themeState } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get the page user was trying to access
    const locationState = location.state as LocationState;
    const from = locationState?.from || '/dashboard';

    // Form state
    const [activeTab, setActiveTab] = useState<'custom' | 'keycloak'>('custom');
    const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (state.isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [state.isAuthenticated, navigate, from]);

    // Clear errors when component mounts or tab changes
    useEffect(() => {
        clearError();
    }, [activeTab, clearError]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle identifier type change
    const handleIdentifierTypeChange = (type: 'email' | 'phone') => {
        setIdentifierType(type);
        setFormData(prev => ({
            ...prev,
            identifier: '', // Clear identifier when switching types
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.identifier || !formData.password) {
            return;
        }

        setIsSubmitting(true);
        
        const credentials: LoginCredentials = {
            identifier: formData.identifier,
            password: formData.password,
            identifierType,
        };

        try {
             // console.log("login state result before ", state);
            await login(credentials, activeTab);
             // console.log("login state result after ", state);
            // Navigation will happen automatically via useEffect
        } catch (error) {
            // Error is handled by the auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Keycloak login
    const handleKeycloakLogin = () => {
        // Redirect to Keycloak login URL
        window.location.href = '/api/auth/keycloak/login';
    };

    // Validate identifier based on type
    const isValidIdentifier = () => {
        if (identifierType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(formData.identifier);
        } else {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(formData.identifier);
        }
    };

    const isFormValid = formData.identifier && formData.password && isValidIdentifier();

    // Handle verification success
    const handleVerificationSuccess = async () => {
        try {
            completeVerification();
            // Navigation will be handled by useEffect when authentication succeeds
        } catch (error) {
            console.error('Verification completion failed:', error);
        }
    };

    // Handle verification cancel
    const handleVerificationCancel = () => {
        clearError();
        navigate(-1);
        // This will clear the verification state and return to login form
    };

    // If verification is required, show verification component
    if (state.verificationState?.isVerificationRequired) {
        return (
            <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" style={{themeState}.themeState.currentTheme.colors}>
                <Row className="w-100 justify-content-center">
                    <Col xs={12} sm={8} md={6} lg={5} xl={4}>
                        <VerificationCodeInput
                            identifier={state.verificationState.identifier}
                            type={state.verificationState.type}
                            onVerificationSuccess={handleVerificationSuccess}
                            onCancel={handleVerificationCancel}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                    <Card className="shadow-lg border-0">
                        <Card.Header className="bg-primary text-white text-center py-4">
                            <h3 className="mb-0">SDA ACM Login</h3>
                            <p className="mb-0 text-light">Welcome back!</p>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {state.error && (
                                <Alert variant="danger" dismissible onClose={clearError}>
                                    {state.error}
                                </Alert>
                            )}

                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k as 'custom' | 'keycloak')}
                                className="mb-4"
                                justify
                            >
                                <Tab eventKey="custom" title="Email/Phone Login">
                                    <Form onSubmit={handleSubmit}>
                                        {/* Identifier Type Selector */}
                                        <Form.Group className="mb-3">
                                            <Form.Label>Login with:</Form.Label>
                                            <div className="d-flex gap-3">
                                                <Form.Check
                                                    type="radio"
                                                    id="email-radio"
                                                    name="identifierType"
                                                    label="Email"
                                                    checked={identifierType === 'email'}
                                                    onChange={() => handleIdentifierTypeChange('email')}
                                                />
                                                <Form.Check
                                                    type="radio"
                                                    id="phone-radio"
                                                    name="identifierType"
                                                    label="Phone"
                                                    checked={identifierType === 'phone'}
                                                    onChange={() => handleIdentifierTypeChange('phone')}
                                                />
                                            </div>
                                        </Form.Group>

                                        {/* Identifier Input */}
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                {identifierType === 'email' ? 'Email Address' : 'Phone Number'}
                                            </Form.Label>
                                            <Form.Control
                                                type={identifierType === 'email' ? 'email' : 'tel'}
                                                name="identifier"
                                                value={formData.identifier}
                                                onChange={handleInputChange}
                                                placeholder={
                                                    identifierType === 'email' 
                                                        ? 'Enter your email address' 
                                                        : 'Enter your phone number'
                                                }
                                                isInvalid={formData.identifier ? !isValidIdentifier() : false}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please enter a valid {identifierType === 'email' ? 'email address' : 'phone number'}.
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        {/* Password Input */}
                                        <Form.Group className="mb-4">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Enter your password"
                                                required
                                            />
                                        </Form.Group>

                                        {/* Submit Button */}
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            className="w-100 py-2"
                                            disabled={!isFormValid || isSubmitting || state.isLoading}
                                        >
                                            {isSubmitting || state.isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Signing in...
                                                </>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </Button>
                                    </Form>
                                </Tab>

                                <Tab eventKey="keycloak" title="SSO Login">
                                    <div className="text-center">
                                        <p className="text-muted mb-4">
                                            Sign in with your organization's Single Sign-On
                                        </p>
                                        <Button
                                            variant="outline-primary"
                                            size="lg"
                                            className="w-100 py-3"
                                            onClick={handleKeycloakLogin}
                                            disabled={state.isLoading}
                                        >
                                            <i className="bi bi-shield-lock me-2"></i>
                                            Continue with SSO
                                        </Button>
                                    </div>
                                </Tab>
                            </Tabs>

                            {/* Additional Links */}
                            <div className="text-center mt-4">
                                <small className="text-muted">
                                    Don't have an account?{' '}
                                    <Button 
                                        variant="link" 
                                        className="p-0 text-decoration-none"
                                        onClick={() => navigate('/register')}
                                    >
                                        Sign up here
                                    </Button>
                                </small>
                            </div>
                            
                            <div className="text-center mt-2">
                                <small>
                                    <Button 
                                        variant="link" 
                                        className="p-0 text-decoration-none"
                                        onClick={() => navigate('/forgot-password')}
                                    >
                                        Forgot your password?
                                    </Button>
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
