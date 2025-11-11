// src/pages/LandingPage.js (수정된 전체 코드)

import React from 'react';
import Navbar from '../components/Navbar'; 
// useNavigate는 Navbar 컴포넌트에서 사용되므로 여기서는 주석 처리합니다.

// --- 서브 컴포넌트 정의 ---

// 히어로 섹션
const HeroSection = () => (
    <section className="hero-section">
        <h1>나의 대학 생활, 여기서 시작!</h1>
        <p>전공 정보, 학교 꿀팁, 스터디까지, 우리 학교 학생들만 모인 커뮤니티.</p>
    </section>
);

// 메인 게시판 미리보기 섹션
const MiniMainSection = () => (
    <section className="mini-main-section">
        <h2>실시간 인기 게시물</h2>
        <div className="post-preview-card">
            <p>[정보] 왕이 넘어지면?</p>
        </div>
    </section>
);

// ✅ 새로운 요약 섹션 추가
const SummarySection = () => (
    <section className="summary-section">
        <h2>왜 **대구들**이여야 할까요?</h2>
        <div className="summary-cards">
            <div className="summary-card">
                <span className="summary-icon">🎓</span>
                <h3>대학 인증 기반</h3>
                <p>우리 학교 학생들만 모여 익명으로 자유롭게 소통해요. 신뢰도 높은 정보 공유가 가능합니다.</p>
            </div>
            <div className="summary-card">
                <span className="summary-icon">💬</span>
                <h3>자유로운 게시판</h3>
                <p>전공 질문부터 일상 수다, 필요한 정보 공유까지. 댓글/수정/삭제 모두 지원해요.</p>
            </div>
            <div className="summary-card">
                <span className="summary-icon">🛡️</span>
                <h3>강력한 보안</h3>
                <p>개인 정보는 안전하게 보호되며, 깨끗한 커뮤니티 환경 유지를 위해 노력합니다.</p>
            </div>
        </div>
    </section>
);

// 푸터 (페이지 하단 정보)
const Footer = () => (
    <footer className="landing-footer">
        <p>&copy; 2025 대학 커뮤니티. 문의: help@univ.com</p>
    </footer>
);


const LandingPage = () => {
    return (
        <div className="landing-page-container"> 
            
            <Navbar /> 
            
            <main className="landing-main-content">
                <HeroSection />
                <MiniMainSection />
                
                {/* ✅ 요약 섹션을 MiniMainSection 아래에 배치 */}
                <SummarySection /> 
            </main>
            
            <Footer />
        </div>
    );
};

export default LandingPage;