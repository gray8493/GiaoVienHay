import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Platform,
  Alert,
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
import { classService } from './src/services/class.service';
import { parentService } from './src/services/parent.service';

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
  const [currentClassId, setCurrentClassId] = useState<string>('cls_empty');
  const [currentClassName, setCurrentClassName] = useState<string>('Chưa có lớp');
  const [currentSubjectName, setCurrentSubjectName] = useState<string>('');
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [currentStudentName, setCurrentStudentName] = useState<string>('');
  const [currentStudentClass, setCurrentStudentClass] = useState<string>('');
  const [remarksInitialTab, setRemarksInitialTab] = useState<'REMARKS' | 'EXAMS'>('REMARKS');
  const [selectedRole, setSelectedRole] = useState<'TEACHER' | 'PARENT'>('TEACHER');
  const [attendanceData, setAttendanceData] = useState<AttendanceSavedData | undefined>(undefined);
  const { width } = useWindowDimensions();

  const handleTeacherTabChange = (tab: 'schedule' | 'attendance' | 'gradebook' | 'profile') => {
    if ((tab === 'attendance' || tab === 'gradebook') && (currentClassId === 'cls_empty' || !currentClassId)) {
      Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
      return;
    }
    if (tab === 'schedule') {
      setCurrentScreen(currentClassId === 'cls_empty' ? 'teacher_home_empty' : 'teacher_home');
    } else if (tab === 'attendance') {
      setCurrentScreen('attendance');
    } else if (tab === 'gradebook') {
      setCurrentScreen('gradebook');
    } else if (tab === 'profile') {
      setCurrentScreen('profile');
    }
  };

  // Kiểm tra phiên đăng nhập hợp lệ khi khởi động app
  useEffect(() => {
    const token = authService.getToken();
    const user = authService.getUser();
    if (token && user) {
      const isParent = user.role === 'PARENT';
      if (isParent) {
        parentService.getLinkedChildren().then((children) => {
          if (children && children.length > 0) {
            setCurrentStudentId(children[0].id);
            setCurrentStudentName(children[0].full_name);
            setCurrentStudentClass(children[0].class_name);
          } else {
            setCurrentStudentId('');
            setCurrentStudentName('');
            setCurrentStudentClass('');
          }
        });
        setCurrentScreen('parent_home');
      } else {
        classService
          .getMyClasses()
          .then((clsList) => {
            if (clsList && clsList.length > 0) {
              setCurrentClassId(clsList[0].id);
              setCurrentClassName(clsList[0].name || 'Lớp học');
              setCurrentScreen('teacher_home');
            } else {
              setCurrentClassId('cls_empty');
              setCurrentClassName('Chưa có lớp');
              setCurrentScreen('teacher_home_empty');
            }
          })
          .catch(() => {
            setCurrentClassId('cls_empty');
            setCurrentClassName('Chưa có lớp');
            setCurrentScreen('teacher_home_empty');
          });
      }
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
              selectedChildId={currentStudentId}
              onSelectChild={(id, name, cls) => {
                setCurrentStudentId(id);
                if (name) setCurrentStudentName(name);
                if (cls) setCurrentStudentClass(cls);
              }}
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
              studentId={currentStudentId}
              studentName={currentStudentName}
              className={currentStudentClass}
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
              studentId={currentStudentId}
              studentName={currentStudentName}
              className={currentStudentClass}
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
              currentClassName={currentClassName}
              onSelectClass={(clsId, clsName, subjectName) => {
                setCurrentClassId(clsId);
                if (clsName) setCurrentClassName(clsName);
                setCurrentSubjectName(subjectName || '');
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
              classId={currentClassId}
              className={currentClassName}
              initialTab={remarksInitialTab}
              onBack={() => setCurrentScreen('teacher_home')}
            />
          </View>

          {/* Screen: Fees & Health Insurance (TEA-07 Học phí & BHYT) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <FeesInsuranceScreen
              classId={currentClassId}
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
              currentClassId={currentClassId}
              className={currentClassName}
              subjectName={currentSubjectName}
              onBack={() => setCurrentScreen('game_select')}
              onGoHome={() => setCurrentScreen('teacher_home')}
            />
          </View>

          {/* Screen: Quiz Generator by AI (TEA-04) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <QuizGenScreen
              classId={currentClassId}
              className={currentClassName}
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
              onBackToHome={() => setCurrentScreen(currentClassId === 'cls_empty' ? 'teacher_home_empty' : 'teacher_home')}
              onTabChange={handleTeacherTabChange}
            />
          </View>

          {/* Screen: Profile (TEA-03) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <ProfileScreen
              onBackToHome={() => setCurrentScreen(currentClassId === 'cls_empty' ? 'teacher_home_empty' : 'teacher_home')}
              onTabChange={handleTeacherTabChange}
              onLogout={() => setCurrentScreen('login')}
              onNavigateToRegister={() => setCurrentScreen('role')}
              onNavigateToMyClasses={() => setCurrentScreen('my_classes')}
            />
          </View>

          {/* Screen 2: Attendance (TEA-02) */}
          <View style={styles.phoneFrame}>
            <View style={styles.phoneNotch} />
            <AttendanceScreen
              classId={currentClassId}
              className={currentClassName}
              onBack={() => setCurrentScreen('teacher_home')}
              onTabChange={handleTeacherTabChange}
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
              onLoginSuccess={(user) => {
                const isParent = user?.role === 'PARENT' || selectedRole === 'PARENT';
                if (isParent) {
                  parentService.getLinkedChildren().then((children) => {
                    if (children && children.length > 0) {
                      setCurrentStudentId(children[0].id);
                      setCurrentStudentName(children[0].full_name);
                      setCurrentStudentClass(children[0].class_name);
                    } else {
                      setCurrentStudentId('');
                      setCurrentStudentName('');
                      setCurrentStudentClass('');
                    }
                  });
                  setCurrentScreen('parent_home');
                } else {
                  classService
                    .getMyClasses()
                    .then((clsList) => {
                      if (clsList && clsList.length > 0) {
                        setCurrentClassId(clsList[0].id);
                        setCurrentClassName(clsList[0].name || 'Lớp học');
                        setCurrentScreen('teacher_home');
                      } else {
                        setCurrentClassId('cls_empty');
                        setCurrentClassName('Chưa có lớp');
                        setCurrentScreen('teacher_home_empty');
                      }
                    })
                    .catch(() => {
                      setCurrentClassId('cls_empty');
                      setCurrentClassName('Chưa có lớp');
                      setCurrentScreen('teacher_home_empty');
                    });
                }
              }}
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
              onRegisterSuccess={(user) => {
                const isParent = user?.role === 'PARENT' || selectedRole === 'PARENT';
                if (isParent) {
                  setCurrentStudentId('');
                  setCurrentStudentName('');
                  setCurrentStudentClass('');
                  setCurrentScreen('parent_home');
                } else {
                  setCurrentClassId('cls_empty');
                  setCurrentClassName('Chưa có lớp');
                  setCurrentScreen('teacher_home_empty');
                }
              }}
            />
          </View>
        </ScrollView>
      ) : (
        <View
          style={[
            styles.singleScreenWrap,
            Platform.OS !== 'web' && styles.singleScreenWrapMobile,
          ]}
        >
          <View style={[styles.phoneFrame, Platform.OS !== 'web' && styles.phoneFrameMobile]}>
            {currentScreen === 'parent_home' && (
              <ParentHomeScreen
                selectedChildId={currentStudentId}
                onSelectChild={(id, name, cls) => {
                  setCurrentStudentId(id);
                  if (name) setCurrentStudentName(name);
                  if (cls) setCurrentStudentClass(cls);
                }}
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
                studentName={currentStudentName}
                className={currentStudentClass}
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
                studentName={currentStudentName}
                className={currentStudentClass}
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
                className={currentClassName}
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
                className={currentClassName}
                subjectName={currentSubjectName}
                onBack={() => setCurrentScreen('teacher_home')}
                onGoHome={() => setCurrentScreen('teacher_home')}
              />
            )}
            {currentScreen === 'teacher_home' && (
              <TeacherHomeScreen
                currentClassId={currentClassId}
                currentClassName={currentClassName}
                hasNoClass={currentClassId === 'cls_empty'}
                onSelectClass={(clsId, clsName, subjectName) => {
                  setCurrentClassId(clsId);
                  if (clsName) setCurrentClassName(clsName);
                  setCurrentSubjectName(subjectName || '');
                }}
                onEnterClassroom={() => {
                  if (currentClassId === 'cls_empty' || !currentClassId) {
                    Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
                    return;
                  }
                  setCurrentScreen('attendance');
                }}
                onOpenAIQuiz={() => setCurrentScreen('quiz_gen')}
                onOpenWheel={() => {
                  if (currentClassId === 'cls_empty' || !currentClassId) {
                    Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
                    return;
                  }
                  setCurrentScreen('wheel');
                }}
                onManageClass={() => setCurrentScreen('my_classes')}
                onOpenHealthInsurance={() => {
                  if (currentClassId === 'cls_empty' || !currentClassId) {
                    Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
                    return;
                  }
                  setCurrentScreen('fees_insurance');
                }}
                onOpenRemarksExam={(tab) => {
                  if (currentClassId === 'cls_empty' || !currentClassId) {
                    Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
                    return;
                  }
                  if (tab) setRemarksInitialTab(tab);
                  setCurrentScreen('remarks_exam');
                }}
                onOpenNotifications={() => setCurrentScreen('notifications')}
                onTabChange={handleTeacherTabChange}
              />
            )}
            {currentScreen === 'teacher_home_empty' && (
              <TeacherHomeScreen
                hasNoClass={true}
                currentClassId="cls_empty"
                onSelectClass={(clsId, clsName, subjectName) => {
                  setCurrentClassId(clsId);
                  if (clsName) setCurrentClassName(clsName);
                  setCurrentSubjectName(subjectName || '');
                  setCurrentScreen('teacher_home');
                }}
                onEnterClassroom={() => {
                  Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
                }}
                onOpenAIQuiz={() => setCurrentScreen('quiz_gen')}
                onOpenWheel={() => {
                  Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
                }}
                onManageClass={() => setCurrentScreen('my_classes')}
                onOpenHealthInsurance={() => {
                  Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
                }}
                onOpenRemarksExam={() => {
                  Alert.alert('Thông báo', 'Vui lòng tạo lớp học trước khi sử dụng tính năng này');
                }}
                onOpenNotifications={() => setCurrentScreen('notifications')}
                onTabChange={handleTeacherTabChange}
              />
            )}
            {currentScreen === 'notifications' && (
              <NotificationScreen
                onBack={() => setCurrentScreen('teacher_home')}
              />
            )}
            {currentScreen === 'quiz_gen' && (
              <QuizGenScreen
                classId={currentClassId}
                className={currentClassName}
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
                className={currentClassName}
                onBack={() => setCurrentScreen('teacher_home')}
                onTabChange={handleTeacherTabChange}
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
                className={currentClassName}
                onBackToHome={() => setCurrentScreen('teacher_home')}
                onTabChange={handleTeacherTabChange}
              />
            )}
            {currentScreen === 'profile' && (
              <ProfileScreen
                onBackToHome={() => setCurrentScreen(currentClassId === 'cls_empty' ? 'teacher_home_empty' : 'teacher_home')}
                onTabChange={handleTeacherTabChange}
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
                  if (isParent) {
                    setCurrentScreen('parent_home');
                  } else {
                    classService
                      .getMyClasses()
                      .then((clsList) => {
                        if (clsList && clsList.length > 0) {
                          setCurrentClassId(clsList[0].id);
                          setCurrentClassName(clsList[0].name || 'Lớp học');
                          setCurrentScreen('teacher_home');
                        } else {
                          setCurrentClassId('cls_empty');
                          setCurrentClassName('Chưa có lớp');
                          setCurrentScreen('teacher_home_empty');
                        }
                      })
                      .catch(() => {
                        setCurrentClassId('cls_empty');
                        setCurrentClassName('Chưa có lớp');
                        setCurrentScreen('teacher_home_empty');
                      });
                  }
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
                  if (isParent) {
                    setCurrentScreen('parent_home');
                  } else {
                    setCurrentClassId('cls_empty');
                    setCurrentClassName('Chưa có lớp');
                    setCurrentScreen('teacher_home_empty');
                  }
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
  singleScreenWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  singleScreenWrapMobile: {
    paddingVertical: 0,
    paddingHorizontal: 0,
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
    minWidth: 0,
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
