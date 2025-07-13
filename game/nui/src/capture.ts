import { createGameView } from '@screencapture/gameview';

type Encoding = 'webp' | 'jpg' | 'png';

type CaptureRequest = {
  action: 'capture';
  url: string;
  encoding: Encoding;
  quality: number;
  headers: Headers;
  uploadToken: string;
  serverEndpoint: string;
  formField: string;
  dataType: 'blob' | 'base64';
};

export class Capture {
  #gameView: any;
  #canvas: HTMLCanvasElement | null = null;

  start() {
    window.addEventListener('message', async (event) => {
      const data = event.data as CaptureRequest;

      if (data.action === 'capture') {
        await this.captureScreen(data);
      }
    });

    window.addEventListener('resize', () => {
      if (this.#gameView) {
        this.#gameView.resize(window.innerWidth, window.innerHeight);
      }
    });
  }

  async captureScreen(request: CaptureRequest) {
    this.#canvas = document.createElement('canvas');
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;

    this.#gameView = createGameView(this.#canvas);

    const enc = request.encoding ?? 'png';
    let imageData: string | Blob;
    if (request.serverEndpoint || !request.formField) {
      // make sure we don't care about serverEndpoint, only the dataType
      imageData = await this.createBlob(this.#canvas, enc);
    } else {
      imageData = await this.createBlob(this.#canvas, enc);
    }

    if (!imageData) return console.error('No image available');
    console.log('Image data:', imageData);
    console.log("image size:", imageData.size);

    await this.httpUploadImage(request, imageData);
    this.#canvas.remove();
  }

  async httpUploadImage(request: CaptureRequest, imageData: string | Blob) {
    const reqBody = this.createRequestBody(request, imageData);

    if (request.serverEndpoint) {
      try {
        await fetch(request.serverEndpoint, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'X-ScreenCapture-Token': request.uploadToken,
          },
          body: reqBody,
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  createRequestBody(request: CaptureRequest, imageData: string | Blob): BodyInit {
    if (imageData instanceof Blob) {
      const formData = new FormData();
      formData.append(request.formField ?? 'file', imageData);

      return formData;
    }

    // dataType is just here in order to know what to do with the data when we get it back
    return JSON.stringify({ imageData: imageData, dataType: request.dataType });
  }

  createDataURL(canvas: HTMLCanvasElement): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = canvas.toDataURL('image/webp', 0.7);
      if (!url) {
        reject('No data URL available');
      }

      resolve(url);
    });
  }

  createBlob(canvas: HTMLCanvasElement, enc: Encoding): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject('No blob available');
          }
        },
        `image/${enc}`,
        0.7,
      );
    });
  }
}
