import React from 'react';
import { Card, Col } from 'react-bootstrap';

interface StatCardProps {
    icon: string;
    iconColor: string;
    value: string | number;
    label: string;
    colSize?: number;
}

export function StatCard({ icon, iconColor, value, label, colSize = 3 }: StatCardProps) {
    return (
        <Col md={colSize}>
            <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                    <i className={`bi ${icon} text-${iconColor}`} style={{ fontSize: '2rem' }}></i>
                    <h4 className="mt-2 mb-1">{value}</h4>
                    <small className="text-muted">{label}</small>
                </Card.Body>
            </Card>
        </Col>
    );
}
