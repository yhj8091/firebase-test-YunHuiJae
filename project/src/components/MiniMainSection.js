// src/components/MiniMainSection.js

import React from 'react';
import '../App.css'; 

const MiniMainSection = () => {
    // 임시 데이터 (실제 데이터는 Firebase에서 가져와야 함)
    const posts = [
        { id: 1, title: "게시글", summary: "게시글 내용 요약", upvote: 'A' },
        { id: 2, title: "게시글", summary: "게시글 내용 요약", upvote: 'A' },
        { id: 3, title: "게시글", summary: "게시글 내용 요약", upvote: 'A' },
        { id: 4, title: "게시글", summary: "게시글 내용 요약", upvote: 'A' },
        { id: 5, title: "게시글", summary: "게시글 내용 요약", upvote: 'A' },
    ];

    return (
        <section className="mini-main-section">
            <h2>프로젝트 예시</h2>
            <div className="post-list-card">
                <div className="card-header">제목</div>
                {posts.map(post => (
                    <div key={post.id} className="post-item">
                        <span className="star">⭐</span>
                        <div className="post-info">
                            <p className="post-title">{post.title}</p>
                            <p className="post-summary">{post.summary}</p>
                        </div>
                        <span className="upvote">⇧{post.upvote}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default MiniMainSection;