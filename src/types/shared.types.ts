// ------------------------------------------------------------------------------

import type { CourseTimeModel } from "../apis/api/course/course.dto";

/**
 * 테이블 컬럼 정의 타입
 */
export type Align = "left" | "center" | "right";

export type StudentStatus = "재원" | "휴원" | "퇴원";
export type instructorStatus = "재직" | "퇴직";

export type ColumnDef<T> = {
  id: string;
  header: React.ReactNode;

  accessor?: keyof T | ((row: T) => React.ReactNode);
  render?: (row: T, rowIndex: number) => React.ReactNode;

  /** ✅ fr 비율 (flex처럼) */
  flex?: number; // 기본 1
  /** ✅ 최소 너비 (이 밑으로는 가로 스크롤) */
  minWidth?: number | string;

  cellPadding?: string; // ✅ ex) "15px 0" | "0" | "0 6px"
  headerPadding?: string; // ✅ 헤더도 같이 필요하면

  align?: Align;
  headerAlign?: Align;
  nowrap?: boolean;
  cellOverflowVisible?: boolean;
  title?: (row: T) => string;

  sortable?: boolean;
  sortValue?: (row: T) => string | number | Date | null | undefined;
};

// ------------------------------------------------------------------------------

/**
 * 회원 수정 폼 값 타입
 */
export type AddressValue = {
  zonecode: string;
  roadAddress: string;
  detailAddress: string;
  extraAddress: string;
};

export type StudentEditFormValues = {
  studentId: number;
  name: string;
  status: "재원" | "휴원" | "퇴원";
  registrationDate: string;
  birth: string;
  gender: "남" | "여" | "";
  school: {
    atptName: string;
    atptCode: string;
    schoolType: string;
    schoolName: string;
    grade: string;
  };
  phoneNumber: string;
  guardianPhoneNumber: string;
  address: AddressValue;
};

export type InstructorEditFormValues = {
  instructorId: number;
  name: string;
  status: string;
  jobTitleId: number;
  phoneNumber: string;
};

export type SportsClass = "근력" | "기능" | "유연성" | "달리기" | "던지기" | "민첩성" | "점프";

export type EditCourseFormValues = {
  courseId?: number;
  courseName: string;
  courseTarget: string;
  courseType: string;
  courseStartDate: string;
  courseTimeModel: CourseTimeModel;
  teacherIds: number[] | [];
  price: number;
};

export type ClassStatusType = "수업중" | "미진행" | "완료";

export type SubjectType = "KOREAN" | "MATH" | "ENGLISH" | "EXPLORATION" | "HISTORY";

export type SubjectDetailType = Exclude<SubjectType, "HISTORY" | "ENGLISH">;
