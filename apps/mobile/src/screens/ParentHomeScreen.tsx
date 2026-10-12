import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Svg, Path, Rect, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G, Line, Polyline, Polygon } from 'react-native-svg';
import { parentService, ChildItem, ParentDashboardData } from '../services/parent.service';

interface ParentHomeScreenProps {
  onOpenNotifications?: () => void;
  onNavigateToTab?: (tabKey: 'home' | 'academic' | 'fees' | 'profile') => void;
  onNavigateToAcademic?: (initialTab?: 'GRADES' | 'REMARKS' | 'ATTENDANCE') => void;
  onNavigateToAddChild?: () => void;
  onLogout?: () => void;
}

export const ParentHomeScreen: React.FC<ParentHomeScreenProps> = ({
  onOpenNotifications,
  onNavigateToTab,
  onNavigateToAcademic,
  onNavigateToAddChild,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'academic' | 'fees' | 'profile'>('home');
  const [childrenList, setChildrenList] = useState<ChildItem[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('stu_02');
  const [dashboardData, setDashboardData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  // Bottom Sheet "Chọn Con" (PAR-01.BS)
  const [isChildSheetVisible, setIsChildSheetVisible] = useState(false);

  // Modal "+ Thêm Con" (Liên kết mã học sinh mới)
  const [isAddChildModalVisible, setIsAddChildModalVisible] = useState(false);
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      loadDashboard(selectedChildId);
    }
  }, [selectedChildId]);

  const loadChildren = async () => {
    const list = await parentService.getLinkedChildren();
    setChildrenList(list);
    if (list.length > 0 && !selectedChildId) {
      setSelectedChildId(list[0].id);
    }
  };

  const loadDashboard = async (childId: string) => {
    setLoading(true);
    try {
      const data = await parentService.getChildDashboard(childId);
      setDashboardData(data);
    } catch (e) {
      console.warn('Error loading parent dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    setIsChildSheetVisible(false);
  };

  const handleLinkChild = async () => {
    if (!studentCodeInput.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã học sinh hoặc mã mời (Ví dụ: HS240105 hoặc INV-6A1-9821)');
      return;
    }

    setIsLinking(true);
    try {
      const newChild = await parentService.linkNewChild(studentCodeInput.trim());
      setChildrenList(prev => [...prev, newChild]);
      setSelectedChildId(newChild.id);
      setIsAddChildModalVisible(false);
      setIsChildSheetVisible(false);
      setStudentCodeInput('');
      Alert.alert('Thành công', `Đã liên kết thành công với học sinh ${newChild.full_name}!`);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Mã học sinh không hợp lệ hoặc đã được liên kết');
    } finally {
      setIsLinking(false);
    }
  };

  const currentChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0] || {
    id: 'stu_02',
    student_code: 'HS240102',
    full_name: 'Trần Gia Bảo',
    avatar_letters: 'GB',
    class_name: 'Lớp 6A1',
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient & SVG Swirls / Stars */}
      <View style={styles.bgSvgContainer} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Path
            d="M-40 120C60 90 140 190 220 150C300 110 380 180 430 160"
            stroke="#F58F4C"
            strokeDasharray="4 6"
            strokeOpacity={0.22}
            strokeWidth={1.5}
          />
          <Path
            d="M-20 380C80 340 160 440 260 410C360 380 400 480 440 460"
            stroke="#F58F4C"
            strokeDasharray="5 7"
            strokeOpacity={0.18}
            strokeWidth={1.5}
          />
          <Path
            d="M-30 650C70 600 180 720 280 670C380 620 420 710 440 700"
            stroke="#F58F4C"
            strokeDasharray="4 6"
            strokeOpacity={0.18}
            strokeWidth={1.5}
          />
          {/* 4-point stars */}
          <Path d="M340 60 L342 66 L348 68 L342 70 L340 76 L338 70 L332 68 L338 66 Z" fill="#F58F4C" fillOpacity={0.28} />
          <Path d="M42 220 L44 225 L49 227 L44 229 L42 234 L40 229 L35 227 L40 225 Z" fill="#F58F4C" fillOpacity={0.32} />
          <Path d="M345 330 L346.5 334 L351 335.5 L346.5 337 L345 341 L343.5 337 L339 335.5 L343.5 334 Z" fill="#F58F4C" fillOpacity={0.25} />
          <Path d="M38 520 L40 525 L45 527 L40 529 L38 534 L36 529 L31 527 L36 525 Z" fill="#F58F4C" fillOpacity={0.26} />
        </Svg>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 1. HEADER ================= */}
        <View style={styles.headerRow}>
          {/* Child Switcher Pill */}
          <TouchableOpacity
            style={styles.childSwitcherPill}
            onPress={() => setIsChildSheetVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.childAvatarBadge}>
              <Text style={styles.childAvatarText}>{currentChild.avatar_letters || 'GB'}</Text>
            </View>
            <View style={styles.childNameWrap}>
              <Text style={styles.childNameTitle} numberOfLines={1}>{currentChild.full_name}</Text>
              <Text style={styles.childClassSub}>{currentChild.class_name}</Text>
            </View>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2.5}>
              <Path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.bellButton}
            onPress={onOpenNotifications}
            activeOpacity={0.85}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2}>
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </Svg>
            <View style={styles.redDot} />
          </TouchableOpacity>
        </View>

        {/* ================= 2. HERO CARD ================= */}
        <View style={styles.heroCard}>
          <View style={styles.heroDecoCircle} />
          <View style={styles.heroContentLeft}>
            <Text style={styles.heroDateTag}>
              {dashboardData?.attendance.date_str || 'HÔM NAY • THỨ NĂM, 08/10'}
            </Text>
            <Text style={styles.heroTitle}>
              {dashboardData?.attendance.status_title || 'Vắng Có Phép'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {dashboardData?.attendance.note || 'Bị sốt, mẹ xin phép'}
            </Text>
          </View>

          {/* Icon Box Bên Phải */}
          <View style={styles.heroIconBox}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
              <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <Line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
              <Line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
              <Line x1="3" y1="10" x2="21" y2="10" />
              <Polyline points="9 16 11 18 15 14" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </View>

        {/* ================= 3. BENTO GRID 2x2 ================= */}
        <View style={styles.bentoGrid}>
          {/* Tile 1: Điểm mới */}
          <TouchableOpacity
            style={styles.bentoTile}
            activeOpacity={0.85}
            onPress={() => (onNavigateToAcademic ? onNavigateToAcademic('GRADES') : onNavigateToTab?.('academic'))}
          >
            <View style={styles.bentoTileTop}>
              <View style={styles.bentoIconBox}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                  <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={styles.bentoCategoryLabel}>Điểm mới</Text>
            </View>
            <View style={styles.bentoTileBottom}>
              <Text style={styles.bentoMainValue}>
                {dashboardData?.latest_grade.subject || 'Toán'} {dashboardData?.latest_grade.score || '9.0'}
              </Text>
              <View style={styles.bentoPillTag}>
                <Text style={styles.bentoPillText}>{dashboardData?.latest_grade.test_type || '15 phút'}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Tile 2: Nhận xét */}
          <TouchableOpacity
            style={styles.bentoTile}
            activeOpacity={0.85}
            onPress={() => (onNavigateToAcademic ? onNavigateToAcademic('REMARKS') : onNavigateToTab?.('academic'))}
          >
            <View style={styles.bentoTileTop}>
              <View style={styles.bentoIconBox}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                  <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </Svg>
              </View>
              <Text style={styles.bentoCategoryLabel}>Nhận xét</Text>
            </View>
            <View style={styles.bentoTileBottom}>
              <Text style={styles.bentoMainValue}>
                {dashboardData?.latest_remark.count_label || '1 lời mới'}
              </Text>
              <View style={styles.bentoPillTag}>
                <Text style={styles.bentoPillText}>{dashboardData?.latest_remark.status_label || 'Chưa đọc'}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Tile 3: Thu phí */}
          <TouchableOpacity
            style={styles.bentoTile}
            activeOpacity={0.85}
            onPress={() => onNavigateToTab?.('fees')}
          >
            <View style={styles.bentoTileTop}>
              <View style={styles.bentoIconBox}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                  <Rect x="2" y="4" width="20" height="16" rx="2" />
                  <Line x1="2" y1="10" x2="22" y2="10" strokeLinecap="round" />
                  <Line x1="6" y1="15" x2="10" y2="15" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={styles.bentoCategoryLabel}>Thu phí</Text>
            </View>
            <View style={styles.bentoTileBottom}>
              <Text style={styles.bentoMainValue}>
                {dashboardData?.fees_insurance.type || 'BHYT'}
              </Text>
              <View style={styles.bentoPillTag}>
                <Text style={styles.bentoPillText}>{dashboardData?.fees_insurance.status_label || 'Chưa nộp'}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Tile 4: Kiểm tra */}
          <TouchableOpacity
            style={styles.bentoTile}
            activeOpacity={0.85}
            onPress={() => (onNavigateToAcademic ? onNavigateToAcademic('REMARKS') : onNavigateToTab?.('academic'))}
          >
            <View style={styles.bentoTileTop}>
              <View style={styles.bentoIconBox}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                  <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <Line x1="9" y1="11" x2="15" y2="11" strokeLinecap="round" />
                  <Line x1="9" y1="15" x2="13" y2="15" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={styles.bentoCategoryLabel}>Kiểm tra</Text>
            </View>
            <View style={styles.bentoTileBottom}>
              <Text style={styles.bentoMainValue}>
                {dashboardData?.upcoming_exam.subject || 'Toán'}
              </Text>
              <View style={styles.bentoPillTag}>
                <Text style={styles.bentoPillText}>{dashboardData?.upcoming_exam.exam_date || '16/10'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= 4. TIMELINE SECTION ================= */}
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>Lịch học hôm nay</Text>
            <View style={styles.pillCount}>
              <Text style={styles.pillCountText}>2 tiết</Text>
            </View>
          </View>

          <View style={styles.timelineCard}>
            {/* Timeline Item 1 */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineNodeCol}>
                <View style={styles.timelineDotActive} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContentWrap}>
                <Text style={styles.lessonTitle}>Tiết 2: Toán Hình</Text>
                <Text style={styles.lessonMeta}>08:15 – 09:00 • Phòng 204</Text>
              </View>
            </View>

            {/* Timeline Item 2 */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineNodeCol}>
                <View style={styles.timelineDotInactive} />
              </View>
              <View style={styles.timelineContentWrap}>
                <Text style={styles.lessonTitle}>Tiết 4: Sinh hoạt lớp</Text>
                <Text style={styles.lessonMeta}>10:15 – 11:00 • Phòng 204</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ================= 5. PARENT DOCK (Floating Dark Pill) ================= */}
      <View style={styles.dockContainer}>
        {/* Tab 1: Trang chủ (Active) */}
        <TouchableOpacity
          style={styles.dockItem}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.85}
        >
          <View style={[styles.dockIconCircle, activeTab === 'home' && styles.dockIconCircleActive]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2}>
              <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <Polyline points="9 22 9 12 15 12 15 22" />
            </Svg>
          </View>
          <Text style={[styles.dockLabel, activeTab === 'home' && styles.dockLabelActive]}>Trang chủ</Text>
        </TouchableOpacity>

        {/* Tab 2: Học tập */}
        <TouchableOpacity
          style={styles.dockItem}
          onPress={() => {
            setActiveTab('academic');
            if (onNavigateToAcademic) {
              onNavigateToAcademic('GRADES');
            } else {
              onNavigateToTab?.('academic');
            }
          }}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
              <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Học tập</Text>
        </TouchableOpacity>

        {/* Tab 3: Thu phí */}
        <TouchableOpacity
          style={styles.dockItem}
          onPress={() => {
            setActiveTab('fees');
            onNavigateToTab?.('fees');
          }}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
              <Rect x="2" y="4" width="20" height="16" rx="2" />
              <Line x1="2" y1="10" x2="22" y2="10" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Thu phí</Text>
        </TouchableOpacity>

        {/* Tab 4: Cá nhân */}
        <TouchableOpacity
          style={styles.dockItem}
          onPress={() => {
            setActiveTab('profile');
            onNavigateToTab?.('profile');
          }}
          activeOpacity={0.85}
        >
          <View style={styles.dockIconBox}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2}>
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </Svg>
          </View>
          <Text style={styles.dockLabel}>Cá nhân</Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* BOTTOM SHEET MODAL: PAR-01.BS HỘP THOẠI CHỌN CON         */}
      {/* ======================================================== */}
      <Modal
        visible={isChildSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsChildSheetVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setIsChildSheetVisible(false)}
          />

          <View style={styles.bottomSheetCard}>
            {/* Drag Handle */}
            <View style={styles.sheetHandleWrap}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Header: Tiêu đề + Nút đóng ✕ */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Chọn Con</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsChildSheetVisible(false)}
                activeOpacity={0.8}
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6B6880" strokeWidth={2.5}>
                  <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Thẻ Card Trắng với các hàng phân tách */}
            <View style={styles.childrenListCard}>
              {childrenList.map((ch, index) => {
                const isSelected = ch.id === selectedChildId;
                const isFirst = index === 0;

                return (
                  <View key={ch.id}>
                    <TouchableOpacity
                      style={[
                        styles.childItemRow,
                        isSelected ? styles.childItemRowSelected : styles.childItemRowNormal,
                      ]}
                      onPress={() => handleSelectChild(ch.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.childRowLeft}>
                        <View style={[styles.childAvatarLetter, isSelected && styles.childAvatarLetterWhite]}>
                          <Text style={styles.avatarLetterText}>{ch.avatar_letters}</Text>
                        </View>
                        <View>
                          <Text style={styles.childRowName}>{ch.full_name}</Text>
                          <Text style={styles.childRowClass}>{ch.class_name}</Text>
                        </View>
                      </View>

                      {/* Vòng tròn check cam hoặc vòng xám rỗng */}
                      {isSelected ? (
                        <View style={styles.checkCircleActive}>
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3}>
                            <Polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        </View>
                      ) : (
                        <View style={styles.checkCircleInactive} />
                      )}
                    </TouchableOpacity>
                    <View style={styles.childDivider} />
                  </View>
                );
              })}

              {/* Hàng 3: + Thêm Con */}
              <TouchableOpacity
                style={styles.addChildRow}
                onPress={() => {
                  setIsChildSheetVisible(false);
                  if (onNavigateToAddChild) {
                    onNavigateToAddChild();
                  } else {
                    setIsAddChildModalVisible(true);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.addChildIconBox}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.5}>
                    <Line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                    <Line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                  </Svg>
                </View>
                <View>
                  <Text style={styles.addChildTitle}>+ Thêm Con</Text>
                  <Text style={styles.addChildSub}>Liên kết mã học sinh mới</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* iOS Home Indicator */}
            <View style={styles.sheetHomeIndicator} />
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL PHỤ: LIÊN KẾT MÃ HỌC SINH MỚI                     */}
      {/* ======================================================== */}
      <Modal
        visible={isAddChildModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddChildModalVisible(false)}
      >
        <View style={styles.linkModalBackdrop}>
          <View style={styles.linkModalCard}>
            <Text style={styles.linkModalTitle}>Liên Kết Mã Học Sinh</Text>
            <Text style={styles.linkModalDesc}>
              Nhập mã học sinh hoặc mã mời được nhà trường cung cấp để theo dõi kết quả học tập của con.
            </Text>

            <View style={styles.linkInputBox}>
              <TextInput
                style={styles.linkTextInput}
                placeholder="Ví dụ: HS240105 hoặc INV-6A1-9821"
                placeholderTextColor="#A09DAE"
                value={studentCodeInput}
                onChangeText={setStudentCodeInput}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.linkModalActions}>
              <TouchableOpacity
                style={styles.linkCancelBtn}
                onPress={() => setIsAddChildModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.linkCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkConfirmBtn}
                onPress={handleLinkChild}
                activeOpacity={0.9}
                disabled={isLinking}
              >
                {isLinking ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.linkConfirmText}>Liên Kết</Text>
                )}
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
    backgroundColor: '#FFCFA3',
    position: 'relative',
  },
  bgSvgContainer: {
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
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 110,
  },

  /* 1. Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  childSwitcherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFE3C8',
    gap: 10,
  },
  childAvatarBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B6880',
  },
  childNameWrap: {
    justifyContent: 'center',
  },
  childNameTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B2E',
    lineHeight: 18,
  },
  childClassSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6880',
    lineHeight: 16,
    marginTop: 1,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE3C8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  redDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },

  /* 2. Hero Card */
  heroCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: '#F58F4C',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 20,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecoCircle: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroContentLeft: {
    flex: 1,
    paddingRight: 8,
  },
  heroDateTag: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 6,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 18,
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  /* 3. Bento Grid 2x2 */
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  bentoTile: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 210, 0.6)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  bentoTileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  bentoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoCategoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6880',
  },
  bentoTileBottom: {
    marginTop: 10,
  },
  bentoMainValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E1B2E',
    lineHeight: 22,
  },
  bentoPillTag: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  bentoPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
  },

  /* 4. Timeline */
  timelineSection: {
    marginTop: 20,
    width: '100%',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  pillCount: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  pillCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6880',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 210, 0.6)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineNodeCol: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 4,
    width: 14,
  },
  timelineDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F58F4C',
    borderWidth: 2,
    borderColor: '#FFF1E6',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#FFE3C8',
    marginVertical: 4,
  },
  timelineDotInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE3C8',
  },
  timelineContentWrap: {
    flex: 1,
    paddingBottom: 12,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B2E',
    lineHeight: 18,
  },
  lessonMeta: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6880',
    lineHeight: 16,
    marginTop: 3,
  },

  /* 5. Floating Dark Dock */
  dockContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: '#1E1B2E',
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
  dockIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockIconCircleActive: {
    backgroundColor: '#F58F4C',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 2,
  },
  dockIconBox: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 3,
  },
  dockLabelActive: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },

  /* Bottom Sheet PAR-01.BS */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: '#FDF8FF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
  },
  sheetHandleWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetHandle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDD6E5',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B2E',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childrenListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  childItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  childItemRowSelected: {
    backgroundColor: '#FFF1E6',
  },
  childItemRowNormal: {
    backgroundColor: '#FFFFFF',
  },
  childRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  childAvatarLetter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarLetterWhite: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  avatarLetterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B6880',
  },
  childRowName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B2E',
    lineHeight: 18,
  },
  childRowClass: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6880',
    lineHeight: 16,
    marginTop: 2,
  },
  checkCircleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  checkCircleInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD6E5',
    backgroundColor: '#FFFFFF',
  },
  childDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  addChildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    backgroundColor: '#FFFFFF',
  },
  addChildIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChildTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F58F4C',
    lineHeight: 18,
  },
  addChildSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B6880',
    lineHeight: 16,
    marginTop: 2,
  },
  sheetHomeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: 'rgba(30, 27, 46, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 24,
  },

  /* Link Modal */
  linkModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  linkModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 10,
  },
  linkModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B2E',
    marginBottom: 8,
  },
  linkModalDesc: {
    fontSize: 13,
    color: '#6B6880',
    lineHeight: 18,
    marginBottom: 16,
  },
  linkInputBox: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8F6FA',
    borderWidth: 1,
    borderColor: '#EAE6EB',
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 20,
  },
  linkTextInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B2E',
  },
  linkModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  linkCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 9999,
    backgroundColor: '#F4F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6880',
  },
  linkConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 9999,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
