// src/pages/Category1.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// ⭐ 수정: deleteCategory와 MASTER_UID를 임포트합니다.
import { 
    fetchPostsByCategory, 
    auth, 
    fetchCategories, 
    deleteCategory, 
    MASTER_UID // 마스터 UID
} from '../firebase'; 

// 시간 포맷팅 함수 (기존과 동일)
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


const Category1 = () => {
    const { categoryName } = useParams(); 
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryLabel, setCategoryLabel] = useState('로딩 중...'); 
    
    // ⭐ 추가: 관리자 권한 및 기본 게시판 보호 상태
    const [isAdmin, setIsAdmin] = useState(false);
    const [isProtected, setIsProtected] = useState(false); 

    const navigate = useNavigate();

    // 카테고리별 게시물 및 레이블을 불러오는 useEffect
    useEffect(() => {
        const loadCategoryData = async () => {
            // 1. 로그인 상태 확인 및 관리자 권한 체크
            const user = auth.currentUser;
            if (!user) {
                navigate('/signin');
                return;
            }
            
            // ⭐ 관리자 권한 체크
            const isMaster = user.uid === MASTER_UID;
            setIsAdmin(isMaster);

            // ⭐ 기본 게시판 보호 체크 (CategoryList.js와 동일하게 설정)
            const protectedCats = ['general', 'master', 'free', 'info'];
            const protectionStatus = protectedCats.includes(categoryName);
            setIsProtected(protectionStatus);

            setLoading(true);
            setError(null);
            setPosts([]);
            setCategoryLabel('로딩 중...'); 

            try {
                // 2. 카테고리 목록을 불러와 레이블 찾기
                const categories = await fetchCategories();
                const currentCategory = categories.find(cat => cat.name === categoryName);

                if (currentCategory) {
                    setCategoryLabel(currentCategory.label);
                } else {
                    setCategoryLabel(`'${categoryName}' (카테고리 없음)`);
                    setError('존재하지 않는 게시판입니다.');
                    setLoading(false);
                    return;
                }

                // 3. 게시물 목록을 불러옵니다.
                const fetchedPosts = await fetchPostsByCategory(categoryName); 
                setPosts(fetchedPosts);

            } catch (err) {
                console.error(`게시판 데이터 로드 실패:`, err);
                setError('게시판 정보를 불러오는 데 실패했습니다.');
                setPosts([]); 
            } finally {
                setLoading(false);
            }
        };

        if (categoryName) {
            loadCategoryData();
        }
    }, [categoryName, navigate]); // 의존성 배열 유지

    // ⭐ 게시판 삭제 핸들러 함수
    const handleDeleteCategory = async () => {
        if (!isAdmin || isProtected) {
            alert("게시판을 삭제할 권한이 없거나 보호된 게시판입니다.");
            return;
        }

        if (window.confirm(`게시판 [${categoryLabel}]과(와) 그 안에 있는 모든 게시물을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            try {
                await deleteCategory(categoryName); 
                alert(`게시판 [${categoryLabel}]이(가) 성공적으로 삭제되었습니다.`);
                
                // 삭제 후, 기본 게시판 또는 메인 페이지로 이동
                navigate('/category/general', { replace: true }); 
            } catch (error) {
                console.error("게시판 삭제 실패:", error);
                alert(`게시판 삭제 실패: ${error.message}`); 
            }
        }
    };


    // 게시물 클릭 시 상세 페이지로 이동하는 핸들러 (기존과 동일)
    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    if (loading) {
        return <div className="loading">게시물 목록을 불러오는 중...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="category-page">
            <div className="category-header-row">
                <h2>{categoryLabel}</h2>
                
                {/* ⭐ 삭제 버튼: 마스터 계정이고 보호된 게시판이 아닐 때만 표시 */}
                {isAdmin && !isProtected && (
                    <button 
                        className="btn btn-danger btn-delete-category"
                        onClick={handleDeleteCategory}
                    >
                        게시판 삭제
                    </button>
                )}
            </div>
            
            <div className="post-list-container">
                {posts.length === 0 ? (
                    <p className="no-posts">아직 작성된 게시물이 없습니다.</p>
                ) : (
                    posts.map(post => (
                        <div 
                            key={post.id} 
                            className="post-item-card" 
                            onClick={() => handlePostClick(post.id)}
                        >
                            <div className="post-header">
                                <span className="post-university">[{post.university}]</span>
                                <h3 className="post-title">{post.title}</h3>
                            </div>
                            <div className="post-meta">
                                <span>작성자: {post.nickname}</span>
                                <span>작성일: {formatTime(post.createdAt)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button 
                className="btn btn-primary btn-write-bottom" 
                onClick={() => navigate(`/post/create?category=${categoryName}`)}
            >
                글쓰기
            </button>
            
            {/* 마스터 모드 디버깅 (선택 사항) */}
            {isAdmin && <div style={{marginTop: '10px', color: 'red', fontSize: '12px'}}>⭐ MASTER MODE ON</div>}
        </div>
    );
};

export default Category1;