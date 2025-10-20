import React, { useState } from 'react';
import { Modal, Button, Card, Row, Col, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface QuickStartGuideProps {
    show: boolean;
    onHide: () => void;
}

export function QuickStartGuide({ show, onHide }: QuickStartGuideProps) {
    const { state } = useAuth();
    const { setTheme } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Welcome to SDA ACM!",
            content: (
                <div className="text-center">
                    <i className="bi bi-heart-fill text-danger" style={{ fontSize: '3rem' }}></i>
                    <h4 className="mt-3">Welcome, {state.user?.name}!</h4>
                    <p className="text-muted">
                        You're now logged in as a <Badge bg="primary">{state.user?.role}</Badge>. 
                        Let's take a quick tour of what you can do.
                    </p>
                </div>
            )
        },
        {
            title: "Your Dashboard",
            content: (
                <div>
                    <h5><i className="bi bi-house me-2"></i>Dashboard Features</h5>
                    <ul className="list-unstyled">
                        <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            View membership statistics and analytics
                        </li>
                        <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            See recent activities and notifications
                        </li>
                        <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Access quick actions for common tasks
                        </li>
                        <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Monitor church growth and engagement
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "Member Management",
            content: (
                <div>
                    <h5><i className="bi bi-people me-2"></i>Member Features</h5>
                    <div className="mb-3">
                        <strong>Your Permissions:</strong>
                        <div className="mt-2">
                            {state.user?.role === 'admin' && (
                                <Badge bg="danger" className="me-2">Full Access - Can view, edit, and delete</Badge>
                            )}
                            {state.user?.role === 'moderator' && (
                                <Badge bg="warning" className="me-2">Moderator - Can view and edit members</Badge>
                            )}
                            {state.user?.role === 'user' && (
                                <Badge bg="secondary" className="me-2">User - Can view member information</Badge>
                            )}
                        </div>
                    </div>
                    <ul className="list-unstyled">
                        <li className="mb-2">
                            <i className="bi bi-search me-2 text-info"></i>
                            Search and filter members by various criteria
                        </li>
                        <li className="mb-2">
                            <i className="bi bi-sort-alpha-down me-2 text-info"></i>
                            Sort member lists by any column
                        </li>
                        <li className="mb-2">
                            <i className="bi bi-table me-2 text-info"></i>
                            Paginated views for large member lists
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "Customize Your Experience",
            content: (
                <div>
                    <h5><i className="bi bi-palette me-2"></i>Themes & Settings</h5>
                    <p>Personalize your experience with different themes:</p>
                    <Row className="g-2 mb-3">
                        <Col xs={4}>
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="w-100"
                                onClick={() => setTheme('default')}
                            >
                                Default
                            </Button>
                        </Col>
                        <Col xs={4}>
                            <Button 
                                variant="outline-dark" 
                                size="sm" 
                                className="w-100"
                                onClick={() => setTheme('dark')}
                            >
                                Dark
                            </Button>
                        </Col>
                        <Col xs={4}>
                            <Button 
                                variant="outline-info" 
                                size="sm" 
                                className="w-100"
                                onClick={() => setTheme('ocean')}
                            >
                                Ocean
                            </Button>
                        </Col>
                    </Row>
                    <p className="text-muted small">
                        <i className="bi bi-lightbulb me-1"></i>
                        Visit Settings to explore all 6 available themes and customize your preferences.
                    </p>
                </div>
            )
        },
        {
            title: "Navigation Tips",
            content: (
                <div>
                    <h5><i className="bi bi-compass me-2"></i>Getting Around</h5>
                    <ul className="list-unstyled">
                        <li className="mb-2">
                            <i className="bi bi-mouse me-2 text-primary"></i>
                            <strong>Fixed Sidebar:</strong> Navigation stays visible while scrolling
                        </li>
                        <li className="mb-2">
                            <i className="bi bi-person-circle me-2 text-primary"></i>
                            <strong>Profile Menu:</strong> Click your avatar for profile and logout options
                        </li>
                        <li className="mb-2">
                            <i className="bi bi-question-circle me-2 text-primary"></i>
                            <strong>Tooltips:</strong> Hover over navigation icons for helpful hints
                        </li>
                        <li className="mb-2">
                            <i className="bi bi-gear me-2 text-primary"></i>
                            <strong>Settings:</strong> Access themes and preferences anytime
                        </li>
                    </ul>
                </div>
            )
        },
        {
            title: "You're All Set!",
            content: (
                <div className="text-center">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                    <h4 className="mt-3 text-success">Ready to Go!</h4>
                    <p className="text-muted">
                        You now know the basics of using the SDA ACM system. 
                        Explore the features and don't hesitate to reach out if you need help.
                    </p>
                    <div className="bg-light rounded p-3 mt-3">
                        <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            <strong>Need Help?</strong> Look for the demo credentials on the login page 
                            to test different user roles and permissions.
                        </small>
                    </div>
                </div>
            )
        }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setCurrentStep(0);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <i className="bi bi-rocket me-2"></i>
                    Quick Start Guide
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">{steps[currentStep].title}</h5>
                        <Badge bg="secondary">
                            Step {currentStep + 1} of {steps.length}
                        </Badge>
                    </div>
                    <div className="progress mb-3" style={{ height: '4px' }}>
                        <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <Card className="border-0 bg-light">
                    <Card.Body>
                        {steps[currentStep].content}
                    </Card.Body>
                </Card>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
                <Button 
                    variant="outline-secondary" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Previous
                </Button>
                
                <div>
                    {currentStep < steps.length - 1 ? (
                        <Button variant="primary" onClick={nextStep}>
                            Next
                            <i className="bi bi-arrow-right ms-2"></i>
                        </Button>
                    ) : (
                        <Button variant="success" onClick={handleClose}>
                            Get Started!
                            <i className="bi bi-check-lg ms-2"></i>
                        </Button>
                    )}
                </div>
            </Modal.Footer>
        </Modal>
    );
}
