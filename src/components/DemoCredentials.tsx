import { useState } from 'react';
import { Card, Button, Table, Badge, Collapse } from 'react-bootstrap';
import { authService } from '../api/authPromise';

export function DemoCredentials() {
    const [show, setShow] = useState(false);
    const credentials = authService.getDemoCredentials();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="mb-3">
            <Button
                variant="outline-info"
                size="sm"
                onClick={() => setShow(!show)}
                className="w-100"
            >
                <i className="bi bi-info-circle me-2"></i>
                {show ? 'Hide' : 'Show'} Demo Credentials
            </Button>
            
            <Collapse in={show}>
                <div className="mt-2">
                    <Card className="border-info">
                        <Card.Header className="bg-info text-white">
                            <small className="fw-bold">
                                <i className="bi bi-key me-2"></i>
                                Demo Login Credentials
                            </small>
                        </Card.Header>
                        <Card.Body className="p-2">
                            <Table size="sm" className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Role</th>
                                        <th>Login</th>
                                        <th>Password</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <Badge bg="danger">ADMIN</Badge>
                                        </td>
                                        <td>
                                            <small className="font-monospace">
                                                {credentials.admin.email}
                                            </small>
                                        </td>
                                        <td>
                                            <small className="font-monospace">
                                                {credentials.admin.password}
                                            </small>
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => copyToClipboard(credentials.admin.email)}
                                            >
                                                <i className="bi bi-clipboard"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Badge bg="warning">MODERATOR</Badge>
                                        </td>
                                        <td>
                                            <small className="font-monospace">
                                                {credentials.moderator.phone}
                                            </small>
                                        </td>
                                        <td>
                                            <small className="font-monospace">
                                                {credentials.moderator.password}
                                            </small>
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => copyToClipboard(credentials.moderator.phone)}
                                            >
                                                <i className="bi bi-clipboard"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Badge bg="primary">USER</Badge>
                                        </td>
                                        <td>
                                            <small className="font-monospace">
                                                {credentials.user.email}
                                            </small>
                                        </td>
                                        <td>
                                            <small className="font-monospace">
                                                {credentials.user.password}
                                            </small>
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => copyToClipboard(credentials.user.email)}
                                            >
                                                <i className="bi bi-clipboard"></i>
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                            <div className="mt-2">
                                <small className="text-muted">
                                    <i className="bi bi-lightbulb me-1"></i>
                                    <strong>Tips:</strong> Try different roles to see permission-based features. 
                                    Admin can delete users, Moderator can edit, User has view-only access.
                                </small>
                            </div>
                            <div className="mt-2 p-2 bg-warning bg-opacity-10 rounded">
                                <small className="text-warning">
                                    <i className="bi bi-shield-check me-1"></i>
                                    <strong>2FA Enabled:</strong> After entering credentials, you'll receive a 6-digit verification code. 
                                    Check browser notifications or console for the code during demo.
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </Collapse>
        </div>
    );
}
