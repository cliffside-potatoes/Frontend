import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import { useUser } from "../../context/UserContext";
import { buildSignInState } from "../../utils/authStorage";

/**
 * 비로그인 사용자에게 메인과 동일한 로그인 유도 모달 (페이지는 그대로 보이고 오버레이로 어둡게 가림)
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
      cancelLabel="취소"
      confirmLabel="로그인"
      onCancel={() => setOpen(false)}
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
