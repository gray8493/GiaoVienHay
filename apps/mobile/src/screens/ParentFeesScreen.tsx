import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Svg,
  Path,
  Rect,
  Circle,
  Line,
  Polyline,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { parentService } from '../services/parent.service';
import { fcmService } from '../services/fcm.service';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeesData();
    const unsubscribe = fcmService.onNotificationReceived((payload) => {
      const type = String(payload?.data?.type || '').toUpperCase();
      if (type.startsWith('FEE_')) loadFeesData();
    });
    return () => unsubscribe?.();
  }, [studentId]);

  const formatCurrency = (value: number): string =>
    `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} đ`;

  const formatPaidDate = (dateVal: any): string => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return String(dateVal);
    }
  };

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

  const insExists = feesData?.insurance?.has_record === true;
  const tuiExists = feesData?.tuition?.has_record === true;
  const isInsPaid = insExists && feesData?.insurance?.status === 'PAID';
  const isTuiPaid = tuiExists && feesData?.tuition?.status === 'PAID';
  const completionPercent =
    typeof feesData?.completion_percent === 'number' ? feesData.completion_percent : 0;
  const allPaid = completionPercent === 100;

  return (
    <View style={styles.container}>
      {/* Background Decor Stars & Wave Curves */}
      <View style={styles.bgDecorWrapper} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Circle cx="350" cy="80" r="130" fill="#FFB68B" opacity={0.12} />
          <Circle cx="30" cy="400" r="110" fill="#F58F4C" opacity={0.08} />
          <Path
            d="M-20 320C80 280 160 380 260 350C360 320 400 420 440 400"
            stroke="#F58F4C"
            strokeDasharray="5 7"
            strokeOpacity={0.18}
            strokeWidth={1.5}
          />
          <Path
            d="M-30 620C70 570 180 690 280 640C380 590 420 680 440 670"
            stroke="#F58F4C"
            strokeDasharray="4 6"
            strokeOpacity={0.18}
            strokeWidth={1.5}
          />
          {/* 4-point stars */}
          <Path d="M340 60 L342 66 L348 68 L342 70 L340 76 L338 70 L332 68 L338 66 Z" fill="#984704" fillOpacity={0.25} />
          <Path d="M42 220 L44 225 L49 227 L44 229 L42 234 L40 229 L35 227 L40 225 Z" fill="#984704" fillOpacity={0.25} />
          <Path d="M350 680 L352 686 L358 688 L352 690 L350 696 L348 690 L342 688 L348 686 Z" fill="#984704" fillOpacity={0.2} />
        </Svg>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Đồng Bộ */}
        <View style={styles.header}>
          <View style={styles.headerLeftGroup}>
            {onBackToHome && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBackToHome}
                activeOpacity={0.8}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2.5}>
                  <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            )}
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Thu Phí & BHYT</Text>
              <Text style={styles.headerSubtitle}>Sổ theo dõi các khoản đóng góp</Text>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#F58F4C" size="small" />
            <Text style={styles.loadingText}>Đang cập nhật tình trạng thu nộp...</Text>
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
            {/* Bento Progress Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.circleRingWrapper}>
                <Svg width={68} height={68} viewBox="0 0 68 68">
                  <Defs>
                    <SvgLinearGradient id="feeRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#FFA67A" />
                      <Stop offset="100%" stopColor="#E26D2B" />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle cx="34" cy="34" r="28" stroke="#FFE7D3" strokeWidth={6.5} fill="none" />
                  <Circle
                    cx="34"
                    cy="34"
                    r="28"
                    stroke="url(#feeRingGrad)"
                    strokeWidth={6.5}
                    strokeDasharray="175.93"
                    strokeDashoffset={String(175.93 * (1 - completionPercent / 100))}
                    strokeLinecap="round"
                    fill="none"
                    transform="rotate(-90 34 34)"
                  />
                </Svg>
                <Text style={styles.ringRatioText}>{feesData.completed_ratio || '—'}</Text>
              </View>

              <View style={styles.summaryTextGroup}>
                <View style={styles.summaryHeaderRow}>
                  <Text style={styles.summaryMainTitle}>Tiến Độ Thu Nộp</Text>
                  <View style={[styles.statusBadgePill, allPaid ? styles.statusBadgeCompleted : styles.statusBadgePending]}>
                    <Text style={[styles.statusBadgeText, allPaid ? styles.statusBadgeTextCompleted : styles.statusBadgeTextPending]}>
                      {allPaid ? 'ĐÃ NỘP ĐỦ' : feesData.remaining_count || 'CHƯA NỘP'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.summarySubtitle}>
                  {allPaid
                    ? 'Con đã hoàn tất toàn bộ các khoản thu kỳ này'
                    : 'Phụ huynh vui lòng hoàn thành trước hạn quy định'}
                </Text>
                {!!feesData.term_label && (
                  <Text style={styles.summaryTermText}>{feesData.term_label}</Text>
                )}
              </View>
            </View>

            {/* Stacked Fee List (Bento Style) */}
            <View style={styles.feeListWrap}>
              {/* Fee Item 1: BHYT */}
              <View style={styles.feeItemCard}>
                <View style={styles.feeItemHeader}>
                  <View style={styles.feeItemLeft}>
                    <View style={styles.feeIconTile}>
                      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Defs>
                          <SvgLinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#FFA67A" />
                            <Stop offset="100%" stopColor="#E26D2B" />
                          </SvgLinearGradient>
                        </Defs>
                        <Path
                          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                          fill="url(#shieldGrad)"
                        />
                        <Path
                          d="M9 12l2 2 4-4"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                    <View style={styles.feeTitleGroup}>
                      <Text style={styles.feeItemTitle} numberOfLines={1}>
                        {feesData.insurance?.title || 'Bảo hiểm Y tế (BHYT)'}
                      </Text>
                      <Text style={styles.feeItemSubtitle} numberOfLines={1}>
                        {typeof feesData.insurance?.amount === 'number'
                          ? `Mức phí: ${formatCurrency(feesData.insurance.amount)}`
                          : 'Chưa có mức phí'}
                      </Text>
                    </View>
                  </View>

                  {!insExists ? null : isInsPaid ? (
                    <View style={styles.paidPill}>
                      <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={3}>
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
                  {insExists && feesData.insurance?.deadline ? (
                    <View style={styles.feeMetaRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#887367" strokeWidth={2}>
                        <Circle cx="12" cy="12" r="10" />
                        <Polyline points="12 6 12 12 16 14" />
                      </Svg>
                      <Text style={styles.feeMetaText}>{feesData.insurance.deadline}</Text>
                    </View>
                  ) : null}
                  {isInsPaid && (feesData.insurance?.paid_date || feesData.insurance?.payment_method) ? (
                    <View style={styles.feeMetaRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2}>
                        <Polyline points="20 6 9 17 4 12" />
                      </Svg>
                      <Text style={[styles.feeMetaText, { color: '#00875A', fontWeight: '600' }]}>
                        {feesData.insurance.paid_date ? `Đã nộp ngày: ${formatPaidDate(feesData.insurance.paid_date)}` : 'Đã thanh toán cho GVCN'}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Fee Item 2: Học phí & Bán trú */}
              <View style={styles.feeItemCard}>
                <View style={styles.feeItemHeader}>
                  <View style={styles.feeItemLeft}>
                    <View style={styles.feeIconTile}>
                      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Defs>
                          <SvgLinearGradient id="tuiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#FFA67A" />
                            <Stop offset="100%" stopColor="#E26D2B" />
                          </SvgLinearGradient>
                        </Defs>
                        <Rect x="3" y="4" width="18" height="16" rx="3" fill="url(#tuiGrad)" />
                        <Line x1="3" y1="9" x2="21" y2="9" stroke="#FFFFFF" strokeWidth={1.5} />
                        <Circle cx="8" cy="14" r="1.5" fill="#FFFFFF" />
                      </Svg>
                    </View>
                    <View style={styles.feeTitleGroup}>
                      <Text style={styles.feeItemTitle} numberOfLines={1}>
                        {feesData.tuition?.title || 'Học phí'}
                      </Text>
                      <Text style={styles.feeItemSubtitle} numberOfLines={1}>
                        {typeof feesData.tuition?.amount === 'number'
                          ? `Mức phí: ${formatCurrency(feesData.tuition.amount)}`
                          : 'Chưa có mức phí'}
                      </Text>
                    </View>
                  </View>

                  {!tuiExists ? null : isTuiPaid ? (
                    <View style={styles.paidPill}>
                      <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={3}>
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
                  {tuiExists && feesData.tuition?.deadline ? (
                    <View style={styles.feeMetaRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#887367" strokeWidth={2}>
                        <Circle cx="12" cy="12" r="10" />
                        <Polyline points="12 6 12 12 16 14" />
                      </Svg>
                      <Text style={styles.feeMetaText}>{feesData.tuition.deadline}</Text>
                    </View>
                  ) : null}
                  {isTuiPaid && feesData.tuition?.paid_date ? (
                    <View style={styles.feeMetaRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2}>
                        <Polyline points="20 6 9 17 4 12" />
                      </Svg>
                      <Text style={[styles.feeMetaText, { color: '#00875A', fontWeight: '600' }]}>
                        Nộp ngày {formatPaidDate(feesData.tuition.paid_date)}
                      </Text>
                    </View>
                  ) : null}
                  {!tuiExists && (
                    <View style={styles.feeMetaRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#887367" strokeWidth={2}>
                        <Circle cx="12" cy="12" r="10" />
                        <Line x1="12" y1="8" x2="12" y2="12" />
                        <Line x1="12" y1="16" x2="12.01" y2="16" />
                      </Svg>
                      <Text style={styles.feeMetaText}>Chưa có khoản thu học phí</Text>
                    </View>
                  )}
                  {tuiExists && !isTuiPaid && (
                    <View style={styles.feeMetaRow}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#887367" strokeWidth={2}>
                        <Circle cx="12" cy="12" r="10" />
                        <Line x1="12" y1="8" x2="12" y2="12" />
                        <Line x1="12" y1="16" x2="12.01" y2="16" />
                      </Svg>
                      <Text style={styles.feeMetaText}>Giáo viên chủ nhiệm chưa ghi nhận nộp tiền</Text>
                    </View>
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
    backgroundColor: '#FFF8EE', // Đồng bộ tone màu ấm hệ thống
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
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTitleWrap: {
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE3C8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C97A3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#887367',
    marginTop: 2,
    fontWeight: '500',
  },
  loadingWrap: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#887367',
    fontWeight: '500',
  },
  emptyFeesCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE7D3',
    marginVertical: 16,
    shadowColor: '#C97A3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  emptyFeesIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF4EA',
    borderWidth: 1,
    borderColor: '#FFE1CC',
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
    color: '#887367',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Bento Progress Summary Card */
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FFE7D3',
    shadowColor: '#C97A3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  circleRingWrapper: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringRatioText: {
    position: 'absolute',
    fontSize: 15,
    fontWeight: '800',
    color: '#E26D2B',
  },
  summaryTextGroup: {
    flex: 1,
    gap: 3,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  statusBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  statusBadgeCompleted: {
    backgroundColor: '#E6FBF2',
  },
  statusBadgePending: {
    backgroundColor: '#FFF1E6',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusBadgeTextCompleted: {
    color: '#00875A',
  },
  statusBadgeTextPending: {
    color: '#B9671F',
  },
  summarySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#887367',
    lineHeight: 16,
  },
  summaryTermText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A06D53',
    marginTop: 2,
  },

  /* Danh sách khoản thu (Bento Cards) */
  feeListWrap: {
    gap: 14,
  },
  feeItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FFE7D3',
    shadowColor: '#C97A3E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  feeItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  feeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  feeIconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF4EA',
    borderWidth: 1,
    borderColor: '#FFE1CC',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  feeTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  feeItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B2E',
    lineHeight: 20,
  },
  feeItemSubtitle: {
    fontSize: 12,
    color: '#887367',
    marginTop: 2,
    fontWeight: '500',
  },
  unpaidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF4EC',
    borderWidth: 1,
    borderColor: '#FFD7B8',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 9999,
    flexShrink: 0,
  },
  unpaidEmptyCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#B9671F',
  },
  unpaidPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B9671F',
  },
  paidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6FBF2',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 9999,
    flexShrink: 0,
  },
  paidPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00875A',
  },
  feeItemMeta: {
    paddingLeft: 56,
    gap: 4,
  },
  feeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feeMetaText: {
    fontSize: 12,
    color: '#887367',
    fontWeight: '500',
  },

  /* Floating Dock (Phụ huynh) */
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
