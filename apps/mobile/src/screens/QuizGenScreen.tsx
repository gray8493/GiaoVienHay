import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import Svg, {
  Path,
  Rect,
  Circle,
  Polygon,
  Polyline,
  Line,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import {
  quizService,
  QuizQuestion,
  DifficultyLevel,
  QuizUploadFile,
} from '../services/quiz.service';
import { classService } from '../services/class.service';
import { authService } from '../services/auth.service';
import { SCHOOL_SUBJECTS, SUBJECT_LABELS } from '../constants/academic';

export interface QuizPlayInfo {
  quizId: string;
  title: string;
  totalQuestions: number;
  subjectCode: string;
}

interface QuizGenScreenProps {
  onBack?: () => void;
  onSaveAndPlay?: (quiz: QuizPlayInfo) => void;
  classId?: string;
  className?: string;
}

const SUBJECT_OPTIONS: { code: string; label: string }[] = [
  { code: 'MATH', label: 'Toán học' },
  { code: 'LIT', label: 'Ngữ văn' },
  { code: 'ENG', label: 'Tiếng Anh' },
  { code: 'CS', label: 'Tin học' },
  { code: 'SCIENCE', label: 'Khoa học' },
  { code: 'HISTORY', label: 'Lịch sử' },
  { code: 'GEOGRAPHY', label: 'Địa lí' },
  { code: 'ETHICS', label: 'Đạo đức' },
];

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const SUPPORTED_FILE_EXTENSIONS = ['pdf', 'docx', 'txt'];

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return 'Không rõ dung lượng';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const QuizGenScreen: React.FC<QuizGenScreenProps> = ({
  onBack,
  onSaveAndPlay,
  classId,
  className = 'Lớp học',
}) => {
  // Bộ lọc scope: Lớp là lớp đang hoạt động (không chọn), Môn học chọn theo môn giáo viên dạy
  const [selectedClass, setSelectedClass] = useState(className);
  const [selectedSubject, setSelectedSubject] = useState('Toán học');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('MATH');
  const [subjectOptions, setSubjectOptions] = useState(SUBJECT_OPTIONS);
  const [subjectMenuVisible, setSubjectMenuVisible] = useState(false);

  // Đồng bộ tên lớp theo dữ liệu hiện tại
  useEffect(() => {
    setSelectedClass(className);
  }, [className]);

  // Xác định danh sách môn giáo viên dạy trong lớp (từ dữ liệu lớp theo DB):
  // GVCN (vd cấp 1 tự dạy nhiều môn) → môn trong hồ sơ ∪ môn có phân công trong lớp;
  // GVBM → đúng môn được phân công (phân công → my-subject → hồ sơ)
  useEffect(() => {
    if (!classId || classId === 'cls_empty') return;
    let cancelled = false;
    classService
      .getMyRoleInClass(classId)
      .then((role) => {
        if (cancelled) return;
        let codes: string[];
        if (role.isHomeroom) {
          codes = [
            ...new Set([
              ...role.profileSubjectCodes,
              ...role.allAssignedCodes,
              ...role.apiSubjectCodes,
            ]),
          ];
          // GVCN chưa khai môn nào ở đâu cả → cho đủ danh sách môn của trường
          if (codes.length === 0) codes = [...SCHOOL_SUBJECTS];
        } else {
          codes =
            role.myAssignedCodes.length > 0
              ? role.myAssignedCodes
              : role.apiSubjectCodes.length > 0
              ? role.apiSubjectCodes
              : role.profileSubjectCodes;
        }
        if (codes.length > 0) {
          const opts = Array.from(new Set(codes)).map((code) => ({
            code,
            label:
              SUBJECT_OPTIONS.find((s) => s.code === code)?.label ||
              SUBJECT_LABELS[code] ||
              code,
          }));
          setSubjectOptions(opts);
          setSelectedSubjectCode((prev) =>
            opts.some((o) => o.code === prev) ? prev : opts[0].code
          );
          setSelectedSubject((prev) =>
            opts.some((o) => o.label === prev) ? prev : opts[0].label
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  // File giáo án
  const [pickedFile, setPickedFile] = useState<QuizUploadFile | null>(null);
  const hasFile = pickedFile !== null;
  const fileName = pickedFile?.name || '';
  const fileSize = pickedFile ? formatFileSize(pickedFile.size) : '';

  // Tùy chỉnh đề
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('MEDIUM');

  // Trạng thái AI Generating (Loading Screen)
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(60);
  const [generatedQuizId, setGeneratedQuizId] = useState<string>('');
  // Tên/môn của bộ đề đã tạo — giữ lại để màn chọn game hiển thị đúng dữ liệu
  const [generatedQuizMeta, setGeneratedQuizMeta] = useState<{
    title: string;
    subjectCode: string;
  } | null>(null);

  // Danh sách câu hỏi
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Chỉnh sửa câu hỏi trực tiếp (Inline edit)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>(['', '', '', '']);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('A');
  const [editExplanation, setEditExplanation] = useState('');
  // Số câu hỏi đang chờ API (lưu/tạo lại) để khóa nút và hiện trạng thái
  const [busyQuestionIndex, setBusyQuestionIndex] = useState<number | null>(null);

  // Backend trả options dạng [{key,text}] hoặc string[] — chuẩn hóa về string[]
  const normalizeOptions = (raw: any): string[] =>
    Array.isArray(raw)
      ? raw.map((o: any) => (typeof o === 'string' ? o : String(o?.text ?? '')))
      : [];

  // Bắt đầu chỉnh sửa một câu hỏi
  const startEditQuestion = (q: QuizQuestion) => {
    setEditingIndex(q.question_index);
    setEditContent(q.content);
    setEditOptions([...q.options]);
    setEditCorrectAnswer(q.correct_answer);
    setEditExplanation(q.explanation);
  };

  // Lưu chỉnh sửa câu hỏi — PUT /quizzes/:id/questions/:n (lưu DB khi đã có quizId)
  const saveEditQuestion = async () => {
    if (editingIndex === null || busyQuestionIndex !== null) return;

    const applyLocal = () => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.question_index === editingIndex
            ? {
                ...q,
                content: editContent,
                options: editOptions,
                correct_answer: editCorrectAnswer,
                explanation: editExplanation,
              }
            : q,
        ),
      );
      setEditingIndex(null);
    };

    if (!generatedQuizId) {
      applyLocal();
      return;
    }

    setBusyQuestionIndex(editingIndex);
    try {
      await quizService.updateQuestion(generatedQuizId, editingIndex, {
        content: editContent,
        options: editOptions,
        correct_answer: editCorrectAnswer,
        explanation: editExplanation,
      });
      applyLocal();
    } catch (e: any) {
      Alert.alert('Thông báo', e?.message || 'Không thể lưu chỉnh sửa câu hỏi');
    } finally {
      setBusyQuestionIndex(null);
    }
  };

  // Xóa một câu hỏi — DELETE /quizzes/:id/questions/:n (lưu DB khi đã có quizId)
  const deleteQuestion = async (index: number) => {
    if (busyQuestionIndex !== null) return;

    const applyLocal = () => {
      setQuestions((prev) => prev.filter((q) => q.question_index !== index));
    };

    if (!generatedQuizId) {
      applyLocal();
      return;
    }

    setBusyQuestionIndex(index);
    try {
      await quizService.deleteQuestion(generatedQuizId, index);
      applyLocal();
    } catch (e: any) {
      Alert.alert('Thông báo', e?.message || 'Không thể xóa câu hỏi');
    } finally {
      setBusyQuestionIndex(null);
    }
  };

  // Tạo lại 1 câu hỏi cụ thể bằng AI — POST /quizzes/:id/questions/:n/regenerate
  const regenerateSingleQuestion = async (index: number) => {
    if (busyQuestionIndex !== null) return;
    if (!generatedQuizId) {
      Alert.alert('Thông báo', 'Chưa lưu bộ đề. Vui lòng tạo đề bằng AI trước khi tạo lại câu hỏi.');
      return;
    }

    setBusyQuestionIndex(index);
    try {
      const updated: any = await quizService.regenerateQuestion(generatedQuizId, index, difficulty);
      const data = updated?.data || updated;
      setQuestions((prev) =>
        prev.map((q) =>
          q.question_index === index
            ? {
                ...q,
                content: data?.content ?? q.content,
                options: normalizeOptions(data?.options).length > 0 ? normalizeOptions(data?.options) : q.options,
                correct_answer: data?.correct_answer ?? q.correct_answer,
                explanation: data?.explanation ?? q.explanation,
              }
            : q,
        ),
      );
    } catch (e: any) {
      Alert.alert('Thông báo', e?.message || 'Không thể tạo lại câu hỏi bằng AI');
    } finally {
      setBusyQuestionIndex(null);
    }
  };

  // Chọn môn học: đổi môn -> xóa đề cũ của môn trước
  const handlePickSubject = (opt: { code: string; label: string }) => {
    if (opt.code === selectedSubjectCode) {
      setSubjectMenuVisible(false);
      return;
    }
    setSelectedSubjectCode(opt.code);
    setSelectedSubject(opt.label);
    setQuestions([]);
    setGeneratedQuizId('');
    setGeneratedQuizMeta(null);
    setSubjectMenuVisible(false);
  };

  // Chọn tệp giáo án thật từ thiết bị
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const extension = (asset.name || '').split('.').pop()?.toLowerCase() || '';

      if (!SUPPORTED_FILE_EXTENSIONS.includes(extension)) {
        Alert.alert('Tệp không được hỗ trợ', 'Chỉ hỗ trợ tệp .pdf, .docx hoặc .txt.');
        return;
      }

      if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert('Tệp quá lớn', 'Giáo án tối đa 15 MB. Vui lòng chọn tệp nhỏ hơn.');
        return;
      }

      setPickedFile({
        uri: asset.uri,
        name: asset.name || `giao_an.${extension}`,
        size: asset.size,
        mimeType: asset.mimeType,
      });
      setQuestions([]);
      setGeneratedQuizId('');
      setGeneratedQuizMeta(null);
    } catch {
      Alert.alert('Không thể chọn tệp', 'Vui lòng thử lại hoặc kiểm tra quyền truy cập tệp.');
    }
  };

  const handleRemoveDocument = () => {
    setPickedFile(null);
    setQuestions([]);
    setGeneratedQuizId('');
    setGeneratedQuizMeta(null);
  };

  // Gọi AI tạo đề toàn diện
  const handleGenerateQuestions = async () => {
    if (!classId || classId === 'cls_empty') {
      Alert.alert('Thông báo', 'Vui lòng chọn lớp học trước khi soạn đề');
      return;
    }
    setIsGenerating(true);
    setProgressPercent(30);

    const timer1 = setTimeout(() => setProgressPercent(60), 600);
    const timer2 = setTimeout(() => setProgressPercent(90), 1200);

    try {
      const resJson: any = await quizService.generateQuizFromAi(
        {
          subject_code: selectedSubjectCode,
          class_id: classId,
          title: `Kiểm tra ${selectedSubject} - ${selectedClass}`,
          num_questions: questionCount,
          difficulty_level: difficulty,
        },
        pickedFile || undefined,
      );
      const data = resJson?.data || resJson;

      // Backend gắn nhãn nguồn: 'pedagogical_fallback' = AI lỗi/bận, dùng câu hỏi mẫu
      if (data?.ai_source === 'pedagogical_fallback') {
        Alert.alert(
          'Lưu ý',
          'AI đang bận nên hệ thống tạm dùng bộ câu hỏi mẫu theo môn (không dựa vào giáo án). Bạn có thể bấm "Tạo lại" từng câu hỏi sau ít phút.',
        );
      }

      setTimeout(() => {
        setGeneratedQuizId(data?.quiz_id || '');
        setGeneratedQuizMeta({
          title: data?.title || `Kiểm tra ${selectedSubject} - ${selectedClass}`,
          subjectCode: data?.subject_code || selectedSubjectCode,
        });
        setQuestions(data?.questions || []);
        setIsGenerating(false);
      }, 1600);
    } catch (e: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      Alert.alert('Thông báo', e.message || 'Không thể tạo câu hỏi từ AI');
    }
  };

  return (
    <View style={styles.root}>
      {/* Background continuous peach gradient */}
      <LinearGradient
        colors={['#FFCFA3', '#FFE3C8', '#FFF3E6', '#FFF8F0']}
        locations={[0, 0.28, 0.6, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative ambient sparkles */}
      <View style={styles.ambientSparkle1} pointerEvents="none" />
      <View style={styles.ambientSparkle2} pointerEvents="none" />

      <SafeAreaView style={styles.safeContainer}>
        {/* Navigation & Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.8}
              accessibilityLabel="Quay lại"
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2.5}>
                <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            <Text style={styles.screenTitle}>Soạn Đề Bằng AI</Text>
            <Text style={styles.screenSubtitle}>Gemini AI đọc giáo án giúp bạn</Text>
          </View>

          {/* Top Right Pastel AI Character Graphic */}
          <View style={styles.aiGraphicWrap}>
            <Svg width={84} height={84} viewBox="0 0 100 100">
              {/* Ambient Glow Circle */}
              <Circle cx={50} cy={50} r={42} fill="#EDEBFF" />
              <Circle cx={50} cy={50} r={38} fill="#F8F6FF" stroke="#DFDBFF" strokeWidth={2} />

              {/* Open Book at base */}
              <Path
                d="M22 68 C 35 64, 45 66, 50 71 C 55 66, 65 64, 78 68 L 78 80 C 65 76, 55 78, 50 83 C 45 78, 35 76, 22 80 Z"
                fill="#FFE0C8"
                stroke="#F58F4C"
                strokeWidth={2}
                strokeLinejoin="round"
              />
              <Path d="M50 71 L 50 83" stroke="#F58F4C" strokeWidth={2} strokeLinecap="round" />

              {/* Cute AI Robot Body */}
              <Rect x={30} y={28} width={40} height={34} rx={14} fill="#5E5CE6" />
              {/* Robot Screen Face */}
              <Rect x={35} y={34} width={30} height={22} rx={8} fill="#1E1B2E" />
              {/* Eyes */}
              <Circle cx={43} cy={44} r={3} fill="#6EE7B7" />
              <Circle cx={57} cy={44} r={3} fill="#6EE7B7" />
              <Circle cx={44} cy={43} r={1} fill="#FFFFFF" />
              <Circle cx={58} cy={43} r={1} fill="#FFFFFF" />
              {/* Smile */}
              <Path d="M48 48 Q 50 51 52 48" fill="none" stroke="#6EE7B7" strokeWidth={1.5} strokeLinecap="round" />
              {/* Antenna */}
              <Path d="M50 28 L 50 20" stroke="#5E5CE6" strokeWidth={3} strokeLinecap="round" />
              <Circle cx={50} cy={18} r={4} fill="#F58F4C" />
              {/* Floating Sparkles */}
              <Path d="M78 26 L 80 20 L 86 22 L 80 24 Z" fill="#F58F4C" />
              <Circle cx={20} cy={38} r={2.5} fill="#5E5CE6" />
              <Path d="M22 22 L 24 17 L 29 19 L 24 21 Z" fill="#FBBF24" />
            </Svg>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ScopeCard: Áp dụng cho */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardHeading}>Áp dụng cho</Text>
            <View style={styles.scopeGrid}>
              {/* Lớp: cố định theo lớp đang hoạt động, đổi lớp ở trang chủ */}
              <View style={[styles.scopeBox, { opacity: 1 }]}>
                <Text style={styles.scopeLabel}>Lớp</Text>
                <View style={styles.scopeValueRow}>
                  <Text style={styles.scopeValueText}>{selectedClass}</Text>
                </View>
              </View>

              {/* Môn học: dropdown chọn môn cần soạn đề */}
              <TouchableOpacity
                style={styles.scopeBox}
                onPress={() => setSubjectMenuVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.scopeLabel}>Môn học</Text>
                <View style={styles.scopeValueRow}>
                  <Text style={styles.scopeValueText}>{selectedSubject}</Text>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#1E1B2E" strokeWidth={2.2}>
                    <Path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* UploadCard: Giáo án */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardHeading}>Giáo án</Text>

            {hasFile ? (
              <View style={styles.dashedFileBox}>
                <View style={styles.fileLeftWrap}>
                  {/* 3D Docx Badge */}
                  <View style={styles.docxBadge}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2}>
                      <Path
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>

                  <View style={styles.fileMeta}>
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      {fileName}
                    </Text>
                    <Text style={styles.fileSizeText}>{fileSize}</Text>
                  </View>
                </View>

                {/* File Actions */}
                <View style={styles.fileActionsRow}>
                  <TouchableOpacity
                    style={styles.changeFileBtn}
                    onPress={handlePickDocument}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.changeFileBtnText}>Đổi file</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteFileBtn}
                    onPress={handleRemoveDocument}
                    activeOpacity={0.8}
                    accessibilityLabel="Xóa file"
                  >
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2}>
                      <Path
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.dashedFileBox, { justifyContent: 'center', paddingVertical: 18 }]}
                onPress={handlePickDocument}
                activeOpacity={0.8}
              >
                <Text style={[styles.changeFileBtnText, { fontSize: 14 }]}>+ Tải lên giáo án (.pdf, .docx, .txt)</Text>
              </TouchableOpacity>
            )}

            <View style={styles.fileHintRow}>
              <Svg width={14} height={14} viewBox="0 0 20 20" fill="#F58F4C">
                <Path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </Svg>
              <Text style={styles.fileHintText}>Hỗ trợ .pdf, .docx, .txt • tối đa 15 MB</Text>
            </View>
          </View>

          {/* CustomizeCard: Tùy chỉnh đề */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardHeading}>Tùy chỉnh đề</Text>

            {/* Số lượng câu hỏi */}
            <View>
              <Text style={styles.subHeading}>Số lượng câu hỏi</Text>
              <View style={styles.pillsRow}>
                {[3, 5, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.pillBtn, questionCount === num && styles.pillBtnActive]}
                    onPress={() => setQuestionCount(num)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.pillBtnText, questionCount === num && styles.pillBtnTextActive]}>
                      {num} câu
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Độ khó */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.subHeading}>Độ khó</Text>
              <View style={styles.difficultyGrid}>
                {[
                  { key: 'EASY', label: 'Dễ' },
                  { key: 'MEDIUM', label: 'Vừa' },
                  { key: 'HARD', label: 'Khó' },
                  { key: 'MIXED', label: 'Hỗn hợp' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.diffBtn, difficulty === item.key && styles.diffBtnActive]}
                    onPress={() => setDifficulty(item.key as DifficultyLevel)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.diffBtnText, difficulty === item.key && styles.diffBtnTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* CTA Tạo câu hỏi bằng AI */}
            <TouchableOpacity
              style={styles.aiGenerateBtn}
              onPress={handleGenerateQuestions}
              activeOpacity={0.9}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="#FDE047">
                <Path d="M12 2L14.2 8.3L20.5 10.5L14.2 12.7L12 19L9.8 12.7L3.5 10.5L9.8 8.3L12 2Z" />
              </Svg>
              <Text style={styles.aiGenerateBtnText}>Tạo Câu Hỏi</Text>
              <View style={styles.aiTag}>
                <Text style={styles.aiTagText}>Gemini AI</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* QuestionsSection: Câu hỏi đã tạo */}
          <View style={styles.questionsHeaderRow}>
            <Text style={styles.questionsSectionTitle}>Câu hỏi đã tạo</Text>
            <View style={styles.questionCountBadge}>
              <Text style={styles.questionCountBadgeText}>{questions.length} câu</Text>
            </View>
          </View>

          {/* Question Cards Feed */}
          {questions.map((q) => {
            const isEditing = editingIndex === q.question_index;

            if (isEditing) {
              return (
                <View key={q.question_index} style={styles.editQuestionCard}>
                  <View style={styles.editCardHeader}>
                    <View style={styles.editQuestionBadge}>
                      <View style={styles.editPulseDot} />
                      <Text style={styles.editQuestionBadgeText}>Câu {q.question_index}</Text>
                    </View>
                    <View style={styles.editingTag}>
                      <Text style={styles.editingTagText}>Chỉnh sửa trực tiếp</Text>
                    </View>
                  </View>

                  <Text style={styles.inputFieldLabel}>Nội dung câu hỏi</Text>
                  <TextInput
                    style={styles.questionInputArea}
                    multiline
                    value={editContent}
                    onChangeText={setEditContent}
                  />

                  <Text style={[styles.inputFieldLabel, { marginTop: 12 }]}>Các đáp án (chọn đáp án đúng)</Text>
                  {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                    const isSelected = editCorrectAnswer === letter;
                    return (
                      <View
                        key={letter}
                        style={[styles.editOptionRow, isSelected && styles.editOptionRowSelected]}
                      >
                        <TouchableOpacity
                          style={[styles.optionLetterBtn, isSelected && styles.optionLetterBtnSelected]}
                          onPress={() => setEditCorrectAnswer(letter)}
                        >
                          <Text
                            style={[
                              styles.optionLetterBtnText,
                              isSelected && styles.optionLetterBtnTextSelected,
                            ]}
                          >
                            {letter}
                          </Text>
                        </TouchableOpacity>

                        <TextInput
                          style={styles.optionInput}
                          value={editOptions[optIdx]}
                          onChangeText={(text) => {
                            const next = [...editOptions];
                            next[optIdx] = text;
                            setEditOptions(next);
                          }}
                        />

                        {isSelected && (
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.5}>
                            <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        )}
                      </View>
                    );
                  })}

                  <Text style={[styles.inputFieldLabel, { marginTop: 12 }]}>Giải thích chi tiết</Text>
                  <TextInput
                    style={styles.explanationInputArea}
                    multiline
                    value={editExplanation}
                    onChangeText={setEditExplanation}
                  />

                  {/* Action buttons */}
                  <View style={styles.editActionsRow}>
                    <TouchableOpacity
                      style={styles.editCancelBtn}
                      onPress={() => setEditingIndex(null)}
                    >
                      <Text style={styles.editCancelBtnText}>Hủy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editDoneBtn}
                      onPress={saveEditQuestion}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#5E5CE6" strokeWidth={2.5}>
                        <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text style={styles.editDoneBtnText}>Xong</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            return (
              <View key={q.question_index} style={styles.questionCard}>
                {/* Header card */}
                <View style={styles.questionCardHeader}>
                  <View style={styles.questionBadge}>
                    <Text style={styles.questionBadgeText}>Câu {q.question_index}</Text>
                  </View>

                  <View style={styles.questionActions}>
                    {/* Sửa câu hỏi */}
                    <TouchableOpacity
                      style={[styles.actionCircleBtn, busyQuestionIndex === q.question_index && { opacity: 0.5 }]}
                      onPress={() => startEditQuestion(q)}
                      disabled={busyQuestionIndex === q.question_index}
                      accessibilityLabel="Sửa câu hỏi"
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth={2}>
                        <Path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </TouchableOpacity>

                    {/* Tạo lại câu hỏi */}
                    <TouchableOpacity
                      style={[styles.actionCircleBtn, busyQuestionIndex === q.question_index && { opacity: 0.5 }]}
                      onPress={() => regenerateSingleQuestion(q.question_index)}
                      disabled={busyQuestionIndex === q.question_index}
                      accessibilityLabel="Tạo lại câu hỏi"
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth={2}>
                        <Path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </TouchableOpacity>

                    {/* Xóa câu hỏi */}
                    <TouchableOpacity
                      style={[styles.actionCircleBtn, busyQuestionIndex === q.question_index && { opacity: 0.5 }]}
                      onPress={() => deleteQuestion(q.question_index)}
                      disabled={busyQuestionIndex === q.question_index}
                      accessibilityLabel="Xóa câu hỏi"
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth={2}>
                        <Path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Prompt */}
                <Text style={styles.questionPromptText}>{q.content}</Text>

                {/* Options */}
                <View style={styles.optionsStack}>
                  {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                    const isCorrect = q.correct_answer === letter;
                    const optText = q.options[optIdx] || '';

                    if (isCorrect) {
                      return (
                        <View key={letter} style={styles.optionBoxCorrect}>
                          <View style={styles.optionContentLeft}>
                            <View style={styles.letterBadgeCorrect}>
                              <Text style={styles.letterBadgeCorrectText}>{letter}</Text>
                            </View>
                            <Text style={styles.optionTextCorrect}>{optText}</Text>
                          </View>
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5}>
                            <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        </View>
                      );
                    }

                    return (
                      <View key={letter} style={styles.optionBoxNormal}>
                        <View style={styles.letterBadgeNormal}>
                          <Text style={styles.letterBadgeNormalText}>{letter}</Text>
                        </View>
                        <Text style={styles.optionTextNormal}>{optText}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Explanation */}
                {q.explanation ? (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationTitle}>Giải thích: </Text>
                    <Text style={styles.explanationContent}>{q.explanation}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Fixed Bottom Bar */}
        <View style={styles.fixedBottomBar}>
          <View style={styles.bottomHintRow}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="#F58F4C">
              <Path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </Svg>
            <Text style={styles.bottomHintText}>Bộ câu hỏi sẽ dùng ở chế độ game</Text>
          </View>

          <TouchableOpacity
            style={styles.saveAndPlayBtn}
            onPress={() => {
              if (!questions.length) {
                Alert.alert('Thông báo', 'Chưa có câu hỏi nào. Hãy soạn đề bằng AI trước.');
                return;
              }
              onSaveAndPlay?.({
                quizId: generatedQuizId,
                title: generatedQuizMeta?.title || `Kiểm tra ${selectedSubject} - ${selectedClass}`,
                totalQuestions: questions.length,
                subjectCode: generatedQuizMeta?.subjectCode || selectedSubjectCode,
              });
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.saveAndPlayBtnText}>Lưu &amp; Chơi Game</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5}>
              <Path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Modal Loading State: AI đang soạn đề... */}
        <Modal
          visible={isGenerating}
          transparent
          animationType="fade"
          onRequestClose={() => setIsGenerating(false)}
        >
          <View style={styles.loadingModalOverlay}>
            <LinearGradient
              colors={['#FFCFA3', '#FFE3C8', '#FFF3E6']}
              locations={[0, 0.48, 1.0]}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.loadingContainer}>
              {/* Robot Illustration Center */}
              <View style={styles.loadingRobotWrap}>
                <View style={styles.loadingAuraCircle} />
                <Svg width={120} height={120} viewBox="0 0 100 100">
                  <Circle cx={50} cy={50} r={44} fill="#EDEBFF" />
                  <Circle cx={50} cy={50} r={40} fill="#F8F6FF" stroke="#DFDBFF" strokeWidth={2} />
                  <Rect x={30} y={28} width={40} height={34} rx={14} fill="#5E5CE6" />
                  <Rect x={35} y={34} width={30} height={22} rx={8} fill="#1E1B2E" />
                  <Circle cx={43} cy={44} r={3} fill="#6EE7B7" />
                  <Circle cx={57} cy={44} r={3} fill="#6EE7B7" />
                  <Path d="M48 48 Q 50 51 52 48" fill="none" stroke="#6EE7B7" strokeWidth={1.5} />
                  <Path d="M50 28 L 50 20" stroke="#5E5CE6" strokeWidth={3} />
                  <Circle cx={50} cy={18} r={4} fill="#F58F4C" />
                  {/* Book */}
                  <Path
                    d="M26 68 C 36 64, 45 66, 50 71 C 55 66, 64 64, 74 68 L 74 78 C 64 74, 55 76, 50 81 C 45 76, 36 74, 26 78 Z"
                    fill="#FFE0C8"
                    stroke="#F58F4C"
                    strokeWidth={1.8}
                  />
                </Svg>
              </View>

              <Text style={styles.loadingTitle}>AI đang soạn đề...</Text>
              <View style={styles.loadingFileTag}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth={2}>
                  <Path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </Svg>
                <Text style={styles.loadingFileTagText}>Đang đọc: {fileName}</Text>
              </View>

              {/* Bento Progress Box */}
              <View style={styles.progressBentoBox}>
                <View style={styles.progressHeaderRow}>
                  <Text style={styles.progressHeaderLabel}>Tiến độ tạo đề</Text>
                  <Text style={styles.progressPercentText}>{progressPercent}%</Text>
                </View>

                {/* Progress Bar Track */}
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>

                {/* Steps List */}
                <View style={styles.stepsStack}>
                  {/* Step 1: Done */}
                  <View style={styles.stepRow}>
                    <View style={styles.stepLeft}>
                      <View style={[styles.stepIconWrap, { backgroundColor: '#6FFBBE' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#00482F" strokeWidth={2.5}>
                          <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                      <Text style={styles.stepName}>Đọc giáo án</Text>
                    </View>
                    <View style={[styles.stepStatusBadge, { backgroundColor: '#6FFBBE' }]}>
                      <Text style={[styles.stepStatusBadgeText, { color: '#00482F' }]}>Xong</Text>
                    </View>
                  </View>

                  {/* Step 2: Processing */}
                  <View style={styles.stepRow}>
                    <View style={styles.stepLeft}>
                      <View style={[styles.stepIconWrap, { backgroundColor: '#C2C1FF' }]}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#332DBC" strokeWidth={2.2}>
                          <Path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </Svg>
                      </View>
                      <Text style={[styles.stepName, { fontWeight: '700' }]}>Chọn kiến thức chính</Text>
                    </View>
                    <View style={[styles.stepStatusBadge, { backgroundColor: '#C2C1FF' }]}>
                      <Text style={[styles.stepStatusBadgeText, { color: '#332DBC' }]}>Đang xử lý...</Text>
                    </View>
                  </View>

                  {/* Step 3: Pending */}
                  <View style={[styles.stepRow, { opacity: 0.6 }]}>
                    <View style={styles.stepLeft}>
                      <View style={[styles.stepIconWrap, { backgroundColor: '#F1EBFF' }]}>
                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#887367" strokeWidth={2.2}>
                          <Circle cx="12" cy="12" r="1" />
                          <Circle cx="19" cy="12" r="1" />
                          <Circle cx="5" cy="12" r="1" />
                        </Svg>
                      </View>
                      <Text style={styles.stepName}>Viết {questionCount} câu hỏi</Text>
                    </View>
                    <View style={styles.stepStatusBadge}>
                      <Text style={[styles.stepStatusBadgeText, { color: '#887367' }]}>Chờ</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Time Note & Cancel */}
              <View style={styles.loadingBottomNote}>
                <Text style={styles.loadingTimeText}>⏱ Thường mất khoảng 15 giây</Text>
                <TouchableOpacity
                  onPress={() => setIsGenerating(false)}
                  activeOpacity={0.7}
                  style={{ marginTop: 8 }}
                >
                  <Text style={styles.loadingCancelText}>Hủy tạo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Chọn môn học */}
        <Modal
          visible={subjectMenuVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setSubjectMenuVisible(false)}
        >
          <View style={styles.subjectModalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => setSubjectMenuVisible(false)}
              activeOpacity={1}
            />
            <View style={styles.subjectSheet}>
              <View style={styles.subjectSheetHandle} />
              <Text style={styles.subjectSheetTitle}>Chọn môn học</Text>
              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {subjectOptions.map((opt) => {
                  const isActive = opt.code === selectedSubjectCode;
                  return (
                    <TouchableOpacity
                      key={opt.code}
                      style={[styles.subjectOptionRow, isActive && styles.subjectOptionRowActive]}
                      onPress={() => handlePickSubject(opt)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.subjectOptionText, isActive && styles.subjectOptionTextActive]}>
                        {opt.label}
                      </Text>
                      {isActive && (
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F58F4C" strokeWidth={2.5}>
                          <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  subjectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 46, 0.4)',
    justifyContent: 'flex-end',
  },
  subjectSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 26,
  },
  subjectSheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5DDF5',
    marginBottom: 12,
  },
  subjectSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B2E',
    marginBottom: 10,
  },
  subjectOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  subjectOptionRowActive: {
    backgroundColor: '#FFF1E6',
  },
  subjectOptionText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#4B5563',
  },
  subjectOptionTextActive: {
    fontWeight: '700',
    color: '#F58F4C',
  },
  safeContainer: {
    flex: 1,
  },
  ambientSparkle1: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  ambientSparkle2: {
    position: 'absolute',
    top: 110,
    right: 40,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FED7AA',
    opacity: 0.7,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  screenTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#1E1B2E',
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#6B6880',
    marginTop: 2,
  },
  aiGraphicWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },

  /* Scroll Content */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 14,
  },

  /* Cards */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(254, 215, 170, 0.6)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1E1B2E',
    marginBottom: 12,
  },
  subHeading: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6B6880',
    marginBottom: 8,
  },

  /* Scope Grid */
  scopeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  scopeBox: {
    flex: 1,
    backgroundColor: '#FFF1E6',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(254, 215, 170, 0.7)',
  },
  scopeLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#6B6880',
  },
  scopeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scopeValueText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1E1B2E',
  },

  /* File Uploader Box */
  dashedFileBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#F58F4C',
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    overflow: 'hidden',
  },
  docxBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  fileMeta: {
    flex: 1,
    gap: 2,
  },
  fileNameText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  fileSizeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: '#6B6880',
  },
  fileActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeFileBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeFileBtnText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#F58F4C',
  },
  deleteFileBtn: {
    padding: 6,
  },
  fileHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingLeft: 4,
  },
  fileHintText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: '#6B6880',
  },

  /* Question Count Pills */
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnActive: {
    backgroundColor: '#F58F4C',
    borderColor: '#F58F4C',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  pillBtnText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#1E1B2E',
  },
  pillBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Difficulty Grid */
  difficultyGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  diffBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffBtnActive: {
    backgroundColor: '#F58F4C',
    borderColor: '#F58F4C',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  diffBtnText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#1E1B2E',
  },
  diffBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* AI Generate Button */
  aiGenerateBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#5E5CE6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    shadowColor: '#5E5CE6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  aiGenerateBtnText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  aiTagText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Questions Feed */
  questionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingHorizontal: 2,
  },
  questionsSectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#1E1B2E',
  },
  questionCountBadge: {
    backgroundColor: '#FFE8D6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  questionCountBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#F58F4C',
  },

  /* Question Card */
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(254, 215, 170, 0.5)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    gap: 10,
  },
  questionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionBadge: {
    backgroundColor: '#EDEBFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  questionBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#5E5CE6',
  },
  questionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionPromptText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1E1B2E',
  },
  optionsStack: {
    gap: 8,
  },
  optionBoxNormal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 10,
  },
  letterBadgeNormal: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBadgeNormalText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  optionTextNormal: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#1E1B2E',
    flex: 1,
  },
  optionBoxCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 12,
    padding: 10,
  },
  optionContentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  letterBadgeCorrect: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBadgeCorrectText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionTextCorrect: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#064E3B',
    flex: 1,
  },
  explanationBox: {
    backgroundColor: '#EDEBFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  explanationTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#3730A3',
  },
  explanationContent: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#312E81',
    flex: 1,
  },

  /* Edit Inline Card */
  editQuestionCard: {
    backgroundColor: '#FFF1E6',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(245, 143, 76, 0.7)',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  editCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editQuestionBadge: {
    backgroundColor: '#EDEBFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F58F4C',
  },
  editQuestionBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#5E5CE6',
  },
  editingTag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(254, 215, 170, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
  },
  editingTagText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: '#F58F4C',
  },
  inputFieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#6B6880',
    marginBottom: 6,
  },
  questionInputArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(254, 215, 170, 0.8)',
    padding: 10,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1E1B2E',
    minHeight: 52,
  },
  editOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    gap: 8,
  },
  editOptionRowSelected: {
    borderWidth: 2,
    borderColor: '#F58F4C',
  },
  optionLetterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterBtnSelected: {
    backgroundColor: '#F58F4C',
  },
  optionLetterBtnText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    color: '#475569',
  },
  optionLetterBtnTextSelected: {
    color: '#FFFFFF',
  },
  optionInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E1B2E',
    paddingVertical: 6,
  },
  explanationInputArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    fontSize: 12,
    lineHeight: 16,
    color: '#1E1B2E',
    minHeight: 46,
  },
  editActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  editCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editCancelBtnText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    color: '#6B6880',
  },
  editDoneBtn: {
    backgroundColor: '#EDEBFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editDoneBtnText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#5E5CE6',
  },

  /* Fixed Bottom Bar */
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: '#FFE8D6',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
    zIndex: 40,
  },
  bottomHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  bottomHintText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#6B6880',
  },
  saveAndPlayBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F58F4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#F58F4C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  saveAndPlayBtnText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Loading Modal State */
  loadingModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  loadingRobotWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingAuraCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 219, 200, 0.6)',
  },
  loadingTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#1E1B2E',
    marginBottom: 6,
  },
  loadingFileTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 20,
  },
  loadingFileTagText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#475569',
  },
  progressBentoBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#1E1B2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressHeaderLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: '#6B6880',
  },
  progressPercentText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: '#F58F4C',
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE8D6',
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#F58F4C',
  },
  stepsStack: {
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stepIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#1E1B2E',
  },
  stepStatusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  stepStatusBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  loadingBottomNote: {
    alignItems: 'center',
    marginTop: 18,
  },
  loadingTimeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#6B6880',
  },
  loadingCancelText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});
