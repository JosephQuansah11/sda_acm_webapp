import { Address, AddressForm } from "../user/Address";

export type Church = {
    id: string;
    name: string;
    address: Address;
}

export type ChurchForm = {
    name: string;
    address: AddressForm;
}
