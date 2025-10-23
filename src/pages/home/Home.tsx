import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { StatCard } from '../../components/common/StatCard';
import { QuickStartGuide } from '../../components/QuickStartGuide';
import '../../App.scss';
import { useUserContent } from '../../hooks/users/useUserContent';
import { useChurchContext } from '../../hooks/church/useChurchContext';

export function Home() {
    const { state } = useAuth();
    const { state: themeState } = useTheme();
    const [showQuickStart, setShowQuickStart] = useState(false);
    const { totalMembers } = useUserContent();
    const { totalChurches } = useChurchContext();
    // Show quick start guide for new users
    useEffect(() => {
        const hasSeenGuide = localStorage.getItem('hasSeenQuickStartGuide');
        if (!hasSeenGuide && state.isAuthenticated) {
            setTimeout(() => setShowQuickStart(true), 1000);
        }
    }, [state.isAuthenticated]);

    // Listen for help button clicks
    useEffect(() => {
        const handleShowGuide = () => {
            setShowQuickStart(true);
        };

        window.addEventListener('showQuickStartGuide', handleShowGuide);
        return () => {
            window.removeEventListener('showQuickStartGuide', handleShowGuide);
        };
    }, []);

    const handleQuickStartClose = () => {
        setShowQuickStart(false);
        localStorage.setItem('hasSeenQuickStartGuide', 'true');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
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
            {/* Welcome Section */}
            <Row className="mb-4">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 className="mb-2">
                                        {getGreeting()}, {state.user?.userName || 'USER'}! <img src="https://media.tenor.com/SNL9_xhZl9oAAAAm/waving-hand-joypixels.webp" alt="" width="60" height="60" />
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Welcome to the SDA ACM Management System
                                    </p>
                                </div>
                                <div className="text-end">
                                    <Badge bg={getRoleBadgeVariant(state.user?.role || 'USER')} className="fs-6 mb-2">
                                        {state.user?.role?.toUpperCase()}
                                    </Badge>
                                    <br />
                                    <small className="text-muted">
                                        Theme: {themeState.currentTheme.name}
                                    </small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Stats */}
            <Container fluid className="m-0 p-0">
                <Row className="d-flex flex-start justify-content-center bg-primary m-3 p-2 pt-4 pb-4">
                    <StatCard 
                        icon="bi-people-fill"
                        iconColor="primary"
                        value={totalMembers}
                        label="Total Members"
                        colSize={2}
                    />
                    <StatCard
                        icon="bi-calendar-event"
                        iconColor="success"
                        value="15"
                        label="Upcoming Events"
                        colSize={2}
                    />
                    <StatCard
                        icon="bi-building"
                        iconColor="info"
                        value={totalChurches}
                        label="Churches"
                        colSize={2}
                    />
                    <StatCard
                        icon="bi-graph-up"
                        iconColor="warning"
                        value="+12%"
                        label="Growth Rate"
                        colSize={2}
                    />
                    <StatCard
                        icon="bi-pie-chart"
                        iconColor="success"
                        value="+12%"
                        label="Active Members"
                        colSize={2}
                    />
                </Row>
            </Container>

            {/* Dashboard Content */}
            <Row>
                <Col lg={7}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-bar-chart me-2"></i>
                                Analytics Dashboard
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <iframe
                                title="Sample Report Demo"
                                width="100%"
                                height="400"
                                src="https://playground.powerbi.com/sampleReportEmbed"
                                allowFullScreen={false}
                                style={{ border: 'none' }}
                            ></iframe>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={5}>
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Header className="bg-success text-white">
                            <h6 className="mb-0">
                                <i className="bi bi-bell me-2"></i>
                                Recent Activities
                            </h6>
                        </Card.Header>
                        <Row lg={2} className="g-2 p-2">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-primary center-rounded-icons p-3 me-3">
                                        <i className="bi bi-person-plus text-white"></i>
                                    </div>
                                    <div>
                                        <small className="fw-bold">New Member Registered</small>
                                        <br />
                                        <small className="text-muted">John Doe joined today</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-success center-rounded-icons p-3 me-3">
                                        <i className="bi bi-calendar-check  text-white"></i>
                                    </div>
                                    <div>
                                        <small className="fw-bold">Event Scheduled</small>
                                        <br />
                                        <small className="text-muted">Youth Meeting - Tomorrow</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="bg-info center-rounded-icons p-3 me-3">
                                        <i className="bi bi-envelope  text-white"></i>
                                    </div>
                                    <div>
                                        <small className="fw-bold">Newsletter Sent</small>
                                        <br />
                                        <small className="text-muted">Monthly update delivered</small>
                                    </div>
                                </div>
                            </Card.Body>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-warning text-dark">
                                    <h6 className="mb-0">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        Quick Actions
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-grid gap-2">
                                        <button className="btn btn-outline-primary btn-sm">
                                            <i className="bi bi-person-plus me-2"></i>
                                            Add New Member
                                        </button>
                                        <button className="btn btn-outline-success btn-sm">
                                            <i className="bi bi-calendar-plus me-2"></i>
                                            Schedule Event
                                        </button>
                                        <button className="btn btn-outline-info btn-sm">
                                            <i className="bi bi-envelope me-2"></i>
                                            Send Newsletter
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm">
                                            <i className="bi bi-file-earmark-text me-2"></i>
                                            Generate Report
                                        </button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Quick Start Guide */}
            <QuickStartGuide
                show={showQuickStart}
                onHide={handleQuickStartClose}
            />
        </Container>
    );
}