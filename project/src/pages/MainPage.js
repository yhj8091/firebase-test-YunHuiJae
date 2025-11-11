// src/pages/MainPage.js (수정된 전체 코드)

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, getUserProfile, logoutUser, fetchCategories, updateCategories } from '../firebase'; 

// ... (기존 MainPage 컴포넌트 정의 시작)

const MainPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = auth.currentUser;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]); 
    const isAdmin = profile?.role === 'admin'; 
    const [newCategoryLabel, setNewCategoryLabel] = useState('');
    
    // ⭐ 검색어 상태 추가
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // ... (기존 loadProfileAndCategories 로직 유지) ...
        const loadProfileAndCategories = async () => {
            if (!user) {
                navigate('/signin');
                return;
            }

            try {
                // 프로필 로드 (role 포함)
                const userProfile = await getUserProfile(user.uid);
                setProfile(userProfile);

                // Firestore에서 카테고리 목록 로드
                const fetchedCategories = await fetchCategories();
                setCategories(fetchedCategories);

            } catch (error) {
                console.error("데이터 로드 실패:", error);
                setCategories([
                    { name: 'general', label: '전체 게시판', path: '/home/general' },
                    { name: 'free', label: '자유 게시판', path: '/home/category/free' },
                    { name: 'info', label: '정보 공유', path: '/home/category/info' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        loadProfileAndCategories();
    }, [user, navigate]);


    const handleLogout = async () => {
        await logoutUser();
        navigate('/');
    };
    
    
    const handleAddCategory = async () => {
        if (!newCategoryLabel.trim()) {
            alert('게시판 제목을 입력해주세요.');
            return;
        }
        if (!isAdmin) {
            alert('게시판 추가 권한이 없습니다.');
            return;
        }

        const newName = newCategoryLabel.trim().replace(/\s+/g, '').toLowerCase();
        if (categories.some(cat => cat.name === newName)) {
            alert('이미 존재하는 게시판 이름입니다.');
            return;
        }

        const newCategory = {
            name: newName,
            label: newCategoryLabel.trim(),
            path: `/home/category/${newName}`
        };

        const updatedCategories = [...categories, newCategory];
        
        try {
            await updateCategories(updatedCategories); 
            setCategories(updatedCategories); 
            setNewCategoryLabel('');
            alert(`게시판 '${newCategoryLabel}'이 성공적으로 추가되었습니다.`);
        } catch (error) {
            console.error("게시판 추가 실패:", error);
            alert("게시판 추가에 실패했습니다. 권한 및 Firebase 설정을 확인하세요.");
        }
    };
    
    // ⭐ 검색 제출 핸들러
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // 검색어를 쿼리 파라미터로 SearchPage에 전달
            navigate(`/home/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };


    if (loading) return <div>프로필 및 게시판 목록 로딩 중...</div>;

    return (
        <>
            {/* Header (검색 UI 추가) */}
            <div className="community-header">
                <Link to="/home/general" style={{ textDecoration: 'none' }}>
                    <h1>대구들</h1>
                </Link>
                
                {/* ⭐ 검색 폼 */}
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                        type="text"
                        placeholder="제목으로 검색 (접두사)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px 0 0 4px', fontSize: '14px', width: '250px' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 15px', borderRadius: '0 4px 4px 0', fontSize: '14px' }}>
                        검색
                    </button>
                </form>

                <div className="user-info">
                    {profile && (
                        <span>
                            {profile.nickname} ({profile.university})님, 환영합니다!
                            {isAdmin && <span style={{ color: 'red', fontWeight: 'bold' }}> [마스터]</span>}
                        </span>
                    )}
                    <button onClick={handleLogout} className="btn btn-secondary">로그아웃</button>
                </div>
            </div>

            {/* Content Wrapper */}
            <div className="content-wrapper">
                
                {/* 사이드바 네비게이션 */}
                <nav className="sidebar-nav">
                    {/* ... (기존 게시판 목록 및 관리자 UI 유지) ... */}
                    <h3>게시판 목록</h3>
                    <ul>
                        {categories.map((category) => (
                            <li key={category.name}>
                                <Link 
                                    to={category.path} 
                                    className={`nav-link ${location.pathname === category.path ? 'active' : ''}`}
                                >
                                    {category.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {isAdmin && (
                        <div className="admin-category-add">
                            <hr style={{ margin: '15px 20px' }} />
                            <h4>게시판 관리</h4>
                            <input 
                                type="text"
                                placeholder="새 게시판 이름"
                                value={newCategoryLabel}
                                onChange={(e) => setNewCategoryLabel(e.target.value)}
                                style={{ width: 'calc(100% - 40px)', margin: '0 20px 10px' }}
                            />
                            <button 
                                onClick={handleAddCategory} 
                                className="btn btn-comment"
                                style={{ width: 'calc(100% - 40px)', margin: '0 20px' }}
                            >
                                게시판 추가
                            </button>
                            <hr style={{ margin: '15px 20px' }} />
                        </div>
                    )}

                    <button 
                        className="btn btn-primary btn-write-post" 
                        onClick={() => navigate('/post/create')}
                    >
                        글쓰기
                    </button>
                </nav>

                {/* 메인 콘텐츠 영역 */}
                <main className="main-content-area">
                    <Outlet />
                </main>
            </div>
        </>
    );
};

export default MainPage;