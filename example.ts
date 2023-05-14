import { PostgresProvider } from "https://cdn.jsdelivr.net/gh/skorotkiewicz/deno-keyv-2/mod.ts";

const pg = new PostgresProvider(
  "tablename",
  "username",
  "database",
  "hostname",
  "password",
  5432
);

await pg.init();

const addPost = async () => {
  return await db.set(`post_${uniqId}`, {
    post,
    userId,
  });
};

const addComment = async () => {
  return await db.set(`comment_${postId}.${uniqId}`, {
    uniqId,
    comment,
    parentId,
    entrieId,
    userId,
  });
};

const getPostComments = async () => {
  const comments = await db.get(`comment_${entrieId}`);

  const mappedData = Object.entries(comments).map(([key, value]) => ({
    uniqId: value.uniqId,
    comment: value.comment,
  }));

  mappedData.map((row) => {
    console.log(row.comment);
  });
};
