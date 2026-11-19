import type {
  ActivityId,
  ConceptionChance,
  FlowLevel,
  Locale,
  MoodId,
  SymptomId,
} from '../domain/types';
import type { BackupErrorCode } from '../data/backup';

export interface TranslationDict {
  appName: string;
  common: {
    days: (n: number) => string;
    dayShort: string;
    save: string;
    cancel: string;
    close: string;
    back: string;
    next: string;
    skip: string;
    done: string;
    edit: string;
    confirm: string;
    today: string;
    clear: string;
    storageErrorTitle: string;
    storageErrorBody: string;
  };
  nav: {
    today: string;
    calendar: string;
    insights: string;
    settings: string;
  };
  onboarding: {
    stepOf: (step: number, total: number) => string;
    welcomeTitle: string;
    welcomeBody: string;
    lastPeriodLabel: string;
    lastPeriodHint: string;
    periodLengthTitle: string;
    periodLengthBody: string;
    cycleLengthTitle: string;
    cycleLengthBody: string;
    startTracking: string;
    skipForNow: string;
  };
  today: {
    cycleDay: (day: number) => string;
    periodDayTitle: (day: number) => string;
    periodSubtitle: string;
    countdownLabel: string;
    daysUntilPeriod: (days: number) => string;
    periodDueToday: string;
    periodLateTitle: (days: number) => string;
    periodLateSubtitle: string;
    ovulationTitle: string;
    ovulationSubtitle: string;
    fertileTitle: string;
    fertileSubtitle: string;
    conceptionChanceLabel: string;
    conceptionChance: Record<ConceptionChance, string>;
    logPeriodToday: string;
    editTodayLog: string;
    clearPeriodToday: string;
    nextPeriodLabel: string;
    ovulationDateLabel: string;
    todayLogHeading: string;
    noLogsToday: string;
    addDailyLog: string;
    emptyTitle: string;
    emptyBody: string;
  };
  calendar: {
    title: string;
    weekdays: readonly [string, string, string, string, string, string, string];
    prevMonth: string;
    nextMonth: string;
    jumpToday: string;
    editPeriodDays: string;
    editBannerTitle: string;
    editBannerHint: string;
    selectedCount: (count: number) => string;
    legend: {
      loggedPeriod: string;
      predictedPeriod: string;
      fertile: string;
      ovulation: string;
      loggedNote: string;
    };
  };
  dailyLog: {
    title: string;
    futureTitle: string;
    futureBody: string;
    flowSection: string;
    symptomsSection: string;
    moodsSection: string;
    activitiesSection: string;
    noteSection: string;
    notePlaceholder: string;
    statusLoggedPeriod: string;
    statusPredictedPeriod: string;
    statusOvulation: string;
    statusFertile: string;
    flow: Record<FlowLevel, string>;
    symptoms: Record<SymptomId, string>;
    moods: Record<MoodId, string>;
    activities: Record<ActivityId, string>;
  };
  insights: {
    title: string;
    avgCycle: string;
    avgPeriod: string;
    variation: string;
    noValue: string;
    trendTitle: string;
    trendAverageLabel: (days: number) => string;
    trendEmpty: string;
    historyTitle: string;
    historyEmpty: string;
    ongoingCycle: string;
    outlierBadge: string;
    periodDaysCount: (days: number) => string;
    cycleDaysCount: (days: number) => string;
    topSymptomsTitle: string;
    topMoodsTitle: string;
    patternsEmpty: string;
    loggedTimes: (count: number, pct: number) => string;
    disclaimer: string;
  };
  settings: {
    title: string;
    cycleDefaultsTitle: string;
    defaultCycleLength: string;
    defaultPeriodLength: string;
    lutealPhaseLength: string;
    languageTitle: string;
    languageTh: string;
    languageEn: string;
    backupTitle: string;
    backupDescription: string;
    exportButton: string;
    importButton: string;
    exportSuccess: string;
    importPreviewTitle: string;
    importPreviewBody: (count: number) => string;
    importSuccess: string;
    importErrors: Record<BackupErrorCode, string>;
    dangerTitle: string;
    resetButton: string;
    resetConfirmTitle: string;
    resetConfirmBody: string;
    resetConfirmAction: string;
    privacyNote: string;
  };
}

