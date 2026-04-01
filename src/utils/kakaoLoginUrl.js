/**
 * 카카오 로그인 시작 URL (백엔드 GET /login).
 * VITE_KAKAO_LOGIN_QUERY 는 백엔드가 카카오 인가 URL에 그대로 넘기도록 구현된 경우에만 효과 있음
 * (예: scope, prompt 등 — 카카오 디벨로퍼 동의항목·백엔드와 맞출 것).
 */
export const buildKakaoLoginStartUrl = () => {
  const baseRaw = import.meta.env.VITE_API_URL || "";
  const base = baseRaw.replace(/\/$/, "");
  const pathRaw = import.meta.env.VITE_KAKAO_LOGIN_START_PATH || "/login";
  const path = pathRaw.startsWith("/") ? pathRaw : `/${pathRaw}`;
  const extra = (import.meta.env.VITE_KAKAO_LOGIN_QUERY || "").trim();

  if (!extra) {
    return `${base}${path}`;
  }

  const sep = path.includes("?") ? "&" : "?";
  return `${base}${path}${sep}${extra}`;
};
