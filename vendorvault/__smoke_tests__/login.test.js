import request from "supertest";
import app from "../app";

describe("Smoke Test: Login", () => {
  it("should return 200 for login page", async () => {
    const res = await request(app).get("/auth/login");
    expect(res.statusCode).toBe(200);
  });
});
