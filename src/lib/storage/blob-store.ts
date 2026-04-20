export type PutBlobInput = {
  bytes: Buffer;
  filename: string;
  mediaType: string;
  threadId: string;
};

export type PutBlobResult = {
  key: string;
  url: string;
  sizeBytes: number;
};

export interface BlobStore {
  put(input: PutBlobInput): Promise<PutBlobResult>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
