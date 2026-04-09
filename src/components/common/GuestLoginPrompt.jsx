import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import { useUser } from "../../context/UserContext";
import { buildSignInState } from "../../utils/authStorage";

/**
 * 비로그인 사용자 유도 모달 — 홈으로 가기 / 로그인
 * @param {number} [reopenSignal] 부모가 1씩 올리면 모달을 다시 연다(닫은 뒤 글쓰기 등).
 * @param {boolean} [showOnLoadWhenGuest=true] false면 첫 진입 시 자동으로 띄우지 않음(피드: 글쓰기 시에만 reopenSignal로 표시).
 */
const GuestLoginPrompt = ({
  afterLoginPath,
  reopenSignal = 0,
  showOnLoadWhenGuest = true,
}) => {
  const { isLoggedIn, isInitializing } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isInitializing) return;
    if (isLoggedIn) {
      setOpen(false);
      return;
    }
    if (showOnLoadWhenGuest) {
      setOpen(true);
    }
  }, [isInitializing, isLoggedIn, showOnLoadWhenGuest]);

  useEffect(() => {
    if (reopenSignal > 0 && !isLoggedIn && !isInitializing) {
      setOpen(true);
    }
  }, [reopenSignal, isLoggedIn, isInitializing]);

  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  return (
    <Modal
      isOpen={open && !isLoggedIn}
      onClose={() => setOpen(false)}
      title="로그인 이후 이용해주세요"
      description="더 많은 기능을 이용할 수 있어요!"
      cancelLabel="홈으로 가기"
      confirmLabel="로그인"
      onCancel={() => {
        setOpen(false);
        navigate("/main", { replace: true });
      }}
      onConfirm={() => {
        setOpen(false);
        navigate("/signin", {
          state: buildSignInState(afterLoginPath, currentPath),
        });
      }}
      variant="login"
    />
  );
};

export default GuestLoginPrompt;
