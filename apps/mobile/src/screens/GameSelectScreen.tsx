import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';

export type GameModeKey = 'GOLDEN_BELL' | 'RACING' | 'MYSTERY_BOX';

export const GAME_MODE_LABELS: Record<GameModeKey, string> = {
  GOLDEN_BELL: 'Rung Chuông Vàng',
  RACING: 'Đua Xe Vượt Chướng Ngại Vật',
  MYSTERY_BOX: 'Hộp Quà May Mắn',
};

interface GameItem {
  key: GameModeKey;
  title: string;
  description: string;
  tag: string;
}

const GAME_LIST: GameItem[] = [
  {
    key: 'GOLDEN_BELL',
    title: 'Rung Chuông Vàng',
    description: 'Trả lời câu hỏi loại trực tiếp',
    tag: '30 giây',
  },
  {
    key: 'RACING',
    title: 'Đua Xe Vượt Chướng Ngại Vật',
    description: 'Chia nhóm thi đua giải bài theo lượt',
    tag: '4 tổ',
  },
  {
    key: 'MYSTERY_BOX',
    title: 'Hộp Quà May Mắn',
    description: 'Mở quà điểm thưởng ngẫu nhiên',
    tag: 'Ngẫu nhiên',
  },
];

interface GameSelectScreenProps {
  quizTitle?: string;
  totalQuestions?: number;
  onBack?: () => void;
  onStartGame?: (mode: GameModeKey) => void;
}

