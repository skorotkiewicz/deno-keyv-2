import { PostgresProvider } from "../src/PostgresProvider.ts";

const pg = new PostgresProvider(
  "tablename",
  "postgres",
  "denokeyv",
  "localhost",
  "password",
  5432
);

await pg.init();
await pg.set("info", { name: "Alex" });
await pg.set("info.age", 33);

console.log(await pg.get("info"));
console.log(await pg.get("info.name"));

console.log(await pg.all());

console.log(await pg.has("info.hehe"));
console.log(await pg.has("info.name"));
