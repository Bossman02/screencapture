export type RequestScreenshotUploadCB = (response: unknown) => void;

type Encoding = 'webp' | 'jpg' | 'png';

export type CaptureRequest = {
  action: 'capture';
  url: string;
  correlationId?: string;
  encoding: Encoding;
  quality: number;
  headers: Headers;
  uploadToken: string;
  serverEndpoint: string;
  // only used for screenshot-basic requestScreenshot export
  callbackUrl?: string;
  filename: string;
  formField: string;
  maxWidth?: number;
  maxHeight?: number;
  dataType: 'blob' | 'base64';
};

export type RequestUploadToken = {
  url: string;
  encoding: Encoding;
  quality: number;
  headers: Headers;
  correlationId: string;
};

export interface ScreenshotCreatedBody {
  id: string;
  data: string;
}