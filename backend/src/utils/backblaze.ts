/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-use-before-define */
/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
import axios from 'axios';

import { callWithRetry } from './methods';

class BackblazeB2Client {
  private apiUrl: string;

  private authorizationToken: string | null = null;

  private downloadUrl: string | null = null;

  private authorizationExpiration: Date | null = null;

  private uploadUrl: string | null = null;

  private uploadAuthorizationToken: string | null = null;

  private uploadUrlExpiration: Date | null = null;

  private bucketName: string | null = null;

  private accountId: string | null = null;

  private downloadAuthorizationTokens: Map<
    string,
    { token: string; expiration: Date }
  > = new Map();

  private static instance: BackblazeB2Client | null = null;

  private constructor(
    private keyId: string,
    private applicationKey: string,
    private buckedId: string,
    private retries: number = 3,
    private retryDelay: number = 1000
  ) {
    this.apiUrl = 'https://api.backblazeb2.com/b2api/v2';
  }

  static getInstance(
    keyId: string,
    applicationKey: string,
    buckedId: string,
    retries?: number,
    retryDelay?: number
  ): BackblazeB2Client {
    if (!this.instance) {
      this.instance = new BackblazeB2Client(
        keyId,
        applicationKey,
        buckedId,
        retries,
        retryDelay
      );
    }
    return this.instance;
  }

  private async authorize(): Promise<void> {
    if (
      this.authorizationExpiration &&
      new Date() < this.authorizationExpiration
    ) {
      return;
    }

    const headers = {
      Authorization: `Basic ${Buffer.from(
        `${this.keyId}:${this.applicationKey}`
      ).toString('base64')}`,
    };

    const response = await axios.get(`${this.apiUrl}/b2_authorize_account`, {
      headers,
    });
    this.apiUrl = `${response.data.apiUrl}/b2api/v2`;
    this.authorizationToken = response.data.authorizationToken;
    this.downloadUrl = response.data.downloadUrl;
    this.accountId = response.data.accountId;
    this.authorizationExpiration = new Date(
      Date.now() + 24 * 60 * 60 * 1000 - 60000
    );
    // Clear the cache of download authorization tokens
    this.downloadAuthorizationTokens.clear();

    if (this.authorizationToken && !this.bucketName) {
      const responseBuckeName = await callWithRetry(
        async () =>
          axios.post(
            `${this.apiUrl}/b2_list_buckets`,
            { accountId: this.accountId, bucketId: this.buckedId },
            {
              headers: {
                Authorization: this.authorizationToken,
              },
            }
          ),
        this.retries,
        this.retryDelay
      );

      const { buckets } = responseBuckeName.data;
      const bucketInfo = buckets.find(
        (bucket: any) => bucket.bucketId === this.buckedId
      );
      if (bucketInfo) {
        this.bucketName = bucketInfo.bucketName;
      } else {
        throw new Error('Bucket ID not found.');
      }
    }
  }

  public async getUploadUrl(): Promise<{
    uploadUrl: string;
    uploadAuthorizationToken: string;
  }> {
    await this.authorize(); // Make sure we are authorized

    if (!this.authorizationToken) {
      throw new Error('Authorization token is not available.');
    }

    // Check if we already have a valid upload URL and token
    if (
      this.uploadUrl &&
      this.uploadAuthorizationToken &&
      this.uploadUrlExpiration &&
      new Date() < this.uploadUrlExpiration
    ) {
      return {
        uploadUrl: this.uploadUrl,
        uploadAuthorizationToken: this.uploadAuthorizationToken,
      };
    }

    // Otherwise, fetch a new upload URL and token
    const response = await callWithRetry(
      async () =>
        axios.post(
          `${this.apiUrl}/b2_get_upload_url`,
          {
            bucketId: this.buckedId,
          },
          {
            headers: {
              Authorization: this.authorizationToken,
            },
          }
        ),
      this.retries,
      this.retryDelay
    );

    this.uploadUrl = response.data.uploadUrl;
    this.uploadAuthorizationToken = response.data.authorizationToken;
    this.uploadUrlExpiration = new Date(
      Date.now() + 24 * 60 * 60 * 1000 - 60000
    ); // Expires in almost 24 hours
    if (!this.uploadUrl || !this.uploadAuthorizationToken) {
      throw new Error('Upload URL or authorization token is not available.');
    }
    return {
      uploadUrl: this.uploadUrl,
      uploadAuthorizationToken: this.uploadAuthorizationToken,
    };
  }

  private async getDownloadAuthorization(
    fileNamePrefix: string,
    validDurationInSeconds: number = 3600 // Default to 1 hour
  ): Promise<string> {
    await this.authorize(); // Make sure we are authorized

    if (!this.authorizationToken) {
      throw new Error('Authorization token is not available.');
    }

    const cachedTokenInfo =
      this.downloadAuthorizationTokens.get(fileNamePrefix);

    // Check if we have a valid cached download authorization token for the filename
    if (cachedTokenInfo && new Date() < cachedTokenInfo.expiration) {
      return cachedTokenInfo.token;
    }

    // Otherwise fetch a new download authorization token
    const response = await callWithRetry(
      async () =>
        axios.post(
          `${this.apiUrl}/b2_get_download_authorization`,
          {
            bucketId: this.buckedId,
            fileNamePrefix,
            validDurationInSeconds,
          },
          {
            headers: {
              Authorization: this.authorizationToken,
            },
          }
        ),
      this.retries,
      this.retryDelay
    );

    const downloadAuthorizationToken = response.data.authorizationToken;

    // Cache the new download authorization token and its expiration time
    this.downloadAuthorizationTokens.set(fileNamePrefix, {
      token: downloadAuthorizationToken,
      expiration: new Date(Date.now() + validDurationInSeconds * 1000),
    });

    return downloadAuthorizationToken;
  }

  public async getAuthorizedDownloadUrl(
    fileName: string,
    validDurationInSeconds: number = 3600 // Default to 1 hour
  ): Promise<string> {
    const downloadAuthorizationToken = await this.getDownloadAuthorization(
      fileName,
      validDurationInSeconds
    );

    if (!this.downloadUrl || !this.bucketName) {
      throw new Error('Download URL or bucket name is not available.');
    }

    // Construct the authorized download URL
    const authorizedDownloadUrl = `${this.downloadUrl}/file/${this.bucketName}/${fileName}?Authorization=${downloadAuthorizationToken}`;

    return authorizedDownloadUrl;
  }

  public async deleteFile(fileId: string, fileName: string): Promise<void> {
    await this.authorize(); // Make sure we are authorized

    if (!this.authorizationToken) {
      throw new Error('Authorization token is not available.');
    }

    const response = await callWithRetry(
      async () =>
        axios.post(
          `${this.apiUrl}/b2_delete_file_version`,
          {
            fileId,
            fileName,
          },
          {
            headers: {
              Authorization: this.authorizationToken,
            },
          }
        ),
      this.retries,
      this.retryDelay
    );

    if (response.status !== 200) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    // Remove cached download authorization token for the deleted file
    this.downloadAuthorizationTokens.delete(fileName);
  }
}

export = BackblazeB2Client;
