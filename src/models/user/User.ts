import { Address, AddressForm } from "./Address";
import { UserProfile } from "./UserProfile";

type User = {
    id: number;
    keycloakId: string;
    userName: string;
    email: string;
    telephone: string;
    password: string;
    address: Address;
    profile: UserProfile;
    role: string;
};

export type UserForm = {
    keycloakId: string;
    userName: string;
    email: string;
    telephone: string;
    password: string;
    address: AddressForm;
    profile: UserProfile;
    role: string;
};

export const initialUserForm: UserForm = {
    keycloakId: '',
    userName: '',
    email: '',
    telephone: '',
    password: '',
    address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        countryCode: '',
    },
    profile: {
        firstName: '',
        lastName: '',
        preferences: {
            language: '',
            theme: '',
            notifications: false,
        },
        avatar: '',
    },
    role: '',
};

export default User;
