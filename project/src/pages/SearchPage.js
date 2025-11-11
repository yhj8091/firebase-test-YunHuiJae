// src/pages/SearchPage.js (새 파일)

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchPosts, auth } from '../firebase'; 

// 시간 포맷팅 함수 (다른 컴포넌트와 동일하게 정의)
const formatTime = (isoString) => {
    if (!isoString) return '날짜 알 수 없음';
    return new Date(isoString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(/\. /g, '.').replace(/\.$/, '').replace(' ', ' ');
};

const SearchPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = auth.currentUser;

    // URL 쿼리 파라미터에서 검색어 (q)를 추출
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('q') || '';

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }

        const runSearch = async () => {
            if (!searchTerm) {
                setPosts([]);
                return;
            }
            
            setLoading(true);
            try {
                const results = await searchPosts(searchTerm);
                setPosts(results);
            } catch (error) {
                console.error("검색 실패:", error);
                alert("검색 중 오류가 발생했습니다.");
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        runSearch();
    }, [searchTerm, user, navigate]);
    
    // 게시물 클릭 핸들러
    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    return (
        <div className="search-page">
            <h2>🔎 '{searchTerm}' 검색 결과</h2>

            {loading && <div className="loading">게시물을 검색하는 중...</div>}
            
            {!loading && searchTerm && posts.length === 0 && (
                <p className="no-posts">'{searchTerm}'에 대한 검색 결과가 없습니다.</p>
            )}

            {!loading && posts.length > 0 && (
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
                                <span>작성일: {formatTime(post.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {!searchTerm && (
                <p className="no-posts">검색어를 입력하고 검색 버튼을 눌러주세요.</p>
            )}
        </div>
    );
};

export default SearchPage;