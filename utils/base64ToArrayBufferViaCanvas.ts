export default async (base64: string): Promise<ArrayBuffer> => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const img = new Image();

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas kontekstini olishda xatolik"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob: Blob | null) => {
        if (!blob) {
          reject(new Error("Blob yaratishda xatolik"));
          return;
        }
        blob.arrayBuffer().then(resolve).catch(reject);
      }, "image/png");
    };

    img.onerror = () => reject(new Error("Rasmni yuklashda xatolik"));
    img.src = base64;
  });
};
