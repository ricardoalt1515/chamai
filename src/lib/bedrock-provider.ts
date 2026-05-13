import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";

export const createBedrockProvider = () =>
  createAmazonBedrock({
    region: process.env.AWS_REGION || "us-east-1",
    credentialProvider: fromNodeProviderChain(),
  });

export const bedrockProvider = createBedrockProvider();
