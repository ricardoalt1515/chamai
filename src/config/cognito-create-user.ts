import {
  AdminCreateUserCommand,
  type AdminCreateUserCommandInput,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

import outputs from "../../amplify_outputs.json";

type AmplifyAuthOutputs = {
  aws_region?: string;
  user_pool_id?: string;
};

type AmplifyOutputs = {
  auth?: AmplifyAuthOutputs;
};

export type CreateCognitoUserOptions = {
  dryRun: boolean;
  email: string;
  env: "outputs" | "sandbox" | "prod";
  region?: string;
  resend: boolean;
  userPoolId?: string;
  yes: boolean;
};

export type CognitoUserPoolConfig = {
  region: string;
  userPoolId: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALUE_FLAGS = new Set(["--env", "--region", "--user-pool-id"]);
const BOOLEAN_FLAGS = new Set(["--dry-run", "--resend", "--yes"]);

const usage =
  "Usage: bun run auth:create-user user@example.com [--env outputs|sandbox|prod] [--region us-east-1] [--user-pool-id us-east-1_xxxxx] [--resend] [--dry-run] [--yes]";

const parseValueFlag = (
  args: string[],
  index: number,
): { key: string; value: string; skip: number } => {
  const arg = args[index];
  const [key, inlineValue] = arg.split("=", 2);

  if (!VALUE_FLAGS.has(key)) {
    throw new Error(`Unknown option: ${key}. ${usage}`);
  }

  const value = inlineValue ?? args[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${key}. ${usage}`);
  }

  return { key, value, skip: inlineValue ? 0 : 1 };
};

export const parseCreateCognitoUserArgs = (args: string[]): CreateCognitoUserOptions => {
  const dryRun = args.includes("--dry-run");
  const resend = args.includes("--resend");
  const yes = args.includes("--yes");
  let env: CreateCognitoUserOptions["env"] = "outputs";
  let region: string | undefined;
  let userPoolId: string | undefined;
  const positional: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    if (BOOLEAN_FLAGS.has(arg)) {
      continue;
    }

    const { key, value, skip } = parseValueFlag(args, index);
    index += skip;

    if (key === "--env") {
      if (value !== "outputs" && value !== "sandbox" && value !== "prod") {
        throw new Error(`Invalid --env value: ${value}. Expected outputs, sandbox, or prod.`);
      }
      env = value;
    }

    if (key === "--region") {
      region = value;
    }

    if (key === "--user-pool-id") {
      userPoolId = value;
    }
  }

  const [email, extra] = positional;

  if (!email || extra) {
    throw new Error(usage);
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error(`Invalid email address: ${email}`);
  }

  return { dryRun, email: email.toLowerCase(), env, region, resend, userPoolId, yes };
};

export const buildUserPoolArn = ({ region, userPoolId }: CognitoUserPoolConfig): string => {
  const accountId = process.env.AWS_ACCOUNT_ID ?? "<account-id>";
  return `arn:aws:cognito-idp:${region}:${accountId}:userpool/${userPoolId}`;
};

export const getCognitoUserPoolConfig = (
  options: Pick<CreateCognitoUserOptions, "env" | "region" | "userPoolId"> = {
    env: "outputs",
  },
  candidate: AmplifyOutputs = outputs,
  runtimeEnv: Record<string, string | undefined> = process.env,
): CognitoUserPoolConfig => {
  const region =
    options.region ??
    (options.env === "prod" ? runtimeEnv.PROD_AWS_REGION : undefined) ??
    candidate.auth?.aws_region;
  const userPoolId =
    options.userPoolId ??
    (options.env === "prod" ? runtimeEnv.PROD_COGNITO_USER_POOL_ID : undefined) ??
    candidate.auth?.user_pool_id;

  if (!region || !userPoolId) {
    throw new Error(
      [
        "Amplify Auth outputs are missing Cognito user pool configuration.",
        "Run `nvm use && npx ampx sandbox`, deploy Amplify, or pass --region and --user-pool-id.",
        "For prod, set PROD_AWS_REGION and PROD_COGNITO_USER_POOL_ID or pass explicit flags.",
        "Required fields: auth.aws_region, auth.user_pool_id, or explicit CLI/env config.",
      ].join(" "),
    );
  }

  return { region, userPoolId };
};

export const buildAdminCreateUserInput = ({
  email,
  resend,
  userPoolId,
}: CreateCognitoUserOptions &
  Pick<CognitoUserPoolConfig, "userPoolId">): AdminCreateUserCommandInput => ({
  UserPoolId: userPoolId,
  Username: email,
  UserAttributes: [
    { Name: "email", Value: email },
    { Name: "email_verified", Value: "true" },
  ],
  DesiredDeliveryMediums: ["EMAIL"],
  ForceAliasCreation: false,
  ...(resend ? { MessageAction: "RESEND" } : {}),
});

export const describeCreateCognitoUserPlan = (
  options: CreateCognitoUserOptions,
  config: CognitoUserPoolConfig,
): string =>
  [
    `Email: ${options.email}`,
    `Environment: ${options.env}`,
    `Action: ${options.resend ? "resend invitation" : "create invited user"}`,
    `Region: ${config.region}`,
    `User Pool: ${config.userPoolId}`,
    `User Pool ARN: ${buildUserPoolArn(config)}`,
  ].join("\n");

export const createCognitoUser = async (
  options: CreateCognitoUserOptions,
  config: CognitoUserPoolConfig = getCognitoUserPoolConfig(options),
): Promise<void> => {
  const client = new CognitoIdentityProviderClient({ region: config.region });
  const input = buildAdminCreateUserInput({
    ...options,
    userPoolId: config.userPoolId,
  });

  await client.send(new AdminCreateUserCommand(input));
};

if (import.meta.main) {
  const options = parseCreateCognitoUserArgs(process.argv.slice(2));
  const config = getCognitoUserPoolConfig(options);

  console.info(describeCreateCognitoUserPlan(options, config));

  if (options.dryRun) {
    console.info("Dry run only. No Cognito user was created or modified.");
    process.exit(0);
  }

  if (!options.yes) {
    throw new Error(
      "Refusing to create or modify a Cognito user without --yes. Re-run with --yes after confirming the target User Pool.",
    );
  }

  await createCognitoUser(options, config);

  console.info(
    options.resend
      ? `Resent Cognito invitation to ${options.email}.`
      : `Created Cognito user ${options.email} and sent the invitation email.`,
  );
}
