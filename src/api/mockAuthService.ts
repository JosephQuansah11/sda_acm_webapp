import { LoginCredentials, VerificationState } from "../contexts/AuthContext";
import { verificationService } from "./verificationService";
import { getAllUsers } from "./UserApi";
import { getLoginPasswordEncoded } from "./UserApi";
import User, { UserForm } from "../models/user/User";
// import { access } from "fs";

let initialApiUsers: User[] = [];

async function getMockUsers() {
  const users = await getAllUsers();
  users.forEach((user) => {
    initialApiUsers.push(user as unknown as User);
  });
  return users;
}
getMockUsers();

// Mock users for testing
export const mockUsers: User[] = initialApiUsers;

// Mock authentication service
export const mockAuthService = {
  // Simulate login with 2FA
  async login(
    credentials: LoginCredentials,
  ): Promise<{
    user?: User;
    token?: string;
    requiresVerification?: boolean;
    verificationState?: VerificationState;
  }> {
    // // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 1000));

    const { identifier, password, identifierType } = credentials;

    // Find user by email or phone
    const user = mockUsers.find(
      (u) => u.email === identifier || u.telephone === identifier,
    );
    const encodedPassword = await getLoginPasswordEncoded(
      credentials.identifierType === "email"
        ? credentials.identifier
        : (identifier as string),
      password,
    );

    // Simple password check (in real app, this would be hashed)
    if (user && encodedPassword === user.password) {
      // For custom login, require 2FA verification
      const verificationType = identifierType === "email" ? "email" : "sms";

      // Send verification code
      const verificationResponse =
        await verificationService.sendVerificationCode({
          identifier,
          type: verificationType,
        });

      if (verificationResponse.success) {
        // Return verification required response
        const verificationState: VerificationState = {
          isVerificationRequired: true,
          identifier,
          type: verificationType,
          tempToken: `temp-token-${user.id}-${Date.now()}`,
        };

        return {
          requiresVerification: true,
          verificationState,
        };
      } else {
        throw new Error("Failed to send verification code");
      }
    }

    throw new Error("Invalid credentials");
  },

  // Complete login after verification
  async completeLogin(
    tempToken: string,
  ): Promise<{ user: User; token: string }> {
    // // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 500));

    // Extract user ID from temp token
    const tokenParts = tempToken.split("-");
    console.log(tokenParts);
    if (
      tokenParts.length >= 4 &&
      tokenParts[0] === "temp" &&
      tokenParts[1] === "token"
    ) {
      const deducedUserId = tokenParts.reduce((acc, part, index) => {
        if (index >= 2 && index <= tokenParts.length - 2) {
          return (
            acc +
            part +
            (index >= 2 && index <= tokenParts.length - 3 ? "-" : "")
          );
        }
        return acc;
      }, "");

      const userId = deducedUserId;
      const user = mockUsers.find((u: User) => String(u.id) == userId);

      if (user) {
        const token = `mock-jwt-token-${user.id}-${Date.now()}`;
        return { user, token };
      }
    }

    throw new Error("Invalid temporary token");
  },

  // Keycloak login
  async keycloakLogin(
    parsedData: {} | any,
  ): Promise<{
    user?: UserForm;
    token?: string;
    requiresVerification?: boolean;
    verificationState?: VerificationState | null;
  }> {
    const resultParsedData = JSON.parse(parsedData)
    const accessToken = resultParsedData.accessToken;
    const isAuthenticated = resultParsedData.isAuthenticated;
    const email = resultParsedData.email;
    const keycloakParsed = resultParsedData.keycloakObject //Getting keycloak instance

    if (!isAuthenticated || !accessToken || !email) {
      throw new Error("Invalid Keycloak credentials");
    }

    // Get user info from Keycloak
    const userInfo = await keycloakParsed.idTokenParsed;

    // Create a new mock user
    const newUserId = Date.now();
    const newUser: UserForm = {
      userName:  userInfo.preferred_username || `user-${newUserId}`,
      email: userInfo.email || email,
      password: userInfo.password, // Set a default password
      telephone: userInfo.telephone,
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        countryCode: "",
      },
      profile: {
        firstName: userInfo.given_name || "",
        lastName: userInfo.family_name || "",
        preferences: {
          theme: "light",
          language: "en",
          notifications: true,
        },
        avatar: "",
      },
      role: "member",
    };

    // Generate a mock JWT
    const token = `mock-jwt-token-${newUserId}-${Date.now()}`;
    
    const requiresVerification = isAuthenticated;
    const verificationState: VerificationState | null = isAuthenticated
      ? {
          isVerificationRequired: true,
          identifier: email,
          type: "email",
          tempToken: `temp-token-${newUserId}-${Date.now()}`,
        }
      : null;
        let mockUser : User = newUser as User;
        mockUser.id = newUserId
      mockUsers.push(mockUser);

    return { user: newUser, token, requiresVerification, verificationState };
  },

  // Simulate token validation
  async validateToken(token: string): Promise<User> {
    // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 500));

    // Extract user ID from mock token
    const tokenParts = token.split("-");
    if (
      tokenParts.length >= 4 &&
      tokenParts[0] === "mock" &&
      tokenParts[1] === "jwt" &&
      tokenParts[2] === "token"
    ) {
      const deducedUserId = tokenParts.reduce((acc, part, index) => {
        if (index >= 3 && index <= tokenParts.length - 2) {
          return (
            acc +
            part +
            (index >= 3 && index <= tokenParts.length - 3 ? "-" : "")
          );
        }
        return acc;
      }, "");
      const userId = deducedUserId;
      const user = mockUsers.find((u: User) => String(u.id) == userId);

      if (user) {
        return user;
      }
    }

    throw new Error("Invalid token");
  },

  // Simulate profile update
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    // // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 800));

    const userIndex = mockUsers.findIndex((u: User) => String(u.id) === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // Update user data
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  },

  // Simulate preferences update
  async updatePreferences(
    userId: string,
    preferences: any,
  ): Promise<{ message: string }> {
    // // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 500));

    const userIndex = mockUsers.findIndex((u) => String(u.id) === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // Update preferences
    if (mockUsers[userIndex].profile) {
      mockUsers[userIndex].profile!.preferences = {
        ...mockUsers[userIndex].profile!.preferences,
        ...preferences,
      };
    }

    return { message: "Preferences updated successfully" };
  },
};
