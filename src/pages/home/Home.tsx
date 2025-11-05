import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { StatCard } from '../../components/common/StatCard';
import { QuickStartGuide } from '../../components/QuickStartGuide';
import { useUserContent } from '../../hooks/users/useUserContent';
import { useChurchContext } from '../../hooks/church/useChurchContext';
import { AddMemberModal } from '../../components/common/AddMemberModal';
import { ScheduleEventModal } from '../../components/common/ScheduleEventModal';
import { initialUserForm, UserForm } from '../../models/user/User';
import { useModalManager } from "../../hooks/useModalManager";
import { useNavigate } from 'react-router-dom';

export function Home() {
    const { state } = useAuth();
    const { state: themeState } = useTheme();
    const [showQuickStart, setShowQuickStart] = useState(false);
    const [showScheduleEvent, setShowScheduleEvent] = useState(false);
    const { totalMembers } = useUserContent();
    const { totalChurches } = useChurchContext();
    const modalManager = useModalManager<UserForm>();
    const navigate = useNavigate();

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

    // Track user activity
    useEffect(() => {
        if (state.isAuthenticated && state.user) {
            // Update user status to active when they're on the page
            updateUserStatus('active');
            
            // Set up activity tracking
            const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
            let activityTimer: NodeJS.Timeout;
            
            const resetActivityTimer = () => {
                // Reset idle timer
                clearTimeout(activityTimer);
                
                // Set user as active
                updateUserStatus('active');
                
                // Set idle timeout (5 minutes)
                activityTimer = setTimeout(() => {
                    updateUserStatus('idle');
                }, 5 * 60 * 1000);
            };
            
            // Add activity listeners
            activityEvents.forEach(event => {
                window.addEventListener(event, resetActivityTimer, true);
            });
            
            // Initialize activity timer
            resetActivityTimer();
            
            // Clean up
            return () => {
                clearTimeout(activityTimer);
                activityEvents.forEach(event => {
                    window.removeEventListener(event, resetActivityTimer, true);
                });
            };
        }
    }, [state.isAuthenticated, state.user]);

    const updateUserStatus = (status: 'active' | 'idle' | 'inactive') => {
        // This would typically make an API call to update the user's status
        console.log(`User ${state.user?.userName} is now ${status}`);
        // In a real implementation, you would update the backend:
        // updateUserStatusAPI(state.user.id, status);
    };

    const handleQuickStartClose = () => {
        setShowQuickStart(false);
        localStorage.setItem('hasSeenQuickStartGuide', 'true');
    };

    const handleScheduleEvent = (eventData: any) => {
        // This would typically make an API call to create the event
        console.log('Scheduling event:', eventData);
        // In a real implementation:
        // createEventAPI(eventData);
        alert('Event scheduled successfully!');
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

    const handleAddMemberModal = (item: UserForm) => {
        modalManager.openAddModal(item);
    }

    // Calculate growth rate (mock implementation)
    const calculateGrowthRate = () => {
        // In a real implementation, this would fetch data from the backend
        // For now, we'll return a mock value
        return "+12%";
    };

    // Calculate active members (mock implementation)
    const calculateActiveMembers = () => {
        // In a real implementation, this would fetch data from the backend
        // For now, we'll return a mock value
        return "42%";
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
                        value={calculateGrowthRate()}
                        label="Growth Rate"
                        colSize={2}
                    />
                    <StatCard
                        icon="bi-pie-chart"
                        iconColor="success"
                        value={calculateActiveMembers()}
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
                                        <Button variant="outline-primary" size="sm" onClick={() => {
                                            console.log("Add New Member");
                                            handleAddMemberModal(initialUserForm);
                                        }}>
                                            <i className="bi bi-person-plus me-2"></i>
                                            Add New Member
                                        </Button>
                                        <Button variant="outline-success" size="sm" onClick={() => {
                                            console.log("Schedule Event");
                                            setShowScheduleEvent(true);
                                        }}>
                                            <i className="bi bi-calendar-plus me-2"></i>
                                            Schedule Event
                                        </Button>
                                        <Button variant="outline-info" size="sm" onClick={()=>{
                                            console.log("Send newsletter");
                                            navigate("/send-newsletter");
                                        }}>
                                            <i className="bi bi-envelope me-2"></i>
                                            Send Newsletter
                                        </Button>
                                        <Button variant="outline-secondary" size="sm">
                                            <i className="bi bi-file-earmark-text me-2"></i>
                                            Generate Report
                                        </Button>
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
        
            {/* Add Member Modal */}
            <AddMemberModal<UserForm> showEditModal={modalManager.showAddModal} 
            addMember={modalManager.addingItem} 
            onCloseEditModal={modalManager.closeAddModal} 
            onEditSubmit={(updatedItem: UserForm) => {
                console.log(updatedItem);
            }} />

            {/* Schedule Event Modal */}
            <ScheduleEventModal
                show={showScheduleEvent}
                onClose={() => setShowScheduleEvent(false)}
                onSchedule={handleScheduleEvent}
            />

           
        </Container>
    );
}
