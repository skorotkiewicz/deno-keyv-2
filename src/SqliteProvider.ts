import { Collection, DB } from "../deps.ts";
import { ld as _ } from "https://deno.land/x/deno_lodash/mod.ts";

/**
 * Simple and easy to use key-v Sqlite Provider for deno
 * @class
 * @param {string} databaseFilePath The filepath for the `.sqlite` file.
 * @param {string} tablename The name of the table for storing data.
 */
export class KeyvSqliteProvider {
  db: DB;
  collection: Collection;
  tablename: string;

  constructor(databaseFilePath: string, tablename: string) {
    this.db = new DB(databaseFilePath);
    this.db.query(
      `CREATE TABLE IF NOT EXISTS ${tablename}(id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT, value TEXT)`
    );
    this.tablename = tablename;
    this.collection = new Collection();
  }

  /**
   * Initiate the database.
   */
  init() {
    const all = [
      ...this.db.query(`SELECT * FROM ${this.tablename}`).asObjects(),
    ];
    for (const row of all) {
      this.collection.set(row.key, row.value);
    }
  }

  /**
   * Set a value to the database
   * @param {string} key The key to the value
   * @param {any} value The value
   * @returns {Object} The updated value in the database.
   * @async
   * @example
   * let db = new Sqlite("db.sqlite", "userinfo");
   * await db.set("john.gender", "male");
   */
  async set(k: string, value: any) {
    let unparsed;
    if (k.includes(".")) {
      let split = k.split(".");
      k = split[0];
      split.shift();
      unparsed = split;
    }
    let cachedData = this.collection.get(k) || {};
    let lodashedData = _.set(cachedData, unparsed || k, value);
    if (unparsed) {
      this.collection.set(k, lodashedData);
    } else {
      this.collection.set(k, value);
      lodashedData = value;
    }

    let fetchQuery = [
      ...this.db
        .query(`SELECT * FROM ${this.tablename} WHERE key = ?`, [k])
        .asObjects(),
    ];
    if (fetchQuery.length <= 0) {
      this.db.query(
        `INSERT INTO ${this.tablename} (key, value) VALUES (?, ?)`,
        [k, JSON.stringify(lodashedData)]
      );
      fetchQuery = [
        ...this.db
          .query(`SELECT * FROM ${this.tablename} WHERE key = ?`, [k])
          .asObjects(),
      ];
    }
    this.db.query(`UPDATE ${this.tablename} SET value = ? WHERE key = ?`, [
      JSON.stringify(lodashedData),
      k,
    ]);
    return [
      ...this.db
        .query(`SELECT * FROM ${this.tablename} WHERE key = ?`, [k])
        .asObjects(),
    ][0];
  }

  /**
   * Get a value from the database
   * @param {string} key The value you want to get.
   * @param {boolean} [default] The default value to get if the original key wasnt found.
   * @returns {any} The value fetched from the database.
   * @async
   * @example
   * let db = new Sqlite("db.sqlite", "userinfo");
   * await db.get("john")
   */
  async get(k: string, def?: string) {
    let data;
    let collection;

    if (k.includes(".")) {
      let array = k.split(".");
      collection = this.collection.get(array[0]);
      let exists = this.collection.has(array[0]);
      array.shift();
      let prop = array.join(".");
      if (!exists) {
        await this.set(k, def || "");
      }
      data = _.get(collection, prop, null);
    } else {
      let exists = this.collection.has(k);
      if (!exists) {
        await this.set(k, def || "");
      }
      data = this.collection.get(k);
    }

    return data;
  }

  /**
   * Alias to the `.get` method.
   * @async
   */
  async fetch(k: string, def?: string) {
    if (def) {
      await this.get(k, def);
      return;
    }
    await this.get(k);
  }

  /**
   * Push a item to a array. If the array does not exist, then it will make a new array!
   * @param {string} key The key to the array in the database.
   * @param {any} value The value to add in the array.
   * @async
   * @returns {any} The new value of the key.
   * @example
   * let db = new DB("db.sqlite", "userinfo");
   * await db.push("john.children", "Suzy");
   */
  async push(k: string, v: any) {
    let fetched = await this.get(k);
    if (!fetched) {
      let array = [];
      array.push(v);
      await this.set(k, array);
    } else {
      if (!Array.isArray(fetched)) {
        let array = [];
        array.push(fetched);
        array.push(v);
        await this.set(k, array);
      } else {
        fetched.push(v);
        await this.set(k, fetched);
      }
    }
    return await this.get(k);
  }

  /**
   * Select all keys from the database!
   * @returns {Map} Map of all data in the database
   * @async
   * @example
   * let db = new DB("db.sqlite", "userinfo");
   * await db.all();
   */
  async all() {
    let fetched = [
      ...this.db.query(`SELECT * FROM ${this.tablename}`).asObjects(),
    ];
    let data = new Map();
    for (const o of fetched) {
      let value = JSON.parse(o.value);
      data.set(o.key, value);
    }
    return data;
  }

  /**
   * Check if the database contains a specific value or not!
   * @param key The value to check.
   * @returns Whether the database has the key or not
   * **param** Key*: string* - Something something
   * ```ts
   * let db = new DB("db.sqlite", "userinfo");
   * await db.has("john");
   * ```
   */
  async has(k: string) {
    if (k.includes(".")) {
      let split = k.split(".");
      let first = split[0];
      let collection = await this.get(first);
      split.shift();
      let prop = split.join(".");
      return _.has(collection, prop);
    }
    return this.collection.has(k);
  }
}
