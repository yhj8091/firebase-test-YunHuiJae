// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../firebase'; 

const ProtectedRoute = ({ children }) => {
    const currentUser = auth.currentUser; 

    if (!currentUser) {
        // 로그인되어 있지 않다면, 로그인 페이지로 리다이렉트
        return <Navigate to="/signin" replace />;
    }

    // 로그인되어 있다면, 하위 컴포넌트 렌더링
    return children ? children : <Outlet />;
};

export default ProtectedRoute;