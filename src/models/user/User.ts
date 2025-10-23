import { Address, AddressForm } from "./Address";
import { UserProfile } from "./UserProfile";

type User = {
    id: number;
    userName: string;
    email: string;
    telephone: string;
    password: string;
    address: Address;
    profile: UserProfile;
    role: string;
};

export type UserForm = {
    userName: string;
    email: string;
    telephone: string;
    password: string;
    address: AddressForm;
    profile: UserProfile;
    role: string;
};

export default User;