export const GameSelectScreen: React.FC<GameSelectScreenProps> = ({
  quizTitle,
  totalQuestions,
  onBack,
  onStartGame,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameModeKey>('GOLDEN_BELL');
  const quizInfoText = [
    quizTitle?.trim() || null,
    totalQuestions && totalQuestions > 0 ? `${totalQuestions} câu` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  const handleStart = () => {
    const game = GAME_LIST.find((g) => g.key === selectedGame);
    if (onStartGame) {
      onStartGame(selectedGame);
    } else {
      Alert.alert('Bắt đầu chơi', `Đang khởi tạo trò chơi: ${game?.title}`);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
        locations={[0, 0.45, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative ambient sparkles */}
      <View style={styles.ambientSparkle1} pointerEvents="none" />
      <View style={styles.ambientSparkle2} pointerEvents="none" />

      <SafeAreaView style={styles.safeContainer}>
        {/* Header Section */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.8}
              accessibilityLabel="Quay lại"
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2.5}>
                <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.screenTitle}>Chọn Trò Chơi</Text>
              {!!quizInfoText && (
                <View style={styles.quizInfoBadge}>
                  <Text style={styles.quizInfoBadgeText}>{quizInfoText}</Text>
                </View>
              )}
            </View>
          </View>

          {/* 3D Gamepad Illustration */}
          <View style={styles.gamepadWrap}>
            <Svg width={56} height={56} viewBox="0 0 100 100" fill="none">
              <Defs>
                <SvgLinearGradient id="ctrl-grad" x1="16" y1="18" x2="84" y2="78" gradientUnits="userSpaceOnUse">
                  <Stop offset="0" stopColor="#FFF6EE" />
                  <Stop offset="0.5" stopColor="#FFE0CC" />
                  <Stop offset="1" stopColor="#FFCA9F" />
                </SvgLinearGradient>
              </Defs>
              <Rect x={12} y={24} width={76} height={52} rx={26} fill="url(#ctrl-grad)" />
              <Rect x={14} y={26} width={72} height={48} rx={24} fill="none" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={2} />
              <Circle cx={32} cy={50} r={12} fill="#FFE6D2" />
              <Path d="M32 44V56M26 50H38" stroke="#F58F4C" strokeWidth={3} strokeLinecap="round" />
              <Circle cx={66} cy={42} r={4.5} fill="#7CD4B9" />
              <Circle cx={75} cy={51} r={4.5} fill="#F58F4C" />
              <Circle cx={57} cy={51} r={4.5} fill="#B7A8FF" />
              <Circle cx={66} cy={60} r={4.5} fill="#FFC168" />
              <Ellipse cx={36} cy={34} rx={16} ry={6} fill="#FFFFFF" fillOpacity={0.4} transform="rotate(-15 36 34)" />
            </Svg>
          </View>
        </View>

        {/* Scrollable Game Cards */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card 1: Rung Chuông Vàng */}
          <TouchableOpacity
            style={[
              styles.gameCard,
              selectedGame === 'GOLDEN_BELL' && styles.gameCardSelected,
            ]}
            onPress={() => setSelectedGame('GOLDEN_BELL')}
            activeOpacity={0.9}
          >
            {selectedGame === 'GOLDEN_BELL' && (
              <View style={styles.checkBadge}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3}>
                  <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            )}

            <View style={styles.cardContentRow}>
              <View style={styles.cardTextWrap}>
                <Text style={styles.gameTitle}>Rung Chuông Vàng</Text>
                <Text style={styles.gameDescription}>Trả lời câu hỏi loại trực tiếp</Text>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>30 giây</Text>
                </View>
              </View>

              {/* 3D Bell Illustration */}
              <View style={[styles.iconBox, { backgroundColor: '#FFF3E6' }]}>
                <Svg width={64} height={64} viewBox="0 0 100 100" fill="none">
                  <Defs>
                    <SvgLinearGradient id="bell-grad" x1="25" y1="25" x2="75" y2="80" gradientUnits="userSpaceOnUse">
                      <Stop offset="0" stopColor="#FFEBB8" />
                      <Stop offset="0.4" stopColor="#FFBE43" />
                      <Stop offset="1" stopColor="#F58A1F" />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle cx={50} cy={22} r={7} fill="#FFA450" />
                  <Ellipse cx={50} cy={22} rx={4} ry={4} fill="#FFE8B3" />
                  <Path
                    d="M26 68C26 40 34 30 50 30C66 30 74 40 74 68C76 72 79 73 80 75C80 77 78 78 72 78H28C22 78 20 77 20 75C21 73 24 72 26 68Z"
                    fill="url(#bell-grad)"
                  />
                  <Ellipse cx={50} cy={78} rx={24} ry={6} fill="#FF9E3D" />
                  <Circle cx={50} cy={80} r={8} fill="#E5781E" />
                  <Circle cx={50} cy={82} r={4} fill="#FFAE5E" />
                  <Path d="M34 42C36 34 44 33 50 33" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeOpacity={0.7} />
                  <Circle cx={75} cy={35} r={3} fill="#FFCA65" />
                  <Circle cx={22} cy={52} r={2.5} fill="#FFCA65" />
                </Svg>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Đua Xe Vượt Chướng Ngại Vật */}
          <TouchableOpacity
            style={[
              styles.gameCard,
              selectedGame === 'RACING' && styles.gameCardSelected,
            ]}
            onPress={() => setSelectedGame('RACING')}
            activeOpacity={0.9}
          >
            {selectedGame === 'RACING' && (
              <View style={styles.checkBadge}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3}>
                  <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            )}

            <View style={styles.cardContentRow}>
              <View style={styles.cardTextWrap}>
                <Text style={styles.gameTitle}>Đua Xe Vượt Chướng Ngại Vật</Text>
                <Text style={styles.gameDescription}>Chia nhóm thi đua giải bài theo lượt</Text>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>4 tổ</Text>
                </View>
              </View>

              {/* 3D Car Illustration */}
              <View style={[styles.iconBox, { backgroundColor: '#FFF7EE' }]}>
                <Svg width={64} height={64} viewBox="0 0 100 100" fill="none">
                  <Defs>
                    <SvgLinearGradient id="car-body" x1="18" y1="46" x2="82" y2="70" gradientUnits="userSpaceOnUse">
                      <Stop offset="0" stopColor="#FF9B6A" />
                      <Stop offset="1" stopColor="#EB5E28" />
                    </SvgLinearGradient>
                    <SvgLinearGradient id="car-roof" x1="30" y1="26" x2="72" y2="46" gradientUnits="userSpaceOnUse">
                      <Stop offset="0" stopColor="#FFF1E6" />
                      <Stop offset="1" stopColor="#FFD8BE" />
                    </SvgLinearGradient>
                  </Defs>
                  <Ellipse cx={50} cy={80} rx={34} ry={7} fill="#000000" fillOpacity={0.08} />
                  <Rect x={18} y={46} width={64} height={24} rx={12} fill="url(#car-body)" />
                  <Path d="M30 46L36 32C37.5 28.5 41 26 45 26H60C64 26 67.5 28.5 69 32L74 46H30Z" fill="url(#car-roof)" />
                  <Path d="M38 43L42 34C43 32 45 30 48 30H55V43H38Z" fill="#D9F3FD" />
                  <Path d="M59 30H61C63.5 30 65.5 31.5 66.5 34L70 43H59V30Z" fill="#D9F3FD" />
                  <Circle cx={32} cy={70} r={10} fill="#3D3A50" />
                  <Circle cx={32} cy={70} r={5} fill="#FFF1E6" />
                  <Circle cx={68} cy={70} r={10} fill="#3D3A50" />
                  <Circle cx={68} cy={70} r={5} fill="#FFF1E6" />
                  <Circle cx={18} cy={56} r={4} fill="#FFE8B3" />
                  <Path d="M48 28H56" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.8} />
                </Svg>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 3: Hộp Quà May Mắn */}
          <TouchableOpacity
            style={[
              styles.gameCard,
              selectedGame === 'MYSTERY_BOX' && styles.gameCardSelected,
            ]}
            onPress={() => setSelectedGame('MYSTERY_BOX')}
            activeOpacity={0.9}
          >
            {selectedGame === 'MYSTERY_BOX' && (
              <View style={styles.checkBadge}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3}>
                  <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            )}

            <View style={styles.cardContentRow}>
              <View style={styles.cardTextWrap}>
                <Text style={styles.gameTitle}>Hộp Quà May Mắn</Text>
                <Text style={styles.gameDescription}>Mở quà điểm thưởng ngẫu nhiên</Text>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>Ngẫu nhiên</Text>
                </View>
              </View>

              {/* 3D Gift Box Illustration */}
              <View style={[styles.iconBox, { backgroundColor: '#F4FDF9' }]}>
                <Svg width={64} height={64} viewBox="0 0 100 100" fill="none">
                  <Defs>
                    <SvgLinearGradient id="box-body" x1="24" y1="46" x2="76" y2="80" gradientUnits="userSpaceOnUse">
                      <Stop offset="0" stopColor="#8CE5C2" />
                      <Stop offset="1" stopColor="#42BD8E" />
                    </SvgLinearGradient>
                    <SvgLinearGradient id="lid-body" x1="20" y1="38" x2="80" y2="50" gradientUnits="userSpaceOnUse">
                      <Stop offset="0" stopColor="#A6EED2" />
                      <Stop offset="1" stopColor="#55C799" />
                    </SvgLinearGradient>
                  </Defs>
                  <Ellipse cx={50} cy={84} rx={30} ry={6} fill="#000000" fillOpacity={0.06} />
                  <Rect x={24} y={46} width={52} height={34} rx={8} fill="url(#box-body)" />
                  <Rect x={20} y={38} width={60} height={12} rx={6} fill="url(#lid-body)" />
                  <Rect x={44} y={46} width={12} height={34} fill="#FFB27D" />
                  <Rect x={44} y={38} width={12} height={12} fill="#FFA468" />
                  <Path d="M48 38C44 30 32 26 34 20C36 14 46 22 50 32C54 22 64 14 66 20C68 26 56 30 52 38" fill="#FF8F4C" />
                  <Circle cx={50} cy={35} r={4.5} fill="#FFAE7E" />
                  <Circle cx={75} cy={32} r={2} fill="#51CF9E" />
                  <Circle cx={24} cy={28} r={2.5} fill="#FFC168" />
                </Svg>
              </View>
            </View>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Bottom Trigger Bar */}
        <View style={styles.fixedBottomBar}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStart}
            activeOpacity={0.9}
          >
            <Text style={styles.startBtnText}>Bắt Đầu Chơi</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF">
              <Path d="M8 5v14l11-7z" />
            </Svg>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFE3C8',
  },
  safeContainer: {
    flex: 1,
  },
  ambientSparkle1: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
  },
  ambientSparkle2: {
    position: 'absolute',
    top: 260,
    left: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FED7AA',
    opacity: 0.6,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitleWrap: {
    flex: 1,
    gap: 4,
  },
  screenTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.4,
  },
  quizInfoBadge: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  quizInfoBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6B6880',
  },
  gamepadWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Scroll Content */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },

  /* Game Cards */
  gameCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F1E5D8',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  gameCardSelected: {
    backgroundColor: '#FFFBF7',
    borderColor: '#F58F4C',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F58F4C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTextWrap: {
    flex: 1,
    paddingRight: 8,
    gap: 4,
  },
  gameTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.3,
  },
  gameDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#6B6880',
    marginBottom: 4,
  },
  tagBadge: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  tagBadgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: '#6B6880',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Fixed Bottom Bar */
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
  },
  startBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  startBtnText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
