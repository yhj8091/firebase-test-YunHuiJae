// src/pages/PostDetail.js (마스터 권한 통합 버전)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    auth, 
    fetchPostDetail, 
    addCommentToPost, 
    getUserProfile,
    deletePost,  
    updatePost,  
    updateComment, 
    deleteComment, 
    fetchComments, 
    MASTER_UID // ⭐ MASTER_UID import 추가
} from '../firebase'; 

// 시간 포맷팅 함수 (ISO String을 사람이 읽을 수 있는 형태로 변환)
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


const PostDetail = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false); 
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null); 
    const [editedCommentText, setEditedCommentText] = useState('');
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); // ⭐ 관리자 상태 추가

    const user = auth.currentUser;
    const navigate = useNavigate();
    
    const isAuthor = user && post && user.uid === post.authorUid; 
    const currentUserId = user ? user.uid : null; 
    
    // ⭐ 게시물 삭제 권한: 작성자이거나 마스터 계정인 경우
    const canDeletePost = user && post && (isAuthor || isAdmin); 


    // 1. 게시물 상세, 댓글 목록, 사용자 프로필 로드
    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                // 로그인 상태가 아니면 /signin으로 리다이렉트 (이전 문제 해결 로직 반영)
                navigate('/signin'); 
                return;
            }
            
            try {
                // 1. 게시물 데이터 로드
                const postData = await fetchPostDetail(postId);
                if (!postData) {
                    setError('게시물을 찾을 수 없습니다.');
                    setLoading(false);
                    return;
                }
                setPost(postData);
                setEditedTitle(postData.title); 
                setEditedContent(postData.content); 
                
                // 2. 현재 사용자 프로필 및 관리자 권한 로드
                const profile = await getUserProfile(user.uid);
                setCurrentUserProfile(profile);
                
                // ⭐ 마스터 UID와 현재 사용자 UID 비교하여 isAdmin 상태 설정
                setIsAdmin(user.uid === MASTER_UID); 
                
                // 3. 댓글 목록 로드 
                const loadedComments = await fetchComments(postId);
                setComments(loadedComments);

            } catch (err) {
                console.error("데이터 로드 실패:", err);
                setError('데이터를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [postId, user, navigate]);


    // 2. 게시물 삭제 핸들러 (canDeletePost 권한 체크 사용)
    const handleDelete = async () => {
        if (!canDeletePost) { // ⭐ 마스터 권한 체크 추가
             alert('게시물을 삭제할 권한이 없습니다.');
             return;
        }

        if (!window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
            return;
        }
        try {
            await deletePost(postId); 
            alert('게시물이 성공적으로 삭제되었습니다.');
            // 삭제 후 일반 게시판으로 이동
            navigate('/home/general'); 
        } catch (err) {
            console.error('게시물 삭제 실패:', err);
            setError('게시물 삭제 중 오류가 발생했습니다.');
        }
    };

    // 3. 게시물 수정 저장 핸들러 (작성자만 수정 가능)
    const handleUpdate = async () => {
        if (!isAuthor) {
            alert('게시물을 수정할 권한이 없습니다.');
            return;
        }
        
        if (!editedTitle.trim() || !editedContent.trim()) {
            alert('제목과 내용을 입력해 주세요.');
            return;
        }
        try {
            await updatePost(postId, {
                title: editedTitle,
                content: editedContent,
            });
            setPost(prevPost => ({
                ...prevPost,
                title: editedTitle,
                content: editedContent
            }));
            setIsEditing(false);
            alert('게시물이 수정되었습니다.');
        } catch (err) {
            console.error('게시물 수정 실패:', err);
            setError('게시물 수정 중 오류가 발생했습니다.');
        }
    };

    // 4. 댓글 작성 핸들러
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        if (!currentUserProfile || !currentUserProfile.university) {
            alert('댓글 작성 권한이 없습니다 (프로필 정보 부족).');
            return;
        }

        const newCommentData = { 
            text: commentText,
            authorNickname: currentUserProfile.nickname || '익명', 
            authorUniversity: currentUserProfile.university, 
            authorUid: user.uid,
        };

        try {
            await addCommentToPost(postId, newCommentData);
            
            setCommentText(''); 
            alert('댓글이 성공적으로 작성되었습니다.');
            
            try {
                const updatedComments = await fetchComments(postId);
                setComments(updatedComments);
            } catch (err) {
                console.warn('댓글 작성은 성공했으나, 목록 새로고침에 실패했습니다. 수동 새로고침 필요.', err);
            }
            
        } catch (err) {
            console.error('댓글 작성 실패 (Firebase 쓰기 에러):', err);
            alert('댓글 작성 중 오류가 발생했습니다. (권한/규칙 재확인 필요)');
        }
    };

    // --- 5. 댓글 수정 및 삭제 핸들러 ---
    
    // 댓글 수정 모드 활성화
    const handleCommentEdit = (comment) => {
        if (currentUserId !== comment.authorUid) { // 작성자만 수정 가능
             alert('댓글을 수정할 권한이 없습니다.');
             return;
        }
        setEditingCommentId(comment.id); 
        setEditedCommentText(comment.text);
    };

    // 댓글 수정 저장
    const handleCommentUpdate = async () => {
        if (!editedCommentText.trim()) return;
        
        // 추가 권한 체크 (현재 유저가 해당 댓글 작성자인지)
        const commentToEdit = comments.find(c => c.id === editingCommentId);
        if (!commentToEdit || currentUserId !== commentToEdit.authorUid) {
             alert('댓글 수정 권한이 없습니다.');
             setEditingCommentId(null);
             return;
        }

        try {
            await updateComment(postId, editingCommentId, editedCommentText); 
            
            const updatedComments = await fetchComments(postId);
            setComments(updatedComments);
            
            setEditingCommentId(null);
            setEditedCommentText('');
            alert('댓글이 수정되었습니다.');

        } catch (err) {
            console.error('댓글 수정 실패:', err);
            alert('댓글 수정 중 오류가 발생했습니다.');
        }
    };

    // 댓글 삭제
    const handleCommentDelete = async (commentId, commentAuthorUid) => {
        // ⭐ 댓글 삭제 권한 체크: 작성자 또는 마스터 계정만 가능
        const canDeleteComment = currentUserId && (currentUserId === commentAuthorUid || isAdmin);
        
        if (!canDeleteComment) {
             alert('댓글을 삭제할 권한이 없습니다.');
             return;
        }

        if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
        
        try {
            await deleteComment(postId, commentId);

            const updatedComments = await fetchComments(postId);
            setComments(updatedComments);
            
            alert('댓글이 삭제되었습니다.');

        } catch (err) {
            console.error('댓글 삭제 실패:', err);
            alert('댓글 삭제 중 오류가 발생했습니다.');
        }
    };

    // 로딩 및 오류 처리
    if (loading) {
        return <div className="post-detail-loading">로딩 중...</div>;
    }
    if (error) {
        return <div className="post-detail-error">{error}</div>;
    }
    if (!post) {
        return <div className="post-detail-not-found">게시물을 찾을 수 없습니다.</div>;
    }

    // 렌더링 시작
    return (
        <div className="post-detail-page">
            <div className="post-content-area">
                
                {/* 제목 영역 */}
                {isEditing && isAuthor ? (
                    <input 
                        type="text" 
                        value={editedTitle} 
                        onChange={(e) => setEditedTitle(e.target.value)} 
                        className="edit-title-input"
                    />
                ) : (
                    <h1>{post.title}</h1>
                )}
                
                <div className="post-meta-header">
                    <span className="meta-info">작성자: {post.nickname || '알 수 없음'}</span>
                    <span className="meta-info">대학교: **{post.university}**</span>
                    <span className="meta-info">작성 시간: {formatTime(post.createdAt)}</span>
                </div>
                <hr />
                
                {/* 내용 영역 */}
                {isEditing && isAuthor ? (
                    <textarea 
                        value={editedContent} 
                        onChange={(e) => setEditedContent(e.target.value)} 
                        rows="15"
                        className="edit-content-textarea"
                    />
                ) : (
                    <p className="post-body">{post.content}</p>
                )}

                {/* 수정/삭제 버튼 영역 */}
                <div className="post-actions">
                    {/* 수정은 작성자만 */}
                    {isAuthor && (
                        <>
                            {isEditing ? (
                                <>
                                    <button className="btn btn-save" onClick={handleUpdate}>수정 저장</button>
                                    <button className="btn btn-cancel" onClick={() => { setIsEditing(false); setEditedTitle(post.title); setEditedContent(post.content); }}>취소</button>
                                </>
                            ) : (
                                <button className="btn btn-edit" onClick={() => setIsEditing(true)}>수정</button>
                            )}
                        </>
                    )}
                    
                    {/* ⭐ 삭제는 작성자 또는 마스터 계정만 */}
                    {canDeletePost && (
                         <button className="btn btn-delete" onClick={handleDelete}>삭제</button>
                    )}
                </div>
                {error && <p className="action-error">{error}</p>}

            </div>
            
            <hr />

            {/* 댓글 영역 */}
            <div className="comments-area">
                <h3>댓글 ({comments.length || 0})</h3> 
                
                {/* 댓글 목록 표시 */}
                <div className="comment-list">
                    {(comments || [])
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                        .map((comment, index) => {
                            const isCommentAuthor = currentUserId && currentUserId === comment.authorUid; 
                            const isCurrentlyEditing = editingCommentId === comment.id; 
                            // ⭐ 댓글 삭제 버튼 표시 권한: 작성자 또는 마스터 계정
                            const canShowDeleteButton = isCommentAuthor || isAdmin; 

                            return (
                                <div key={comment.id || index} className="comment-item">
                                    <div className="comment-header">
                                        <span className="comment-author">
                                            {comment.authorNickname} ({comment.authorUniversity}) 
                                        </span>
                                        <span className="comment-time">{formatTime(comment.createdAt)}</span>
                                    </div>
                                    
                                    {isCurrentlyEditing ? (
                                        // 댓글 수정 입력 필드
                                        <div className="comment-edit-form">
                                            <textarea
                                                value={editedCommentText}
                                                onChange={(e) => setEditedCommentText(e.target.value)}
                                                rows="2"
                                            />
                                            <button className="btn btn-save" onClick={handleCommentUpdate}>저장</button>
                                            <button className="btn btn-cancel" onClick={() => setEditingCommentId(null)}>취소</button>
                                        </div>
                                    ) : (
                                        // 댓글 내용 표시 및 수정/삭제 버튼
                                        <>
                                            <p className="comment-text">{comment.text}</p>
                                            {(isCommentAuthor || canShowDeleteButton) && ( // ⭐ 수정/삭제 버튼 표시
                                                <div className="comment-actions">
                                                    {/* 수정은 작성자만 */}
                                                    {isCommentAuthor && (
                                                         <button onClick={() => handleCommentEdit(comment)}>수정</button>
                                                    )}
                                                    {/* 삭제는 작성자 또는 마스터 계정 */}
                                                    {canShowDeleteButton && (
                                                         <button onClick={() => handleCommentDelete(comment.id, comment.authorUid)}>삭제</button> 
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                </div>

                {/* 댓글 작성 폼 */}
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                    <h4>댓글 작성하기</h4>
                    <textarea
                        placeholder="댓글을 입력하세요..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows="3"
                        required
                    />
                    <button type="submit" className="btn btn-comment">댓글 게시</button>
                </form>
            </div>
            <button className="btn btn-back" onClick={() => navigate(-1)}>목록으로 돌아가기</button>
        </div>
    );
};

export default PostDetail;