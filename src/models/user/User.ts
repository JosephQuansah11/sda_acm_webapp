import { Address, AddressForm } from "./Address";

type User = {
    id: number;
    name: string;
    email: string;
    telephone: string;
    address: Address;
};

export type UserForm = {
    name: string;
    email: string;
    telephone: string;
    address: AddressForm;
};

export default User;
