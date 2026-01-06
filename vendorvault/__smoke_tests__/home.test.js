import request from "supertest";
import app from "../app";

describe("Smoke Test: Homepage", () => {
  it("should load homepage and return 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});
