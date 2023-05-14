import { Collection, DB } from "../deps.ts";

/**
 * Simple and easy to use key-v Sqlite Provider for deno
 * @param databaseFilePath The filepath for the `.sqlite` file.
 * @param tablename The name of the table for storing data.
 * ```ts
 * const db = new DB("./database.sqlite", "userinfo")
 * ```
 */
export class SqliteProvider {
  private db: DB;
  private collection: Collection;
  private tablename: string;
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
   * ```ts
   * db.init();
   * ```
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
    // let lodashedData = _.set(cachedData, unparsed || key, value);
    let data = Object.assign(cachedData, { [unparsed || key]: value });

    if (unparsed) {
      this.collection.set(key, data);
    } else {
      this.collection.set(key, value);
      data = value;
    }
    let fetchQuery = [
      ...this.db
        .query(`SELECT * FROM ${this.tablename} WHERE key = ?`, [key])
        .asObjects(),
    ];
    if (fetchQuery.length <= 0) {
      this.db.query(
        `INSERT INTO ${this.tablename} (key, value) VALUES (?, ?)`,
        [key, JSON.stringify(data)]
      );
      fetchQuery = [
        ...this.db
          .query(`SELECT * FROM ${this.tablename} WHERE key = ?`, [key])
          .asObjects(),
      ];
    }
    this.db.query(`UPDATE ${this.tablename} SET value = ? WHERE key = ?`, [
      JSON.stringify(data),
      key,
    ]);
    return [
      ...this.db
        .query(`SELECT * FROM ${this.tablename} WHERE key = ?`, [key])
        .asObjects(),
    ][0];
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
      array.shift();
      let prop = array.join(".");
      if (!exists) {
        await this.set(key, defaultValue || "");
      }
      //   data = _.get(collection, prop, null);
      data = collection[prop] != null ? collection[prop] : null;
    } else {
      let exists = this.collection.has(key);
      if (!exists) {
        await this.set(key, defaultValue || "");
      }
      data = this.collection.get(key);
    }
    return data;
  }

  /**
   * Alias to the `.get` method.
   */
  async fetch(key: string, defaultValue?: string) {
    if (defaultValue) {
      await this.get(key, defaultValue);
      return;
    }
    await this.get(key);
  }

  /**
   * Push a item to a array. If the array does not exist, then it will make a new array!
   * @param key The key to the array in the database.
   * @param value The value to add in the array.
   * @returns The updated value of the key
   * ```ts
   * await db.push("john.children", "Suzy");
   * ```
   */
  async push(key: string, ...value: any[]) {
    let fetched = await this.get(key);
    for (let v in value) {
      v = value[v];
      if (!fetched) {
        let array = [];
        array.push(v);
        await this.set(key, array);
      } else {
        if (!Array.isArray(fetched)) {
          let array = [];
          array.push(fetched);
          array.push(v);
          await this.set(key, array);
        } else {
          fetched.push(v);
          await this.set(key, fetched);
        }
      }
    }
    return await this.get(key);
  }

  /**
   * Select all keys from the database!
   * @returns All the data in the database
   * ```ts
   * const all = await db.all();
   * ```
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
      //   return _.has(collection, prop);
      return Object.prototype.hasOwnProperty.call(collection, prop);
    }
    return this.collection.has(key);
  }
}
