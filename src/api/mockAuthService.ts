import { AuthState, LoginCredentials, VerificationState } from "../contexts/AuthLoginContext";
import { verificationService } from "./verificationService";
import { addUser, getAllUsers } from "./UserApi";
import { getLoginPasswordEncoded } from "./UserApi";
import User, { UserForm } from "../models/user/User";

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

      console.log("is this triggered?")
      if (verificationResponse.success) {
        // Return verification required response
        const verificationState: VerificationState = {
          isVerificationRequired: true,
          identifier,
          type: verificationType,
          tempToken: `temp-token-${user.id}-${Date.now()}`,
        };

        console.log("temp token for custom user: ", verificationState.tempToken)

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
      const user = mockUsers.find((u: User) => String(u.id) == userId || u.keycloakId == userId);

      if (user) {
        let token = "";
        const loginMethod = localStorage.getItem("loginMethod") as
          | "custom"
          | "keycloak"
          | null;

        if (loginMethod === "custom") {
          console.log("We should be here!!!!")
          token = `mock-jwt-token-${user.id}-${Date.now()}`;
        } else if (loginMethod === "keycloak") {
          console.log("Why are we here?")
          token = `mock-jwt-token-${user.keycloakId}-${Date.now()}`
        }
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
    authState?: AuthState | null;
  }> {
    const resultParsedData = JSON.parse(parsedData)
    const accessToken = resultParsedData.accessToken;
    const isAuthenticated = resultParsedData.isAuthenticated;
    const email = resultParsedData.email == undefined ? resultParsedData.keycloakObject.tokenParsed?.email : "josepheducationplatform@gmail.com";
    const keycloakParsed = resultParsedData.keycloakObject //Getting keycloak instance

    if (!isAuthenticated || !accessToken || !email) {
      throw new Error("Invalid Keycloak credentials");
    }

    // Get user info from Keycloak
    const userInfo = await keycloakParsed.tokenParsed;

    // Create a new mock user
    const newUserId = userInfo.sub;
    let newUser: UserForm = {
      keycloakId: userInfo.sub,
      userName: userInfo.preferred_username || `user-${newUserId}`,
      email: userInfo.email || email,
      password: "don't temp password", // Set a default password
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
        avatar: "https://api.dicebear.com/9.x/identicon/svg?seed=Avery",
      },
      role: "USER",
      lastActive: null,
      status: 'inactive',
      churchId: null

    };

    // // Generate a mock JWT
    const token = `mock-jwt-token-${newUserId}-${Date.now()}`;
    const requiresVerification = isAuthenticated;
    const verificationState: VerificationState = {
      isVerificationRequired: true,
      identifier: email,
      type: "email",
      tempToken: `temp-token-${newUserId}-${Date.now()}`,
    };

    // mockUsers.push(mockUser);
    const userId = newUserId;
    const user = mockUsers.find((u: User) => String(u.id) == userId || u.keycloakId == userId);
    if (!user) {
      addUser(newUser)
    }

    const authState:AuthState = {
      user: user!,
      isAuthenticated: keycloakParsed.authenticated,
      isLoading: false,
      error: null,
      verificationState: verificationState,
      loginMethod: "keycloak"
    }
    return { user: user, token, requiresVerification, authState };
  },

  // Simulate token validation
  async validateToken(token: string): Promise<{ user: User, authState: AuthState }> {
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
      const user = mockUsers.find((u: User) => String(u.id) == userId || u.keycloakId == userId);

      const loginMethod = localStorage.getItem("loginMethod") as
        | "custom"
        | "keycloak"
        | null;


      const verificationState: VerificationState = {
        isVerificationRequired: true,
        identifier: "email",
        type: "email",
        tempToken: `temp-token-${userId}-${Date.now()}`,
      };
      const authState: AuthState = {
        user: user!,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginMethod: loginMethod,
        verificationState: verificationState
      }


      if (user) {
        return { user, authState };
      }
    }

    throw new Error("Invalid token");
  },

  // Simulate profile update
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    // // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 800));

    const userIndex = mockUsers.findIndex((u: User) => String(u.id) == userId || u.keycloakId == userId);
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

    const userIndex = mockUsers.findIndex((u: User) => String(u.id) == userId || u.keycloakId == userId);
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
