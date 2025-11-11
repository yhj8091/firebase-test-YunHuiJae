// src/firebase.js

import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp,
    increment 
} from "firebase/firestore";

// ⭐⭐⭐ 주의: 이 부분을 실제 Firebase Console에서 복사한 config로 정확히 교체해야 합니다! ⭐⭐⭐
const firebaseConfig = {
    apiKey: "AIzaSyDhdj9-CPmPT5DLHLWSRPr9CXQlR54kZaA",
    authDomain: "kalguksuuuuuuuu.firebaseapp.com",
    projectId: "kalguksuuuuuuuu",
    storageBucket: "kalguksuuuuuuuu.firebasestorage.app",
    messagingSenderId: "281374408255",
    appId: "1:281374408255:web:eb4872d84090e2f85e828a",
    measurementId: "G-GJDRHQQHM0"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// =================================================================
// 0. 마스터 계정 UID 정의 (Firestore 규칙과 동일해야 함)
// =================================================================

export const MASTER_UID = 'GEHGRmx8WHga8l4RTTsJf7ZDehB2'; 


// =================================================================
// 1. 사용자 인증 (Authentication) 및 프로필
// =================================================================

export const registerUserWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const signInUserWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
    return signOut(auth);
};

export const saveUserProfile = (uid, profileData) => {
    const dataToSave = {
        ...profileData,
        createdAt: serverTimestamp(),
        // ⭐ 관리자 계정 생성 시 'role: admin'으로 설정하는 로직이 별도로 필요합니다.
        // 여기서는 기본값을 'user'로 설정합니다.
        role: 'user' 
    };
    return setDoc(doc(db, "users", uid), dataToSave);
};

export const getUserProfile = async (uid) => {
    if (!uid) return null;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
};


// =================================================================
// 2. 게시물 관리 (Post CRUD 및 검색)
// =================================================================

const postsCollectionRef = collection(db, "posts");

export const createPost = (postData) => {
    const dataToSave = {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        commentCount: 0 
    };
    return addDoc(postsCollectionRef, dataToSave);
};

export const fetchPosts = async () => {
    const q = query(postsCollectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString(), 
    }));
};

export const fetchPostsByCategory = async (categoryName) => {
    const q = query(
        postsCollectionRef, 
        where("category", "==", categoryName),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
    }));
};

export const searchPosts = async (searchTerm) => {
    if (!searchTerm || searchTerm.length === 0) {
        return [];
    }
    const start = searchTerm;
    const end = searchTerm + '\uf8ff'; 

    const q = query(
        postsCollectionRef,
        orderBy("title"),
        where("title", ">=", start),
        where("title", "<=", end)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString(),
    }));
};

export const fetchPostDetail = async (postId) => {
    const docRef = doc(db, "posts", postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const postData = docSnap.data();
        return {
            id: docSnap.id,
            ...postData,
            createdAt: postData.createdAt?.toDate()?.toISOString(),
            updatedAt: postData.updatedAt?.toDate()?.toISOString(),
        };
    } else {
        return null;
    }
};

export const updatePost = (postId, updatedData) => {
    const docRef = doc(db, "posts", postId);
    const dataToUpdate = {
        ...updatedData,
        updatedAt: serverTimestamp(),
    };
    return updateDoc(docRef, dataToUpdate);
};

export const deletePost = (postId) => {
    return deleteDoc(doc(db, "posts", postId));
};


// =================================================================
// 3. 댓글 관리 (Comment CRUD)
// =================================================================

export const fetchComments = async (postId) => {
    const commentsCollectionRef = collection(db, "posts", postId, "comments");
    const q = query(commentsCollectionRef, orderBy("createdAt", "asc")); 
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));
};

export const addCommentToPost = async (postId, commentData) => {
    const commentsCollectionRef = collection(db, "posts", postId, "comments");
    const postRef = doc(db, "posts", postId);
    
    const dataToSave = {
        ...commentData,
        createdAt: serverTimestamp(),
    };
    await addDoc(commentsCollectionRef, dataToSave);
    
    await updateDoc(postRef, {
        commentCount: increment(1) 
    });
};

export const updateComment = (postId, commentId, newText) => {
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    return updateDoc(commentRef, { 
        text: newText,
        updatedAt: serverTimestamp()
    });
};

export const deleteComment = async (postId, commentId) => {
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const postRef = doc(db, "posts", postId);

    await deleteDoc(commentRef);
    
    await updateDoc(postRef, {
        commentCount: increment(-1) 
    });
};


// =================================================================
// 4. 게시판 목록 관리 (공용/관리자)
// =================================================================

// ⭐ 경로 수정: 'admin' 컬렉션이 아닌 'config' 컬렉션으로 변경
// (이유: 일반 사용자가 읽기 권한을 가져야 하기 때문)
const CATEGORIES_DOC_REF = doc(db, 'config', 'categoriesList'); 

export const fetchCategories = async () => {
    // ⭐ 경로 수정: 'admin' -> 'config'
    const docSnap = await getDoc(CATEGORIES_DOC_REF);

    if (docSnap.exists()) {
        return docSnap.data().list; 
    } else {
        // 문서가 없을 경우 기본 목록 반환
        return [
            { name: 'general', label: '전체 게시판', path: '/home/general' },
            { name: 'free', label: '자유 게시판', path: '/home/category/free' },
            { name: 'info', label: '정보 공유', path: '/home/category/info' },
        ];
    }
};

/**
 * 게시판 목록 업데이트 
 */
export const updateCategories = async (newCategories) => {
    // ⭐ 경로 수정: 'admin' -> 'config'
    // setDoc과 merge: true를 사용하여 upsert 구현
    await setDoc(CATEGORIES_DOC_REF, { list: newCategories }, { merge: true }); 
};


/**
 * 특정 카테고리를 목록에서 삭제합니다.
 * (deleteCategory는 내부적으로 fetch/update를 사용하므로 수정 필요 없음)
 */
export const deleteCategory = async (categoryName) => {
    
    // 기본 카테고리 보호
    if (categoryName === 'general' || categoryName === 'master' || categoryName === 'free' || categoryName === 'info') {
         throw new Error(`기본 게시판(${categoryName})은 삭제할 수 없습니다.`);
    }

    const currentCategories = await fetchCategories();
    const newCategories = currentCategories.filter(cat => cat.name !== categoryName);
    await updateCategories(newCategories);
};