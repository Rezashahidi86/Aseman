import { describe, it, expect, vi, beforeEach } from "vitest";
import setBranchContext from "../middlewares/branchMiddleware.js";
import ROLES from "../constants/roles.js";

describe("Branch isolation", () => {
  let req;
  let res;
  let next;

  const ownBranchId = "507f1f77bcf86cd799439011";
  const anotherBranchId = "507f191e810c19729de860ea";

  beforeEach(() => {
    req = {
      user: {
        role: ROLES.SELLER,
        branch: ownBranchId,
      },
      body: {},
      query: {},
      params: {},
    };

    res = {};
    next = vi.fn();
  });

  it("should reject access to another branch through body", () => {
    req.body.branchId = anotherBranchId;

    setBranchContext(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 }),
    );
    expect(req.branchId).toBeUndefined();
  });

  it("should reject access to another branch through params", () => {
    req.params.id = anotherBranchId;

    setBranchContext(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 }),
    );
    expect(req.branchId).toBeUndefined();
  });

  it("should allow access to the seller's own branch", () => {
    req.params.id = ownBranchId;

    setBranchContext(req, res, next);

    expect(req.branchId).toBe(ownBranchId);
    expect(next).toHaveBeenCalledWith();
  });
});
