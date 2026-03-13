export const uploadFileToS3 = async (presignedUrl, file) => {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`S3 업로드 실패 (${res.status})`);
  }

  return true;
};

export default {
  uploadFileToS3,
};