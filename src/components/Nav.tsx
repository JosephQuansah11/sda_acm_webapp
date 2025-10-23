import { Nav, NavLink, OverlayTrigger, Tooltip, Dropdown } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import MyIcon from '../images/sda_cm_logo.png';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.scss'
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function CustomNav() {
    const { state, logout } = useAuth();
    const navigate = useNavigate();

    const navLinkList = [
        { href: '/dashboard', icon: 'bi-house', title: 'Home' },
        { href: '/members', icon: 'bi-people', title: 'Members' },
        { href: '/events', icon: 'bi-calendar', title: 'Events' },
        { href: '/settings', icon: 'bi-gear', title: 'Settings' },
    ];

    const handleShowHelp = () => {
        // Trigger quick start guide
        const event = new CustomEvent('showQuickStartGuide');
        window.dispatchEvent(event);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    console.log(state.user?.profile.avatar);

    if (!state?.user?.profile?.avatar) {
        state!.user!.profile!.avatar = "../images/2149548010.jpg";
    }

    return (
        <Navbar
            id="Navbar"
            expand="lg"
            className="bg-dark d-flex flex-column align-items-center h-100"
        >
            <Navbar.Brand href="/dashboard" className="w-100 m-0 p-0 position-relative d-flex justify-content-center align-items-center">
                <img
                    src={MyIcon}
                    alt="My Icon"
                    width="100%"
                    style={{ borderRadius: '10%' }}
                />
            </Navbar.Brand>
            <Nav className="d-flex flex-column justify-content-between h-100">
                <div className=" d-flex flex-column justify-content-around w-100 mt-3">
                    {navLinkList.map((link) => (
                        <OverlayTrigger key={'link'+link.title} placement="right" overlay={<Tooltip>{link.title}</Tooltip>}>
                            <NavLink href={link.href} className="icons-list">
                                <i className={link.icon + " hover-effect "}></i>
                            </NavLink>
                        </OverlayTrigger>
                    ))}
                </div>
                
                {/* User Profile Section */}
                {state.isAuthenticated && state.user && (
                    <div className="d-flex flex-column align-items-center mb-3">
                        <Dropdown drop="up">
                            <Dropdown.Toggle
                                variant="link"
                                className="text-light p-0 border-0 shadow-none"
                                style={{ background: 'none' }}
                            >
                                <OverlayTrigger placement="top" overlay={<Tooltip>Profile Menu</Tooltip>}>
                                    <div className="d-flex flex-column align-items-center">
                                        {state.user.profile.avatar ? (
                                            <img
                                                src={state.user.profile.avatar}
                                                alt="Profile"
                                                width="40"
                                                height="40"
                                                className="rounded-circle mb-1"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-circle bg-primary d-flex align-items-center justify-content-center mb-1"
                                                style={{ width: '40px', height: '40px' }}
                                            >
                                                <i className="bi bi-person-fill text-white fs-5"></i>
                                            </div>
                                        )}
                                        <small className="text-truncate" style={{ maxWidth: '60px', fontSize: '0.7rem' }}>
                                            {state.user.userName}
                                        </small>
                                    </div>
                                </OverlayTrigger>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Header>
                                    <div className="text-center">
                                        <strong>{state.user.userName}</strong>
                                        <br />
                                        <small className="text-muted">{state.user.role}</small>
                                    </div>
                                </Dropdown.Header>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => navigate('/profile')}>
                                    <i className="bi bi-person me-2"></i>
                                    Profile
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => navigate('/settings')}>
                                    <i className="bi bi-gear me-2"></i>
                                    Settings
                                </Dropdown.Item>
                                <Dropdown.Item onClick={handleShowHelp}>
                                    <i className="bi bi-question-circle me-2"></i>
                                    Quick Start Guide
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout} className="text-danger">
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                )}
            </Nav>
        </Navbar>
    );
}

