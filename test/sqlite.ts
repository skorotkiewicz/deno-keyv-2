import { SqliteProvider } from "../mod.ts";

const db = new SqliteProvider("db.sqlite", "tablename");

// Set an object in the database.
//            Key           Value
db.set("user", { name: "Alex" });
// Data -> 'user': { 'name': 'Alex' }

const gender = "Male";

db.set("user.gender", gender);
// Data -> 'user': { 'name': 'Alex', 'gender': 'male' }

db.set("user.age", 33);
// Data -> 'user': { 'name': 'Alex', 'gender': 'male', 'age': 33}

const age = await db.get("user.age");
console.log(age);
// Output -> 33

await db.push("user.children", "Suzy");
await db.push("user.name", "Johnson");

const all = db.all();
console.log("all:", all);

console.log(await db.has("user.hehe"));
console.log(await db.has("user.name"));

// Getting the data from the database
const data = await db.get("user");
console.log(data);
// Output -> { 'name': 'Alex', 'gender': 'male', 'age': 33}
