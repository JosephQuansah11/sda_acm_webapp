import { LoginCredentials, User, VerificationState } from '../contexts/AuthContext';
import { verificationService } from './verificationService';
import avatar from '../images/7960899(1).jpg';


const adminAvatar = 'https://media.tenor.com/xqStQSFQotIAAAAm/cute-eyes-aang.webp';
const moderatorAvatar = 'https://media.tenor.com/hD5dujWbbq0AAAAm/really-zhao.webp';

// Mock users for testing
export const mockUsers: User[] = [
    {
        id: 1,
        email: 'admin@sda.com',
        name: 'John Administrator',
        role: 'admin',
        profile: {
            firstName: 'John',
            lastName: 'Administrator',
            avatar: adminAvatar,
            preferences: {
                theme: 'default',
                notifications: true,
            },
        },
    },
    {
        id: 2,
        telephone: '+1234567890',
        name: 'Jane Moderator',
        role: 'moderator',
        profile: {
            firstName: 'Jane',
            lastName: 'Moderator',
            avatar: moderatorAvatar,
            preferences: {
                theme: 'ocean',
                notifications: false,
            },
        },
    },
    {
        id: 3,
        email: 'user@sda.com',
        name: 'Bob User',
        role: 'user',
        profile: {
            firstName: 'Bob',
            lastName: 'User',
            avatar: avatar,
            preferences: {
                theme: 'dark',
                notifications: true,
            },
        },
    },
];

// Mock authentication service
export const mockAuthService = {
    // Simulate login with 2FA
    async login(credentials: LoginCredentials): Promise<{ user?: User; token?: string; requiresVerification?: boolean; verificationState?: VerificationState }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { identifier, password, identifierType } = credentials;

        // Find user by email or phone
        const user = mockUsers.find(u => {
            if (identifierType === 'email') {
                return u.email === identifier;
            } else {
                return u.telephone === identifier;
            }
        });

        // Simple password check (in real app, this would be hashed)
        if (user && password === 'password123') {
            // For custom login, require 2FA verification
            const verificationType = identifierType === 'email' ? 'email' : 'sms';
            
            // Send verification code
            const verificationResponse = await verificationService.sendVerificationCode({
                identifier,
                type: verificationType
            });

            if (verificationResponse.success) {
                // Return verification required response
                const verificationState: VerificationState = {
                    isVerificationRequired: true,
                    identifier,
                    type: verificationType,
                    tempToken: `temp-token-${user.id}-${Date.now()}`
                };

                return {
                    requiresVerification: true,
                    verificationState
                };
            } else {
                throw new Error('Failed to send verification code');
            }
        }

        throw new Error('Invalid credentials');
    },

    // Complete login after verification
    async completeLogin(tempToken: string): Promise<{ user: User; token: string }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Extract user ID from temp token
        const tokenParts = tempToken.split('-');
        if (tokenParts.length >= 4 && tokenParts[0] === 'temp' && tokenParts[1] === 'token') {
            const userId = parseInt(tokenParts[2]);
            const user = mockUsers.find(u => u.id === userId);
            
            if (user) {
                const token = `mock-jwt-token-${user.id}-${Date.now()}`;
                return { user, token };
            }
        }

        throw new Error('Invalid temporary token');
    },

    // Simulate token validation
    async validateToken(token: string): Promise<User> {
        // Simulate network delay
        // await new Promise(resolve => setTimeout(resolve, 500));

        // Extract user ID from mock token
        const tokenParts = token.split('-');
        if (tokenParts.length >= 4 && tokenParts[0] === 'mock' && tokenParts[1] === 'jwt' && tokenParts[2] === 'token') {
            const userId = parseInt(tokenParts[3]);
            const user = mockUsers.find(u => u.id === userId);
            
            if (user) {
                return user;
            }
        }

        throw new Error('Invalid token');
    },

    // Simulate profile update
    async updateProfile(userId: number, updates: Partial<User>): Promise<User> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Update user data
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
        return mockUsers[userIndex];
    },

    // Simulate preferences update
    async updatePreferences(userId: number, preferences: any): Promise<{ message: string }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Update preferences
        if (mockUsers[userIndex].profile) {
            mockUsers[userIndex].profile!.preferences = {
                ...mockUsers[userIndex].profile!.preferences,
                ...preferences,
            };
        }

        return { message: 'Preferences updated successfully' };
    },

    // Get demo credentials for testing
    getDemoCredentials() {
        return {
            admin: {
                email: 'admin@sda.com',
                password: 'password123',
                name: 'John Administrator'
            },
            moderator: {
                phone: '+1234567890',
                password: 'password123',
                name: 'Jane Moderator'
            },
            user: {
                email: 'user@sda.com',
                password: 'password123',
                name: 'Bob User'
            }
        };
    }
};
