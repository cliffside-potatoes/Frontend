/**
 * S3 presignedUrl로 직접 업로드
 * PUT presignedUrl
 */
export const uploadFileToS3 = async ({ presignedUrl, file }) => {
  try {
    const res = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!res.ok) {
      throw new Error(`S3 업로드 실패 (${res.status})`);
    }

    return true;
  } catch (error) {
    console.error('uploadFileToS3 실패:', error);
    throw error;
  }
};

export default {
  uploadFileToS3,
};