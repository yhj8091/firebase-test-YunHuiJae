# 대구들

## 💡 프로젝트 개요

이 프로젝트는 **React**와 **Firebase**를 활용하여 구축된 실시간 커뮤니티형 웹 애플리케이션(SPA)입니다. 사용자 인증, 게시물 CRUD, 댓글 기능, 그리고 관리자 전용 게시판 관리 기능을 포함한 기본적인 웹 게시판의 모든 핵심 기능을 구현합니다.

## ✨ 주요 기능

* **사용자 인증**: 이메일/비밀번호를 사용한 회원가입 및 로그인/로그아웃.
* **사용자 프로필**: Firestore에 사용자 프로필 및 권한(`user`/`admin`) 저장.
* **게시물 관리 (CRUD)**: 게시물 작성, 조회, 수정, 삭제 기능 제공.
* **댓글 시스템**: 댓글 작성, 수정, 삭제 및 실시간 카운트(`commentCount`) 반영.
* **게시판 관리 (Admin 전용)**: 관리자만 게시판 목록(`config/categoriesList`)을 추가/삭제/수정할 수 있는 기능.
* **SPA History Fallback**: Firebase Hosting 설정을 통한 새로고침 및 404 오류 방지.

## 🛠️ 기술 스택

| 구분 | 기술 스택 | 설명 |
| :--- | :--- | :--- |
| **Frontend** | React, JavaScript | 사용자 인터페이스 구축 |
| **Backend/DB** | **Firebase Authentication** | 사용자 인증 및 권한 관리 |
| | **Firebase Firestore** | NoSQL 데이터베이스 및 실시간 데이터 저장 |
| | **Firebase Hosting** | 웹 애플리케이션 배포 및 History Fallback 처리 |
