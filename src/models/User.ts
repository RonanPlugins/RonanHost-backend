import {UUID} from "../util/functions/UUID.js";
import Pterodactyl from "@avionrx/pterodactyl-js";
import dotenv from "dotenv"
import BaseModel, {RequiredFields} from "./Base/BaseModel.js";
import {AutoAccessor} from "../util/decorators/AutoAccessor.js";
import type {Hashed} from '../@types/crypto';
import {getGrantedPermissions, Permissions} from "../enum/Permissions.js";

dotenv.config()

const pteroClient = new Pterodactyl.Builder()
    .setURL(process.env.PTERODACTYL_BASE_URL)
    .setAPIKey(process.env.PTERODACTYL_API_KEY)
    .asAdmin();

export interface UserRequiredFields extends RequiredFields {
    email: string;
    name: string;
    username: string;
    password: string;
}
export default class User extends BaseModel<UserRequiredFields> {
    required: UserRequiredFields

    @AutoAccessor()
    public email: string;
    @AutoAccessor()
    public name: string;
    @AutoAccessor()
    public username: string;
    @AutoAccessor()
    public readonly pterodactyl_user_id: number;
    private _pterodactyl_user: any;
    @AutoAccessor()
    public stripe_customer_id: string;
    private _stripe_customer: any;
    @AutoAccessor()
    public password: Hashed<string>|String;
    @AutoAccessor()
    public permissions_integer: number;
    @AutoAccessor()
    public created_from: string;
    @AutoAccessor()
    public created_at: Date;
    @AutoAccessor()
    public updated_at: Date;

    constructor(id: UUID, email: string, name: string, username: string, pterodactyl_user_id: number, stripe_customer_id: string,
                password: Hashed<string>|string, permissions: number, created_from: string) {
        super(id)
        this.email = email;
        this.name = name;
        this.username = username;
        this.pterodactyl_user_id = pterodactyl_user_id;
        this.stripe_customer_id = stripe_customer_id;
        this.password = password;
        this.permissions_integer = permissions;
        this.created_from = created_from;
    }

    protected async loadPterodactylUser(): Promise<void> {
        this._pterodactyl_user = await pteroClient.getUser(String(this.pterodactyl_user_id))
    }

    @AutoAccessor()
    public get pterodactyl_user(): Promise<any> {
        if (!this._pterodactyl_user) return this.loadPterodactylUser();
        return this._pterodactyl_user;
    }

    async loadStripeCustomer(): Promise<void> {
        // const response = await axios.get(`/api/customers/${this._stripe_customer_id}`);
        this._stripe_customer = null;
    }

    @AutoAccessor()
    get permissions(): Permissions[] {
        return getGrantedPermissions(this.permissions_integer)
    }

    @AutoAccessor()
    get stripe_customer(): any {
        if (!this._stripe_customer) {
            return this.loadStripeCustomer();
        }
        return this._stripe_customer;
    }

}