import { query } from './database.js';
import Customer from '../models/Customer.js'; // assuming you have a User model/interface defined
import { v4 as uuidv4 } from 'uuid';
import StripeApiClient from "../services/stripe-api-client.js";
import NotFoundError from "../Error/NotFoundError.js";
import DuplicateError from "../Error/DuplicateError.js";
import Pterodactyl from "@avionrx/pterodactyl-js";
import dotenv from "dotenv";
dotenv.config();
const pteroClient = new Pterodactyl.Builder()
    .setURL(process.env.PTERODACTYL_BASE_URL)
    .setAPIKey(process.env.PTERODACTYL_API_KEY)
    .asAdmin();
const stripeApi = new StripeApiClient(process.env.STRIPE_API_KEY);
export default class CustomerRepository {
    async createCustomer(email, firstName, lastName) {
        const insId = uuidv4();
        const pteroUser = await pteroClient.createUser({
            email: email, firstName: firstName, lastName: lastName, username: firstName + lastName
        }).catch(err => { throw err; });
        const stripeUser = await stripeApi.createCustomer(new Customer(insId, email, firstName + lastName, undefined, pteroUser.id));
        const name = firstName + lastName;
        const result = await query('INSERT INTO customer (id, email, name, stripe_customer_id, pterodactyl_user_id) VALUES (?, ?, ?, ?, ?)', [insId, email, name, stripeUser.id, pteroUser.id]).catch(error => {
            if (error.code === "ER_DUP_ENTRY") {
                const field = error.message.split("'")[1];
                throw new DuplicateError('Customer', {
                    values: {
                        insId,
                        email,
                        name
                    }
                }, error);
            }
            throw error;
        });
        return new Customer(insId, email, firstName + lastName, stripeUser.id, pteroUser.id);
    }
    async createWithPanel(email, firstName, lastName, stripeUser) {
        const insId = uuidv4();
        const pteroUser = await pteroClient.createUser({
            email: email, firstName: firstName, lastName: lastName, username: firstName + lastName
        }).catch(err => { throw err; });
        const name = firstName + lastName;
        const result = await query('INSERT INTO customer (id, email, name, stripe_customer_id, pterodactyl_user_id) VALUES (?, ?, ?, ?, ?)', [insId, email, name, stripeUser.id, pteroUser.id]).catch(error => {
            if (error.code === "ER_DUP_ENTRY") {
                const field = error.message.split("'")[1];
                throw new DuplicateError('Customer', {
                    values: {
                        insId,
                        email,
                        name
                    }
                }, error);
            }
            throw error;
        });
        return new Customer(insId, email, firstName + lastName, stripeUser.id, pteroUser.id);
    }
    async createFromStripe(customer) {
        const insId = uuidv4();
        const firstName = customer.name.split(" ")[0];
        const lastName = customer.name.split(" ")[1];
        const name = firstName + lastName;
        const pteroUser = await pteroClient.createUser({
            email: customer.email, firstName: firstName, lastName: lastName, username: firstName + lastName
        }).catch(err => { throw err; });
        const result = await query('INSERT INTO customer (id, email, name, stripe_customer_id, pterodactyl_user_id) VALUES (?, ?, ?, ?, ?)', [insId, customer.email, name, customer.id, pteroUser.id]).catch(error => {
            if (error.code === "ER_DUP_ENTRY") {
                const field = error.message.split("'")[1];
                throw new DuplicateError('Customer', {
                    values: {
                        insId,
                        name
                    }
                }, error);
            }
            throw error;
        });
        return new Customer(insId, customer.email, firstName + lastName, customer.id, pteroUser.id);
    }
    async getCustomerByEmail(email) {
        const rows = await query('SELECT * FROM customer WHERE email = ?', [email]);
        if (rows.length === 0) {
            return undefined;
        }
        if (!rows.length) {
            throw new NotFoundError('User', { email: email });
        }
        // @ts-ignore
        return new Customer(...Object.values(rows[0]));
    }
    async getCustomerById(id) {
        const rows = await query('SELECT * FROM customer WHERE id = ?', [id]);
        if (rows.length === 0) {
            return undefined;
        }
        if (!rows.length) {
            throw new NotFoundError('User', { id: id });
        }
        // @ts-ignore
        return new Customer(...Object.values(rows[0]));
    }
    async getCustomerByStripeId(id) {
        const rows = await query('SELECT * FROM customer WHERE stripe_customer_id = ?', [id]);
        if (rows.length === 0) {
            return undefined;
        }
        if (!rows.length) {
            throw new NotFoundError('User', { stripe_customer_id: id });
        }
        // @ts-ignore
        return new Customer(...Object.values(rows[0]));
    }
    async getCustomerByPteroId(id) {
        const rows = await query('SELECT * FROM customer WHERE pterodactyl_user_id = ?', [id]);
        if (rows.length === 0) {
            return undefined;
        }
        if (!rows.length) {
            throw new NotFoundError('User', { pterodactyl_user_id: id });
        }
        // @ts-ignore
        return new Customer(...Object.values(rows[0]));
    }
    async updateCustomerEmail(id, email) {
        await query('UPDATE customer SET email = ? WHERE id = ?', [email, id]);
    }
    async deleteCustomer(id) {
        await query('DELETE FROM customer WHERE id = ?', [id]);
    }
}
