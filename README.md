<img align="right" src="banner.png" height="300" />

# Deno-Keyv-2

Keyv is a simple and lightweight, easy to use database wrapper made for the Javascript runtime envoirement, [Deno](https://deno.land/). The wrapper is designed for quick setup and fast results.

## Why Keyv?

- Simple and easy to use.
- Very fast results
- Data doesnt disappear after restarts
- Beginner Friendly
- Supports dot notation.
  _And much more!_

## Usage

- [Stable](https://deno.land/x/keyv) `import { DB } from "https://deno.land/x/mod.ts";`

## Examples

```typescript
// ================USE THE FOLLOWING FOR SQLITE=======================
import { DB } from "https://deno.land/x/keyv/mod.ts";

// Need to make a new file called `db.sqlite` in your folder.
// The second value is the name of the database.. You can name is anything you want
const db = new DB("db.sqlite", "userinfo");

// Important line to write before doing any operations!
db.init();

// ================USE THE FOLLOWING FOR PostgreSQL=======================
import { PostgresProvider } from "https://deno.land/x/keyv/mod.ts";

const db = new PostgresProvider(
  "tablename",
  "username",
  "database",
  "hostname",
  "password"
);
await db.init();

// Set an object in the database.
//            Key           Value
await db.set("user", { name: "Alex" });
// Data -> 'user': { 'name': 'Alex' }

await db.set("user.gender", "male");
// Data -> 'user': { 'name': 'Alex', 'gender': 'male' }

await db.set("user.age", 33);
// Data -> 'user': { 'name': 'Alex', 'gender': 'male', 'age': 33}

await pg.set("user.children", ["Klaudia", "Ada"]);
// Data -> 'user': {"name":"Alex","gender":"male","age":33,"children":["Klaudia","Ada"]}

// Remove value from key
await db.set("user.name", null);
// Output -> { 'gender': 'male', 'age': 33}

// Getting the data from the database
await db.get("user");
// Output -> { 'name': 'Alex', 'gender': 'male', 'age': 33}

await db.get("user.age");
// Output -> 33

// Remove `user` key
await db.delete("user");
// Output -> `null`

console.log(await pg.all());
// Data -> {
//   user: { name: "Alex" },
//   info: { name: "Alex", gender: "male", age: 33, children: [ "Klaudia", "Ada" ] }
// }
```

## Support

If you need help regarding the wrapper, feel free to open a [issue](https://github.com/skorotkiewicz/deno-keyv/issues).

## Contributing

Pull Requests are always welcome. Just make sure to open a issue and inform us what you are working so that we can confirm if we want it in the repository or not.

- We use [deno fmt](https://deno.land/manual/tools/formatter) for formatting our files. We recommend you use it too if you wish to contribute.
- Please do not add any more third party modules to the library without confirming with us first.

---

Made with ❤ by [Tejas Agarwal](https://github.com/tejasag)
MIT License. Copyright 2021 All rights reserved.
