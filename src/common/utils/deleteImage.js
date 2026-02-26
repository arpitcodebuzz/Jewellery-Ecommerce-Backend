import fs from "fs";
import path from 'path';
import { URL } from 'url';

export const deleteFileIfFail = (filePath) => {
  if (!filePath) return;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Failed to delete file if service failed:", err.message);
    }
  });
};





export const deleteMediaFile = async (filePath) => {
  try {
    if (!filePath) return;

    let relativePath = filePath;
    console.log("filePath is",filePath);

    // If full URL → extract pathname
    if (filePath.startsWith('http')) {
      const url = new URL(filePath);
      relativePath = url.pathname; // /uploads/collections/filename.png
    }

    // remove leading slash
    relativePath = relativePath.startsWith('/')
      ? relativePath.slice(1)
      : relativePath;

    // 🚨 safety: allow delete only inside uploads
    if (!relativePath.startsWith('uploads/')) {
      return;
    }

    const fullPath = path.join(process.cwd(), 'public', relativePath);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (err) {
    // don't crash API for file system errors
    console.error('File delete failed:', err.message);
  }
};