import React from 'react';
import { Alert, Button } from 'react-bootstrap';

interface ErrorAlertProps {
    error: string | null;
    onDismiss?: () => void;
    variant?: string;
    showIcon?: boolean;
    retryAction?: {
        label: string;
        onClick: () => void;
    };
}

export function ErrorAlert({ 
    error, 
    onDismiss, 
    variant = 'danger', 
    showIcon = true,
    retryAction 
}: ErrorAlertProps) {
    if (!error) return null;

    return (
        <Alert variant={variant} dismissible={!!onDismiss} onClose={onDismiss}>
            <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    {showIcon && <i className="bi bi-exclamation-triangle-fill me-2"></i>}
                    <span>{error}</span>
                </div>
                {retryAction && (
                    <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={retryAction.onClick}
                        className="ms-2"
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        {retryAction.label}
                    </Button>
                )}
            </div>
        </Alert>
    );
}
