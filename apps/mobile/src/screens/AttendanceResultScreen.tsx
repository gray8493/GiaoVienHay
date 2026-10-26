import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Polygon,
  Line,
  G,
  Defs,
  RadialGradient as SvgRadialGradient,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { AttendanceSavedData } from './AttendanceScreen';

interface AttendanceResultScreenProps {
  savedData?: AttendanceSavedData;
  totalCount?: number;
  presentCount?: number;
  absentCount?: number;
  className?: string;
  lessonName?: string;
  lessonTime?: string;
  onGoHome?: () => void;
  onEditAttendance?: () => void;
}

export const AttendanceResultScreen: React.FC<AttendanceResultScreenProps> = ({
  savedData,
  totalCount: propTotal,
  presentCount: propPresent,
  absentCount: propAbsent,
  className: propClass,
  lessonName: propLesson,
  lessonTime: propTime,
  onGoHome,
  onEditAttendance,
}) => {
  const total = savedData?.totalCount ?? propTotal ?? 0;
  const present = savedData?.presentCount ?? propPresent ?? 0;
  const absent = savedData?.absentCount ?? propAbsent ?? 0;
  const currentClassName = savedData?.className ?? propClass ?? 'Lớp học';
  const lesson = savedData?.lessonName ?? propLesson ?? 'Điểm danh đầu ngày';
  const time = savedData?.lessonTime ?? propTime ?? '--:--';

  const absentStudents = savedData?.absentStudents ?? [];
  const notifiedParentsQueued = savedData?.notifiedParentsQueued ?? 0;
  const notifiedMessage =
    absent > 0
      ? notifiedParentsQueued > 0
        ? `Đã gửi thông báo đến ${notifiedParentsQueued} phụ huynh`
        : 'Không có thay đổi — không gửi lại thông báo'
      : notifiedParentsQueued > 0
        ? `Đã cập nhật ${notifiedParentsQueued} phụ huynh về việc đi học lại`
        : 'Cả lớp có mặt đầy đủ (100%)';
  const hasQueuedNotification = notifiedParentsQueued > 0;

  return (
    <View style={styles.container}>
      {/* Background Peach Linear Gradient matching TEA-02b */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Background Elements */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Glow aura */}
        <View style={styles.glowAura} />

        {/* Curved dashed trails */}
        <View style={styles.curvedTrailContainer}>
          <Svg width={390} height={256} viewBox="0 0 390 256" fill="none">
            <Path
              d="M-20 120 C 80 40, 160 160, 240 80 C 300 20, 360 90, 410 70"
              stroke="#FFFFFF"
              strokeWidth={1.8}
              strokeDasharray="5 7"
              opacity={0.5}
            />
            <Path
              d="M-10 210 C 100 170, 220 250, 400 180"
              stroke="#FFFFFF"
              strokeWidth={1.2}
              strokeDasharray="4 6"
              opacity={0.35}
            />
          </Svg>
        </View>

        {/* Sparkle stars */}
        <View style={styles.sparkle1}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="#FDE047">
            <Path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
          </Svg>
        </View>

        <View style={styles.sparkle2}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FBBF24">
            <Path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
          </Svg>
        </View>

        <View style={styles.sparkle3}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
            <Path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
          </Svg>
        </View>

        <View style={styles.sparkle4}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="#FDBA74">
            <Path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
          </Svg>
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= 1. HERO CELEBRATION SECTION ================= */}
          <View style={styles.heroSection}>
            {/* 3D Pastel Illustration: Golden Medal + Paper Plane */}
            <View style={styles.illustrationWrap}>
              <View style={styles.innerGlowBall} />

              <Svg width={180} height={160} viewBox="0 0 180 160" fill="none">
                <Defs>
                  <SvgRadialGradient cx="0.4" cy="0.3" id="badgeGlow" r="0.7">
                    <Stop offset="0%" stopColor="#FFEBB8" />
                    <Stop offset="50%" stopColor="#FFBD59" />
                    <Stop offset="100%" stopColor="#F28E2B" />
                  </SvgRadialGradient>
                  <SvgLinearGradient id="checkCircle" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#34D399" />
                    <Stop offset="100%" stopColor="#059669" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="planeBody" x1="0.2" y1="0" x2="0.8" y2="1">
                    <Stop offset="0%" stopColor="#FFFFFF" />
                    <Stop offset="60%" stopColor="#F4F8FE" />
                    <Stop offset="100%" stopColor="#D7E6FD" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="planeFold" x1="0" x2="1" y1="0" y2="1">
                    <Stop offset="0%" stopColor="#CBDCF9" />
                    <Stop offset="100%" stopColor="#A5C4F7" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="bellGrad" x1="0" x2="1" y1="0" y2="1">
                    <Stop offset="0%" stopColor="#FFDE6A" />
                    <Stop offset="100%" stopColor="#F59E0B" />
                  </SvgLinearGradient>
                </Defs>

                {/* Decorative flight motion dash trail */}
                <Path
                  d="M 46 122 C 60 135, 96 126, 110 98 C 118 80, 126 58, 142 42"
                  stroke="#FFFFFF"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeWidth={2.5}
                />

                {/* Main Golden 3D Award Ribbon Base */}
                <Path d="M68 94 L54 126 L76 116 L88 126 L82 96 Z" fill="#E27822" opacity={0.85} />
                <Path d="M102 92 L118 124 L98 116 L86 124 L90 92 Z" fill="#CA6210" opacity={0.85} />

                {/* Golden 3D Circular Medallion */}
                <Circle cx={85} cy={74} r={42} fill="url(#badgeGlow)" />
                <Circle cx={85} cy={74} r={35} fill="#FFF2D6" opacity={0.6} />

                {/* Inner Success Green Circle with Gloss */}
                <Circle cx={85} cy={74} r={28} fill="url(#checkCircle)" />
                <Ellipse cx={80} cy={56} rx={14} ry={6} fill="#FFFFFF" opacity={0.4} />

                {/* Crisp White Checkmark */}
                <Path
                  d="M74 74 L82 82 L97 65"
                  stroke="#FFFFFF"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Cute Golden Notification School Bell (Left Accent) */}
                <G transform="translate(32, 70) rotate(-15)">
                  <Path
                    d="M12 4 C10 4 6 8 6 13 L4 16 L20 16 L18 13 C18 8 14 4 12 4 Z"
                    fill="url(#bellGrad)"
                  />
                  <Ellipse cx={12} cy={17.5} rx={3} ry={1.5} fill="#D97706" />
                  <Circle cx={12} cy={3} r={2} fill="#FDE68A" />
                </G>

                {/* 3D Paper Airplane Swooshing Upwards */}
                <G transform="translate(98, 22) rotate(12)">
                  <Polygon points="46,6 4,36 28,34" fill="url(#planeBody)" />
                  <Polygon points="46,6 28,34 32,44" fill="url(#planeFold)" />
                  <Polygon points="46,6 32,44 14,35" fill="#E2EDFC" />
                  <Line x1={46} y1={6} x2={4} y2={36} stroke="#FFFFFF" strokeWidth={1.2} opacity={0.8} />
                </G>

                {/* Gloss Sparkles around the plane */}
                <Path d="M152 24 L154 29 L159 31 L154 33 L152 38 L150 33 L145 31 L150 29 Z" fill="#FFFFFF" />
                <Circle cx={140} cy={54} r={2.5} fill="#FFD43F" />
                <Circle cx={40} cy={46} r={2} fill="#FFFFFF" />
              </Svg>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.successTitle}>Đã lưu điểm danh!</Text>
            <Text style={styles.sessionMeta}>
              {currentClassName} • {lesson} • {time}
            </Text>
          </View>

          {/* ================= 2. CONTENT CARDS ================= */}
          <View style={styles.cardsArea}>
            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statsCols}>
                {/* Total */}
                <View style={styles.statCol}>
                  <Text style={styles.statTotalNum}>{total}</Text>
                  <Text style={styles.statTotalLabel}>Sĩ số</Text>
                </View>

                <View style={styles.statDivider} />

                {/* Present */}
                <View style={styles.statCol}>
                  <Text style={styles.statPresentNum}>{present}</Text>
                  <Text style={styles.statPresentLabel}>Có mặt</Text>
                </View>

                <View style={styles.statDivider} />

                {/* Absent */}
                <View style={styles.statCol}>
                  <Text style={styles.statAbsentNum}>{absent}</Text>
                  <Text style={styles.statAbsentLabel}>Vắng</Text>
                </View>
              </View>
            </View>

            {/* Centered Notification Sent Pill matching TEA-02b HTML */}
            <View style={styles.sentPillContainer}>
              <View style={styles.sentPillBox}>
                {hasQueuedNotification || absent === 0 ? (
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5}>
                    <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                ) : (
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.2}>
                    <Circle cx={12} cy={12} r={10} />
                    <Line x1={12} y1={8} x2={12} y2={12} strokeLinecap="round" />
                    <Line x1={12} y1={16} x2={12.01} y2={16} strokeLinecap="round" />
                  </Svg>
                )}
                <Text style={styles.sentPillText}>{notifiedMessage}</Text>
              </View>
            </View>

            {/* Detail Absent Card if absent > 0 */}
            {absent > 0 && absentStudents.length > 0 && (
              <View style={styles.notiCard}>
                <View style={styles.notiCardHeader}>
                  <Text style={styles.notiCardTitle}>Học sinh vắng mặt</Text>
                  <View style={styles.sentPillBadge}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2.5}>
                      <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.sentPillBadgeText}>
                      {hasQueuedNotification ? `${notifiedParentsQueued} đã gửi` : 'Không gửi mới'}
                    </Text>
                  </View>
                </View>

                {absentStudents.map((st, idx) => (
                  <React.Fragment key={st.id || idx}>
                    {idx > 0 && <View style={styles.rowDivider} />}
                    <View style={styles.studentNotiRow}>
                      <View style={styles.studentInfoLeft}>
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarText}>{st.initials}</Text>
                        </View>
                        <View style={styles.studentTextWrap}>
                          <View style={styles.nameBadgeRow}>
                            <Text style={styles.studentName} numberOfLines={1}>{st.name}</Text>
                            <View style={st.excused ? styles.excusedPill : styles.unexcusedPill}>
                              <Text style={st.excused ? styles.excusedPillText : styles.unexcusedPillText}>
                                {st.excused ? 'Có phép' : 'Không phép'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.studentSubtitle} numberOfLines={1}>
                            {st.code} • {st.reason || (st.excused ? 'Có phép' : 'Chưa có phép')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>

          {/* ================= 3. BOTTOM ACTION BUTTONS ================= */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.btnPrimaryHome}
              onPress={onGoHome}
              activeOpacity={0.88}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
                <Path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.btnPrimaryHomeText}>Về Trang Chủ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondaryEdit}
              onPress={onEditAttendance}
              activeOpacity={0.85}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.2}>
                <Path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.btnSecondaryEditText}>Sửa Điểm Danh</Text>
            </TouchableOpacity>

            <View style={styles.homeIndicatorBar} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE3C8',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },

  /* Decorative Background Elements */
  glowAura: {
    position: 'absolute',
    top: 60,
    left: '50%',
    marginLeft: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  curvedTrailContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
  },
  sparkle1: {
    position: 'absolute',
    top: 48,
    left: 36,
  },
  sparkle2: {
    position: 'absolute',
    top: 100,
    right: 28,
  },
  sparkle3: {
    position: 'absolute',
    top: 170,
    left: 26,
  },
  sparkle4: {
    position: 'absolute',
    top: 256,
    right: 44,
  },

  /* 1. Hero Celebration Section */
  heroSection: {
    alignItems: 'center',
    marginTop: 2,
  },
  illustrationWrap: {
    width: 180,
    height: 155,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerGlowBall: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(253, 230, 138, 0.5)',
  },
  successTitle: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.4,
    marginTop: 2,
    textAlign: 'center',
  },
  sessionMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#6B6880',
    marginTop: 3,
    textAlign: 'center',
  },

  /* 2. Content Cards */
  cardsArea: {
    gap: 10,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FFE3C8',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  statsCols: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#FFEDD5',
  },
  statTotalNum: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  statTotalLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: '#6B6880',
    marginTop: 2,
  },
  statPresentNum: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: '#10B981',
  },
  statPresentLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 2,
  },
  statAbsentNum: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: '#EF4444',
  },
  statAbsentLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 2,
  },

  /* Centered Notification Sent Pill */
  sentPillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  sentPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#FFE3C8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  sentPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E1B2E',
  },

  /* Notification Sent Card */
  notiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE3C8',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  notiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF7ED',
  },
  notiCardTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  sentPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F9F0',
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  sentPillBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  studentNotiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  studentInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF1E6',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B6880',
  },
  studentTextWrap: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentName: {
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  excusedPill: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 999,
  },
  excusedPillText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: '#F58F4C',
  },
  unexcusedPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 999,
  },
  unexcusedPillText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  studentSubtitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: '#6B6880',
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 247, 237, 0.8)',
    width: '100%',
  },

  /* 3. Bottom Action Buttons */
  bottomActions: {
    marginTop: 6,
    gap: 9,
  },
  btnPrimaryHome: {
    width: '100%',
    height: 52,
    backgroundColor: '#F58F4C',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  btnPrimaryHomeText: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnSecondaryEdit: {
    width: '100%',
    height: 46,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnSecondaryEditText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#F58F4C',
  },
  homeIndicatorBar: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 4,
  },
});
