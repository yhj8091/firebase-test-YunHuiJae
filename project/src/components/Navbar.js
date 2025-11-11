// src/components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 

const Navbar = () => {
    const navigate = useNavigate();
    
    return (
        <header className="navbar-container">
            {/* 로고 클릭 시 홈(랜딩) 페이지로 이동 */}
            <Link to="/" className="logo-link">
                <div className="logo">대구들</div>
            </Link>
            
            {/* ... (nav-links 부분 생략 가능) ... */}

            <div className="auth-buttons">
                {/* ✅ 로그인 버튼: /signin 경로로 이동 */}
                <button 
                    className="btn btn-login" 
                    onClick={() => navigate('/signin')}
                >
                    로그인
                </button>
                {/* ✅ 회원가입 버튼: /signup 경로로 이동 */}
                <button 
                    className="btn btn-signup" 
                    onClick={() => navigate('/signup')}
                >
                    회원가입
                </button>
            </div>
        </header>
    );
};

export default Navbar;