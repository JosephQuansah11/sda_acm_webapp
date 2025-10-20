import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    const { state } = useAuth();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/dashboard');
    };

    return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={5}>
                    <Card className="shadow-lg border-0 text-center">
                        <Card.Body className="p-5">
                            <div className="mb-4">
                                <i 
                                    className="bi bi-shield-exclamation text-warning" 
                                    style={{ fontSize: '4rem' }}
                                ></i>
                            </div>
                            
                            <h2 className="text-danger mb-3">Access Denied</h2>
                            
                            <p className="text-muted mb-4">
                                You don't have the required permissions to access this page.
                            </p>

                            {state.user && (
                                <div className="bg-light rounded p-3 mb-4">
                                    <small className="text-muted">
                                        <strong>Current User:</strong> {state.user.name}<br />
                                        <strong>Role:</strong> {state.user.role}
                                    </small>
                                </div>
                            )}

                            <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                                <Button 
                                    variant="primary" 
                                    onClick={handleGoHome}
                                    className="me-md-2"
                                >
                                    <i className="bi bi-house me-2"></i>
                                    Go to Dashboard
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={handleGoBack}
                                >
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Go Back
                                </Button>
                            </div>

                            <hr className="my-4" />
                            
                            <small className="text-muted">
                                If you believe this is an error, please contact your administrator.
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
