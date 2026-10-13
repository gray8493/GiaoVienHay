import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { Svg, Path, Rect, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G, Ellipse } from 'react-native-svg';
import { feesService, StudentFeeRecord, ClassFeesSummary, FeeType } from '../services/fees.service';

interface FeesInsuranceScreenProps {
  onBack?: () => void;
  classId?: string;
}

type FilterMode = 'ALL' | 'UNPAID_INSURANCE' | 'UNPAID_TUITION';

export const FeesInsuranceScreen: React.FC<FeesInsuranceScreenProps> = ({
  onBack,
  classId = '',
}) => {
  const [feesSummary, setFeesSummary] = useState<ClassFeesSummary | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal TEA-07.2 Cập nhật đóng tiền state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeRecord | null>(null);
  const [editFeeType, setEditFeeType] = useState<FeeType>('INSURANCE');
  const [editIsPaid, setEditIsPaid] = useState(true);
  const [editPaidDate, setEditPaidDate] = useState('05/10/2026');
  const [editNote, setEditNote] = useState('Nộp tiền mặt tại lớp');

  // Modal TEA-07.3 Nhắc phụ huynh state
  const [showRemindModal, setShowRemindModal] = useState(false);
  const [remindCategory, setRemindCategory] = useState<FeeType>('INSURANCE');
  const [remindTone, setRemindTone] = useState<'POLITE' | 'EXPIRING' | 'TOMORROW'>('POLITE');

  useEffect(() => {
    loadFeesData();
  }, [classId]);

  const loadFeesData = async () => {
    if (!classId || classId === 'cls_empty') {
      setFeesSummary(null);
      return;
    }
    const data = await feesService.getClassFeesList(classId);
    setFeesSummary(data);
  };

  const handleOpenEdit = (student: StudentFeeRecord, defaultType: FeeType = 'INSURANCE') => {
    setSelectedStudent(student);
    setEditFeeType(defaultType);
    const targetStatus = defaultType === 'INSURANCE' ? student.insurance : student.tuition;
    setEditIsPaid(targetStatus.is_paid);
    setEditPaidDate(targetStatus.paid_date || '05/10/2026');
    setEditNote(student.note || '');
    setShowEditModal(true);
  };

  const handleSwitchFeeType = (type: FeeType) => {
    if (!selectedStudent) return;
    setEditFeeType(type);
    const targetStatus = type === 'INSURANCE' ? selectedStudent.insurance : selectedStudent.tuition;
    setEditIsPaid(targetStatus.is_paid);
    setEditPaidDate(targetStatus.paid_date || '05/10/2026');
  };

  const handleSaveFeeStatus = async () => {
    if (!selectedStudent || !feesSummary) return;

    await feesService.toggleFeeStatus({
      record_id: selectedStudent.record_id,
      fee_type: editFeeType,
      is_paid: editIsPaid,
      paid_date: editPaidDate,
      note: editNote,
    });

    // Cập nhật local state
    setFeesSummary(prev => {
      if (!prev) return null;
      const updatedRecords = prev.records.map(r => {
        if (r.record_id === selectedStudent.record_id) {
          const updated = { ...r };
          if (editFeeType === 'INSURANCE') {
            updated.insurance = {
              is_paid: editIsPaid,
              paid_date: editIsPaid ? editPaidDate : null,
            };
          } else {
            updated.tuition = {
              is_paid: editIsPaid,
              paid_date: editIsPaid ? editPaidDate : null,
            };
          }
          updated.note = editNote || null;
          return updated;
        }
        return r;
      });

      const insPaid = updatedRecords.filter(r => r.insurance.is_paid).length;
      const tuiPaid = updatedRecords.filter(r => r.tuition.is_paid).length;
      const total = prev.total_students;

      return {
        ...prev,
        records: updatedRecords,
        insurance_paid_count: insPaid,
        insurance_unpaid_count: Math.max(0, total - insPaid),
        insurance_percent: Math.round((insPaid / total) * 100),
        tuition_paid_count: tuiPaid,
        tuition_unpaid_count: Math.max(0, total - tuiPaid),
        tuition_percent: Math.round((tuiPaid / total) * 100),
      };
    });

    setShowEditModal(false);
  };

  const handleSendReminder = async () => {
    const count = remindCategory === 'INSURANCE' ? feesSummary?.insurance_unpaid_count || 3 : feesSummary?.tuition_unpaid_count || 5;
    const catName = remindCategory === 'INSURANCE' ? 'BHYT' : 'Học phí';

    await feesService.sendFeeReminder({
      class_id: classId,
      fee_type: remindCategory,
      custom_message: getPreviewMessage(),
    });

    setShowRemindModal(false);
    Alert.alert(
      'Gửi thành công! 🔔',
      `Đã gửi thông báo nhắc đóng ${catName} tới ${count} phụ huynh của lớp.`,
      [{ text: 'Đồng ý' }]
    );
  };

  const getPreviewMessage = () => {
    const feeName = remindCategory === 'INSURANCE' ? 'BHYT' : 'học phí HK1';
    if (remindTone === 'POLITE') {
      return `“Kính nhờ phụ huynh nộp ${feeName} cho cô Thu Hà trước ngày 15/10 để nhà trường hoàn thiện thủ tục cho con.”`;
    }
    if (remindTone === 'EXPIRING') {
      return `“Kính nhắc phụ huynh: Hạn nộp ${feeName} sắp kết thúc vào ngày 15/10. Phụ huynh vui lòng hoàn thành sớm cho con.”`;
    }
    return `“Kính nhắc phụ huynh: Ngày mai là hạn chót nộp ${feeName}. Xin phụ huynh lưu ý nộp cho cô Thu Hà trong ngày mai.”`;
  };

  const getAvatarColors = (index: number) => {
    const palettes = [
      { bg: '#E0E7FF', text: '#4338CA' },
      { bg: '#FEF3C7', text: '#B45309' },
      { bg: '#FCE7F3', text: '#BE185D' },
      { bg: '#CCFBF1', text: '#0F766E' },
      { bg: '#EDE9FE', text: '#7C3AED' },
    ];
    return palettes[index % palettes.length];
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const filteredRecords = (feesSummary?.records || []).filter(r => {
    const matchQuery =
      r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student_code.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchQuery) return false;

    if (filterMode === 'UNPAID_INSURANCE') return !r.insurance.is_paid;
    if (filterMode === 'UNPAID_TUITION') return !r.tuition.is_paid;
    return true;
  });

  const totalUnpaid = (feesSummary?.insurance_unpaid_count || 3) + (feesSummary?.tuition_unpaid_count || 5);

  return (
    <View style={styles.container}>
      {/* Background Decor */}
      <View style={styles.bgDecor} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Path
            d="M-20,100 C40,40 140,40 160,100 C180,160 80,180 40,140 C10,110 50,60 100,60"
            stroke="#F58F4C"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.15}
          />
          <Path
            d="M210,320 C260,360 320,280 380,330"
            stroke="#F58F4C"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.12}
          />
          <Path d="M340 120 L342.5 129 L352 131.5 L342.5 134 L340 143 L337.5 134 L328 131.5 L337.5 129 Z" fill="#F58F4C" opacity={0.3} />
          <Path d="M40 540 L42.5 549 L52 551.5 L42.5 554 L40 563 L37.5 554 L28 551.5 L37.5 549 Z" fill="#F58F4C" opacity={0.25} />
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Section */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 19l-7-7 7-7"
                  stroke="#1E1B2E"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            <View style={styles.headerTitleCol}>
              <Text style={styles.headerTitle}>Học Phí & BHYT</Text>
              <View style={styles.classPillDropdown}>
                <Text style={styles.classPillDropdownText}>Lớp 6A1 • HK1</Text>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M6 9l6 6 6-6" stroke="#6B6880" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </View>
          </View>

          {/* 3D Pastel Shield & Coin Illustration */}
          <View style={styles.shieldCoinWrapper}>
            <View style={styles.shieldBox}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="#FFFFFF">
                <Path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </Svg>
            </View>
            <View style={styles.coinCircle}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="#78350F">
                <Circle cx={12} cy={12} r={10} fill="#FFE082" stroke="#FFB74D" strokeWidth={2} />
                <Path d="M12 6v12M9 9h6M9 15h6" stroke="#78350F" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={styles.coinSparkle}>✦</Text>
          </View>
        </View>

        {/* 2. Two KPI Cards (Side by side) */}
        <View style={styles.kpiGrid}>
          {/* BHYT KPI */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiCardTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#D1FAE5' }]}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="#10B981">
                  <Path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </Svg>
              </View>
              <Text style={styles.kpiTitle}>BHYT</Text>
            </View>

            {/* Circular Progress Ring */}
            <View style={styles.progressRingWrapper}>
              <Svg width={72} height={72} viewBox="0 0 72 72">
                <Circle cx={36} cy={36} r={30} stroke="#F1EBFF" strokeWidth={6} fill="transparent" />
                <Circle
                  cx={36}
                  cy={36}
                  r={30}
                  stroke="#10B981"
                  strokeWidth={6}
                  strokeDasharray="188.4"
                  strokeDashoffset={188.4 * (1 - (feesSummary?.insurance_percent || 92) / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  transform="rotate(-90 36 36)"
                />
              </Svg>
              <View style={styles.progressRingTextWrap}>
                <Text style={styles.progressPercentText}>{feesSummary?.insurance_percent || 92}%</Text>
              </View>
            </View>

            <Text style={styles.kpiRatio}>
              {feesSummary?.insurance_paid_count || 35}/{feesSummary?.total_students || 38}
            </Text>
            <View style={styles.kpiRemainingBadge}>
              <View style={[styles.remainingDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.kpiRemainingText}>Còn {feesSummary?.insurance_unpaid_count || 3} em</Text>
            </View>
          </View>

          {/* Học Phí KPI */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiCardTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: '#FFDBC8' }]}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="#F58F4C">
                  <Rect x={2} y={5} width={20} height={14} rx={2} />
                  <Path d="M2 10h20" stroke="#FFFFFF" strokeWidth={2} />
                </Svg>
              </View>
              <Text style={styles.kpiTitle}>Học phí</Text>
            </View>

            {/* Circular Progress Ring */}
            <View style={styles.progressRingWrapper}>
              <Svg width={72} height={72} viewBox="0 0 72 72">
                <Circle cx={36} cy={36} r={30} stroke="#F1EBFF" strokeWidth={6} fill="transparent" />
                <Circle
                  cx={36}
                  cy={36}
                  r={30}
                  stroke="#10B981"
                  strokeWidth={6}
                  strokeDasharray="188.4"
                  strokeDashoffset={188.4 * (1 - (feesSummary?.tuition_percent || 87) / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  transform="rotate(-90 36 36)"
                />
              </Svg>
              <View style={styles.progressRingTextWrap}>
                <Text style={styles.progressPercentText}>{feesSummary?.tuition_percent || 87}%</Text>
              </View>
            </View>

            <Text style={styles.kpiRatio}>
              {feesSummary?.tuition_paid_count || 33}/{feesSummary?.total_students || 38}
            </Text>
            <View style={styles.kpiRemainingBadge}>
              <View style={[styles.remainingDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.kpiRemainingText}>Còn {feesSummary?.tuition_unpaid_count || 5} em</Text>
            </View>
          </View>
        </View>

        {/* 3. Search Bar */}
        <View style={styles.searchBar}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={8} stroke="#6B6880" strokeWidth={2} />
            <Path d="M21 21l-4.35-4.35" stroke="#6B6880" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm học sinh"
            placeholderTextColor="#6B6880"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* 4. Three Filter Pill Chips */}
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.filterChip, filterMode === 'ALL' && styles.filterChipActive]}
            onPress={() => setFilterMode('ALL')}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterChipText, filterMode === 'ALL' && styles.filterChipTextActive]}>
              Tất cả ({feesSummary?.total_students || 38})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterMode === 'UNPAID_INSURANCE' && styles.filterChipActive]}
            onPress={() => setFilterMode('UNPAID_INSURANCE')}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterChipText, filterMode === 'UNPAID_INSURANCE' && styles.filterChipTextActive]}>
              BHYT ({feesSummary?.insurance_unpaid_count || 3})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterMode === 'UNPAID_TUITION' && styles.filterChipActive]}
            onPress={() => setFilterMode('UNPAID_TUITION')}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterChipText, filterMode === 'UNPAID_TUITION' && styles.filterChipTextActive]}>
              Học phí ({feesSummary?.tuition_unpaid_count || 5})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. Student Cards List */}
        <View style={styles.studentCardsCol}>
          {filteredRecords.map((item, idx) => {
            const colors = getAvatarColors(idx);

            return (
              <TouchableOpacity
                key={item.record_id}
                style={styles.studentCard}
                onPress={() => handleOpenEdit(item, 'INSURANCE')}
                activeOpacity={0.9}
              >
                {/* Row A: Info + More icon */}
                <View style={styles.studentHeaderRow}>
                  <View style={styles.studentInfoLeft}>
                    <View style={[styles.avatarBox, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.avatarText, { color: colors.text }]}>
                        {getInitials(item.student_name)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.studentNameText}>{item.student_name}</Text>
                      <Text style={styles.studentCodeText}>{item.student_code}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.moreIconBtn}
                    onPress={() => handleOpenEdit(item, 'INSURANCE')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Circle cx={5} cy={12} r={2} fill="#6B6880" />
                      <Circle cx={12} cy={12} r={2} fill="#6B6880" />
                      <Circle cx={19} cy={12} r={2} fill="#6B6880" />
                    </Svg>
                  </TouchableOpacity>
                </View>

                {/* Row B: 2 Columns BHYT & Học phí */}
                <View style={styles.feeColumnsRow}>
                  {/* BHYT */}
                  <TouchableOpacity
                    style={styles.feeSubCol}
                    onPress={() => handleOpenEdit(item, 'INSURANCE')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.feeSubLabel}>BHYT</Text>
                    {item.insurance.is_paid ? (
                      <View style={styles.paidBadge}>
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="#10B981">
                          <Circle cx={12} cy={12} r={10} fill="#10B981" />
                          <Path d="M7 12l3 3 7-7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={styles.paidBadgeText}>{item.insurance.paid_date || '18/09'}</Text>
                      </View>
                    ) : (
                      <View style={styles.unpaidBadge}>
                        <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                          <Circle cx={12} cy={12} r={9} stroke="#F59E0B" strokeWidth={2} />
                        </Svg>
                        <Text style={styles.unpaidBadgeText}>Chưa nộp</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Học phí */}
                  <TouchableOpacity
                    style={styles.feeSubCol}
                    onPress={() => handleOpenEdit(item, 'TUITION')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.feeSubLabel}>Học phí</Text>
                    {item.tuition.is_paid ? (
                      <View style={styles.paidBadge}>
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="#10B981">
                          <Circle cx={12} cy={12} r={10} fill="#10B981" />
                          <Path d="M7 12l3 3 7-7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={styles.paidBadgeText}>{item.tuition.paid_date || '20/09'}</Text>
                      </View>
                    ) : (
                      <View style={styles.unpaidBadge}>
                        <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                          <Circle cx={12} cy={12} r={9} stroke="#F59E0B" strokeWidth={2} />
                        </Svg>
                        <Text style={styles.unpaidBadgeText}>Chưa nộp</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Optional Note Row */}
                {item.note ? (
                  <View style={styles.noteBox}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#9A3412" strokeWidth={2} strokeLinecap="round" />
                      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#9A3412" strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                    <Text style={styles.noteText} numberOfLines={1}>{item.note}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* 6. FIXED BOTTOM ACTION BAR */}
      <View style={styles.fixedBottomBar}>
        <TouchableOpacity
          style={styles.remindBtn}
          onPress={() => setShowRemindModal(true)}
          activeOpacity={0.88}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.remindBtnText}>Nhắc Phụ Huynh</Text>
          <View style={styles.remindBadge}>
            <Text style={styles.remindBadgeText}>{totalUnpaid}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* TEA-07.3: HỘP THOẠI NHẮC PHỤ HUYNH (BOTTOM-SHEET) */}
      {/* ======================================================== */}
      <Modal
        visible={showRemindModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRemindModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setShowRemindModal(false)}
          />

          <View style={styles.sheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header + 3D Bell Icon */}
            <View style={styles.sheetHeaderRow}>
              <View>
                <Text style={styles.sheetTitle}>Nhắc Phụ Huynh</Text>
                <Text style={styles.sheetSubtitle}>Gửi thông báo nhanh đến phụ huynh</Text>
              </View>

              {/* 3D Bell Icon */}
              <View style={styles.bellIconBox}>
                <View style={styles.bellGlow} />
                <Svg width={36} height={36} viewBox="0 0 56 56" fill="none">
                  <Defs>
                    <SvgLinearGradient id="bellGrad" x1={20} y1={17} x2={36} y2={38} gradientUnits="userSpaceOnUse">
                      <Stop offset="0%" stopColor="#FFB68B" />
                      <Stop offset="50%" stopColor="#F58F4C" />
                      <Stop offset="100%" stopColor="#984704" />
                    </SvgLinearGradient>
                  </Defs>
                  <Path
                    d="M28 17C23.0294 17 19 21.0294 19 26V32.5C19 33.3284 18.3284 34 17.5 34C16.6716 34 16 34.6716 16 35.5C16 36.3284 16.6716 37 17.5 37H38.5C39.3284 37 40 36.3284 40 35.5C40 34.6716 39.3284 34 38.5 34C37.6716 34 37 33.3284 37 32.5V26C37 21.0294 32.9706 17 28 17Z"
                    fill="url(#bellGrad)"
                  />
                  <Path d="M25 38.5C25 40.1569 26.3431 41.5 28 41.5C29.6569 41.5 31 40.1569 31 38.5H25Z" fill="#984704" />
                  <Path d="M43 11L44.2 14.8L48 16L44.2 17.2L43 21L41.8 17.2L38 16L41.8 14.8L43 11Z" fill="#F58F4C" />
                </Svg>
              </View>
            </View>

            {/* Selectable Category Bento Cards */}
            <View style={styles.categoryGrid}>
              {/* Card 1: BHYT */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  remindCategory === 'INSURANCE' && styles.categoryCardSelected,
                ]}
                onPress={() => setRemindCategory('INSURANCE')}
                activeOpacity={0.85}
              >
                <View style={styles.catCardTop}>
                  <View style={[
                    styles.catCheckCircle,
                    remindCategory === 'INSURANCE' ? styles.catCheckCircleActive : styles.catCheckCircleInactive,
                  ]}>
                    {remindCategory === 'INSURANCE' && (
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
                      </Svg>
                    )}
                  </View>
                  <Text style={[
                    styles.catStatusTag,
                    remindCategory === 'INSURANCE' ? { color: '#984704' } : { color: '#887367' },
                  ]}>
                    {remindCategory === 'INSURANCE' ? 'ĐANG CHỌN' : 'CÒN LẠI'}
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.catTitle}>Bảo hiểm y tế</Text>
                  <Text style={[
                    styles.catCountText,
                    remindCategory === 'INSURANCE' ? { color: '#984704' } : { color: '#887367' },
                  ]}>
                    {feesSummary?.insurance_unpaid_count || 3} phụ huynh
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Card 2: Học Phí */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  remindCategory === 'TUITION' && styles.categoryCardSelected,
                ]}
                onPress={() => setRemindCategory('TUITION')}
                activeOpacity={0.85}
              >
                <View style={styles.catCardTop}>
                  <View style={[
                    styles.catCheckCircle,
                    remindCategory === 'TUITION' ? styles.catCheckCircleActive : styles.catCheckCircleInactive,
                  ]}>
                    {remindCategory === 'TUITION' && (
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
                      </Svg>
                    )}
                  </View>
                  <Text style={[
                    styles.catStatusTag,
                    remindCategory === 'TUITION' ? { color: '#984704' } : { color: '#887367' },
                  ]}>
                    {remindCategory === 'TUITION' ? 'ĐANG CHỌN' : 'CÒN LẠI'}
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.catTitle}>Học phí</Text>
                  <Text style={[
                    styles.catCountText,
                    remindCategory === 'TUITION' ? { color: '#984704' } : { color: '#887367' },
                  ]}>
                    {feesSummary?.tuition_unpaid_count || 5} phụ huynh
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Quick Tone Pills */}
            <View style={styles.tonePillsRow}>
              <TouchableOpacity
                style={[styles.tonePill, remindTone === 'POLITE' && styles.tonePillActive]}
                onPress={() => setRemindTone('POLITE')}
              >
                <Text style={styles.toneHeartIcon}>♥</Text>
                <Text style={[styles.tonePillText, remindTone === 'POLITE' && styles.tonePillTextActive]}>
                  Lịch sự
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tonePill, remindTone === 'EXPIRING' && styles.tonePillActive]}
                onPress={() => setRemindTone('EXPIRING')}
              >
                <Text style={[styles.tonePillText, remindTone === 'EXPIRING' && styles.tonePillTextActive]}>
                  Sắp hết hạn
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tonePill, remindTone === 'TOMORROW' && styles.tonePillActive]}
                onPress={() => setRemindTone('TOMORROW')}
              >
                <Text style={[styles.tonePillText, remindTone === 'TOMORROW' && styles.tonePillTextActive]}>
                  Ngày mai
                </Text>
              </TouchableOpacity>
            </View>

            {/* Message Preview Box */}
            <View style={styles.msgPreviewBox}>
              <View style={styles.msgPreviewHeader}>
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="#F58F4C">
                  <Path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
                </Svg>
                <Text style={styles.msgPreviewTitle}>Nội dung gửi mẫu</Text>
              </View>
              <Text style={styles.msgPreviewContent}>
                {getPreviewMessage()}
              </Text>
            </View>

            {/* Send Action Button */}
            <TouchableOpacity
              style={styles.sendActionBtn}
              onPress={handleSendReminder}
              activeOpacity={0.88}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF">
                <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </Svg>
              <Text style={styles.sendActionBtnText}>Gửi Nhắc</Text>
              <View style={styles.sendActionBadge}>
                <Text style={styles.sendActionBadgeText}>
                  {remindCategory === 'INSURANCE' ? feesSummary?.insurance_unpaid_count || 3 : feesSummary?.tuition_unpaid_count || 5}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* TEA-07.2: MODAL CẬP NHẬT ĐÓNG TIỀN (BOTTOM-SHEET) */}
      {/* ======================================================== */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setShowEditModal(false)}
          />

          <View style={styles.sheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Student Header Row */}
            <View style={styles.editStudentHeader}>
              <View style={styles.editStudentLeft}>
                <View style={styles.editAvatar}>
                  <Text style={styles.editAvatarText}>
                    {selectedStudent ? getInitials(selectedStudent.student_name) : 'BN'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.editStudentName}>
                    {selectedStudent?.student_name || 'Trần Bảo Nam'}
                  </Text>
                  <View style={styles.editCodeBadge}>
                    <Text style={styles.editCodeBadgeText}>
                      {selectedStudent?.student_code || 'HS240102'}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke="#887367" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Segmented Filter Pills */}
            <View style={styles.segmentedFilter}>
              <TouchableOpacity
                style={[styles.segmentBtn, editFeeType === 'INSURANCE' && styles.segmentBtnActive]}
                onPress={() => handleSwitchFeeType('INSURANCE')}
              >
                <Text style={[styles.segmentBtnText, editFeeType === 'INSURANCE' && styles.segmentBtnTextActive]}>
                  BHYT
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, editFeeType === 'TUITION' && styles.segmentBtnActive]}
                onPress={() => handleSwitchFeeType('TUITION')}
              >
                <Text style={[styles.segmentBtnText, editFeeType === 'TUITION' && styles.segmentBtnTextActive]}>
                  Học phí
                </Text>
              </TouchableOpacity>
            </View>

            {/* Status Toggle Card */}
            <View style={styles.statusToggleCard}>
              <View style={styles.statusToggleLeft}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill={editIsPaid ? '#10B981' : '#A3A0B5'}>
                  <Circle cx={12} cy={12} r={10} fill={editIsPaid ? '#10B981' : '#D1D5DB'} />
                  {editIsPaid && <Path d="M7 12l3 3 7-7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />}
                </Svg>
                <Text style={styles.statusToggleTitle}>
                  {editIsPaid ? 'Đã nộp' : 'Chưa nộp'}
                </Text>
              </View>

              <Switch
                value={editIsPaid}
                onValueChange={setEditIsPaid}
                trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Date Selection Card */}
            <View style={styles.dateCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardSmallLabel}>Ngày nộp</Text>
                <TextInput
                  style={styles.cardInputText}
                  value={editPaidDate}
                  onChangeText={setEditPaidDate}
                  placeholder="DD/MM/YYYY"
                />
              </View>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={4} width={18} height={18} rx={2} stroke="#887367" strokeWidth={2} />
                <Path d="M16 2v4M8 2v4M3 10h18" stroke="#887367" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </View>

            {/* Note Input Card */}
            <View style={styles.noteCard}>
              <Text style={styles.cardSmallLabel}>Ghi chú</Text>
              <TextInput
                style={styles.cardInputText}
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Nhập ghi chú nộp tiền..."
                placeholderTextColor="#A3A0B5"
              />
            </View>

            {/* Action Buttons Row */}
            <View style={styles.editActionRow}>
              <TouchableOpacity
                style={styles.editCancelBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.editCancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editSaveBtn}
                onPress={handleSaveFeeStatus}
                activeOpacity={0.88}
              >
                <Text style={styles.editSaveBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE3C8',
    position: 'relative',
  },
  bgDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8C5A32',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.2,
  },
  classPillDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 4,
    shadowColor: '#8C5A32',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  classPillDropdownText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  shieldCoinWrapper: {
    width: 72,
    height: 60,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '6deg' }],
    shadowColor: '#F58F4C',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  coinCircle: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE082',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  coinSparkle: {
    position: 'absolute',
    top: 0,
    right: 4,
    color: '#F59E0B',
    fontSize: 14,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#8C5A32',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 3,
  },
  kpiCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  kpiIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  progressRingWrapper: {
    width: 72,
    height: 72,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  progressRingTextWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#10B981',
  },
  kpiRatio: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#1E1B2E',
    marginTop: 2,
  },
  kpiRemainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  remainingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kpiRemainingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },

  // Search Bar
  searchBar: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    shadowColor: '#8C5A32',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#1E1B2E',
    padding: 0,
  },

  // Filter Chips Row
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8C5A32',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#F58F4C',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // Student Cards List
  studentCardsCol: {
    gap: 12,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#8C5A32',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 2,
  },
  studentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  studentInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
  },
  studentNameText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  studentCodeText: {
    fontSize: 11.5,
    lineHeight: 15,
    color: '#6B6880',
    marginTop: 1,
  },
  moreIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  feeColumnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  feeSubCol: {
    flex: 1,
    gap: 4,
  },
  feeSubLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6B6880',
    paddingLeft: 2,
  },
  paidBadge: {
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D1FAE5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  paidBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  unpaidBadge: {
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  unpaidBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 8,
  },
  noteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A3412',
    flex: 1,
  },

  // Fixed Bottom Bar
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    shadowColor: '#8C5A32',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 20,
    elevation: 8,
  },
  remindBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  remindBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  remindBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  remindBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F58F4C',
  },

  // Modal common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 44, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBackdropDismiss: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    shadowColor: '#1C192C',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -12 },
    shadowRadius: 32,
    elevation: 10,
  },
  dragHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },

  // TEA-07.3 Remind Sheet
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C192C',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#6B6880',
    marginTop: 2,
  },
  bellIconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFDBC8',
    opacity: 0.5,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#F7F1FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2DFFF',
  },
  categoryCardSelected: {
    backgroundColor: '#FFF1E6',
    borderColor: '#F58F4C',
  },
  catCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCheckCircleActive: {
    backgroundColor: '#F58F4C',
  },
  catCheckCircleInactive: {
    backgroundColor: '#E2DFFF',
  },
  catStatusTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  catTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C192C',
  },
  catCountText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  tonePillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F1EBFF',
  },
  tonePillActive: {
    backgroundColor: '#FFE3D1',
    borderWidth: 1.5,
    borderColor: '#F58F4C',
  },
  toneHeartIcon: {
    color: '#F58F4C',
    fontSize: 11,
  },
  tonePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#554339',
  },
  tonePillTextActive: {
    color: '#984704',
    fontWeight: '700',
  },
  msgPreviewBox: {
    backgroundColor: '#F7F1FF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  msgPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  msgPreviewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#554339',
  },
  msgPreviewContent: {
    fontSize: 13,
    lineHeight: 18,
    color: '#1C192C',
    fontStyle: 'italic',
  },
  sendActionBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  sendActionBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sendActionBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendActionBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#984704',
  },

  // TEA-07.2 Edit Sheet
  editStudentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  editStudentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFE3D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#984704',
  },
  editStudentName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C192C',
  },
  editCodeBadge: {
    backgroundColor: '#F1EBFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  editCodeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#554339',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedFilter: {
    flexDirection: 'row',
    backgroundColor: '#F1EBFF',
    borderRadius: 22,
    padding: 3,
    gap: 4,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B6880',
  },
  segmentBtnTextActive: {
    color: '#F58F4C',
    fontWeight: '800',
  },
  statusToggleCard: {
    backgroundColor: '#FFF1E6',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusToggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C192C',
  },
  dateCard: {
    backgroundColor: '#F7F1FF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardSmallLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#887367',
    marginBottom: 2,
  },
  cardInputText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C192C',
    padding: 0,
  },
  noteCard: {
    backgroundColor: '#F7F1FF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  editActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editCancelBtn: {
    width: 96,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F58F4C',
  },
  editSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  editSaveBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
