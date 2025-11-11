// src/pages/PostCreate.js

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// ⭐ 수정: fetchCategories 함수를 추가로 임포트합니다.
import { auth, createPost, getUserProfile, MASTER_UID, fetchCategories } from '../firebase'; 

const PostCreate = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState(''); // 초기값 비워둠
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); 
    
    // ⭐ 추가: Firebase에서 불러온 동적 카테고리 목록
    const [allCategories, setAllCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const navigate = useNavigate();
    const user = auth.currentUser;

    // 1. 카테고리 목록 로드 및 관리자 권한 확인
    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }

        const loadData = async () => {
            try {
                // 1. 사용자 프로필 로드 및 관리자 권한 확인
                const profile = await getUserProfile(user.uid);
                setUserProfile(profile);
                const isMaster = user.uid === MASTER_UID;
                setIsAdmin(isMaster); 
                
                // 2. ⭐ Firebase에서 카테고리 목록 로드
                setLoadingCategories(true);
                const fetchedList = await fetchCategories();
                
                // 3. 'general' 게시판과 같은 글쓰기 불가 카테고리 필터링
                const selectableList = fetchedList.filter(cat => 
                    cat.name !== 'general' && cat.name !== 'master' // 마스터 게시판은 아래 useMemo에서 처리
                );
                
                setAllCategories(selectableList);

                // 4. 카테고리 기본값 설정 (마스터가 아니면 첫 번째 일반 게시판, 마스터면 첫 번째 일반 게시판)
                if (selectableList.length > 0) {
                    setCategory(selectableList[0].name);
                } else {
                    setCategory(''); // 카테고리가 아예 없을 경우
                }

            } catch(err) {
                console.error('데이터 로드 실패:', err);
                setError('필요한 정보를 불러오는 데 실패했습니다.');
                navigate('/home/general');
            } finally {
                setLoadingCategories(false);
            }
        };
        loadData();
    }, [user, navigate]);


    // ⭐ 2. 최종적으로 드롭다운에 표시될 카테고리 목록 (useMemo 사용)
    const categoriesToDisplay = useMemo(() => {
        if (isAdmin) {
            // 마스터는 'master' 게시판을 목록에 추가
            return [
                ...allCategories,
                { name: 'master', label: '⭐ 마스터 공지' },
            ].sort((a, b) => a.name.localeCompare(b.name)); // 정렬 (선택 사항)
        }
        return allCategories;
    }, [isAdmin, allCategories]);
    
    
    // 3. 게시물 제출 핸들러 (기존과 동일)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim() || !content.trim() || !category) {
            setError('제목, 내용 및 카테고리를 선택해주세요.');
            return;
        }

        if (loading || !userProfile) return;

        setLoading(true);
        setError(null);

        try {
            const postData = {
                title,
                content,
                authorUid: user.uid,
                nickname: userProfile.nickname,
                university: userProfile.university,
                category: category, 
                commentCount: 0 
            };
            
            await createPost(postData);
            alert('게시물이 성공적으로 작성되었습니다.');
            
            if (category === 'general' || category === 'master') {
                 navigate(`/home/general`); 
            } else {
                 navigate(`/home/category/${category}`); 
            }
            

        } catch (err) {
            console.error("게시물 작성 실패:", err);
            setError('게시물 작성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!user || !userProfile || loadingCategories) {
        return <div className="loading">사용자 정보 및 카테고리 확인 중...</div>; 
    }

    // 4. 렌더링 부분 (categoriesToDisplay 사용)
    return (
        <div className="post-create-page">
            <h2>새 글 작성</h2>
            <form onSubmit={handleSubmit} className="post-create-form">
                
                {/* ⭐ 카테고리 선택 드롭다운 (동적 목록 사용) */}
                <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={categoriesToDisplay.length === 0}
                >
                    <option value="">-- 카테고리 선택 --</option>
                    {categoriesToDisplay.map((cat) => (
                        <option 
                            key={cat.name} 
                            value={cat.name}
                             // ⭐ 마스터 계정이 아니면 'master' 게시판을 선택할 수 없도록 방지
                            disabled={!isAdmin && cat.name === 'master'} 
                        >
                            {cat.label}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="내용을 입력하세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="15"
                    required
                />

                {error && <p className="error-message">{error}</p>}
                
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? '작성 중...' : '게시물 등록'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostCreate;