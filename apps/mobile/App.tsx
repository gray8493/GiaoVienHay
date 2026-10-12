import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RoleSelectionScreen } from './src/screens/RoleSelectionScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { TeacherHomeScreen } from './src/screens/TeacherHomeScreen';
import { AttendanceScreen, AttendanceSavedData } from './src/screens/AttendanceScreen';
import { AttendanceResultScreen } from './src/screens/AttendanceResultScreen';
import { GradebookScreen } from './src/screens/GradebookScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { QuizGenScreen } from './src/screens/QuizGenScreen';
import { GameSelectScreen } from './src/screens/GameSelectScreen';
import { WheelScreen } from './src/screens/WheelScreen';
import { ClassManagementScreen } from './src/screens/ClassManagementScreen';
import { MyClassesScreen } from './src/screens/MyClassesScreen';
import { ParentHomeScreen } from './src/screens/ParentHomeScreen';
import { ParentAcademicScreen } from './src/screens/ParentAcademicScreen';
import { ParentFeesScreen } from './src/screens/ParentFeesScreen';
import { ParentProfileScreen } from './src/screens/ParentProfileScreen';
import { ParentJoinCodeScreen } from './src/screens/ParentJoinCodeScreen';
import { ParentNotificationScreen } from './src/screens/ParentNotificationScreen';
import { FeesInsuranceScreen } from './src/screens/FeesInsuranceScreen';
import { RemarksExamScreen } from './src/screens/RemarksExamScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { fcmService } from './src/services/fcm.service';
import { authService } from './src/services/auth.service';

type ScreenKey =
  | 'parent_home'
  | 'parent_academic'
  | 'parent_fees'
  | 'parent_profile'
  | 'parent_join_code'
  | 'parent_notifications'
  | 'my_classes'
  | 'remarks_exam'
  | 'fees_insurance'
  | 'class_mgmt'
  | 'wheel'
  | 'teacher_home'
  | 'teacher_home_empty'
  | 'notifications'
  | 'attendance'
  | 'attendance_result'
  | 'gradebook'
  | 'profile'
  | 'quiz_gen'
  | 'game_select'
  | 'onboarding'
  | 'login'
  | 'role'
  | 'register'
  | 'showcase';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>('login');
  const [currentClassId, setCurrentClassId] = useState<string>('cls_1a_2026');
  const [currentStudentId, setCurrentStudentId] = useState<string>('stu_02');
  const [remarksInitialTab, setRemarksInitialTab] = useState<'REMARKS' | 'EXAMS'>('REMARKS');
  const [selectedRole, setSelectedRole] = useState<'TEACHER' | 'PARENT'>('TEACHER');
  const [attendanceData, setAttendanceData] = useState<AttendanceSavedData | undefined>(undefined);
  const { width } = useWindowDimensions();

  // Kiểm tra phiên đăng nhập hợp lệ khi khởi động app
  useEffect(() => {
    const token = authService.getToken();
    const user = authService.getUser();
    if (token && user) {
      const isParent = user.role === 'PARENT';
      setCurrentScreen(isParent ? 'parent_home' : 'teacher_home');
    } else {
      setCurrentScreen('login');
    }
  }, []);

  // Tự động nhúng font Plus Jakarta Sans & Be Vietnam Pro chuẩn Stitch AI khi chạy trên Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const linkId = 'stitch-custom-fonts';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.textContent = `
          * {
            font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
    fcmService.initFCM().catch(() => null);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Top Floating Control Bar to switch between screens or view showcase */}
      <SafeAreaView style={styles.controlHeaderArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'login' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('login')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'login' && styles.tabTextActive,
              ]}
            >
              🔑 Đăng Nhập
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'register' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('register')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'register' && styles.tabTextActive,
              ]}
            >
              📝 Đăng Ký
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'parent_home' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('parent_home')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'parent_home' && styles.tabTextActive,
              ]}
            >
              ★ PAR-01 (Trang Chủ PH)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'parent_academic' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('parent_academic')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'parent_academic' && styles.tabTextActive,
              ]}
            >
              ★ PAR-02 (Học Tập Con)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'parent_fees' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('parent_fees')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'parent_fees' && styles.tabTextActive,
              ]}
            >
              ★ PAR-03 (Thu Phí PH)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'parent_profile' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('parent_profile')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'parent_profile' && styles.tabTextActive,
              ]}
            >
              ★ PAR-05 (Cá Nhân PH)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'parent_join_code' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('parent_join_code')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'parent_join_code' && styles.tabTextActive,
              ]}
            >
              ★ PAR-00 (Mã Mời PH)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'parent_notifications' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('parent_notifications')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'parent_notifications' && styles.tabTextActive,
              ]}
            >
              ★ PAR-04 (Thông Báo PH)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'remarks_exam' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('remarks_exam')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'remarks_exam' && styles.tabTextActive,
              ]}
            >
              ★ TEA-09 (Nhận xét & Thi)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'fees_insurance' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('fees_insurance')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'fees_insurance' && styles.tabTextActive,
              ]}
            >
              ★ TEA-07 (Học phí & BHYT)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'my_classes' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('my_classes')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'my_classes' && styles.tabTextActive,
              ]}
            >
              ★ TEA-11 (Lớp Của Tôi)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'class_mgmt' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('class_mgmt')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'class_mgmt' && styles.tabTextActive,
              ]}
            >
              ★ TEA-08 (Chi tiết lớp)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'wheel' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('wheel')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'wheel' && styles.tabTextActive,
              ]}
            >
              ★ TEA-03b (Vòng quay)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'teacher_home' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('teacher_home')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'teacher_home' && styles.tabTextActive,
              ]}
            >
              TEA-01 (Home)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'teacher_home_empty' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('teacher_home_empty')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'teacher_home_empty' && styles.tabTextActive,
              ]}
            >
              ★ TEA-01.empty (Chưa lớp)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'notifications' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('notifications')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'notifications' && styles.tabTextActive,
              ]}
            >
              ★ TEA-12 (Thông Báo)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'attendance' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('attendance')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'attendance' && styles.tabTextActive,
              ]}
            >
              TEA-02 (Điểm danh)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'attendance_result' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('attendance_result')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'attendance_result' && styles.tabTextActive,
              ]}
            >
              ★ TEA-02b (Kết quả)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'gradebook' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('gradebook')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'gradebook' && styles.tabTextActive,
              ]}
            >
              ★ TEA-06 (Sổ điểm)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'profile' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('profile')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'profile' && styles.tabTextActive,
              ]}
            >
              ★ TEA-03 (Cá nhân)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'quiz_gen' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('quiz_gen')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'quiz_gen' && styles.tabTextActive,
              ]}
            >
              ★ TEA-04 (Tạo đề AI)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'game_select' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('game_select')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'game_select' && styles.tabTextActive,
              ]}
            >
              ★ TEA-05 (Chọn Game)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'onboarding' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('onboarding')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'onboarding' && styles.tabTextActive,
              ]}
            >
              Onboarding
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'login' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('login')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'login' && styles.tabTextActive,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'role' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('role')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'role' && styles.tabTextActive,
              ]}
            >
              Role
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'register' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('register')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'register' && styles.tabTextActive,
              ]}
            >
              Register
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentScreen === 'showcase' && styles.tabItemActive]}
            onPress={() => setCurrentScreen('showcase')}
          >
            <Text
              style={[
                styles.tabText,
                currentScreen === 'showcase' && styles.tabTextActive,
              ]}
            >
              Showcase All
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Main Screen Viewport */}
      {currentScreen === 'showcase' ? (
        <ScrollView
          horizontal
          contentContainerStyle={styles.showcaseContainer}
          showsHorizontalScrollIndicator={false}
        >
          {/* Screen: Parent Home (PAR-01 Trang chủ Phụ Huynh) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <ParentHomeScreen
              onOpenNotifications={() => setCurrentScreen('parent_notifications')}
              onNavigateToTab={(tabKey) => {
                if (tabKey === 'academic') setCurrentScreen('parent_academic');
                if (tabKey === 'fees') setCurrentScreen('parent_fees');
                if (tabKey === 'profile') setCurrentScreen('parent_profile');
              }}
              onNavigateToAcademic={() => setCurrentScreen('parent_academic')}
              onNavigateToAddChild={() => setCurrentScreen('parent_join_code')}
              onLogout={() => setCurrentScreen('login')}
            />
          </View>

          {/* Screen: Parent Academic (PAR-02 Học tập con) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <ParentAcademicScreen
              studentId="stu_02"
              studentName="Trần Bảo Nam"
              className="1A"
              onBackToHome={() => setCurrentScreen('parent_home')}
              onNavigateToTab={(tabKey) => {
                if (tabKey === 'home') setCurrentScreen('parent_home');
                if (tabKey === 'academic') setCurrentScreen('parent_academic');
                if (tabKey === 'fees') setCurrentScreen('parent_fees');
                if (tabKey === 'profile') setCurrentScreen('parent_profile');
              }}
              onOpenNotifications={() => setCurrentScreen('parent_notifications')}
            />
          </View>

          {/* Screen: Parent Fees (PAR-03 Thu Phí) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <ParentFeesScreen
              studentId="stu_02"
              studentName="Trần Bảo Nam"
              className="1A"
              onBackToHome={() => setCurrentScreen('parent_home')}
              onNavigateToTab={(tabKey) => {
                if (tabKey === 'home') setCurrentScreen('parent_home');
                if (tabKey === 'academic') setCurrentScreen('parent_academic');
                if (tabKey === 'fees') setCurrentScreen('parent_fees');
                if (tabKey === 'profile') setCurrentScreen('parent_profile');
              }}
            />
          </View>

          {/* Screen: Parent Profile (PAR-05 Cá Nhân Phụ Huynh) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <ParentProfileScreen
              onBackToHome={() => setCurrentScreen('parent_home')}
              onNavigateToTab={(tabKey) => {
                if (tabKey === 'home') setCurrentScreen('parent_home');
                if (tabKey === 'academic') setCurrentScreen('parent_academic');
                if (tabKey === 'fees') setCurrentScreen('parent_fees');
                if (tabKey === 'profile') setCurrentScreen('parent_profile');
              }}
              onNavigateToAddChild={() => setCurrentScreen('parent_join_code')}
              onLogout={() => setCurrentScreen('login')}
            />
          </View>

          {/* Screen: Parent Join Code (PAR-00 Nhập Mã Mời) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <ParentJoinCodeScreen
              onBack={() => setCurrentScreen('parent_home')}
              onJoinSuccess={() => setCurrentScreen('parent_home')}
            />
          </View>

          {/* Screen: Parent Notifications (PAR-04 Thông Báo Phụ Huynh) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <ParentNotificationScreen
              onBack={() => setCurrentScreen('parent_home')}
            />
          </View>

          {/* Screen 1: Teacher Home (TEA-01) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <TeacherHomeScreen
              currentClassId={currentClassId}
              onSelectClass={(clsId) => setCurrentClassId(clsId)}
              onEnterClassroom={() => setCurrentScreen('attendance')}
              onOpenAIQuiz={() => setCurrentScreen('quiz_gen')}
              onOpenWheel={() => setCurrentScreen('wheel')}
              onManageClass={() => setCurrentScreen('my_classes')}
              onOpenHealthInsurance={() => setCurrentScreen('fees_insurance')}
              onOpenRemarksExam={(tab) => {
                if (tab) setRemarksInitialTab(tab);
                setCurrentScreen('remarks_exam');
              }}
              onOpenNotifications={() => setCurrentScreen('notifications')}
              onTabChange={(tab) => {
                if (tab === 'attendance') setCurrentScreen('attendance');
                if (tab === 'gradebook') setCurrentScreen('gradebook');
                if (tab === 'profile') setCurrentScreen('profile');
              }}
            />
          </View>

          {/* Screen: Teacher Home Empty State (TEA-01.empty Chưa có lớp) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <TeacherHomeScreen
              hasNoClass={true}
              currentClassId="cls_empty"
              onSelectClass={(clsId) => setCurrentClassId(clsId)}
              onOpenNotifications={() => setCurrentScreen('notifications')}
            />
          </View>

          {/* Screen: Notifications (TEA-12 Thông Báo) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <NotificationScreen
              onBack={() => setCurrentScreen('teacher_home')}
            />
          </View>

          {/* Screen: Remarks & Exam Reminders (TEA-09 Nhận xét & Lịch kiểm tra) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <RemarksExamScreen
              initialTab={remarksInitialTab}
              onBack={() => setCurrentScreen('teacher_home')}
            />
          </View>

          {/* Screen: Fees & Health Insurance (TEA-07 Học phí & BHYT) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <FeesInsuranceScreen
              onBack={() => setCurrentScreen('teacher_home')}
            />
          </View>

          {/* Screen: My Classes (TEA-11 Lớp Của Tôi) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <MyClassesScreen
              onBack={() => setCurrentScreen('teacher_home')}
              onSelectClass={(clsId) => {
                setCurrentClassId(clsId);
                setCurrentScreen('class_mgmt');
              }}
            />
          </View>

          {/* Screen: Class Management (TEA-08 Chi tiết lớp học) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <ClassManagementScreen
              classId={currentClassId}
              onBack={() => setCurrentScreen('my_classes')}
            />
          </View>

          {/* Screen: Wheel & Score (TEA-03/TEA-05 Vòng quay dò bài) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <WheelScreen
              onBack={() => setCurrentScreen('game_select')}
              onGoHome={() => setCurrentScreen('teacher_home')}
            />
          </View>

          {/* Screen: Quiz Generator by AI (TEA-04) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <QuizGenScreen
              onBack={() => setCurrentScreen('teacher_home')}
              onSaveAndPlay={() => setCurrentScreen('game_select')}
            />
          </View>

          {/* Screen: Game Select (TEA-05) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <GameSelectScreen
              onBack={() => setCurrentScreen('quiz_gen')}
              onStartGame={() => setCurrentScreen('wheel')}
            />
          </View>

          {/* Screen: Gradebook & Honor (TEA-06) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <GradebookScreen
              currentClassId={currentClassId}
              onBackToHome={() => setCurrentScreen('teacher_home')}
              onTabChange={(tab) => {
                if (tab === 'schedule') setCurrentScreen('teacher_home');
                if (tab === 'attendance') setCurrentScreen('attendance');
                if (tab === 'gradebook') setCurrentScreen('gradebook');
                if (tab === 'profile') setCurrentScreen('profile');
              }}
            />
          </View>

          {/* Screen: Profile (TEA-03) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <ProfileScreen
              onBackToHome={() => setCurrentScreen('teacher_home')}
              onTabChange={(tab) => {
                if (tab === 'schedule') setCurrentScreen('teacher_home');
                if (tab === 'attendance') setCurrentScreen('attendance');
                if (tab === 'gradebook') setCurrentScreen('gradebook');
                if (tab === 'profile') setCurrentScreen('profile');
              }}
              onLogout={() => setCurrentScreen('login')}
              onNavigateToMyClasses={() => setCurrentScreen('my_classes')}
            />
          </View>

          {/* Screen 2: Attendance (TEA-02) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <AttendanceScreen
              onBack={() => setCurrentScreen('teacher_home')}
              onSaveSuccess={(data) => {
                setAttendanceData(data);
                setCurrentScreen('attendance_result');
              }}
            />
          </View>

          {/* Screen 3: Attendance Result (TEA-02b) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <AttendanceResultScreen
              savedData={attendanceData}
              onGoHome={() => setCurrentScreen('teacher_home')}
              onEditAttendance={() => setCurrentScreen('attendance')}
            />
          </View>

          {/* Screen 4 Frame: Onboarding */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <OnboardingScreen onNavigateToLogin={() => setCurrentScreen('login')} />
          </View>

          {/* Screen 5 Frame: Login */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <LoginScreen
              onLoginSuccess={() => setCurrentScreen('teacher_home')}
              onNavigateToSignup={() => setCurrentScreen('role')}
            />
          </View>

          {/* Screen 6 Frame: Role Selection */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <RoleSelectionScreen
              onBack={() => setCurrentScreen('login')}
              onContinue={(role) => {
                setSelectedRole(role);
                setCurrentScreen('register');
              }}
            />
          </View>

          {/* Screen 7 Frame: Register */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <RegisterScreen
              initialRole={selectedRole}
              onBack={() => setCurrentScreen('role')}
              onNavigateToLogin={() => setCurrentScreen('login')}
              onRegisterSuccess={() => setCurrentScreen('teacher_home')}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.singleScreenWrap}>
          <View style={styles.phoneFrame}>
            {currentScreen === 'parent_home' && (
              <ParentHomeScreen
                selectedChildId={currentStudentId}
                onSelectChild={(id) => setCurrentStudentId(id)}
                onOpenNotifications={() => setCurrentScreen('parent_notifications')}
                onNavigateToTab={(tabKey) => {
                  if (tabKey === 'academic') setCurrentScreen('parent_academic');
                  if (tabKey === 'fees') setCurrentScreen('parent_fees');
                  if (tabKey === 'profile') setCurrentScreen('parent_profile');
                }}
                onNavigateToAcademic={() => setCurrentScreen('parent_academic')}
                onNavigateToAddChild={() => setCurrentScreen('parent_join_code')}
                onLogout={() => setCurrentScreen('login')}
              />
            )}
            {currentScreen === 'parent_academic' && (
              <ParentAcademicScreen
                studentId={currentStudentId}
                studentName="Trần Bảo Nam"
                className="1A"
                onBackToHome={() => setCurrentScreen('parent_home')}
                onNavigateToTab={(tabKey) => {
                  if (tabKey === 'home') setCurrentScreen('parent_home');
                  if (tabKey === 'academic') setCurrentScreen('parent_academic');
                  if (tabKey === 'fees') setCurrentScreen('parent_fees');
                  if (tabKey === 'profile') setCurrentScreen('parent_profile');
                }}
                onOpenNotifications={() => setCurrentScreen('parent_notifications')}
              />
            )}
            {currentScreen === 'parent_fees' && (
              <ParentFeesScreen
                studentId={currentStudentId}
                studentName="Trần Bảo Nam"
                className="1A"
                onBackToHome={() => setCurrentScreen('parent_home')}
                onNavigateToTab={(tabKey) => {
                  if (tabKey === 'home') setCurrentScreen('parent_home');
                  if (tabKey === 'academic') setCurrentScreen('parent_academic');
                  if (tabKey === 'fees') setCurrentScreen('parent_fees');
                  if (tabKey === 'profile') setCurrentScreen('parent_profile');
                }}
              />
            )}
            {currentScreen === 'parent_profile' && (
              <ParentProfileScreen
                onBackToHome={() => setCurrentScreen('parent_home')}
                onNavigateToTab={(tabKey) => {
                  if (tabKey === 'home') setCurrentScreen('parent_home');
                  if (tabKey === 'academic') setCurrentScreen('parent_academic');
                  if (tabKey === 'fees') setCurrentScreen('parent_fees');
                  if (tabKey === 'profile') setCurrentScreen('parent_profile');
                }}
                onNavigateToAddChild={() => setCurrentScreen('parent_join_code')}
                onLogout={() => setCurrentScreen('login')}
              />
            )}
            {currentScreen === 'parent_join_code' && (
              <ParentJoinCodeScreen
                onBack={() => setCurrentScreen('parent_home')}
                onJoinSuccess={() => setCurrentScreen('parent_home')}
              />
            )}
            {currentScreen === 'parent_notifications' && (
              <ParentNotificationScreen
                onBack={() => setCurrentScreen('parent_home')}
              />
            )}
            {currentScreen === 'remarks_exam' && (
              <RemarksExamScreen
                classId={currentClassId}
                initialTab={remarksInitialTab}
                onBack={() => setCurrentScreen('teacher_home')}
              />
            )}
            {currentScreen === 'fees_insurance' && (
              <FeesInsuranceScreen
                classId={currentClassId}
                onBack={() => setCurrentScreen('teacher_home')}
              />
            )}
            {currentScreen === 'my_classes' && (
              <MyClassesScreen
                onBack={() => setCurrentScreen('teacher_home')}
                onSelectClass={(clsId) => {
                  setCurrentClassId(clsId);
                  setCurrentScreen('class_mgmt');
                }}
              />
            )}
            {currentScreen === 'class_mgmt' && (
              <ClassManagementScreen
                classId={currentClassId}
                onBack={() => setCurrentScreen('my_classes')}
              />
            )}
            {currentScreen === 'wheel' && (
              <WheelScreen
                currentClassId={currentClassId}
                className={currentClassId === 'cls_6a2' ? 'Lớp 6A2' : currentClassId === 'cls_6a3' ? 'Lớp 6A3' : 'Lớp 6A1'}
                subjectName={currentClassId === 'cls_6a2' ? 'Toán Đại' : currentClassId === 'cls_6a3' ? 'Tin Học' : 'Toán Hình'}
                onBack={() => setCurrentScreen('teacher_home')}
                onGoHome={() => setCurrentScreen('teacher_home')}
              />
            )}
            {currentScreen === 'teacher_home' && (
              <TeacherHomeScreen
                currentClassId={currentClassId}
                onSelectClass={(clsId) => setCurrentClassId(clsId)}
                onEnterClassroom={() => setCurrentScreen('attendance')}
                onOpenAIQuiz={() => setCurrentScreen('quiz_gen')}
                onOpenWheel={() => setCurrentScreen('wheel')}
                onManageClass={() => setCurrentScreen('my_classes')}
                onOpenHealthInsurance={() => setCurrentScreen('fees_insurance')}
                onOpenRemarksExam={(tab) => {
                  if (tab) setRemarksInitialTab(tab);
                  setCurrentScreen('remarks_exam');
                }}
                onOpenNotifications={() => setCurrentScreen('notifications')}
                onTabChange={(tab) => {
                  if (tab === 'attendance') setCurrentScreen('attendance');
                  if (tab === 'gradebook') setCurrentScreen('gradebook');
                  if (tab === 'profile') setCurrentScreen('profile');
                }}
              />
            )}
            {currentScreen === 'teacher_home_empty' && (
              <TeacherHomeScreen
                hasNoClass={true}
                currentClassId="cls_empty"
                onSelectClass={(clsId) => {
                  setCurrentClassId(clsId);
                  setCurrentScreen('teacher_home');
                }}
                onEnterClassroom={() => setCurrentScreen('attendance')}
                onOpenAIQuiz={() => setCurrentScreen('quiz_gen')}
                onOpenWheel={() => setCurrentScreen('wheel')}
                onManageClass={() => setCurrentScreen('my_classes')}
                onOpenHealthInsurance={() => setCurrentScreen('fees_insurance')}
                onOpenRemarksExam={(tab) => {
                  if (tab) setRemarksInitialTab(tab);
                  setCurrentScreen('remarks_exam');
                }}
                onOpenNotifications={() => setCurrentScreen('notifications')}
                onTabChange={(tab) => {
                  if (tab === 'attendance') setCurrentScreen('attendance');
                  if (tab === 'gradebook') setCurrentScreen('gradebook');
                  if (tab === 'profile') setCurrentScreen('profile');
                }}
              />
            )}
            {currentScreen === 'notifications' && (
              <NotificationScreen
                onBack={() => setCurrentScreen('teacher_home')}
              />
            )}
            {currentScreen === 'quiz_gen' && (
              <QuizGenScreen
                onBack={() => setCurrentScreen('teacher_home')}
                onSaveAndPlay={() => setCurrentScreen('game_select')}
              />
            )}
            {currentScreen === 'game_select' && (
              <GameSelectScreen
                onBack={() => setCurrentScreen('quiz_gen')}
                onStartGame={() => setCurrentScreen('wheel')}
              />
            )}
            {currentScreen === 'attendance' && (
              <AttendanceScreen
                classId={currentClassId}
                className={currentClassId === 'cls_6a2' ? 'Lớp 6A2' : currentClassId === 'cls_6a3' ? 'Lớp 6A3' : 'Lớp 6A1'}
                onBack={() => setCurrentScreen('teacher_home')}
                onSaveSuccess={(data) => {
                  setAttendanceData(data);
                  setCurrentScreen('attendance_result');
                }}
              />
            )}
            {currentScreen === 'attendance_result' && (
              <AttendanceResultScreen
                savedData={attendanceData}
                onGoHome={() => setCurrentScreen('teacher_home')}
                onEditAttendance={() => setCurrentScreen('attendance')}
              />
            )}
            {currentScreen === 'gradebook' && (
              <GradebookScreen
                currentClassId={currentClassId}
                onBackToHome={() => setCurrentScreen('teacher_home')}
                onTabChange={(tab) => {
                  if (tab === 'schedule') setCurrentScreen('teacher_home');
                  if (tab === 'attendance') setCurrentScreen('attendance');
                  if (tab === 'gradebook') setCurrentScreen('gradebook');
                  if (tab === 'profile') setCurrentScreen('profile');
                }}
              />
            )}
            {currentScreen === 'profile' && (
              <ProfileScreen
                onBackToHome={() => setCurrentScreen('teacher_home')}
                onTabChange={(tab) => {
                  if (tab === 'schedule') setCurrentScreen('teacher_home');
                  if (tab === 'attendance') setCurrentScreen('attendance');
                  if (tab === 'gradebook') setCurrentScreen('gradebook');
                  if (tab === 'profile') setCurrentScreen('profile');
                }}
                onLogout={() => setCurrentScreen('login')}
                onNavigateToRegister={() => setCurrentScreen('role')}
                onNavigateToMyClasses={() => setCurrentScreen('my_classes')}
              />
            )}
            {currentScreen === 'onboarding' && (
              <OnboardingScreen onNavigateToLogin={() => setCurrentScreen('login')} />
            )}
            {currentScreen === 'login' && (
              <LoginScreen
                onLoginSuccess={(user) => {
                  const isParent = user?.role === 'PARENT' || selectedRole === 'PARENT';
                  setCurrentScreen(isParent ? 'parent_home' : 'teacher_home');
                }}
                onNavigateToSignup={() => setCurrentScreen('role')}
              />
            )}
            {currentScreen === 'role' && (
              <RoleSelectionScreen
                onBack={() => setCurrentScreen('login')}
                onContinue={(role) => {
                  setSelectedRole(role);
                  setCurrentScreen('register');
                }}
              />
            )}
            {currentScreen === 'register' && (
              <RegisterScreen
                initialRole={selectedRole}
                onBack={() => setCurrentScreen('role')}
                onNavigateToLogin={() => setCurrentScreen('login')}
                onRegisterSuccess={(user) => {
                  const isParent = user?.role === 'PARENT' || selectedRole === 'PARENT';
                  setCurrentScreen(isParent ? 'parent_home' : 'teacher_home');
                }}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EAE6FA', // Soft ambient pastel purple/cream canvas gradient backdrop
  },
  controlHeaderArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.12)',
    zIndex: 100,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F0FC',
  },
  tabItemActive: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  singleScreenWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  showcaseContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 28,
  },
  phoneFrame: {
    width: 390,
    minWidth: 360,
    maxWidth: '100%',
    height: 844,
    maxHeight: '100%',
    backgroundColor: '#FAF8FF',
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#3B1875',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  phoneFrameMobile: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  phoneNotch: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -45,
    width: 90,
    height: 20,
    backgroundColor: '#1E1B2E',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 999,
  },
});
