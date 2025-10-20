import React from 'react';
import { Spinner, Container, Row, Col } from 'react-bootstrap';

interface LoadingSpinnerProps {
    size?: 'sm';
    text?: string;
    centered?: boolean;
    variant?: string;
}

export function LoadingSpinner({ 
    size, 
    text = 'Loading...', 
    centered = true, 
    variant = 'primary' 
}: LoadingSpinnerProps) {
    const spinner = (
        <div className="d-flex flex-column align-items-center">
            <Spinner animation="border" variant={variant} size={size} />
            {text && <div className="mt-2 text-muted">{text}</div>}
        </div>
    );

    if (centered) {
        return (
            <Container fluid>
                <Row className="justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <Col xs="auto">
                        {spinner}
                    </Col>
                </Row>
            </Container>
        );
    }

    return spinner;
}
