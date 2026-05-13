import { describe, expect, it } from "vitest";

import {
  buildAdminCreateUserInput,
  describeCreateCognitoUserPlan,
  getCognitoUserPoolConfig,
  parseCreateCognitoUserArgs,
} from "./cognito-create-user";

describe("parseCreateCognitoUserArgs", () => {
  it("requires exactly one valid email", () => {
    expect(() => parseCreateCognitoUserArgs([])).toThrow(/Usage/);
    expect(() => parseCreateCognitoUserArgs(["not-an-email"])).toThrow(/Invalid email/);
    expect(() => parseCreateCognitoUserArgs(["a@example.com", "b@example.com"])).toThrow(/Usage/);
  });

  it("normalizes email and supports resend", () => {
    expect(parseCreateCognitoUserArgs(["User@Example.COM", "--resend"])).toEqual({
      dryRun: false,
      email: "user@example.com",
      env: "outputs",
      region: undefined,
      resend: true,
      userPoolId: undefined,
      yes: false,
    });
  });

  it("supports dry-run and explicit confirmation", () => {
    expect(parseCreateCognitoUserArgs(["user@example.com", "--dry-run", "--yes"])).toEqual({
      dryRun: true,
      email: "user@example.com",
      env: "outputs",
      region: undefined,
      resend: false,
      userPoolId: undefined,
      yes: true,
    });
  });

  it("supports explicit production target flags", () => {
    expect(
      parseCreateCognitoUserArgs([
        "user@example.com",
        "--env",
        "prod",
        "--region=us-east-1",
        "--user-pool-id",
        "us-east-1_prod",
      ]),
    ).toEqual({
      dryRun: false,
      email: "user@example.com",
      env: "prod",
      region: "us-east-1",
      resend: false,
      userPoolId: "us-east-1_prod",
      yes: false,
    });
  });

  it("rejects unknown flags", () => {
    expect(() => parseCreateCognitoUserArgs(["user@example.com", "--silent"])).toThrow(
      /Unknown option/,
    );
  });
});

describe("describeCreateCognitoUserPlan", () => {
  it("prints the target environment before mutating Cognito", () => {
    expect(
      describeCreateCognitoUserPlan(
        { env: "outputs", dryRun: false, email: "user@example.com", resend: false, yes: true },
        { region: "us-east-1", userPoolId: "pool-id" },
      ),
    ).toContain("User Pool: pool-id");
  });
});

describe("getCognitoUserPoolConfig", () => {
  it("extracts region and user pool id from Amplify outputs", () => {
    expect(
      getCognitoUserPoolConfig(
        {
          env: "outputs",
        },
        {
          auth: {
            aws_region: "us-east-1",
            user_pool_id: "us-east-1_example",
          },
        },
      ),
    ).toEqual({ region: "us-east-1", userPoolId: "us-east-1_example" });
  });

  it("uses explicit CLI config before Amplify outputs", () => {
    expect(
      getCognitoUserPoolConfig(
        { env: "prod", region: "us-east-2", userPoolId: "us-east-2_prod" },
        {
          auth: {
            aws_region: "us-east-1",
            user_pool_id: "us-east-1_sandbox",
          },
        },
      ),
    ).toEqual({ region: "us-east-2", userPoolId: "us-east-2_prod" });
  });

  it("can read production config from environment variables", () => {
    expect(
      getCognitoUserPoolConfig(
        { env: "prod" },
        {},
        { PROD_AWS_REGION: "us-east-1", PROD_COGNITO_USER_POOL_ID: "us-east-1_prod" },
      ),
    ).toEqual({ region: "us-east-1", userPoolId: "us-east-1_prod" });
  });

  it("throws a clear error when Auth outputs are missing", () => {
    expect(() =>
      getCognitoUserPoolConfig({ env: "outputs" }, { auth: { aws_region: "us-east-1" } }),
    ).toThrow(/explicit CLI\/env config/);
  });
});

describe("buildAdminCreateUserInput", () => {
  it("builds a safe admin-created user invitation request", () => {
    expect(
      buildAdminCreateUserInput({
        dryRun: false,
        email: "user@example.com",
        env: "outputs",
        resend: false,
        userPoolId: "pool-id",
        yes: true,
      }),
    ).toEqual({
      UserPoolId: "pool-id",
      Username: "user@example.com",
      UserAttributes: [
        { Name: "email", Value: "user@example.com" },
        { Name: "email_verified", Value: "true" },
      ],
      DesiredDeliveryMediums: ["EMAIL"],
      ForceAliasCreation: false,
    });
  });

  it("sets MessageAction only for resend", () => {
    expect(
      buildAdminCreateUserInput({
        dryRun: false,
        email: "user@example.com",
        env: "outputs",
        resend: true,
        userPoolId: "pool-id",
        yes: true,
      }),
    ).toMatchObject({ MessageAction: "RESEND" });
  });
});
