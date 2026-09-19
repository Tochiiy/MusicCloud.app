import { fileTypeFromBuffer } from 'file-type';

export const getFileType = async (buffer: Buffer) => {
  const type = await fileTypeFromBuffer(buffer);
  return {
    mime: type?.mime ?? 'application/octet-stream',
    ext: type?.ext ?? 'bin',
  };
};