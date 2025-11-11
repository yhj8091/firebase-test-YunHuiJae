// src/pages/SignInPage.js (수정된 전체 코드)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInUserWithEmail } from '../firebase'; 

const SignInPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // useNavigate 훅 사용

    const handleSubmit = async (e) => {
        // ... (기존 로그인 로직 유지) ...
        e.preventDefault();
        setError(null);
        
        if (!email || !password) {
            setError('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        try {
            await signInUserWithEmail(email, password);
            navigate('/home/general'); 

        } catch (err) {
            console.error("로그인 오류:", err.message);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            } else if (err.code === 'auth/invalid-email') {
                setError('유효하지 않은 이메일 형식입니다.');
            } else {
                setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    };

    return (
        <div className="signin-page">
            {/* ✅ 뒤로가기 버튼 추가 */}
            <button 
                className="btn btn-back-auth" 
                onClick={() => navigate('/')} // 랜딩 페이지로 이동
            >
                &lt;
            </button>
            
            <h3>로그인</h3>
            <form onSubmit={handleSubmit} className="signin-form">
                <input 
                    type="email" 
                    placeholder="이메일" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="비밀번호" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn btn-primary">로그인</button>
            </form>
            <button className="btn btn-secondary" onClick={() => navigate('/signup')}>
                계정이 없으신가요? 회원가입하기
            </button>
        </div>
    );
};

export default SignInPage;