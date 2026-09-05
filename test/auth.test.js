const request = require("supertest");

const server = require("../API/server.js");
const db = require("../data/dbConfig.js");

beforeAll(async () => {
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

beforeEach(async () => {
  await db("users").del();
});

describe("POST /api/auth/register", () => {
  it("creates a user and returns a token without leaking the hash", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "alice", password: "s3cret!" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user).toEqual({ id: expect.any(Number), username: "alice" });
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("rejects a missing password", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "alice" });

    expect(res.status).toBe(400);
  });

  it("rejects a duplicate username", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "bob", password: "pw123456" });

    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "bob", password: "pw123456" });

    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "carol", password: "pw123456" });

    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "carol", password: "pw123456" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf("string");
  });

  it("rejects a wrong password", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "dave", password: "pw123456" });

    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "dave", password: "wrong" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/users (restricted)", () => {
  it("401s without a token", async () => {
    const res = await request(server).get("/api/users");
    expect(res.status).toBe(401);
  });

  it("401s with a bad token", async () => {
    const res = await request(server)
      .get("/api/users")
      .set("Authorization", "Bearer not.a.jwt");
    expect(res.status).toBe(401);
  });

  it("returns users (no password) with a valid Bearer token", async () => {
    const reg = await request(server)
      .post("/api/auth/register")
      .send({ username: "erin", password: "pw123456" });

    const res = await request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${reg.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).not.toHaveProperty("password");
  });

  it("also accepts a raw token without the Bearer prefix", async () => {
    const reg = await request(server)
      .post("/api/auth/register")
      .send({ username: "frank", password: "pw123456" });

    const res = await request(server)
      .get("/api/users")
      .set("Authorization", reg.body.token);

    expect(res.status).toBe(200);
  });
});
