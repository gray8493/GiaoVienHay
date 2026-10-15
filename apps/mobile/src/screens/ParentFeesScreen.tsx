import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Svg, Path, Rect, Circle, Line, Polyline } from 'react-native-svg';
import { parentService } from '../services/parent.service';

interface ParentFeesScreenProps {
  studentId?: string;
  studentName?: string;
  className?: string;
  onBackToHome?: () => void;
  onNavigateToTab?: (tabKey: 'home' | 'academic' | 'fees' | 'profile') => void;
}

export const ParentFeesScreen: React.FC<ParentFeesScreenProps> = ({
  studentId = '',
  studentName = 'Học sinh',
  className = '',
  onBackToHome,
  onNavigateToTab,
}) => {
  const [feesData, setFeesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFeesData();
  }, [studentId]);

  const loadFeesData = async () => {
    if (!studentId) {
      setFeesData(null);
      return;
    }

    setLoading(true);
    try {
      const data = await parentService.getChildFeesInsurance(studentId);
      setFeesData(data);
    } catch (e) {
      console.warn('Error fetching fees data:', e);
      setFeesData(null);
    } finally {
      setLoading(false);
    }
  };

  const isInsPaid = feesData?.insurance?.status === 'PAID';
  const isTuiPaid = feesData?.tuition?.status === 'PAID';

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
              {studentName} {className ? `• ${className}` : ''}
            </Text>
          </View>
        </View>

        {loading && (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color="#F58F4C" size="small" />
          </View>
        )}

        {!loading && !feesData && (
          <View style={styles.emptyFeesCard}>
            <View style={styles.emptyFeesIconBox}>
              <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                <Rect x="2" y="4" width="20" height="16" rx="2" />
                <Line x1="2" y1="10" x2="22" y2="10" />
              </Svg>
            </View>
            <Text style={styles.emptyFeesTitle}>Chưa có thông báo thu phí</Text>
            <Text style={styles.emptyFeesSub}>
              Nhà trường hoặc giáo viên chưa phát hành đợt thu học phí hay BHYT nào cho học sinh này.
            </Text>
          </View>
        )}

        {!loading && feesData && (
          <>
            {/* Summary Card with Circular Ring */}
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
                    strokeDashoffset={isInsPaid && isTuiPaid ? '0' : !isInsPaid && !isTuiPaid ? '163.36' : '81.68'}
                    strokeLinecap="round"
                    fill="none"
                    transform="rotate(-90 32 32)"
                  />
                </Svg>
                <Text style={styles.ringRatioText}>{feesData.completed_ratio || '0/2'}</Text>
              </View>

              <View style={styles.summaryTextGroup}>
                <Text style={styles.summaryMainTitle}>{feesData.remaining_count || 'Chưa hoàn thành'}</Text>
                <Text style={styles.summarySubtitle}>
                  {isInsPaid && isTuiPaid ? 'Đã hoàn tất tất cả khoản phí' : 'Cần hoàn thành sớm'}
                </Text>
                <Text style={styles.summaryTermText}>{feesData.term_label || 'Học kỳ 1 • 2026–2027'}</Text>
              </View>
            </View>

            {/* Stacked Fee List */}
            <View style={styles.feeListWrap}>
              {/* Fee Item 1: BHYT */}
              <TouchableOpacity
                style={styles.feeItemCard}
                activeOpacity={0.9}
                onPress={() => Alert.alert('Bảo hiểm y tế', 'Hạn chót nộp BHYT theo thông báo của trường. Phụ huynh có thể nộp trực tiếp tại văn phòng trường hoặc chuyển khoản cho GVCN.')}
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

                  {isInsPaid ? (
                    <View style={styles.paidPill}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={3}>
                        <Polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text style={styles.paidPillText}>Đã nộp</Text>
                    </View>
                  ) : (
                    <View style={styles.unpaidPill}>
                      <View style={styles.unpaidEmptyCircle} />
                      <Text style={styles.unpaidPillText}>Chưa nộp</Text>
                    </View>
                  )}
                </View>

                <View style={styles.feeItemMeta}>
                  <Text style={styles.feeMetaText}>
                    {feesData.insurance?.deadline || 'Chưa có hạn nộp'}
                  </Text>
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

                  {isTuiPaid ? (
                    <View style={styles.paidPill}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={3}>
                        <Polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text style={styles.paidPillText}>Đã nộp</Text>
                    </View>
                  ) : (
                    <View style={styles.unpaidPill}>
                      <View style={styles.unpaidEmptyCircle} />
                      <Text style={styles.unpaidPillText}>Chưa nộp</Text>
                    </View>
                  )}
                </View>

                <View style={styles.feeItemMeta}>
                  {feesData.tuition?.paid_date && (
                    <Text style={styles.feeMetaText}>{feesData.tuition.paid_date}</Text>
                  )}
                  {feesData.tuition?.payment_method && (
                    <Text style={styles.feeMetaText}>{feesData.tuition.payment_method}</Text>
                  )}
                </View>
              </View>
            </View>
          </>
        )}
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

        {/* Tab Thu Phí (Active) */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBubbleActive}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
              <Rect x="2" y="4" width="20" height="16" rx="2" />
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
    backgroundColor: '#FAF8FC',
  },
  bgDecorWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  scrollArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  studentBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  studentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
    maxWidth: 160,
  },
  emptyFeesCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0EBF4',
    marginVertical: 16,
  },
  emptyFeesIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyFeesTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1B2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyFeesSub: {
    fontSize: 13,
    color: '#6B6880',
    textAlign: 'center',
    lineHeight: 18,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0EBF4',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  circleRingWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringRatioText: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '800',
    color: '#F58F4C',
  },
  summaryTextGroup: {
    flex: 1,
    gap: 2,
  },
  summaryMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  summarySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6880',
  },
  summaryTermText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A06D53',
    marginTop: 4,
  },
  feeListWrap: {
    gap: 14,
  },
  feeItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0EBF4',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
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
    fontWeight: '700',
    color: '#1E1B2E',
  },
  unpaidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  unpaidEmptyCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
