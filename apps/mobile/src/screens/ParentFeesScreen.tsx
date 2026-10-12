import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Svg, Path, Rect, Circle, Line, Polyline } from 'react-native-svg';
import { parentService } from '../services/parent.service';

interface ParentFeesScreenProps {
  studentName?: string;
  className?: string;
  onBackToHome?: () => void;
  onNavigateToTab?: (tabKey: 'home' | 'academic' | 'fees' | 'profile') => void;
}

export const ParentFeesScreen: React.FC<ParentFeesScreenProps> = ({
  studentName = 'Trần Gia Bảo',
  className = '6A1',
  onBackToHome,
  onNavigateToTab,
}) => {
  const [feesData, setFeesData] = useState<any>({
    completed_ratio: '1/2',
    remaining_count: 'Còn 1 khoản',
    term_label: 'Học kỳ 1 • 2026–2027',
    insurance: {
      type: 'BHYT',
      status: 'UNPAID',
      status_label: 'Chưa nộp',
      deadline: 'Hạn 15/10/2026',
    },
    tuition: {
      type: 'Học phí',
      status: 'PAID',
      status_label: 'Đã nộp',
      paid_date: '22/09',
      payment_method: 'Nộp tiền mặt tại lớp',
    },
  });

  return (
    <View style={styles.container}>
      {/* Background Decor Stars */}
      <View style={styles.bgDecorWrapper} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Path d="M340 60 L342 66 L348 68 L342 70 L340 76 L338 70 L332 68 L338 66 Z" fill="#F58F4C" fillOpacity={0.25} />
          <Path d="M20 280 L22 286 L28 288 L22 290 L20 296 L18 290 L12 288 L18 286 Z" fill="#F58F4C" fillOpacity={0.25} />
          <Path d="M350 680 L352 686 L358 688 L352 690 L350 696 L348 690 L342 688 L348 686 Z" fill="#F58F4C" fillOpacity={0.2} />
        </Svg>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thu Phí</Text>
          <View style={styles.studentBadgePill}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2}>
              <Circle cx="12" cy="7" r="4" />
              <Path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
            </Svg>
            <Text style={styles.studentBadgeText} numberOfLines={1}>
              {studentName} • {className}
            </Text>
          </View>
        </View>

        {/* Summary Card with Circular Ring (1/2 completion) */}
        <View style={styles.summaryCard}>
          <View style={styles.circleRingWrapper}>
            <Svg width={64} height={64} viewBox="0 0 64 64">
              <Circle cx="32" cy="32" r="26" stroke="#FFF1E6" strokeWidth={6} fill="none" />
              <Circle
                cx="32"
                cy="32"
                r="26"
                stroke="#F58F4C"
                strokeWidth={6}
                strokeDasharray="163.36"
                strokeDashoffset="81.68"
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 32 32)"
              />
            </Svg>
            <Text style={styles.ringRatioText}>1/2</Text>
          </View>

          <View style={styles.summaryTextGroup}>
            <Text style={styles.summaryMainTitle}>Còn 1 khoản</Text>
            <Text style={styles.summarySubtitle}>Cần hoàn thành sớm</Text>
            <Text style={styles.summaryTermText}>Học kỳ 1 • 2026–2027</Text>
          </View>
        </View>

        {/* Stacked Fee List */}
        <View style={styles.feeListWrap}>
          {/* Fee Item 1: BHYT */}
          <TouchableOpacity
            style={styles.feeItemCard}
            activeOpacity={0.9}
            onPress={() => Alert.alert('Bảo hiểm y tế', 'Hạn chót nộp BHYT là 15/10/2026. Phụ huynh có thể nộp trực tiếp tại văn phòng trường hoặc chuyển khoản cho GVCN.')}
          >
            <View style={styles.feeItemHeader}>
              <View style={styles.feeItemLeft}>
                <View style={styles.feeIconTile}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </Svg>
                </View>
                <Text style={styles.feeItemTitle}>BHYT</Text>
              </View>

              <View style={styles.unpaidPill}>
                <View style={styles.unpaidEmptyCircle} />
                <Text style={styles.unpaidPillText}>Chưa nộp</Text>
              </View>
            </View>

            <View style={styles.feeItemMeta}>
              <Text style={styles.feeMetaText}>Hạn 15/10/2026</Text>
            </View>
          </TouchableOpacity>

          {/* Fee Item 2: Học phí */}
          <View style={styles.feeItemCard}>
            <View style={styles.feeItemHeader}>
              <View style={styles.feeItemLeft}>
                <View style={styles.feeIconTile}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <Polyline points="14 2 14 8 20 8" />
                    <Line x1="16" y1="13" x2="8" y2="13" />
                    <Line x1="16" y1="17" x2="8" y2="17" />
                  </Svg>
                </View>
                <Text style={styles.feeItemTitle}>Học phí</Text>
              </View>

              <View style={styles.paidPill}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={3}>
                  <Polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.paidPillText}>Đã nộp</Text>
              </View>
            </View>

            <View style={styles.feeItemMeta}>
              <Text style={styles.feeMetaText}>22/09</Text>
              <Text style={styles.feeMetaText}>Nộp tiền mặt tại lớp</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Dock điều hướng đáy (Tab Thu Phí Active) */}
      <View style={styles.dockContainer}>
        <TouchableOpacity
          style={styles.dockItem}
          onPress={onBackToHome}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9E9BB2" strokeWidth={2}>
              <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <Polyline points="9 22 9 12 15 12 15 22" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dockItem}
          onPress={() => onNavigateToTab?.('academic')}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9E9BB2" strokeWidth={2}>
              <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Học tập</Text>
        </TouchableOpacity>

        {/* Tab 3: Thu phí (ACTIVE Bubble) */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBubbleActive}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
              <Rect x="2" y="5" width="20" height="14" rx="2" />
              <Line x1="2" y1="10" x2="22" y2="10" />
            </Svg>
          </View>
          <Text style={styles.dockLabelActive}>Thu phí</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dockItem}
          onPress={() => onNavigateToTab?.('profile')}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#9E9BB2" strokeWidth={2}>
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFCFA3',
    position: 'relative',
  },
  bgDecorWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  scrollArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  studentBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  studentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
  },

  /* Summary Card */
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  circleRingWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  ringRatioText: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B2E',
    lineHeight: 22,
  },
  summarySubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
    marginTop: 3,
  },
  summaryTermText: {
    fontSize: 12,
    color: 'rgba(107, 104, 128, 0.8)',
    marginTop: 2,
  },

  /* Fee List */
  feeListWrap: {
    gap: 12,
  },
  feeItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  feeItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feeIconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeItemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  unpaidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E0EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  unpaidEmptyCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#6B6880',
  },
  unpaidPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
  },
  paidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6FBF2',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  paidPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  feeItemMeta: {
    paddingLeft: 56,
    gap: 2,
  },
  feeMetaText: {
    fontSize: 12,
    color: '#6B6880',
    fontWeight: '500',
  },

  /* Dock */
  dockContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: 'rgba(30, 27, 46, 0.96)',
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 8,
    zIndex: 50,
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockIconBubbleActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  dockIconBox: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9E9BB2',
    marginTop: 3,
  },
  dockLabelActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
});
