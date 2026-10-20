import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';
import { notificationService, NotificationItem } from '../services/notification.service';

interface NotificationScreenProps {
  onBack?: () => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    const data = await notificationService.getNotifications();
    setNotifications(data.items);
    setIsLoading(false);
  };

  const handleItemPress = async (item: NotificationItem) => {
    if (!item.is_read) {
      const ok = await notificationService.markAsRead(item.id);
      if (!ok) return;
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, is_read: true } : n))
      );
    }
  };

  const renderIcon = (type: string) => {
    if (type === 'CLASS_JOINED') {
      // Graduation cap / class icon
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
          <Path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    }
    if (type === 'EXAM_SCHEDULED' || type === 'EXAM_REMINDER') {
      // Calendar / test schedule icon
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
          <Rect x={3} y={4} width={18} height={18} rx={2} strokeLinecap="round" strokeLinejoin="round" />
          <Line x1={16} y1={2} x2={16} y2={6} strokeLinecap="round" strokeLinejoin="round" />
          <Line x1={8} y1={2} x2={8} y2={6} strokeLinecap="round" strokeLinejoin="round" />
          <Line x1={3} y1={10} x2={21} y2={10} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    }
    // Chat / comment check icon default
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2}>
        <Path
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M9 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Peach Linear Gradient */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Background vector sparkles & swirl lines */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 390 844" fill="none">
          <Path d="M60 120L63 128L71 131L63 134L60 142L57 134L49 131L57 128L60 120Z" fill="#FFAF6B" fillOpacity={0.4} />
          <Path d="M330 220L332 226L338 228L332 230L330 236L328 230L322 228L328 226L330 220Z" fill="#FFAF6B" fillOpacity={0.35} />
          <Path d="M45 460L47.5 466L53.5 468.5L47.5 471L45 477L42.5 471L36.5 468.5L42.5 466L45 460Z" fill="#FFAF6B" fillOpacity={0.35} />
          <Path d="M340 680L342 686L348 688L342 690L340 696L338 690L332 688L338 686L340 680Z" fill="#FFAF6B" fillOpacity={0.35} />
          <Path d="M-30 200C50 180 120 230 190 205C260 180 340 215 420 180" stroke="#FFA459" strokeOpacity={0.18} strokeWidth={2} strokeDasharray="6 6" />
          <Path d="M-20 620C70 600 150 650 240 620C320 590 380 630 420 610" stroke="#FFA459" strokeOpacity={0.15} strokeWidth={2} strokeDasharray="6 6" />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentWrap}>
          {/* HEADER: Back button, Title "Thông Báo", and 3D Bell Illustration */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.85}
                accessibilityLabel="Quay lại"
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#221C38" strokeWidth={2.3}>
                  <Path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              <Text style={styles.screenTitle}>Thông Báo</Text>
            </View>

            {/* 3D Bell Illustration top-right */}
            <View style={styles.bellImageWrap}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX9z-bufXBmMTsNK7aMwuizwI-F2rkFD9U2ysJCGACC4QofpQPH4yzFZidsoQWwAAQhzJHy3sgweF2NtcQLFesAO84zq2l-HWkjNLY2kmASowf_4tLIFJkq8gmno-DliCdYQY1ezwIKi_9k8EqWPFG7MOMWcmYppjRJlw9aDn7uD_fZbotpSdYNjkkua8X3tfnhGEv2xsqKFwfeWcRzoekFxXMhVEXmgx0zzMr3pqKhUFCl3Yx2_gdsg',
                }}
                style={styles.bellImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* NOTIFICATIONS CARD */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.notificationsCard}>
              {!isLoading && notifications.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                  <Text style={{ fontSize: 13, color: '#6B6880', textAlign: 'center' }}>
                    Chưa có thông báo nào
                  </Text>
                </View>
              )}
              {notifications.map((item, index) => {
                const isLast = index === notifications.length - 1;
                return (
                  <React.Fragment key={item.id}>
                    <TouchableOpacity
                      style={styles.notificationRow}
                      onPress={() => handleItemPress(item)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.rowLeftWrap}>
                        {/* Icon tile: #FFF1E6 background + orange icon */}
                        <View style={styles.iconTile}>
                          {renderIcon(item.type)}
                        </View>

                        {/* Text block */}
                        <View style={styles.textBlock}>
                          <Text style={styles.itemTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.itemTime}>
                            {item.timeAgo}
                          </Text>
                        </View>
                      </View>

                      {/* Small red dot for unread status */}
                      {!item.is_read && (
                        <View style={styles.unreadDot} />
                      )}
                    </TouchableOpacity>

                    {/* Thin divider line */}
                    {!isLast && <View style={styles.dividerLine} />}
                  </React.Fragment>
                );
              })}
            </View>
          </ScrollView>

          {/* iOS Home Indicator */}
          <View style={styles.homeIndicatorWrap}>
            <View style={styles.homeIndicator} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  safeArea: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#FFE7D3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#221C38',
    letterSpacing: -0.4,
  },
  bellImageWrap: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -8,
  },
  bellImage: {
    width: 76,
    height: 76,
    transform: [{ rotate: '-6deg' }],
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  notificationsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3E8E0',
    shadowColor: '#B47850',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 3,
    overflow: 'hidden',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  rowLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    marginRight: 10,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#221C38',
    lineHeight: 19,
  },
  itemTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8A9F',
    marginTop: 3,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 2,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#F7EEE8',
    marginHorizontal: 16,
  },
  homeIndicatorWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(34, 28, 56, 0.2)',
  },
});
