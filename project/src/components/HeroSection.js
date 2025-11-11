// src/components/HeroSection.js

import React from 'react';
import '../App.css'; 

const HeroSection = ({ title, subtitle, onLogin }) => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                {/* 요구사항: "대구들"이 제목, "프로젝트 제목"이 서브타이틀 */}
                <h1>{title}</h1> 
                <p>{subtitle}</p>
                <button 
                    className="btn btn-hero-login" 
                    onClick={onLogin}
                >
                    로그인
                </button>
            </div>
        </section>
    );
};

export default HeroSection;