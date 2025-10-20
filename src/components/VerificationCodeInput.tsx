import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { verificationService, CodeValidationRequest } from '../api/verificationService';

interface VerificationCodeInputProps {
    identifier: string;
    type: 'email' | 'sms';
    onVerificationSuccess: () => void;
    onCancel: () => void;
}

export function VerificationCodeInput({ 
    identifier, 
    type, 
    onVerificationSuccess, 
    onCancel 
}: VerificationCodeInputProps) {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(240); // 4 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
            setError('Verification code has expired. Please request a new code.');
        }
    }, [timeLeft]);

    // Format time display
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Handle input change
    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit
        if (!/^\d*$/.test(value)) return; // Only allow numbers

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        if (newCode.every(digit => digit !== '') && value) {
            handleSubmit(newCode.join(''));
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        
        if (pastedData.length === 6) {
            const newCode = pastedData.split('');
            setCode(newCode);
            handleSubmit(pastedData);
        }
    };

    // Submit verification code
    const handleSubmit = async (codeToSubmit?: string) => {
        const finalCode = codeToSubmit || code.join('');
        
        if (finalCode.length !== 6) {
            setError('Please enter the complete 6-digit verification code.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const request: CodeValidationRequest = {
                identifier,
                code: finalCode,
                type
            };

            const response = await verificationService.validateVerificationCode(request);

            if (response.success) {
                setSuccess(response.message);
                setTimeout(() => {
                    onVerificationSuccess();
                }, 1000);
            } else {
                setError(response.message);
                if (response.remainingAttempts === 0) {
                    setCanResend(true);
                }
                // Clear the code on error
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            setError('Failed to verify code. Please try again.');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Resend verification code
    const handleResend = async () => {
        setResendLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await verificationService.resendVerificationCode({
                identifier,
                type
            });

            if (response.success) {
                setSuccess(response.message);
                setTimeLeft(240); // Reset timer
                setCanResend(false);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError('Failed to resend verification code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    return (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white text-center">
                <h5 className="mb-0">
                    <i className={`bi ${type === 'email' ? 'bi-envelope' : 'bi-phone'} me-2`}></i>
                    Verify Your {type === 'email' ? 'Email' : 'Phone Number'}
                </h5>
            </Card.Header>
            <Card.Body className="p-4">
                <div className="text-center mb-4">
                    <p className="text-muted">
                        We've sent a 6-digit verification code to:
                    </p>
                    <p className="fw-bold text-primary">
                        {type === 'email' ? identifier : 
                         identifier.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                    </p>
                    <small className="text-muted">
                        Enter the code below to continue
                    </small>
                </div>

                {error && (
                    <Alert variant="danger" className="mb-3">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" className="mb-3">
                        <i className="bi bi-check-circle me-2"></i>
                        {success}
                    </Alert>
                )}

                <Form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <Row className="justify-content-center mb-4">
                        {code.map((digit, index) => (
                            <Col key={index} xs="auto" className="px-1">
                                <Form.Control
                                    ref={(el: any) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="text-center fw-bold"
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        fontSize: '1.5rem',
                                        border: '2px solid #dee2e6',
                                        borderRadius: '8px'
                                    }}
                                    maxLength={1}
                                    disabled={loading || success !== null}
                                />
                            </Col>
                        ))}
                    </Row>

                    <div className="text-center mb-3">
                        {timeLeft > 0 ? (
                            <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                Code expires in: <span className="fw-bold text-warning">{formatTime(timeLeft)}</span>
                            </small>
                        ) : (
                            <small className="text-danger">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                Code has expired
                            </small>
                        )}
                    </div>

                    <div className="d-grid gap-2">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading || code.some(digit => digit === '') || success !== null}
                            className="py-2"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Verifying...
                                </>
                            ) : success ? (
                                <>
                                    <i className="bi bi-check-lg me-2"></i>
                                    Verified!
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-shield-check me-2"></i>
                                    Verify Code
                                </>
                            )}
                        </Button>

                        {canResend && (
                            <Button
                                variant="outline-secondary"
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="py-2"
                            >
                                {resendLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-arrow-clockwise me-2"></i>
                                        Resend Code
                                    </>
                                )}
                            </Button>
                        )}

                        <Button
                            variant="outline-secondary"
                            onClick={onCancel}
                            disabled={loading || resendLoading}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to Login
                        </Button>
                    </div>
                </Form>

                <div className="mt-4 p-3 bg-light rounded">
                    <small className="text-muted">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Demo Note:</strong> For testing purposes, verification codes are displayed in browser notifications and console. 
                        In production, codes would be sent via actual email/SMS services.
                    </small>
                </div>
            </Card.Body>
        </Card>
    );
}
