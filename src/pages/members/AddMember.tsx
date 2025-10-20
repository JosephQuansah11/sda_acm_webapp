import { Container } from "react-bootstrap";
import { AddForm } from "../../components/common";
import { Card } from "react-bootstrap";

export default function AddMember() {
    const userForm = {
        name: '',
        email: '',
        telephone: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: ''
        }
    };
    return (
        <Container className="card p-5">
            <Card.Header className="bg-primary text-white">
                <h2 className="mb-0">
                    <i className="bi bi-person-plus me-2"></i>
                    Add Member
                </h2>
            </Card.Header>
            <AddForm items={userForm} buttonName="Add Member" />
        </Container>
    );
}   