// src/App.js

import React, { useState, useEffect } from 'react';
import { 
    BrowserRouter as Router, 
    Routes, 
    Route, 
    Navigate 
} from 'react-router-dom';
import { auth } from './firebase'; // ⭐ Firebase auth 객체 import 필요

// Pages (기존 임포트 유지)
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import MainPage from './pages/MainPage'; 
import Main1 from './pages/Main1'; 
import Category1 from './pages/Category1'; 
import PostCreatePage from './pages/PostCreate'; 
import PostDetail from './pages/PostDetail'; 
import SearchPage from './pages/SearchPage'; 

// Styles
import './App.css'; 

const App = () => {
    // ⭐ 1. 인증 상태 준비 여부: Firebase 세션 로드 확인 상태
    const [isAuthReady, setIsAuthReady] = useState(false);
    // ⭐ 2. 현재 로그인된 사용자 정보 (User 객체 또는 null)
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Firebase 인증 상태 리스너 설정
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser); 
            setIsAuthReady(true); // ⭐ 세션 확인 완료
        });

        // 컴포넌트 언마운트 시 리스너 정리
        return () => unsubscribe();
    }, []);

    // ⛔ 인증 상태가 준비되지 않았다면 로딩 화면을 표시 (새로고침 로그아웃 방지 핵심)
    if (!isAuthReady) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '1.2rem',
                color: '#333'
            }}>
                인증 상태 확인 중...
            </div>
        ); 
    }
    
    // ⭐ 인증이 필요한 라우트를 보호하는 헬퍼 컴포넌트
    // user가 없으면 로그인 페이지로 리다이렉트
    const ProtectedRoute = ({ children }) => {
        if (!user) {
            // 로그인 상태가 아니면 로그인 페이지로
            return <Navigate to="/signin" replace />;
        }
        return children;
    };

    // ✅ 인증 상태가 준비된 후 라우팅 시작
    return (
        <Router>
            <Routes>
                
                {/* 1. 인증/랜딩 페이지 (로그인 상태면 메인으로 리다이렉트) */}
                <Route path="/" element={user ? <Navigate to="/home" replace /> : <LandingPage />} />
                <Route path="/signin" element={user ? <Navigate to="/home" replace /> : <SignInPage />} />
                <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <SignUpPage />} />

                {/* 2. 메인 커뮤니티 레이아웃 (인증 필요) */}
                <Route 
                    path="/home" 
                    element={
                        <ProtectedRoute>
                            <MainPage />
                        </ProtectedRoute>
                    }
                >
                    {/* 기본 경로: 전체 게시판으로 리다이렉트 (인증 필요) */}
                    <Route index element={<Navigate to="general" replace />} /> 
                    
                    {/* 전체 게시판 (인증 필요) */}
                    <Route path="general" element={<Main1 />} /> 
                    
                    {/* 카테고리 게시판 (인증 필요) */}
                    <Route path="category/:categoryName" element={<Category1 />} />
                    
                    {/* 검색 결과 페이지 (인증 필요) */}
                    <Route path="search" element={<SearchPage />} /> 

                    {/* 잘못된 경로 처리 (인증 필요) */}
                    <Route path="*" element={<Navigate to="general" replace />} />
                </Route>

                {/* 3. 게시물 개별 페이지 (MainPage 레이아웃 밖, 인증 필요) */}
                <Route 
                    path="/post/create" 
                    element={
                        <ProtectedRoute>
                            <PostCreatePage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/post/:postId" 
                    element={
                        <ProtectedRoute>
                            <PostDetail />
                        </ProtectedRoute>
                    } 
                />
                
                {/* 4. 정의되지 않은 모든 경로를 "/"로 리다이렉트 */}
                <Route path="*" element={<Navigate to="/" replace />} />
                
            </Routes>
        </Router>
    );
};


export default App;