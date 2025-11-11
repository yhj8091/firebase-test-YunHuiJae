// src/pages/SignUpPage.js (수정된 전체 코드)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    registerUserWithEmail, 
    saveUserProfile 
} from '../firebase'; 

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [university, setUniversity] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // useNavigate 훅 사용

    const handleSubmit = async (e) => {
        // ... (기존 회원가입 로직 유지) ...
        e.preventDefault();
        setError(null);
        
        if (!email || !password || !nickname || !university) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const userCredential = await registerUserWithEmail(email, password);
            const user = userCredential.user;

            await saveUserProfile(user.uid, {
                email: email,
                nickname: nickname,
                university: university
            });
            
            navigate('/signin'); 

        } catch (err) {
            console.error("회원가입 오류:", err.message);
            if (err.code === 'auth/email-already-in-use') {
                setError('이미 사용 중인 이메일 주소입니다.');
            } else if (err.code === 'auth/weak-password') {
                setError('비밀번호는 6자리 이상이어야 합니다.');
            } else {
                setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    };

    return (
        <div className="signup-page">
             {/* ✅ 뒤로가기 버튼 추가 */}
            <button 
                className="btn btn-back-auth" 
                onClick={() => navigate('/')} // 랜딩 페이지로 이동
            >
                &lt;
            </button>
            
            <h3>회원가입</h3>
            <form onSubmit={handleSubmit} className="signup-form">
                <input 
                    type="email" 
                    placeholder="이메일" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="비밀번호 (6자리 이상)" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input 
                    type="text" 
                    placeholder="닉네임" 
                    value={nickname} 
                    onChange={(e) => setNickname(e.target.value)}
                />
                <input 
                    type="text" 
                    placeholder="대학교 이름" 
                    value={university} 
                    onChange={(e) => setUniversity(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn btn-primary">회원가입 완료</button>
            </form>
            <button className="btn btn-secondary" onClick={() => navigate('/signin')}>
                이미 계정이 있나요? 로그인하기
            </button>
        </div>
    );
};

export default SignUpPage;