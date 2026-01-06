import request from "supertest";
import app from "../app";

describe("Smoke Test: Health Endpoint", () => {
  it("should return 200 OK and status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
