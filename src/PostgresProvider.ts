import { Pool, PoolClient, Collection } from "../deps.ts";

/** Simple and easy to use key-v PostgreSQL provider for Deno.
 * @param tablename The name of the table in the database
 * @param user The name of the user of the database
 * @param database The name of the database
 * @param hostname The name of the host
 * @param password The password to the user
 * @param port The port on which the database is hosted
 * ```ts
 * const db = new DB("userinfo", "postgres", "denokeyv", "localhost", "somepassword");
 * ```
 */
export class PostgresProvider {
  private db: Pool;
  private collection: Collection;
  private tablename: String;
  private clientOptions: Object;
  constructor(
    tablename: String,
    user: String,
    database: String,
    hostname: String,
    password: String,
    port?: number
  ) {
    this.clientOptions = {
      user,
      database,
      hostname,
      password,
      port: port || 5432,
    };
    this.tablename = tablename;
    this.collection = new Collection();
    this.db = new Pool(this.clientOptions, 20);
  }

  private async runQuery(query: string, ...args: any[]) {
    try {
      const client: PoolClient = await this.db.connect();
      const result = await client.queryArray(query, ...args);

      client.release();
      return result;
    } catch (err) {
      console.error(`Error running query: ${err.message}`);
      throw err;
    }
  }

  /**
   * Initiate the database.
   * ```ts
   * await db.init();
   * ```
   */
  async init() {
    await this.runQuery(
      `CREATE TABLE IF NOT EXISTS ${this.tablename}(key TEXT PRIMARY KEY, value TEXT)`
    );
  }

  /**
   * Set a value to the database
   * @param key The key to the value
   * @param value The value
   * @returns The updated value in the database.
   * ```ts
   * await db.set("john.gender", "male");
   * ```
   */
  async set(key: string, value: any) {
    let unparsed;

    if (key.includes(".")) {
      let split = key.split(".");
      key = split[0];
      split.shift();
      unparsed = split;
    }

    let cachedData = this.collection.get(key) || {};
    let data = Object.assign(cachedData, { [unparsed || key]: value });

    const result = await this.runQuery(
      `SELECT value FROM ${this.tablename} WHERE key = $1`,
      [key]
    );

    if (result.rowCount > 0) {
      const existingData = JSON.parse(result.rows[0][0]);
      data = Object.assign(existingData, data);
    }

    if (unparsed) {
      this.collection.set(key, data);
    } else {
      this.collection.set(key, value);
      data = value;
    }

    if (value === null) {
      delete this.collection[unparsed];
      delete data[unparsed];
    }

    await this.runQuery(
      `INSERT INTO ${this.tablename} (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2`,
      [key, JSON.stringify(data)]
    );

    const json = JSON.stringify(Object.fromEntries(this.collection));
    return json;
  }

  /**
   * Remove key from the database
   * @param key The value to remove key
   * @returns null
   */
  async delete(key: string) {
    this.collection.delete(key);
    await this.runQuery(`DELETE FROM ${this.tablename} WHERE key = $1`, [key]);
    return null;
  }

  /**
   * Get a value from the database
   * @param  key The value you want to get.
   * @param default The default value to get if the original key wasnt found.
   * @returns  The value fetched from the database.
   * ```ts
   * const john = await db.get("john")
   * ```
   */
  async get(key: string, defaultValue?: string) {
    let data;
    let collection;

    if (key.includes(".")) {
      let array = key.split(".");
      collection = this.collection.get(array[0]);
      let exists = this.collection.has(array[0]);
      // let prop = array.join(".");

      if (!exists) {
        const result = await this.runQuery(
          `SELECT value FROM ${this.tablename} WHERE key = $1`,
          [array[0]]
        );
        if (result.rowCount > 0) {
          data = JSON.parse(result.rows[0][0])[array[1]];
        } else {
          data = defaultValue || "";
        }
      } else {
        data = collection[array[1]];
      }
    } else {
      let exists = this.collection.has(key);
      if (!exists) {
        const result = await this.runQuery(
          `SELECT value FROM ${this.tablename} WHERE key = $1`,
          [key]
        );
        if (result.rowCount > 0) {
          data = JSON.parse(result.rows[0][0]);
        } else {
          data = defaultValue || "";
        }
      } else {
        data = this.collection.get(key);
      }
    }
    return data;
  }

  /**
   * Select all keys from the database!
   * @returns All the data in the database
   * ```ts
   * const all = await db.all();
   * ```
   */
  async all() {
    const result = await this.runQuery(`SELECT * FROM ${this.tablename}`);

    let data = new Map();
    for (const o of result.rows) {
      data.set(o[0], JSON.parse(o[1]));
    }
    return Object.fromEntries(data);
  }

  /**
   * Check if the database contains a specific value or not!
   * @param key - The value to check.
   * @return Whether the database has the key or not
   * ```ts
   * const result = await db.has("john");
   * ```
   */
  async has(key: string) {
    if (key.includes(".")) {
      let split = key.split(".");
      let first = split[0];
      let collection = await this.get(first);
      split.shift();
      let prop = split.join(".");
      return Object.prototype.hasOwnProperty.call(collection, prop);
    }
    return this.collection.has(key);
  }
}
