## Deno Keyv

Keyv is a simple and lightweight, easy to use database wrapper made for the Javascript runtime envoirement, [Deno](https://deno.land/). The wrapper is designed for quick setup and fast results.

## Why Keyv?

- Simple and easy to use.
- Very fast results
- Data doesnt disappear after restarts
- Beginner Friendly
- Supports dot notation.
  _And much more!_

## Examples

```typescript
import { DB } from "https://deno.land/x/keyv/mod.ts";

// Need to make a new file called `db.sqlite` in your folder.
// The second value is the name of the database.. You can name is anything you want
const db = new DB("db.sqlite", "userinfo");

// Important line to write before doing any operations!
await db.init();

// Set an object in the database.
//            Key           Value
await db.set("user", { name: "Alex" });
// Data -> 'user': { 'name': 'Alex' }

await db.set("user.gender", "male");
// Data -> 'user': { 'name': 'Alex', 'gender': 'male' }

await db.set("user.age", 33);
// Data -> 'user': { 'name': 'Alex', 'gender': 'male', 'age': 33}

// Getting the data from the database
const data = await db.get("user");
console.log(data);
// Output -> { 'name': 'Alex', 'gender': 'male', 'age': 33}

const age = await db.get("user.age");
console.log(age);
// Output -> 33
```

## Contributing

Pull Requests are always welcome. Just make sure to open a issue and inform us what you are working so that we can confirm if we want it in the repository or not.

- We use [deno fmt](https://deno.land/manual/tools/formatter) for formatting our files. We recommend you use it too if you wish to contribute.
- Please do not add any more third party modules to the library without confirming with us first.

## Docs

soon™

## Support

If you need help regarding the wrapper, feel free to open a [issue](https://github.com/CyberKnight007/deno-keyv/issues) or ask in the [Help discussions category](https://github.com/CyberKnight007/deno-keyv/discussions/categories/help) on github. You can also DM me on discord `Tejas#9134`.

## Do you want to make discord bots in deno?

Why not check out [Harmony](https://github.com/harmony-org/harmony)!

- Lightweight and easy to use.
- Built-in Command Framework,
  - Easily build Commands on the fly.
  - Completely Customizable.
  - Complete Object-Oriented approach.
- 100% Discord API Coverage.
- Customizable caching.
  - Built in support for Redis.
  - Write Custom Cache Adapters.
- Complete TypeScript support.

---

Made with ❤ by [Tejas Agarwal](https://github.com/CyberKnight007) <br/>
MIT License. Copyright 2020  All rights reserved.
