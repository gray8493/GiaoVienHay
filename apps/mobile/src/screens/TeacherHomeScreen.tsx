import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  Polygon,
  Rect,
  Line,
  G,
} from 'react-native-svg';

interface TeacherHomeScreenProps {
  onEnterClassroom?: () => void;
  onOpenAIQuiz?: () => void;
  onOpenWheel?: () => void;
  onOpenHealthInsurance?: () => void;
  onTabChange?: (tab: 'schedule' | 'attendance' | 'gradebook' | 'profile') => void;
}

export const TeacherHomeScreen: React.FC<TeacherHomeScreenProps> = ({
  onEnterClassroom,
  onOpenAIQuiz,
  onOpenWheel,
  onOpenHealthInsurance,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance' | 'gradebook' | 'profile'>('schedule');

  const handleTabPress = (tab: 'schedule' | 'attendance' | 'gradebook' | 'profile') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <View style={styles.container}>
      {/* Background Peach Linear Gradient */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Sparkles & Doodles (Faint aesthetic accents) */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Star 1 - Top Right */}
        <View style={styles.starTopRight}>
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="#FDE68A" opacity={0.35}>
            <Path d="M12 0L14.5 8.5L23.5 11L14.5 13.5L12 22L9.5 13.5L0.5 11L9.5 8.5z" />
          </Svg>
        </View>

        {/* Star 2 - Left */}
        <View style={styles.starMidLeft}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="#FFFFFF" opacity={0.3}>
            <Path d="M12 0L14.5 8.5L23.5 11L14.5 13.5L12 22L9.5 13.5L0.5 11L9.5 8.5z" />
          </Svg>
        </View>

        {/* Star 3 - Bottom Right */}
        <View style={styles.starBottomRight}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="#FEF3C7" opacity={0.4}>
            <Path d="M12 0L14.5 8.5L23.5 11L14.5 13.5L12 22L9.5 13.5L0.5 11L9.5 8.5z" />
          </Svg>
        </View>

        {/* Curved Doodle Line */}
        <View style={styles.curvedDoodle}>
          <Svg width={160} height={160} viewBox="0 0 100 100" fill="none">
            <Path
              d="M10,20 Q60,10 80,60 T10,95"
              stroke="#FFFFFF"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.25}
            />
          </Svg>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= 1. HEADER SECTION ================= */}
          <View style={styles.header}>
            {/* Teacher Profile & Greeting */}
            <View style={styles.teacherInfoWrap}>
              <View style={styles.avatarBorderRing}>
                <View style={styles.avatarContainer}>
                  {/* Female Teacher Vector SVG */}
                  <Svg width={44} height={44} viewBox="0 0 64 64" fill="none">
                    <Circle cx="32" cy="32" r="32" fill="#FEEAD8" />
                    <Path d="M32 35C24.8 35 19 40.8 19 48V56H45V48C45 40.8 39.2 35 32 35Z" fill="#5E5CE6" />
                    <Circle cx="32" cy="24" r="10" fill="#FDBC87" />
                    <Path
                      d="M22 23C22 17 26 13 32 13C38 13 42 17 42 23C42 25 39 26 39 26C39 26 38 29 36 29C34 29 32 28 32 28C32 28 30 29 28 29C26 29 25 26 25 26C25 26 22 25 22 23Z"
                      fill="#4B2C20"
                    />
                    <Circle cx="28.5" cy="24.5" r="1.5" fill="#333322" />
                    <Circle cx="35.5" cy="24.5" r="1.5" fill="#333322" />
                    <Path d="M30 28C30.8 29 33.2 29 34 28" stroke="#D97706" strokeWidth={1.2} strokeLinecap="round" />
                    {/* Spectacles / Glasses */}
                    <Circle cx="28" cy="24" r="3.2" stroke="#4F46E5" strokeWidth={1.1} fill="none" />
                    <Circle cx="36" cy="24" r="3.2" stroke="#4F46E5" strokeWidth={1.1} fill="none" />
                    <Path d="M31.2 24H32.8" stroke="#4F46E5" strokeWidth={1.1} />
                  </Svg>
                </View>
                {/* Active online green dot */}
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.greetingTextContainer}>
                <Text style={styles.greetingSubtitle}>Xin chào,</Text>
                <Text style={styles.greetingTeacherName}>Cô Nguyễn Thu Hà</Text>
              </View>
            </View>

            {/* Badges & Notification Bell */}
            <View style={styles.headerRightActions}>
              {/* GVCN Badge */}
              <View style={styles.gvcnBadge}>
                <View style={styles.gvcnDot} />
                <Text style={styles.gvcnBadgeText}>GVCN 6A1</Text>
              </View>

              {/* Notification Button */}
              <TouchableOpacity
                style={styles.notificationBtn}
                activeOpacity={0.8}
                accessibilityLabel="Thông báo"
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2}>
                  <Path
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                {/* Red alert dot */}
                <View style={styles.notificationAlertDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= 2. HERO CARD (NEXT LESSON) ================= */}
          <View style={styles.heroCard}>
            {/* Background Glows */}
            <View style={styles.heroGlowBottomRight} />
            <View style={styles.heroGlowTopLeft} />

            {/* 3D Cute School Theme Illustration placed top-right */}
            <View style={styles.heroIllustrationContainer} pointerEvents="none">
              <Svg width={110} height={110} viewBox="0 0 120 120" fill="none">
                <G rotation="-6" origin="60, 60">
                  {/* Cap top diamond */}
                  <Polygon points="60,20 102,40 60,60 18,40" fill="#FFC947" />
                  <Polygon points="60,24 96,40 60,56 24,40" fill="#FFE27A" />
                  {/* Skull base */}
                  <Path d="M35 48 C35 72 85 72 85 48 Z" fill="#E69500" />
                  {/* Tassel cord & bead */}
                  <Circle cx={60} cy={40} r={3.5} fill="#FFFFFF" />
                  <Path d="M60 40 Q84 48 88 66" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
                  <Polygon points="85,65 91,65 89,78 87,78" fill="#F58F4C" />
                  {/* Math ruler */}
                  <G transform="translate(14, 52) rotate(35)">
                    <Rect x={0} y={0} width={46} height={14} rx={3} fill="#FFFFFF" fillOpacity={0.95} />
                    <Line x1={8} y1={0} x2={8} y2={6} stroke="#5E5CE6" strokeWidth={1.5} />
                    <Line x1={16} y1={0} x2={16} y2={4} stroke="#5E5CE6" strokeWidth={1.5} />
                    <Line x1={24} y1={0} x2={24} y2={6} stroke="#5E5CE6" strokeWidth={1.5} />
                    <Line x1={32} y1={0} x2={32} y2={4} stroke="#5E5CE6" strokeWidth={1.5} />
                    <Line x1={40} y1={0} x2={40} y2={6} stroke="#5E5CE6" strokeWidth={1.5} />
                  </G>
                  {/* Star sparkle */}
                  <Path d="M96 24L98 30L104 32L98 34L96 40L94 34L88 32L94 30Z" fill="#FFF3E6" />
                </G>
              </Svg>
            </View>

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <View style={styles.heroTagPill}>
                <Text style={styles.heroTagText}>TIẾT DẠY TIẾP THEO</Text>
              </View>

              <Text style={styles.heroTitle}>Tiết 2: Toán Hình - Lớp 6A1</Text>

              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaItem}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2}>
                    <Circle cx="12" cy="12" r="10" />
                    <Path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.heroMetaText}>08:15 - 09:00</Text>
                </View>
                <Text style={styles.heroMetaSeparator}>•</Text>
                <View style={styles.heroMetaItem}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2}>
                    <Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <Circle cx="12" cy="11" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.heroMetaText}>Phòng 204</Text>
                </View>
              </View>

              {/* Quick Action CTA Button */}
              <TouchableOpacity
                style={styles.heroCtaBtn}
                onPress={onEnterClassroom}
                activeOpacity={0.88}
              >
                <Text style={styles.heroCtaBtnText}>Vào Lớp & Điểm Danh</Text>
                <View style={styles.heroCtaArrowCircle}>
                  <Text style={styles.heroCtaArrowText}>→</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= 3. QUICK STATS BENTO GRID ================= */}
          <View style={styles.bentoGrid}>
            {/* Card 1: Sĩ số 6A1 */}
            <TouchableOpacity
              style={styles.bentoCard}
              activeOpacity={0.85}
              onPress={onEnterClassroom}
            >
              <View style={styles.bentoCardHeader}>
                <View style={[styles.bentoIconBox, { backgroundColor: '#FFF7ED', borderColor: 'rgba(254, 215, 170, 0.5)' }]}>
                  <Svg width={17} height={17} viewBox="0 0 20 20" fill="#F58F4C">
                    <Path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </Svg>
                </View>
                <Text style={styles.bentoLabel}>Sĩ số 6A1</Text>
              </View>
              <View>
                <Text style={styles.bentoPrimaryValue}>38/38</Text>
                <View style={styles.bentoTagWrapper}>
                  <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <View style={styles.pulsingGreenDot} />
                    <Text style={[styles.statusBadgeText, { color: '#059669' }]}>Có mặt 100%</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 2: Trợ giảng AI */}
            <TouchableOpacity
              style={styles.bentoCard}
              activeOpacity={0.85}
              onPress={onOpenAIQuiz}
            >
              <View style={styles.bentoCardHeader}>
                <View style={[styles.bentoIconBox, { backgroundColor: '#EEF2FF', borderColor: 'rgba(199, 210, 254, 0.5)' }]}>
                  <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#5E5CE6" strokeWidth={2}>
                    <Path
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={styles.bentoLabel}>Trợ giảng AI</Text>
              </View>
              <View>
                <Text style={styles.bentoSubtitleText} numberOfLines={1}>Soạn đề bài mới</Text>
                <View style={styles.bentoTagWrapper}>
                  <View style={[styles.statusBadge, { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#5E5CE6' }]}>Tạo nhanh ✨</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 3: Dò bài cũ */}
            <TouchableOpacity
              style={styles.bentoCard}
              activeOpacity={0.85}
              onPress={onOpenWheel}
            >
              <View style={styles.bentoCardHeader}>
                <View style={[styles.bentoIconBox, { backgroundColor: '#FFFBEB', borderColor: 'rgba(254, 240, 138, 0.6)' }]}>
                  <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth={2}>
                    <Circle cx="12" cy="12" r="9" />
                    <Path d="M12 3v9l6 3" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M9 12a3 3 0 116 0 3 3 0 01-6 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.bentoLabel}>Dò bài cũ</Text>
              </View>
              <View>
                <Text style={styles.bentoSubtitleText}>Vòng quay gọi tên</Text>
                <View style={styles.bentoTagWrapper}>
                  <View style={[styles.statusBadge, { backgroundColor: '#FFFBEB', borderColor: 'rgba(253, 230, 138, 0.6)' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#D97706' }]}>Ngẫu nhiên 🎲</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 4: BHYT Lớp CN */}
            <TouchableOpacity
              style={styles.bentoCard}
              activeOpacity={0.85}
              onPress={onOpenHealthInsurance}
            >
              <View style={styles.bentoCardHeader}>
                <View style={[styles.bentoIconBox, { backgroundColor: '#FFF1F2', borderColor: 'rgba(254, 205, 211, 0.6)' }]}>
                  <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth={2}>
                    <Path
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={styles.bentoLabel}>BHYT Lớp CN</Text>
              </View>
              <View>
                <View style={styles.bhytValueRow}>
                  <Text style={styles.bhytNumerator}>35/38</Text>
                  <Text style={styles.bhytStatusLabel}>Đã nộp</Text>
                </View>
                {/* Progress bar at 92% */}
                <View style={styles.bhytProgressBarTrack}>
                  <View style={[styles.bhytProgressBarFill, { width: '92%' }]} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* ================= 4. DAILY TIMELINE SECTION ================= */}
          <View style={styles.timelineSection}>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineSectionTitle}>Lịch dạy còn lại hôm nay</Text>
              <View style={styles.timelineCountBadge}>
                <Text style={styles.timelineCountText}>2 tiết</Text>
              </View>
            </View>

            <View style={styles.timelineList}>
              {/* Vertical connector line */}
              <View style={styles.timelineVerticalLine} />

              {/* Timeline Item 1 */}
              <View style={styles.timelineItemRow}>
                {/* Purple Indicator Dot */}
                <View style={[styles.timelineDotIndicator, { borderColor: '#5E5CE6' }]} />
                <View style={styles.timelineCard}>
                  <View style={styles.timelineCardLeft}>
                    <Text style={styles.timelineClassTitle}>Tiết 3: Toán Đại - 6A2</Text>
                    <View style={styles.timelineMetaRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}>
                        <Circle cx="12" cy="12" r="10" />
                        <Path d="M12 6v6l3 2" />
                      </Svg>
                      <Text style={styles.timelineMetaText}>09:15 - 10:00</Text>
                      <Text style={styles.timelineMetaText}>•</Text>
                      <Text style={styles.timelineMetaText}>Phòng 205</Text>
                    </View>
                  </View>
                  <View style={styles.timelineStatusUpcoming}>
                    <Text style={styles.timelineStatusUpcomingText}>Sắp tới</Text>
                  </View>
                </View>
              </View>

              {/* Timeline Item 2 */}
              <View style={styles.timelineItemRow}>
                {/* Orange Indicator Dot */}
                <View style={[styles.timelineDotIndicator, { borderColor: '#F58F4C' }]} />
                <View style={styles.timelineCard}>
                  <View style={styles.timelineCardLeft}>
                    <Text style={styles.timelineClassTitle}>Tiết 4: Sinh hoạt lớp - 6A1</Text>
                    <View style={styles.timelineMetaRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2}>
                        <Circle cx="12" cy="12" r="10" />
                        <Path d="M12 6v6l3 2" />
                      </Svg>
                      <Text style={styles.timelineMetaText}>10:15 - 11:00</Text>
                      <Text style={styles.timelineMetaText}>•</Text>
                      <Text style={styles.timelineMetaText}>Phòng 204</Text>
                    </View>
                  </View>
                  <View style={styles.timelineStatusNotYet}>
                    <Text style={styles.timelineStatusNotYetText}>Chưa dạy</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* ================= 5. FLOATING BOTTOM DOCK ================= */}
        <View style={styles.dockOuterContainer} pointerEvents="box-none">
          <View style={styles.dockBar}>
            {/* Tab 1: Lịch dạy */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => handleTabPress('schedule')}
              activeOpacity={0.8}
            >
              <View style={[styles.dockIconCircle, activeTab === 'schedule' && styles.dockIconCircleActive]}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'schedule' ? '#FFFFFF' : '#94A3B8'} strokeWidth={2.2}>
                  <Path
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={[styles.dockTabText, activeTab === 'schedule' ? styles.dockTabTextActive : styles.dockTabTextInactive]}>
                Lịch dạy
              </Text>
            </TouchableOpacity>

            {/* Tab 2: Điểm danh */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => handleTabPress('attendance')}
              activeOpacity={0.8}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'attendance' ? '#F58F4C' : '#94A3B8'} strokeWidth={2}>
                <Path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.dockTabText, activeTab === 'attendance' ? styles.dockTabTextActive : styles.dockTabTextInactive]}>
                Điểm danh
              </Text>
            </TouchableOpacity>

            {/* Tab 3: Sổ điểm */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => handleTabPress('gradebook')}
              activeOpacity={0.8}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'gradebook' ? '#F58F4C' : '#94A3B8'} strokeWidth={2}>
                <Path
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.dockTabText, activeTab === 'gradebook' ? styles.dockTabTextActive : styles.dockTabTextInactive]}>
                Sổ điểm
              </Text>
            </TouchableOpacity>

            {/* Tab 4: Cá nhân */}
            <TouchableOpacity
              style={styles.dockTabItem}
              onPress={() => handleTabPress('profile')}
              activeOpacity={0.8}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={activeTab === 'profile' ? '#F58F4C' : '#94A3B8'} strokeWidth={2}>
                <Path
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.dockTabText, activeTab === 'profile' ? styles.dockTabTextActive : styles.dockTabTextInactive]}>
                Cá nhân
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 16,
  },

  /* Decorative Sparkles */
  starTopRight: {
    position: 'absolute',
    top: 48,
    right: 24,
  },
  starMidLeft: {
    position: 'absolute',
    top: 200,
    left: 12,
  },
  starBottomRight: {
    position: 'absolute',
    top: 520,
    right: 16,
  },
  curvedDoodle: {
    position: 'absolute',
    top: 110,
    right: 0,
  },

  /* 1. Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 2,
  },
  teacherInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBorderRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: '#FED7AA',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingTextContainer: {
    justifyContent: 'center',
  },
  greetingSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6880',
    marginBottom: 2,
  },
  greetingTeacherName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gvcnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.6)',
    gap: 5,
  },
  gvcnDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B45309',
  },
  gvcnBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  notificationAlertDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  /* 2. Hero Card */
  heroCard: {
    borderRadius: 24,
    backgroundColor: '#5E5CE6',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#5E5CE6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
  },
  heroGlowBottomRight: {
    position: 'absolute',
    right: -32,
    bottom: -32,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(129, 140, 248, 0.25)',
  },
  heroGlowTopLeft: {
    position: 'absolute',
    left: -24,
    top: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroIllustrationContainer: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 110,
    height: 110,
  },
  heroContent: {
    paddingRight: 64,
  },
  heroTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 2.5,
    borderRadius: 999,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  heroTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 6,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetaText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 12,
    fontWeight: '500',
  },
  heroMetaSeparator: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  heroCtaBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E5CE6',
  },
  heroCtaArrowCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaArrowText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5E5CE6',
  },

  /* 3. Bento Grid */
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bentoCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 115,
  },
  bentoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bentoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  bentoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B6880',
  },
  bentoPrimaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  bentoSubtitleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E1B2E',
    lineHeight: 18,
  },
  bentoTagWrapper: {
    marginTop: 5,
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    gap: 4,
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bhytValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  bhytNumerator: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  bhytStatusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B6880',
  },
  bhytProgressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#FFEDD5',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  bhytProgressBarFill: {
    height: '100%',
    backgroundColor: '#F58F4C',
    borderRadius: 3,
  },

  /* 4. Timeline Section */
  timelineSection: {
    paddingTop: 4,
    gap: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  timelineSectionTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  timelineCountBadge: {
    backgroundColor: 'rgba(255, 237, 213, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 2.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  timelineCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F58F4C',
  },
  timelineList: {
    position: 'relative',
    paddingLeft: 18,
    gap: 10,
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 7,
    top: 14,
    bottom: 14,
    width: 2,
    backgroundColor: 'rgba(94, 92, 230, 0.35)',
  },
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  timelineDotIndicator: {
    position: 'absolute',
    left: -18,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  timelineCardLeft: {
    flex: 1,
    paddingRight: 8,
  },
  timelineClassTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E1B2E',
    marginBottom: 4,
  },
  timelineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timelineMetaText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6B6880',
  },
  timelineStatusUpcoming: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  timelineStatusUpcomingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  timelineStatusNotYet: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  timelineStatusNotYetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F58F4C',
  },

  /* 5. Bottom Dock */
  dockOuterContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dockBar: {
    width: '100%',
    maxWidth: 360,
    height: 64,
    backgroundColor: 'rgba(30, 27, 46, 0.95)',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 36,
    elevation: 10,
  },
  dockTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 3,
  },
  dockIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockIconCircleActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F58F4C',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  dockTabText: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  dockTabTextActive: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dockTabTextInactive: {
    fontWeight: '500',
    color: '#94A3B8',
  },
});
