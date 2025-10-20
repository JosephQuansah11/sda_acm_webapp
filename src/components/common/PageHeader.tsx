import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
    actionButton?: {
        label: string;
        onClick: () => void;
        variant?: string;
        icon?: string;
    };
    children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon, actionButton, children }: PageHeaderProps) {
    return (
        <Row className="mb-4">
            <Col>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="h3 mb-1">
                            {icon && <i className={`bi ${icon} me-2`}></i>}
                            {title}
                        </h1>
                        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
                    </div>
                    <div className="d-flex gap-2">
                        {actionButton && (
                            <Button 
                                variant={actionButton.variant || 'primary'} 
                                onClick={actionButton.onClick}
                            >
                                {actionButton.icon && <i className={`bi ${actionButton.icon} me-2`}></i>}
                                {actionButton.label}
                            </Button>
                        )}
                        {children}
                    </div>
                </div>
            </Col>
        </Row>
    );
}
