import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/productValidators.js";
import Product from "../models/Product.js";

describe("Product validators", () => {
  const validProduct = {
    name: "Test Product",
    barcode: "123456789",
    purchasePrice: 100,
    salePrice: 150,
    quantity: 10,
    minimumStock: 3,
  };

  it("should accept valid product data", () => {
    expect(createProductSchema.safeParse(validProduct).success).toBe(true);
  });

  it("should reject duplicate-field format violations only through the database", () => {
    expect(createProductSchema.safeParse(validProduct).success).toBe(true);
  });

  it.each([
    ["purchasePrice", -1],
    ["salePrice", -1],
    ["quantity", -1],
    ["minimumStock", -1],
  ])("should reject negative %s on create", (field, value) => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      [field]: value,
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ["purchasePrice", -1],
    ["salePrice", -1],
    ["quantity", -1],
    ["minimumStock", -1],
  ])("should reject negative %s on update", (field, value) => {
    const result = updateProductSchema.safeParse({
      [field]: value,
    });

    expect(result.success).toBe(false);
  });

  it("should reject fractional quantity", () => {
    expect(
      createProductSchema.safeParse({
        ...validProduct,
        quantity: 1.5,
      }).success,
    ).toBe(false);
  });

  it("should reject fractional minimumStock", () => {
    expect(
      createProductSchema.safeParse({
        ...validProduct,
        minimumStock: 1.5,
      }).success,
    ).toBe(false);
  });

  it("should reject empty update data", () => {
    expect(updateProductSchema.safeParse({}).success).toBe(false);
  });
});
