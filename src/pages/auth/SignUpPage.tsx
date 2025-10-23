import { Card, Container, Row, Col, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import {AddForm} from "../../components/common/AddForm";
import { UserForm } from "../../models/user/User";
import { useMemo } from "react";
import { AddUserContent } from "../../hooks/users/useUserContent";

export default function SignUpPage() {
    
    const { state, clearError } = useAuth();
    // const userForm = {
    //     userName: "",
    //     email: "",
    //     telephone: "",
    //     address: {
    //         street: "",
    //         city: "",
    //         state: "",
    //         country: "",
    //         countryCode: "",
    //         zipCode: ""
    //     },
    //     profile: {
    //         firstName: "",
    //         lastName: "",
    //         preferences: {
    //             language: "en",
    //             theme: "light"
    //         }
    //     }
    //     , role: "user"
    // }
    const adminAvatar = 'https://media.tenor.com/xqStQSFQotIAAAAm/cute-eyes-aang.webp';
    const moderatorAvatar = 'https://media.tenor.com/hD5dujWbbq0AAAAm/really-zhao.webp';

    const userForm = useMemo(() => {
        return {
            userName: "",
            email: "",
            telephone: "",
            password: "",
            address: {
                street: "",
                city: "",
                state: "",
                country: "",
                countryCode: "",
                zipCode: ""
            },
            profile: {
                firstName: "",
                lastName: "",
                preferences: {
                    language: "en",
                    theme: "light",
                    notifications: false
                },
                avatar: state.user?.role === "ADMIN"? adminAvatar : moderatorAvatar
            }
            , role: "USER"
        }
    }, []);

    return(
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
        <Row className="w-100 justify-content-center">
            <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                <Card className="shadow-lg border-0">
                    <Card.Header className="bg-primary text-white text-center py-4">
                        <h3 className="mb-0">SDA ACM Sign Up</h3>
                        <p className="mb-0 text-light">Sign up to get started!</p>
                    </Card.Header>
                    <Card.Body className="p-4">
                        {state.error && (
                            <Alert variant="danger" dismissible onClose={clearError}>
                                {state.error}
                            </Alert>
                        )}
                        <AddForm <UserForm> items={userForm} onSubmit={AddUserContent} buttonName="Sign Up" />
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
    )
}