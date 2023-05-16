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

- [Stable](https://deno.land/x/keyv2)
  ```ts
  import { PostgresProvider } from "https://deno.land/x/keyv2/mod.ts";
  ```
- [Main](https://github.com/skorotkiewicz/deno-keyv-2) (**Main may contain bugs**)
  ```ts
  import { PostgresProvider } from "https://cdn.jsdelivr.net/gh/skorotkiewicz/deno-keyv-2/mod.ts";
  ```

## Examples

### SQLite

```typescript
import { SqliteProvider } from "https://deno.land/x/keyv2/mod.ts";

const db = new SqliteProvider("db.sqlite", "tablename");
```

### PostgreSQL

```typescript
import { PostgresProvider } from "https://deno.land/x/keyv2/mod.ts";

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

If you need help regarding the wrapper, feel free to open a [issue](https://github.com/skorotkiewicz/deno-keyv-2/issues).

## Contributing

Pull Requests are always welcome! :-)

---

Made with ❤ by [Tejas Agarwal](https://github.com/tejasag) and [Sebastian Korotkiewicz](https://github.com/skorotkiewicz)  
MIT License
