// deno-lint-ignore-file no-explicit-any
import { DB } from "https://deno.land/x/sqlite@v3.7.2/mod.ts";

/**
 * Simple and easy to use key-v Sqlite Provider for deno
 * @param databaseFilePath The filepath for the `.sqlite` file.
 * @param tablename The name of the table for storing data.
 * ```ts
 * const db = new DB("./database.sqlite", "tablename")
 * ```
 */
export class SqliteProvider {
  private db: DB;
  private collection: Map<any, any>;
  private tablename: string;
  constructor(databaseFilePath: string, tablename: string) {
    this.db = new DB(databaseFilePath);
    this.db.query(
      `CREATE TABLE IF NOT EXISTS ${tablename}(id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT, value TEXT)`
    );
    this.tablename = tablename;
    this.collection = new Map();
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
  set(key: string, value: any) {
    let unparsed: any;
    if (key.includes(".")) {
      const split = key.split(".");
      key = split[0];
      split.shift();
      unparsed = split;
    }
    const cachedData = this.collection.get(key) || {};
    let data = Object.assign(cachedData, { [unparsed || key]: value });

    if (unparsed) {
      this.collection.set(key, data);
    } else {
      this.collection.set(key, value);
      data = value;
    }

    let fetchQuery = [
      ...this.db.query(`SELECT * FROM ${this.tablename} WHERE key = ?`, [key]),
      // .asObjects(),
    ];

    if (fetchQuery.length <= 0) {
      this.db.query(
        `INSERT INTO ${this.tablename} (key, value) VALUES (?, ?)`,
        [key, JSON.stringify(data)]
      );

      fetchQuery = [
        ...this.db.query(`SELECT * FROM ${this.tablename} WHERE key = ?`, [
          key,
        ]),
        // .asObjects(),
      ];
    }

    this.db.query(`UPDATE ${this.tablename} SET value = ? WHERE key = ?`, [
      JSON.stringify(data),
      key,
    ]);

    return [
      ...this.db.query(`SELECT * FROM ${this.tablename} WHERE key = ?`, [key]),
      // .asObjects(),
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
  get(key: string, defaultValue?: string) {
    let data;
    let collection;
    if (key.includes(".")) {
      const array = key.split(".");
      collection = this.collection.get(array[0]);
      const exists = this.collection.has(array[0]);
      array.shift();
      const prop = array.join(".");
      if (!exists) {
        this.set(key, defaultValue || "");
      }
      data = collection[prop] != null ? collection[prop] : null;
    } else {
      const exists = this.collection.has(key);
      if (!exists) {
        this.set(key, defaultValue || "");
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
    const fetched = await this.get(key);
    for (let v in value) {
      v = value[v];
      if (!fetched) {
        const array = [];
        array.push(v);
        this.set(key, array);
      } else {
        if (!Array.isArray(fetched)) {
          const array = [];
          array.push(fetched);
          array.push(v);
          this.set(key, array);
        } else {
          fetched.push(v);
          this.set(key, fetched);
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
  all() {
    const fetched = [...this.db.query(`SELECT * FROM ${this.tablename}`)];
    // let fetched = [
    //   ...this.db.query(`SELECT * FROM ${this.tablename}`).asObjects(),
    // ];

    const data = new Map();
    for (const _o of fetched) {
      // let value = JSON.parse(o.value);
      // data.set(o.key, value);
      // TODO
      // console.log(">>>", o[0].value);
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
      const split = key.split(".");
      const first = split[0];
      const collection = await this.get(first);
      split.shift();
      const prop = split.join(".");

      return Object.prototype.hasOwnProperty.call(collection, prop);
    }
    return this.collection.has(key);
  }
}
