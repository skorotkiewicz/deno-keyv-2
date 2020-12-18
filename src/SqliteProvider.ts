import { Collection, DB } from "../deps.ts";
import { ld as _ } from "https://deno.land/x/deno_lodash/mod.ts";

/**
 * Simple and easy to use key-v Sqlite Provider for deno
 * @param databaseFilePath The filepath for the `.sqlite` file.
 * @param tablename The name of the table for storing data.
 */
export class KeyvSqliteProvider {
  db: DB;
  collection: Collection;
  tablename: string;

  constructor(databaseFilePath: string, tablename: string) {
    this.db = new DB(databaseFilePath);
    this.db.query(
      `CREATE TABLE IF NOT EXISTS ${tablename}(id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT, value TEXT)`,
    );
    this.tablename = tablename;
    this.collection = new Collection();
  }

  async init() {
    const all = [
      ...this.db.query(`SELECT * FROM ${this.tablename}`).asObjects(),
    ];
    for (const row of all) {
      this.collection.set(row.key, row.value);
    }
  }

  /**
   * Set a value to the database
   * @param k The key to the value
   * @param value The value
   * @return The updated value in the database.
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
      ...this.db.query(
        `SELECT * FROM ${this.tablename} WHERE key = ?`,
        [k],
      ).asObjects(),
    ];
    if (fetchQuery.length <= 0) {
      this.db.query(
        `INSERT INTO ${this.tablename} (key, value) VALUES (?, ?)`,
        [k, JSON.stringify(lodashedData)],
      );
      fetchQuery = [
        ...this.db.query(
          `SELECT * FROM ${this.tablename} WHERE key = ?`,
          [k],
        ).asObjects(),
      ];
    }
    this.db.query(
      `UPDATE ${this.tablename} SET value = ? WHERE key = ?`,
      [JSON.stringify(lodashedData), k],
    );
    return [
      ...this.db.query(`SELECT * FROM ${this.tablename} WHERE key = ?`, [k])
        .asObjects(),
    ][0];
  }

  /**
   * Get a value from the database
   * @param k The value you want to get.
   * @param def The default value to get if the original key wasnt found.
   * @return The value fetched from the database.
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
      data = _.get(collection, prop, "owo");
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
   */
  async fetch(k: string, def?: string) {
    if (def) {
      await this.get(k, def);
      return;
    }
    await this.get(k);
  }
}
