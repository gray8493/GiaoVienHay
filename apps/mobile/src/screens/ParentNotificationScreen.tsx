import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Svg, Path, Rect, Circle, Line } from 'react-native-svg';

interface ParentNotificationScreenProps {
  onBack?: () => void;
}

type FilterType = 'ALL' | 'ATTENDANCE' | 'GRADES' | 'EXAMS' | 'FEES';

interface NotificationItem {
  id: string;
  title: string;
  time_label: string;
  category: FilterType;
  is_unread: boolean;
  icon_type: 'calendar' | 'book' | 'shield' | 'exam' | 'chat';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'Gia Bảo vắng mặt hôm nay',
    time_label: '07:45',
    category: 'ATTENDANCE',
    is_unread: true,
    icon_type: 'calendar',
  },
  {
    id: 'notif_02',
    title: 'Cô Thu Hà gửi sổ liên lạc môn Toán',
    time_label: 'Hôm qua',
    category: 'GRADES',
    is_unread: true,
    icon_type: 'book',
  },
  {
    id: 'notif_03',
    title: 'Nhắc nộp BHYT trước 15/10',
    time_label: 'Hôm qua',
    category: 'FEES',
    is_unread: false,
    icon_type: 'shield',
  },
  {
    id: 'notif_04',
    title: 'Kiểm tra 1 tiết Toán ngày 16/10',
    time_label: '2 ngày trước',
    category: 'EXAMS',
    is_unread: false,
    icon_type: 'exam',
  },
  {
    id: 'notif_05',
    title: 'Có nhận xét mới từ cô Thu Hà',
    time_label: '2 ngày trước',
    category: 'GRADES',
    is_unread: false,
    icon_type: 'chat',
  },
];

export const ParentNotificationScreen: React.FC<ParentNotificationScreenProps> = ({
  onBack,
}) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_unread: false })));
  };

  const filteredList = notifications.filter(item => {
    if (filter === 'ALL') return true;
    return item.category === filter;
  });

  return (
    <View style={styles.container}>
      {/* Background Decor Stars */}
      <View style={styles.bgDecorWrapper} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Path d="M340 60 L342 66 L348 68 L342 70 L340 76 L338 70 L332 68 L338 66 Z" fill="#F58F4C" fillOpacity={0.25} />
          <Path d="M20 380 L22 386 L28 388 L22 390 L20 396 L18 390 L12 388 L18 386 Z" fill="#F58F4C" fillOpacity={0.25} />
        </Svg>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2.5}>
              <Path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Thông Báo</Text>

          <TouchableOpacity
            style={styles.readAllBtn}
            onPress={handleMarkAllRead}
            activeOpacity={0.85}
          >
            <Text style={styles.readAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          <TouchableOpacity
            style={[styles.chip, filter === 'ALL' && styles.chipActive]}
            onPress={() => setFilter('ALL')}
            activeOpacity={0.85}
          >
            <Text style={[styles.chipText, filter === 'ALL' && styles.chipTextActive]}>Tất cả</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filter === 'ATTENDANCE' && styles.chipActive]}
            onPress={() => setFilter('ATTENDANCE')}
            activeOpacity={0.85}
          >
            <Text style={[styles.chipText, filter === 'ATTENDANCE' && styles.chipTextActive]}>Điểm danh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filter === 'GRADES' && styles.chipActive]}
            onPress={() => setFilter('GRADES')}
            activeOpacity={0.85}
          >
            <Text style={[styles.chipText, filter === 'GRADES' && styles.chipTextActive]}>Điểm số</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filter === 'EXAMS' && styles.chipActive]}
            onPress={() => setFilter('EXAMS')}
            activeOpacity={0.85}
          >
            <Text style={[styles.chipText, filter === 'EXAMS' && styles.chipTextActive]}>Kiểm tra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filter === 'FEES' && styles.chipActive]}
            onPress={() => setFilter('FEES')}
            activeOpacity={0.85}
          >
            <Text style={[styles.chipText, filter === 'FEES' && styles.chipTextActive]}>Học phí</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Notification List Card */}
        <View style={styles.card}>
          {filteredList.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.itemRow}
                activeOpacity={0.8}
                onPress={() => {
                  setNotifications(prev =>
                    prev.map(n => (n.id === item.id ? { ...n, is_unread: false } : n))
                  );
                }}
              >
                {/* Icon Tile */}
                <View style={styles.iconTile}>
                  {item.icon_type === 'calendar' && (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                      <Rect x="3" y="4" width="18" height="18" rx="2" />
                      <Line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                      <Line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                      <Line x1="3" y1="10" x2="21" y2="10" />
                    </Svg>
                  )}
                  {item.icon_type === 'book' && (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </Svg>
                  )}
                  {item.icon_type === 'shield' && (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </Svg>
                  )}
                  {item.icon_type === 'exam' && (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                      <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </Svg>
                  )}
                  {item.icon_type === 'chat' && (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
                      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </Svg>
                  )}
                </View>

                {/* Text Info */}
                <View style={styles.textWrap}>
                  <Text style={[styles.titleText, item.is_unread && styles.titleTextUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.timeText}>{item.time_label}</Text>
                </View>

                {/* Red Unread Dot */}
                {item.is_unread && <View style={styles.redDot} />}
              </TouchableOpacity>
              {index < filteredList.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Home Indicator Spacer */}
        <View style={styles.homeIndicator} />
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFF1E6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  readAllBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: '#F58F4C',
  },
  readAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F58F4C',
  },
  filterChipsRow: {
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFF1E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: '#F58F4C',
    borderColor: '#F58F4C',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B6880',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3ECE5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
    overflow: 'hidden',
  },
  itemRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B2E',
    lineHeight: 18,
  },
  titleTextUnread: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#6B6880',
    marginTop: 2,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#F6EFEA',
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: 'rgba(30, 27, 46, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 28,
  },
});
