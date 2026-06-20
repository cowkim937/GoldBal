import { IMAGE } from './constants.js';

export function processImageFile(file) {
  return new Promise((resolve, reject) => {
    if (file.size > IMAGE.MAX_SIZE) {
      reject(new Error(`파일 크기가 2MB를 초과합니다. (${(file.size / 1024 / 1024).toFixed(1)}MB)`));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > IMAGE.MAX_WIDTH) {
          height = Math.round((height * IMAGE.MAX_WIDTH) / width);
          width = IMAGE.MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('이미지 변환에 실패했습니다.'));
            }
          },
          IMAGE.FORMAT,
          IMAGE.QUALITY
        );
      };
      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'));
    reader.readAsDataURL(file);
  });
}
