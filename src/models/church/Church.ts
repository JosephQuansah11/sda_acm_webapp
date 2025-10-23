import Address from "../user/User";

export type Church = {
    id: string;
    name: string;
    address: Address;
}

export type ChurchForm = {
    name: string;
    address: Address;
}
