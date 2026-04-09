import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import { useUser } from "../../context/UserContext";
import { buildSignInState } from "../../utils/authStorage";

/**
 * 비로그인 사용자 유도 모달 — 홈으로 가기 / 로그인
 */
const GuestLoginPrompt = ({ afterLoginPath }) => {
  const { isLoggedIn, isInitializing } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isInitializing) return;
    setOpen(!isLoggedIn);
  }, [isInitializing, isLoggedIn]);

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
