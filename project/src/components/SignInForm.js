// src/components/SignInForm.js

import React from 'react';
// import '../App.css'; // 스타일링을 위해

const SignInForm = ({ 
    email, setEmail,
    password, setPassword,
    error,
    handleSubmit
}) => {
    return (
        <form className="signin-form" onSubmit={handleSubmit}>
            
            {/* 1. 이메일 입력 */}
            <div className="form-group">
                <label htmlFor="email">이메일</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="이메일을 입력하세요"
                />
            </div>

            {/* 2. 비밀번호 입력 */}
            <div className="form-group">
                <label htmlFor="password">비밀번호</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="비밀번호를 입력하세요"
                />
            </div>
            
            {/* 3. 오류 메시지 표시 */}
            {error && <p className="error-message">{error}</p>}

            {/* 4. 로그인 버튼 */}
            <button type="submit" className="btn btn-primary">
                로그인
            </button>
        </form>
    );
};

export default SignInForm;