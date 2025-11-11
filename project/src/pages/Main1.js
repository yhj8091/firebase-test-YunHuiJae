// src/pages/Main1.js (전체 게시판 컴포넌트)

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchPosts } from '../firebase'; 

// 시간 포맷팅 함수 (다른 컴포넌트와 동일하게 정의되어 있어야 함)
const formatTime = (isoString) => {
    if (!isoString) return '날짜 알 수 없음';
    // ISO 문자열을 받아 사용자 친화적인 형식으로 변환합니다.
    return new Date(isoString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(/\. /g, '.').replace(/\.$/, '').replace(' ', ' ');
};

const Main1 = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadPosts = async () => {
            try {
                // ⭐ fetchPosts 함수 호출
                const fetchedPosts = await fetchPosts(); 
                setPosts(fetchedPosts);
            } catch (error) {
                // ⭐ 오류 발생 시 (Main1.js:43 로깅 위치)
                console.error("게시물 로드 실패:", error); 
                // 오류가 발생해도 앱이 멈추지 않도록 빈 배열로 설정
                setPosts([]); 
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, []); 

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    if (loading) return <div>게시물을 불러오는 중...</div>;

    return (
        <div className="main1-page">
            <h2>전체 게시판</h2>
            
            {posts.length === 0 && (
                <p className="no-posts">아직 작성된 게시물이 없습니다. 첫 글을 작성해보세요!</p>
            )}

            <div className="post-list-container">
                {posts.map(post => (
                    <div 
                        key={post.id} 
                        className="post-item-card" 
                        onClick={() => handlePostClick(post.id)}
                    >
                        <div className="post-header">
                            <span className="post-university">[{post.category}]</span>
                            <h3 className="post-title">{post.title}</h3>
                        </div>
                        <div className="post-meta">
                            <span>작성자: {post.nickname}</span>
                            <span>댓글: {post.commentCount || 0}</span>
                            <span>작성일: {formatTime(post.createdAt)}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <button 
                className="btn btn-primary btn-write"
                onClick={() => navigate('/post/create')}
            >
                글쓰기
            </button>
        </div>
    );
};

export default Main1;