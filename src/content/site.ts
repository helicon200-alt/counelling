// 홈 화면에 보이는 연구실 정보입니다. 이 파일의 글자만 바꾸면 홈 화면이 바뀝니다.
// (실제 개인 연락처를 넣기 전에 공개해도 되는 정보인지 확인하세요.)

export const site = {
  labName: '상담심리 연구실',
  shortName: '연구실 자료 & 토론',
  affiliation: 'OO대학교 학생상담센터',
  professor: 'OOO 교수',
  intro:
    '대학생의 정신건강과 적응을 돕기 위한 상담 이론과 실제를 연구합니다. 이 공간은 연구실 구성원이 연구·수업 자료를 함께 보고 토론하기 위한 곳입니다.',
  researchAreas: [
    { title: '대학생 정신건강', description: '우울·불안·스트레스 등 대학생 정서 문제의 이해와 개입' },
    { title: '집단상담 프로그램', description: '정서조절, 대인관계 향상 등 구조화 집단 프로그램 개발과 효과 검증' },
    { title: '위기상담', description: '학생상담센터 위기 개입 체계와 안전 계획 수립' },
    { title: '상담자 교육', description: '상담 수련생의 역량 개발과 수퍼비전' },
  ],
  contact: {
    office: 'OO관 000호',
    email: 'lab@example.ac.kr',
    hours: '평일 10:00 – 17:00 (사전 연락 후 방문)',
  },
} as const
