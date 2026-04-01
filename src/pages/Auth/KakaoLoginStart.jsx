import { useEffect, useRef } from 'react';
import { clearLoggedOutMarker } from '../../utils/authStorage';
import { buildKakaoLoginStartUrl } from '../../utils/kakaoLoginUrl';

const KakaoLoginStart = () => {
    const isRequested = useRef(false);

    useEffect(() => {
        if (isRequested.current) return;
        isRequested.current = true;

        // 다시 로그인 시도하는 순간 로그아웃 마커 해제
        clearLoggedOutMarker();

        window.location.replace(buildKakaoLoginStartUrl());
    }, []);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>카카오 로그인으로 이동 중...</h2>
        </div>
    );
};

export default KakaoLoginStart;