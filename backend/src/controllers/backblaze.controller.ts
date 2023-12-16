import { IGetUserAuthInfoRequest } from '../utils/typesAndInterfaces';
import bigPromise from '../middlewares/bigPromise';
import BackBlazeB2 from '../utils/backblaze';

const b2 = BackBlazeB2.getInstance(
  process.env.B2_KEY_ID || '',
  process.env.B2_APP_KEY || '',
  process.env.B2_BUCKET_ID || ''
);
export const getUploadUrl = bigPromise(
  async (req: IGetUserAuthInfoRequest, res) => {
    const data = await b2.getUploadUrl();

    return res.status(200).json({
      success: true,
      ...data,
    });
  }
);
export const getFileDownloadUrl = bigPromise(
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const { fileName, validDurationInSeconds = 3600 } = req.query;
      const url = await b2.getAuthorizedDownloadUrl(
        fileName as string, // Assuming fileName is a string
        parseInt(validDurationInSeconds as string, 10)
      );

      // Redirect the user to the authorized URL
      return res.redirect(url);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return res.status(500).json({
        success: false,
        message: 'An error occurred while generating the download URL.',
        error: errorMessage,
      });
    }
  }
);

export const deleteFile = async (fileId: string, fileName: string) =>
  b2.deleteFile(fileId, fileName);