export const translations: Record<Locale, TranslationDict> = {
  th: {
    appName: 'PinkBird',
    common: {
      days: (n) => `${n} วัน`,
      dayShort: 'วัน',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      close: 'ปิด',
      back: 'ย้อนกลับ',
      next: 'ถัดไป',
      skip: 'ข้าม',
      done: 'เสร็จสิ้น',
      edit: 'แก้ไข',
      confirm: 'ยืนยัน',
      today: 'วันนี้',
      clear: 'ล้างค่า',
      storageErrorTitle: 'ไม่สามารถเข้าถึงพื้นที่จัดเก็บข้อมูลบนเครื่องได้',
      storageErrorBody:
        'เบราว์เซอร์อาจอยู่ในโหมดไม่ระบุตัวตนหรือปิดกั้น IndexedDB กรุณาลองเปิดในหน้าต่างปกติ',
    },
    nav: {
      today: 'วันนี้',
      calendar: 'ปฏิทิน',
      insights: 'สถิติ',
      settings: 'ตั้งค่า',
    },
    onboarding: {
      stepOf: (step, total) => `ขั้นตอนที่ ${step} จาก ${total}`,
      welcomeTitle: 'เริ่มติดตามรอบเดือนของคุณ',
      welcomeBody: 'ข้อมูลทั้งหมดเก็บไว้บนเครื่องของคุณเท่านั้น ไม่ต้องสร้างบัญชี',
      lastPeriodLabel: 'วันแรกของประจำเดือนครั้งล่าสุด',
      lastPeriodHint: 'เลือกวันที่เริ่มมา หรือกดข้ามเพื่อบันทึกภายหลังได้',
      periodLengthTitle: 'ประจำเดือนของคุณมักมากี่วัน',
      periodLengthBody: 'ค่ามาตรฐานคือ 5 วัน แอปจะปรับตามสถิติจริงเมื่อคุณบันทึกมากขึ้น',
      cycleLengthTitle: 'ความยาวรอบเดือนปกติของคุณ',
      cycleLengthBody: 'นับจากวันแรกของรอบนี้ถึงวันแรกของรอบถัดไป (ค่ามาตรฐาน 28 วัน)',
      startTracking: 'เริ่มใช้งาน',
      skipForNow: 'ข้ามไปก่อน',
    },
    today: {
      cycleDay: (day) => `วันที่ ${day} ของรอบเดือน`,
      periodDayTitle: (day) => `ประจำเดือนวันที่ ${day}`,
      periodSubtitle: 'ดูแลร่างกายและพักผ่อนให้เพียงพอ',
      countdownLabel: 'คาดการณ์รอบถัดไปในอีก',
      daysUntilPeriod: (days) => `${days} วัน`,
      periodDueToday: 'คาดว่าประจำเดือนมาวันนี้',
      periodLateTitle: (days) => `เลยกำหนด ${days} วัน`,
      periodLateSubtitle: 'รอบเดือนอาจคลาดเคลื่อนได้ แตะบันทึกทันทีเมื่อประจำเดือนมา',
      ovulationTitle: 'วันไข่ตก (คาดการณ์)',
      ovulationSubtitle: 'โอกาสตั้งครรภ์อยู่ในระดับสูงสุดของรอบนี้',
      fertileTitle: 'ช่วงเจริญพันธุ์',
      fertileSubtitle: 'อยู่ในช่วงใกล้ตกไข่ของรอบเดือนนี้',
      conceptionChanceLabel: 'โอกาสตั้งครรภ์',
      conceptionChance: {
        low: 'ต่ำ',
        medium: 'ปานกลาง',
        high: 'สูง',
      },
      logPeriodToday: 'บันทึกประจำเดือนวันนี้',
      editTodayLog: 'แก้ไขบันทึกวันนี้',
      clearPeriodToday: 'ยกเลิกวันประจำเดือนวันนี้',
      nextPeriodLabel: 'รอบถัดไป (คาดการณ์)',
      ovulationDateLabel: 'วันไข่ตก (คาดการณ์)',
      todayLogHeading: 'บันทึกของวันนี้',
      noLogsToday: 'ยังไม่ได้บันทึกอาการหรืออารมณ์ของวันนี้',
      addDailyLog: 'บันทึกอาการและอารมณ์',
      emptyTitle: 'ยังไม่มีข้อมูลรอบเดือน',
      emptyBody: 'แตะบันทึกวันแรกของประจำเดือนเพื่อเริ่มคำนวณรอบถัดไปและวันไข่ตก',
    },
    calendar: {
      title: 'ปฏิทินรอบเดือน',
      weekdays: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
      prevMonth: 'เดือนก่อนหน้า',
      nextMonth: 'เดือนถัดไป',
      jumpToday: 'วันนี้',
      editPeriodDays: 'แก้ไขวันประจำเดือน',
      editBannerTitle: 'โหมดแก้ไขวันประจำเดือน',
      editBannerHint: 'แตะเลือกหรือยกเลิกวันที่มีประจำเดือน (ย้อนหลังถึงวันนี้)',
      selectedCount: (count) => `เลือกไว้ ${count} วัน`,
      legend: {
        loggedPeriod: 'ประจำเดือน',
        predictedPeriod: 'คาดการณ์',
        fertile: 'เจริญพันธุ์',
        ovulation: 'ไข่ตก',
        loggedNote: 'มีบันทึก',
      },
    },
    dailyLog: {
      title: 'บันทึกรายวัน',
      futureTitle: 'ข้อมูลคาดการณ์ล่วงหน้า',
      futureBody: 'ยังไม่สามารถบันทึกอาการหรือประจำเดือนสำหรับวันในอนาคตได้',
      flowSection: 'ปริมาณประจำเดือน',
      symptomsSection: 'อาการทางกาย',
      moodsSection: 'อารมณ์',
      activitiesSection: 'กิจกรรม',
      noteSection: 'โน้ตเพิ่มเติม',
      notePlaceholder: 'จดบันทึกสั้นๆ สำหรับวันนี้...',
      statusLoggedPeriod: 'วันประจำเดือน',
      statusPredictedPeriod: 'คาดการณ์ประจำเดือน',
      statusOvulation: 'วันไข่ตก (คาดการณ์)',
      statusFertile: 'ช่วงเจริญพันธุ์',
      flow: {
        none: 'ไม่มี',
        spotting: 'กะปริดกะปรอย',
        light: 'น้อย',
        medium: 'ปานกลาง',
        heavy: 'มาก',
      },
      symptoms: {
        cramps: 'ปวดท้องน้อย',
        backache: 'ปวดหลัง',
        headache: 'ปวดหัว',
        tender_breasts: 'คัดตึงหน้าอก',
        bloating: 'ท้องอืด',
        fatigue: 'อ่อนเพลีย',
        acne: 'สิวขึ้น',
        nausea: 'คลื่นไส้',
      },
      moods: {
        calm: 'สงบ',
        happy: 'มีความสุข',
        sensitive: 'อ่อนไหว',
        irritable: 'หงุดหงิด',
        sad: 'เศร้า',
        anxious: 'กังวล',
        tired: 'เหนื่อยล้า',
      },
      activities: {
        protected_sex: 'เพศสัมพันธ์ (ป้องกัน)',
        unprotected_sex: 'เพศสัมพันธ์ (ไม่ป้องกัน)',
        exercise: 'ออกกำลังกาย',
      },
    },
    insights: {
      title: 'สถิติและแนวโน้ม',
      avgCycle: 'รอบเดือนเฉลี่ย',
      avgPeriod: 'ประจำเดือนเฉลี่ย',
      variation: 'ความผันผวน',
      noValue: '-',
      trendTitle: 'ความยาวรอบเดือนย้อนหลัง',
      trendAverageLabel: (days) => `เฉลี่ย ${days} วัน`,
      trendEmpty: 'บันทึกอย่างน้อย 2 รอบเดือนเพื่อดูกราฟแนวโน้มความยาวรอบเดือน',
      historyTitle: 'ประวัติรอบเดือน',
      historyEmpty: 'ยังไม่มีประวัติรอบเดือนที่บันทึกไว้',
      ongoingCycle: 'รอบปัจจุบัน',
      outlierBadge: 'ผิดปกติ',
      periodDaysCount: (days) => `ประจำเดือน ${days} วัน`,
      cycleDaysCount: (days) => `รอบ ${days} วัน`,
      topSymptomsTitle: 'อาการที่พบบ่อย',
      topMoodsTitle: 'อารมณ์ที่พบบ่อย',
      patternsEmpty: 'บันทึกอาการและอารมณ์รายวันเพื่อดูรูปแบบสุขภาพของคุณ',
      loggedTimes: (count, pct) => `${count} ครั้ง (${pct}%)`,
      disclaimer:
        'การคาดการณ์รอบเดือนและวันไข่ตกเป็นการประมาณการจากข้อมูลที่คุณบันทึกเท่านั้น ไม่สามารถใช้แทนคำแนะนำทางการแพทย์หรือการคุมกำเนิดได้',
    },
    settings: {
      title: 'ตั้งค่า',
      cycleDefaultsTitle: 'ค่าเริ่มต้นของรอบเดือน',
      defaultCycleLength: 'ความยาวรอบเดือนปกติ',
      defaultPeriodLength: 'ระยะประจำเดือนปกติ',
      lutealPhaseLength: 'ระยะหลังตกไข่ (Luteal)',
      languageTitle: 'ภาษา',
      languageTh: 'ไทย',
      languageEn: 'English',
      backupTitle: 'สำรองและกู้คืนข้อมูล',
      backupDescription: 'ส่งออกข้อมูลเป็นไฟล์ JSON เพื่อเก็บสำรอง หรือกู้คืนลงเครื่องนี้',
      exportButton: 'ส่งออก JSON',
      importButton: 'นำเข้า JSON',
      exportSuccess: 'ส่งออกไฟล์สำรองข้อมูลเรียบร้อยแล้ว',
      importPreviewTitle: 'ยืนยันการนำเข้าข้อมูล',
      importPreviewBody: (count) =>
        `พบรายการบันทึกทั้งหมด ${count} วัน การนำเข้าจะแทนที่ข้อมูลปัจจุบันบนเครื่องนี้`,
      importSuccess: 'นำเข้าข้อมูลเรียบร้อยแล้ว',
      importErrors: {
        INVALID_FORMAT: 'รูปแบบไฟล์ JSON ไม่ถูกต้อง',
        UNSUPPORTED_VERSION: 'ไม่รองรับเวอร์ชันของไฟล์สำรองข้อมูลนี้',
        INVALID_SETTINGS: 'ข้อมูลตั้งค่าในไฟล์สำรองไม่ถูกต้อง',
        INVALID_LOGS: 'พบบันทึกรายวันที่ไม่ถูกต้องในไฟล์สำรอง',
      },
      dangerTitle: 'จัดการข้อมูล',
      resetButton: 'ล้างข้อมูลทั้งหมด',
      resetConfirmTitle: 'ยืนยันการล้างข้อมูลทั้งหมด',
      resetConfirmBody: 'ประวัติรอบเดือน บันทึกรายวัน และการตั้งค่าบนเครื่องนี้จะถูกลบทั้งหมดและไม่สามารถย้อนกลับได้',
      resetConfirmAction: 'ลบข้อมูลทั้งหมด',
      privacyNote:
        'ข้อมูลทั้งหมดถูกจัดเก็บไว้ในเครื่องของคุณด้วย IndexedDB เท่านั้น ไม่มีการส่งออกไปยังเซิร์ฟเวอร์ภายนอก',
    },
  },
  en: {
    appName: 'PinkBird',
    common: {
      days: (n) => `${n} ${n === 1 ? 'day' : 'days'}`,
      dayShort: 'd',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      skip: 'Skip',
      done: 'Done',
      edit: 'Edit',
      confirm: 'Confirm',
      today: 'Today',
      clear: 'Clear',
      storageErrorTitle: 'Local storage unavailable',
      storageErrorBody:
        'IndexedDB may be restricted in private browsing mode. Please open in a standard browser window.',
    },
    nav: {
      today: 'Today',
      calendar: 'Calendar',
      insights: 'Insights',
      settings: 'Settings',
    },
    onboarding: {
      stepOf: (step, total) => `Step ${step} of ${total}`,
      welcomeTitle: 'Track your cycle privately',
      welcomeBody: 'All records stay on your device with no account required.',
      lastPeriodLabel: 'First day of your last period',
      lastPeriodHint: 'Pick a start date or skip to log later.',
      periodLengthTitle: 'How long does your period usually last?',
      periodLengthBody: 'Typical length is 5 days. Predictions adapt as you log more cycles.',
      cycleLengthTitle: 'How long is your typical cycle?',
      cycleLengthBody: 'Counted from day 1 of one period to day 1 of the next (default 28 days).',
      startTracking: 'Start tracking',
      skipForNow: 'Skip for now',
    },
    today: {
      cycleDay: (day) => `Cycle Day ${day}`,
      periodDayTitle: (day) => `Period Day ${day}`,
      periodSubtitle: 'Take it easy and log how you feel today',
      countdownLabel: 'Next period expected in',
      daysUntilPeriod: (days) => `${days} ${days === 1 ? 'day' : 'days'}`,
      periodDueToday: 'Period expected today',
      periodLateTitle: (days) => `${days} ${days === 1 ? 'day' : 'days'} late`,
      periodLateSubtitle: 'Cycles naturally vary. Log your period once it begins.',
      ovulationTitle: 'Estimated Ovulation',
      ovulationSubtitle: 'Highest estimated chance of conception in this cycle',
      fertileTitle: 'Fertile Window',
      fertileSubtitle: 'Approaching estimated ovulation for this cycle',
      conceptionChanceLabel: 'Chance of conception',
      conceptionChance: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      },
      logPeriodToday: 'Log Period Today',
      editTodayLog: "Edit Today's Log",
      clearPeriodToday: 'Clear Period Today',
      nextPeriodLabel: 'Next period (est.)',
      ovulationDateLabel: 'Ovulation (est.)',
      todayLogHeading: "Today's Log",
      noLogsToday: 'No symptoms or moods logged for today yet',
      addDailyLog: 'Log symptoms and mood',
      emptyTitle: 'No cycle data yet',
      emptyBody: 'Log your first period day to start estimating upcoming cycles and ovulation.',
    },
    calendar: {
      title: 'Cycle Calendar',
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      jumpToday: 'Today',
      editPeriodDays: 'Edit Period Days',
      editBannerTitle: 'Editing period days',
      editBannerHint: 'Tap dates up to today to mark or unmark period days',
      selectedCount: (count) => `${count} ${count === 1 ? 'day' : 'days'} selected`,
      legend: {
        loggedPeriod: 'Period',
        predictedPeriod: 'Predicted',
        fertile: 'Fertile',
        ovulation: 'Ovulation',
        loggedNote: 'Logged',
      },
    },
    dailyLog: {
      title: 'Daily Log',
      futureTitle: 'Upcoming prediction',
      futureBody: 'Logging flow or symptoms is only available for today and past dates.',
      flowSection: 'Period Flow',
      symptomsSection: 'Symptoms',
      moodsSection: 'Mood',
      activitiesSection: 'Activity',
      noteSection: 'Note',
      notePlaceholder: 'Add a quick note for this day...',
      statusLoggedPeriod: 'Logged Period',
      statusPredictedPeriod: 'Predicted Period',
      statusOvulation: 'Estimated Ovulation',
      statusFertile: 'Fertile Window',
      flow: {
        none: 'None',
        spotting: 'Spotting',
        light: 'Light',
        medium: 'Medium',
        heavy: 'Heavy',
      },
      symptoms: {
        cramps: 'Cramps',
        backache: 'Backache',
        headache: 'Headache',
        tender_breasts: 'Tender breasts',
        bloating: 'Bloating',
        fatigue: 'Fatigue',
        acne: 'Acne',
        nausea: 'Nausea',
      },
      moods: {
        calm: 'Calm',
        happy: 'Happy',
        sensitive: 'Sensitive',
        irritable: 'Irritable',
        sad: 'Sad',
        anxious: 'Anxious',
        tired: 'Tired',
      },
      activities: {
        protected_sex: 'Protected sex',
        unprotected_sex: 'Unprotected sex',
        exercise: 'Exercise',
      },
    },
    insights: {
      title: 'Insights & Trends',
      avgCycle: 'Avg cycle',
      avgPeriod: 'Avg period',
      variation: 'Variation',
      noValue: '-',
      trendTitle: 'Recent cycle lengths',
      trendAverageLabel: (days) => `Avg ${days}d`,
      trendEmpty: 'Log at least 2 cycles to view your cycle length trend chart.',
      historyTitle: 'Cycle History',
      historyEmpty: 'No period history recorded yet.',
      ongoingCycle: 'Ongoing',
      outlierBadge: 'Irregular',
      periodDaysCount: (days) => `${days}d period`,
      cycleDaysCount: (days) => `${days}d cycle`,
      topSymptomsTitle: 'Frequent Symptoms',
      topMoodsTitle: 'Frequent Moods',
      patternsEmpty: 'Log daily symptoms and moods to uncover personal patterns.',
      loggedTimes: (count, pct) => `${count}x (${pct}%)`,
      disclaimer:
        'Cycle and ovulation predictions are estimates based on your logged history and should not be used as medical advice or contraception.',
    },
    settings: {
      title: 'Settings',
      cycleDefaultsTitle: 'Cycle Defaults',
      defaultCycleLength: 'Default cycle length',
      defaultPeriodLength: 'Default period length',
      lutealPhaseLength: 'Luteal phase length',
      languageTitle: 'Language',
      languageTh: 'ไทย',
      languageEn: 'English',
      backupTitle: 'Backup & Restore',
      backupDescription: 'Export your data as JSON for safekeeping or restore an earlier backup.',
      exportButton: 'Export JSON',
      importButton: 'Import JSON',
      exportSuccess: 'Backup exported successfully.',
      importPreviewTitle: 'Confirm backup restore',
      importPreviewBody: (count) =>
        `Found ${count} logged days. Importing will replace current records on this device.`,
      importSuccess: 'Backup imported successfully.',
      importErrors: {
        INVALID_FORMAT: 'Invalid JSON backup format.',
        UNSUPPORTED_VERSION: 'Unsupported backup file version.',
        INVALID_SETTINGS: 'Backup contains invalid cycle settings.',
        INVALID_LOGS: 'Backup contains invalid daily log entries.',
      },
      dangerTitle: 'Data Management',
      resetButton: 'Reset All Data',
      resetConfirmTitle: 'Reset all local data?',
      resetConfirmBody:
        'All period history, daily logs, and preferences on this device will be permanently removed.',
      resetConfirmAction: 'Delete everything',
      privacyNote:
        'All records are stored locally on your device using IndexedDB and are never sent to external servers.',
    },
  },
};
