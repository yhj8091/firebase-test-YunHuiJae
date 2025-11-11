// src/components/SignUpForm.js

import React from 'react';
// 스타일링을 위해 App.css 또는 SignUpForm.css를 사용한다고 가정합니다.
// import '../App.css'; 

const SignUpForm = ({ 
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    university, setUniversity,
    universityList, // 대학교 목록 (드롭다운 옵션)
    nickname, setNickname,
    error,
    handleSubmit
}) => {
    return (
        <form className="signup-form" onSubmit={handleSubmit}>
            
            {/* 1. 이메일 입력 (아이디) */}
            <div className="form-group">
                <label htmlFor="email">이메일 (ID)</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="example@univ.ac.kr"
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
                    minLength="6"
                    placeholder="6자 이상 입력"
                />
            </div>

            {/* 3. 비밀번호 확인 입력 */}
            <div className="form-group">
                <label htmlFor="confirmPassword">비밀번호 확인</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="비밀번호를 다시 입력하세요"
                />
            </div>

            {/* 4. 대학교 선택 (드롭다운) */}
            <div className="form-group">
                <label htmlFor="university">대학교</label>
                <select
                    id="university"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    required
                >
                    {/* universityList 배열을 옵션으로 매핑 */}
                    {universityList.map((univ, index) => (
                        <option 
                            key={index} 
                            value={univ}
                            // 첫 번째 항목("대학교 선택")은 disabled 처리
                            disabled={index === 0}
                        >
                            {univ}
                        </option>
                    ))}
                </select>
            </div>

            {/* 5. 닉네임 입력 (게시판 활동명) */}
            <div className="form-group">
                <label htmlFor="nickname">닉네임</label>
                <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    placeholder="커뮤니티에서 사용할 닉네임"
                />
            </div>
            
            {/* 6. 오류 메시지 표시 */}
            {error && <p className="error-message">{error}</p>}

            {/* 7. 제출 버튼 */}
            <button type="submit" className="btn btn-primary">
                회원가입 완료
            </button>
        </form>
    );
};

export default SignUpForm;