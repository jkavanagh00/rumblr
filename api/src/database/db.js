import knex from "knex";
import knexConfig from "../config/knexfile.js";

const db = knex(knexConfig);

export default db;
