const S3_BASE_URL = 'https://naenggu-file.s3.ap-northeast-2.amazonaws.com/';

export const toImageUrl = (value) => {
  if (!value) return '';

  // 이미 완전한 URL이면 그대로 사용
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) {
    return value;
  }

  // s3Key면 base URL 붙이기
  return `${S3_BASE_URL}${value}`;
};

export default {
  toImageUrl,
};