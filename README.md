# 연구실 자료 & 토론

대학 학생상담센터 연구실을 위한 자료 공유·토론 웹사이트입니다.
교수(관리자)가 연구·수업 자료를 올리고, 승인된 대학원생이 자료마다 댓글로 토론합니다.

- **Firebase 연결 전**에는 샘플 데이터로 동작하는 **데모 모드**로 실행됩니다.
  화면 맨 위에 "데모 모드: Firebase 미연결" 표시가 나오고, "관리자로 체험" / "회원으로 체험" 버튼으로 둘러볼 수 있습니다.
  (데모 모드에서 작성한 내용은 새로고침하면 사라집니다.)
- Firebase 연결 후에는 Google 계정으로 로그인하며, 데이터가 실제로 저장됩니다.

> ⚠ **민감정보 주의** — 내담자 이름·학번·사례 등 개인을 식별할 수 있는 정보는 자료나 댓글에 절대 입력하지 마세요.

---

## 목차

1. [화면과 권한](#1-화면과-권한)
2. [내 컴퓨터에서 실행하기](#2-내-컴퓨터에서-실행하기)
3. [GitHub에 올리기](#3-github에-올리기)
4. [Netlify로 배포하기](#4-netlify로-배포하기)
5. [다음 단계: Firebase 연결하기](#5-다음-단계-firebase-연결하기)
6. [내용 수정하기](#6-내용-수정하기)
7. [폴더 구조](#7-폴더-구조)

---

## 1. 화면과 권한

| 주소 | 화면 | 볼 수 있는 사람 |
| --- | --- | --- |
| `/` | 홈(연구실 소개·연구 분야·연락처) | 누구나 |
| `/materials` | 자료 목록(연구/수업 탭, 20개씩 더 보기) | 회원, 관리자 |
| `/materials/자료ID` | 자료 상세 + 댓글 토론 | 회원, 관리자 |
| `/admin` | 자료 작성·수정·삭제, 가입 승인/거절 | 관리자 |
| `/pending` | 승인 대기 안내 | 승인 대기 중인 사람 |

- **관리자(admin)**: 교수님. `VITE_ADMIN_EMAIL`에 적은 이메일의 Google 계정입니다. 모든 댓글을 삭제할 수 있습니다.
- **회원(member)**: 관리자가 승인한 대학원생. 자료를 보고, 본인 댓글을 작성·수정·삭제할 수 있습니다.
- **승인 대기(pending)**: 처음 로그인한 사람. 승인 전까지는 안내 화면만 보입니다.
- 가입을 **거절**하면 그 사람의 정보가 삭제됩니다. 그 사람이 다시 로그인하면 다시 승인 대기 상태가 됩니다.

---

## 2. 내 컴퓨터에서 실행하기

### 준비물 (한 번만)
- [Node.js](https://nodejs.org/ko) **22 버전 이상(LTS)** 설치
- 설치 확인: 터미널(맥: "터미널", 윈도우: "PowerShell")에서 `node -v` 를 입력해 `v22...` 이상이 나오면 됩니다.

### 실행
프로젝트 폴더에서 아래 명령을 차례로 입력합니다.

```bash
npm install
```

```bash
npm run dev
```

터미널에 나오는 주소(보통 `http://localhost:5173`)를 브라우저로 열면 됩니다. 끝낼 때는 터미널에서 `Ctrl + C`.

배포용 결과물이 잘 만들어지는지 확인하려면:

```bash
npm run build
```

---

## 3. GitHub에 올리기

> 이미 이 저장소가 GitHub에 있다면 이 단계는 건너뛰어도 됩니다.

1. [github.com](https://github.com)에 로그인 → 오른쪽 위 **+** → **New repository**
2. 저장소 이름 입력(예: `counseling-lab`) → **Private**(비공개) 권장 → **Create repository**
3. 프로젝트 폴더에서 아래 명령 실행 (주소는 방금 만든 저장소 주소로 바꾸세요)

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "첫 업로드"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/내아이디/counseling-lab.git
```

```bash
git push -u origin main
```

- `.env` 파일(비밀 설정값)은 `.gitignore`에 들어 있어 **GitHub에 올라가지 않습니다.** 그대로 두세요.

---

## 4. Netlify로 배포하기

1. [app.netlify.com](https://app.netlify.com)에 GitHub 계정으로 가입/로그인
2. **Add new project → Import an existing project → GitHub** 선택
3. 저장소 목록에서 이 저장소를 선택 (안 보이면 "Configure the Netlify app on GitHub"에서 접근 허용)
4. 설정 화면은 **그대로 두면 됩니다.** (`netlify.toml` 파일에 이미 들어 있습니다)
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Deploy** 클릭 → 1~2분 뒤 `https://무작위이름.netlify.app` 주소가 생깁니다.
6. (선택) **Project configuration → Change project name**에서 주소 앞부분을 원하는 이름으로 바꿀 수 있습니다.

이후 GitHub에 변경 사항을 올리면(push) Netlify가 **자동으로 다시 배포**합니다.
지금은 Firebase 설정이 없으므로 배포된 사이트도 **데모 모드**로 보입니다.

---

## 5. 다음 단계: Firebase 연결하기

모든 단계는 **무료 Spark 요금제** 안에서 진행합니다. 결제 정보를 등록하라는 화면(Blaze 업그레이드)이 나오면 **진행하지 마세요.**
이 사이트는 Firestore 데이터베이스와 Google 로그인만 사용하며, Storage·Functions·Hosting·Analytics는 사용하지 않습니다.

### 5-1. 프로젝트 만들기
1. [console.firebase.google.com](https://console.firebase.google.com) 접속 → **프로젝트 만들기**
2. 이름 입력 → **Google 애널리틱스 사용 설정은 끔(OFF)** → 프로젝트 만들기

### 5-2. 웹앱 등록
1. 프로젝트 개요 화면에서 **웹(`</>`) 아이콘** 클릭
2. 앱 닉네임 입력 → **"Firebase 호스팅도 설정" 체크하지 않음** → 앱 등록
3. 화면에 나오는 `firebaseConfig` 값(apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)을 메모해 둡니다.
   (나중에 **프로젝트 설정 → 일반 → 내 앱**에서도 다시 볼 수 있습니다.)

### 5-3. Google 로그인 켜기
1. 왼쪽 메뉴 **보안(Security) → Authentication → 시작하기**
2. **로그인 방법(Sign-in method)** 탭 → **Google** → 사용 설정 → 지원 이메일 선택 → 저장

### 5-4. 승인된 도메인에 Netlify 주소 추가
1. Authentication → **설정(Settings)** 탭 → **승인된 도메인(Authorized domains)**
2. **도메인 추가** → `무작위이름.netlify.app` 입력 (앞의 `https://`는 빼고 입력)
   - 이 작업을 하지 않으면 배포 사이트에서 로그인할 때 "승인되지 않은 도메인" 오류가 납니다.

### 5-5. Firestore 데이터베이스 만들기
1. 왼쪽 메뉴 **데이터베이스 및 스토리지(Databases & Storage) → Firestore Database → 데이터베이스 만들기**
2. 버전을 고르는 화면이 나오면 **Standard**, 위치는 **`asia-northeast3 (서울)`** 권장 (나중에 바꿀 수 없음)
3. **프로덕션 모드**로 시작

### 5-6. 보안 규칙 붙여넣기
1. 이 프로젝트의 `firestore.rules` 파일을 열어 전체 내용을 복사합니다.
2. 복사한 내용에서 `ADMIN_EMAIL_HERE` 를 **교수님 Google 이메일(소문자)** 로 바꿉니다.
   예: `request.auth.token.email == "professor@gmail.com"`
3. Firestore Database → **규칙(Rules)** 탭 → 기존 내용을 모두 지우고 붙여넣기 → **게시(Publish)**

> GitHub에 올라가는 `firestore.rules` 파일에는 실제 이메일을 넣지 않고 `ADMIN_EMAIL_HERE`로 두는 것을 권장합니다.
> 실제 이메일은 Firebase 콘솔에 붙여넣을 때만 바꿔 넣으세요.

### 5-7. 색인(index) 만들기
자료 목록의 "연구"/"수업" 탭은 종류와 날짜로 함께 정렬하므로 색인이 하나 필요합니다(무료).
1. Firestore Database → **색인(Indexes)** 탭 → **복합(Composite)** → **색인 만들기**
2. 컬렉션 ID: `materials`
3. 필드 1: `type` — 오름차순 / 필드 2: `createdAt` — 내림차순
4. 쿼리 범위: 컬렉션 → 만들기 (완료까지 몇 분 걸립니다)

> 이 단계를 빼먹으면 탭을 눌렀을 때 "데이터베이스 색인이 필요합니다" 안내가 나옵니다.

### 5-8. Netlify에 환경변수 입력
1. Netlify → 내 사이트 → **Project configuration → Environment variables → Add a variable**
2. 아래 7개를 하나씩 추가합니다 (값은 5-2에서 메모한 값)

| 키 | 값 |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | authDomain |
| `VITE_FIREBASE_PROJECT_ID` | projectId |
| `VITE_FIREBASE_STORAGE_BUCKET` | storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `VITE_FIREBASE_APP_ID` | appId |
| `VITE_ADMIN_EMAIL` | 교수님 Google 이메일 (규칙에 넣은 것과 동일) |

3. **Deploys → Trigger deploy → Deploy site** 로 다시 배포 → 데모 배너가 사라지면 연결 성공!

> Firebase의 apiKey는 비밀번호가 아니라 "프로젝트 식별용" 값이라 화면 코드에 포함되는 것이 정상입니다.
> 실제 보호는 5-6의 **보안 규칙**이 담당하므로 규칙을 꼭 게시하세요.

### 5-9. 첫 사용
1. 교수님이 먼저 Google 로그인 → 자동으로 관리자가 됩니다.
2. 대학원생이 로그인 → 승인 대기 화면이 보입니다.
3. 교수님이 `/admin`에서 **승인** → 대학원생이 "승인 상태 다시 확인"을 누르면 자료를 볼 수 있습니다.

### 로컬에서 Firebase로 실행하려면
`.env.example` 파일을 복사해 `.env` 라는 이름으로 저장하고 값을 채운 뒤 `npm run dev`를 다시 실행합니다.
또한 Firebase 승인된 도메인에 `localhost`가 들어 있는지 확인하세요(기본 포함).

### 무료 한도 안내
Spark 요금제는 하루 **읽기 5만 회, 쓰기 2만 회**까지 무료입니다. 이 사이트는 한도를 아끼도록 만들어졌습니다.
- 자료 목록은 한 번에 20개만 읽고, 실시간 감시를 하지 않습니다.
- 실시간 갱신은 지금 열어 둔 자료의 댓글에만 사용하고, 화면을 떠나면 바로 멈춥니다.

연구실 규모(수십 명)에서는 한도에 도달할 일이 거의 없습니다. 한도를 넘으면 다음 날까지 일시적으로 멈출 뿐, 요금이 청구되지는 않습니다.

---

## 6. 내용 수정하기

- **홈 화면 문구(연구실 이름, 소개, 연구 분야, 연락처)**: `src/content/site.ts` 파일의 글자만 바꾸면 됩니다.
- GitHub 웹사이트에서 파일을 열고 연필(✏️) 아이콘으로 직접 고친 뒤 **Commit changes**를 누르면 Netlify가 자동으로 다시 배포합니다.

---

## 7. 폴더 구조

```
├─ firestore.rules        Firestore 보안 규칙 (Firebase 콘솔에 붙여넣기)
├─ netlify.toml           Netlify 배포 설정
├─ .env.example           환경변수 목록 (복사해서 .env로 사용)
└─ src/
   ├─ content/site.ts     홈 화면 문구
   ├─ types/              데이터 타입 (users, materials, comments)
   ├─ services/           데이터 접근 계층
   │   ├─ types.ts          공통 인터페이스
   │   ├─ mockService.ts    데모 모드(샘플 데이터)
   │   ├─ firebaseService.ts 실제 Firebase 구현
   │   └─ index.ts          API 키 유무로 자동 선택
   ├─ contexts/           로그인 상태(AuthContext)
   ├─ components/         공통 화면 조각
   └─ pages/              페이지
```

화면 코드(`pages`, `components`)는 Firebase를 직접 부르지 않고 항상 `services`를 통해서만 데이터를 다룹니다.

### Firestore 데이터 구조
```
users/{uid}                      displayName, email, photoURL, role('admin'|'member'|'pending'), createdAt
materials/{id}                   title, summary, body, type('research'|'lecture'), tags[], linkUrl?, authorUid, createdAt, updatedAt
materials/{id}/comments/{id}     body, authorUid, authorName, createdAt, updatedAt
```
