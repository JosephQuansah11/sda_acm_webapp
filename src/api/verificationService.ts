// Verification code service for 2FA authentication
export interface VerificationCode {
    code: string;
    identifier: string; // email or phone
    type: 'email' | 'sms';
    expiresAt: Date;
    attempts: number;
    maxAttempts: number;
}

export interface VerificationRequest {
    identifier: string;
    type: 'email' | 'sms';
}

export interface VerificationResponse {
    success: boolean;
    message: string;
    expiresIn: number; // seconds until expiration
}

export interface CodeValidationRequest {
    identifier: string;
    code: string;
    type: 'email' | 'sms';
}

export interface CodeValidationResponse {
    success: boolean;
    message: string;
    remainingAttempts?: number;
}

// In-memory storage for demo purposes (in production, use Redis or database)
const verificationCodes = new Map<string, VerificationCode>();

// Generate a 6-digit verification code
function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Mock email sending service
async function sendEmailCode(email: string, code: string): Promise<boolean> {
     // console.log(`📧 Sending verification code to ${email}: ${code}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For demo, we'll show the code in console and browser notification
    if (typeof window !== 'undefined') {
        // Show browser notification for demo
        if (Notification.permission === 'granted') {
            new Notification('Verification Code', {
                body: `Your verification code is: ${code}`,
                icon: '/favicon.ico'
            });
        }
    }
    
    return true; // Simulate successful send
}

// Mock SMS sending service
async function sendSMSCode(phone: string, code: string): Promise<boolean> {
     // console.log(`📱 Sending SMS verification code to ${phone}: ${code}`);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    // For demo, we'll show the code in console and browser notification
    if (typeof window !== 'undefined') {
        // Show browser notification for demo
        if (Notification.permission === 'granted') {
            new Notification('SMS Verification Code', {
                body: `Your verification code is: ${code}`,
                icon: '/favicon.ico'
            });
        }
    }
    
    return true; // Simulate successful send
}

export const verificationService = {
    // Send verification code
    async sendVerificationCode(request: VerificationRequest): Promise<VerificationResponse> {
        const { identifier, type } = request;
        
        // Generate new code
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 4 * 60 * 1000); // 4 minutes from now
        
        // Store verification code
        const verificationData: VerificationCode = {
            code,
            identifier,
            type,
            expiresAt,
            attempts: 0,
            maxAttempts: 3
        };
        
        verificationCodes.set(identifier, verificationData);
        
        try {
            // Send code via appropriate channel
            let sendSuccess = false;
            if (type === 'email') {
                sendSuccess = await sendEmailCode(identifier, code);
            } else if (type === 'sms') {
                sendSuccess = await sendSMSCode(identifier, code);
            }
            
            if (sendSuccess) {
                return {
                    success: true,
                    message: `Verification code sent to your ${type === 'email' ? 'email' : 'phone'}`,
                    expiresIn: 240 // 4 minutes in seconds
                };
            } else {
                // Remove failed code
                verificationCodes.delete(identifier);
                return {
                    success: false,
                    message: `Failed to send verification code via ${type}`,
                    expiresIn: 0
                };
            }
        } catch (error) {
            // Remove failed code
            verificationCodes.delete(identifier);
            return {
                success: false,
                message: 'Failed to send verification code. Please try again.',
                expiresIn: 0
            };
        }
    },

    // Validate verification code
    async validateVerificationCode(request: CodeValidationRequest): Promise<CodeValidationResponse> {
        const { identifier, code, type } = request;
        
        const storedVerification = verificationCodes.get(identifier);
        
        if (!storedVerification) {
            return {
                success: false,
                message: 'No verification code found. Please request a new code.'
            };
        }
        
        // Check if code has expired
        if (new Date() > storedVerification.expiresAt) {
            verificationCodes.delete(identifier);
            return {
                success: false,
                message: 'Verification code has expired. Please request a new code.'
            };
        }
        
        // Check if max attempts exceeded
        if (storedVerification.attempts >= storedVerification.maxAttempts) {
            verificationCodes.delete(identifier);
            return {
                success: false,
                message: 'Maximum verification attempts exceeded. Please request a new code.'
            };
        }
        
        // Increment attempt count
        storedVerification.attempts++;
        
        // Validate code
        if (storedVerification.code === code && storedVerification.type === type) {
            // Code is valid - remove it
            verificationCodes.delete(identifier);
            return {
                success: true,
                message: 'Verification successful!'
            };
        } else {
            // Code is invalid
            const remainingAttempts = storedVerification.maxAttempts - storedVerification.attempts;
            
            if (remainingAttempts <= 0) {
                verificationCodes.delete(identifier);
                return {
                    success: false,
                    message: 'Invalid verification code. Maximum attempts exceeded.'
                };
            }
            
            return {
                success: false,
                message: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
                remainingAttempts
            };
        }
    },

    // Resend verification code (same as send, but with different message)
    async resendVerificationCode(request: VerificationRequest): Promise<VerificationResponse> {
        // Remove existing code first
        verificationCodes.delete(request.identifier);
        
        const result = await this.sendVerificationCode(request);
        if (result.success) {
            result.message = `New verification code sent to your ${request.type === 'email' ? 'email' : 'phone'}`;
        }
        return result;
    },

    // Get remaining time for a verification code
    getRemainingTime(identifier: string): number {
        const storedVerification = verificationCodes.get(identifier);
        if (!storedVerification) return 0;
        
        const now = new Date();
        const remaining = Math.max(0, Math.floor((storedVerification.expiresAt.getTime() - now.getTime()) / 1000));
        
        if (remaining <= 0) {
            verificationCodes.delete(identifier);
        }
        
        return remaining;
    },

    // Check if verification code exists and is valid
    hasValidCode(identifier: string): boolean {
        const storedVerification = verificationCodes.get(identifier);
        if (!storedVerification) return false;
        
        const now = new Date();
        const isValid = now <= storedVerification.expiresAt && 
                        storedVerification.attempts < storedVerification.maxAttempts;
        
        if (!isValid) {
            verificationCodes.delete(identifier);
        }
        
        return isValid;
    }
};

// Request notification permission on service load
if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
}
