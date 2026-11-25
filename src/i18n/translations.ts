import type {
  ActivityId,
  ConceptionChance,
  CycleStatus,
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
    lastPeriodPlaceholder: string;
    lastPeriodHint: string;
    futureDateError: string;
    periodLengthTitle: string;
    periodLengthBody: string;
    cycleLengthTitle: string;
    cycleLengthBody: string;
    startTracking: string;
    skipForNow: string;
  };
  landing: {
    openApp: string;
    github: string;
    headline: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    previewTabToday: string;
    previewTabCalendar: string;
    previewCaption: string;
    featuresTitle: string;
    features: ReadonlyArray<{
      index: '01' | '02' | '03';
      title: string;
      body: string;
    }>;
    legendTitle: string;
    legendBody: string;
    closingTitle: string;
    closingBody: string;
    closingCta: string;
    footerLicense: string;
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
    endPeriodToday: string;
    periodEndedToday: string;
    nextPeriodLabel: string;
    ovulationDateLabel: string;
    todayLogHeading: string;
    noLogsToday: string;
    addDailyLog: string;
    emptyTitle: string;
    emptyBody: string;
    wheelAriaLabel: string;
    wheelDayAriaLabel: (day: number, dateStr: string) => string;
    wheelBackToToday: string;
    wheelPhases: {
      period: string;
      ovulation: string;
      fertile: string;
      follicular: string;
      luteal: string;
    };
    phaseGuide: Record<Exclude<CycleStatus, 'no_data'>, { title: string; body: string }>;
  };
  pwa: {
    installTitle: string;
    installBodyPrompt: string;
    installAction: string;
    installBodyIos: string;
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
    selectedDay: {
      periodStartButton: string;
      periodStartActive: string;
      periodEndButton: string;
      periodEndActive: string;
      openDetails: string;
      editDetails: string;
      autoEndHint: (days: number) => string;
      noLogsForDay: string;
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
    trackersSection: string;
    weightLabel: string;
    weightUnit: string;
    weightPlaceholder: string;
    weightError: string;
    bbtLabel: string;
    bbtUnit: string;
    bbtPlaceholder: string;
    bbtError: string;
    pillLabel: string;
    pillTaken: string;
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
    trackersTitle: string;
    trackersDescription: string;
    trackerWeight: string;
    trackerBbt: string;
    trackerPill: string;
    pinTitle: string;
    pinDescription: string;
    pinStatusOn: string;
    pinStatusOff: string;
    pinSetupButton: string;
    pinChangeButton: string;
    pinDisableButton: string;
    pinLockNowButton: string;
    pinSetupTitle: string;
    pinConfirmTitle: string;
    pinVerifyCurrentTitle: string;
    pinNewTitle: string;
    pinDisableTitle: string;
    pinMismatchError: string;
    pinWrongError: string;
    pinSavedFeedback: string;
    pinChangedFeedback: string;
    pinDisabledFeedback: string;
    pinUnlockTitle: string;
    pinUnlockSubtitle: string;
    pinDeleteDigit: string;
    pinForgotButton: string;
    pinForgotTitle: string;
    pinForgotBody: string;
    pinForgotConfirmAction: string;
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
    appName: 'Roselle',
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
      lastPeriodPlaceholder: 'เลือกวันที่ (ไม่บังคับ)',
      lastPeriodHint: 'เลือกวันที่เริ่มมา หรือกดข้ามเพื่อบันทึกภายหลังได้',
      futureDateError: 'วันที่ต้องไม่เกินวันปัจจุบัน',
      periodLengthTitle: 'ประจำเดือนของคุณมักมากี่วัน',
      periodLengthBody: 'ค่ามาตรฐานคือ 5 วัน แอปจะปรับตามสถิติจริงเมื่อคุณบันทึกมากขึ้น',
      cycleLengthTitle: 'ความยาวรอบเดือนปกติของคุณ',
      cycleLengthBody: 'นับจากวันแรกของรอบนี้ถึงวันแรกของรอบถัดไป (ค่ามาตรฐาน 28 วัน)',
      startTracking: 'เริ่มใช้งาน',
      skipForNow: 'ข้ามไปก่อน',
    },
    landing: {
      openApp: 'เปิดแอป',
      github: 'GitHub',
      headline: 'ติดตามรอบเดือนและวันไข่ตกอย่างเป็นส่วนตัว บนเครื่องของคุณเอง',
      subhead:
        'บันทึกประจำเดือน อาการ และอารมณ์ในไม่กี่วินาที ไม่มีบัญชี ไม่มีโฆษณา และใช้งานออฟไลน์ได้เต็มรูปแบบ',
      primaryCta: 'เริ่มใช้งานเลย',
      secondaryCta: 'ดูซอร์สโค้ดบน GitHub',
      previewTabToday: 'วันนี้',
      previewTabCalendar: 'ปฏิทิน',
      previewCaption: 'ตัวอย่างการใช้งานจริง ลองกดสลับดูได้',
      featuresTitle: 'ออกแบบมาเพื่อการใช้งานทุกวันแบบไม่รบกวน',
      features: [
        {
          index: '01',
          title: 'เป็นส่วนตัว 100% บนเครื่องของคุณ',
          body: 'บันทึกทั้งหมดเก็บด้วย IndexedDB บนอุปกรณ์โดยตรง ไม่ต้องสมัครสมาชิก ไม่ส่งข้อมูลขึ้นเซิร์ฟเวอร์ และส่งออกหรือนำเข้าไฟล์ JSON สำรองได้ทุกเมื่อ',
        },
        {
          index: '02',
          title: 'คาดการณ์รอบเดือนและจบรอบอัตโนมัติ',
          body: 'คำนวณรอบถัดไป วันไข่ตก และช่วงเจริญพันธุ์จากประวัติจริง 6 รอบล่าสุด พร้อมจบรอบประจำเดือนอัตโนมัติตามค่าตั้งค่าเมื่อคุณลืมกดหยุด',
        },
        {
          index: '03',
          title: 'PWA ออฟไลน์และ Open Source',
          body: 'ติดตั้งลงหน้าจอโฮมได้ทั้ง iOS และ Android ใช้งานได้แม้ไม่มีอินเทอร์เน็ต รองรับภาษาไทยและอังกฤษ พร้อมซอร์สโค้ดเปิดเผยภายใต้สัญญาอนุญาต MIT',
        },
      ],
      legendTitle: 'อ่านปฏิทินได้ทันทีทั้งสีและรูปทรง',
      legendBody:
        'แต่ละระยะของรอบเดือนแยกด้วยทั้งเฉดสีและเส้นขอบ ไม่พึ่งพาสีเพียงอย่างเดียว',
      closingTitle: 'เริ่มบันทึกได้ทันที ไม่ต้องสร้างบัญชี',
      closingBody:
        'ข้อมูลทุกวันอยู่บนอุปกรณ์ของคุณเท่านั้น และส่งออกสำรองเป็นไฟล์ JSON ได้ทุกเมื่อ',
      closingCta: 'เปิด Roselle',
      footerLicense: 'Open Source (MIT License)',
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
      endPeriodToday: 'ประจำเดือนหมดวันนี้',
      periodEndedToday: 'บันทึกว่าประจำเดือนหมดวันนี้แล้ว',
      nextPeriodLabel: 'รอบถัดไป (คาดการณ์)',
      ovulationDateLabel: 'วันไข่ตก (คาดการณ์)',
      todayLogHeading: 'บันทึกของวันนี้',
      noLogsToday: 'ยังไม่ได้บันทึกอาการหรืออารมณ์ของวันนี้',
      addDailyLog: 'บันทึกอาการและอารมณ์',
      emptyTitle: 'ยังไม่มีข้อมูลรอบเดือน',
      emptyBody: 'แตะบันทึกวันแรกของประจำเดือนเพื่อเริ่มคำนวณรอบถัดไปและวันไข่ตก',
      wheelAriaLabel: 'วงล้อรอบเดือนแบบโต้ตอบได้',
      wheelDayAriaLabel: (day, dateStr) => `วันที่ ${day} ของรอบเดือน (${dateStr})`,
      wheelBackToToday: 'กลับสู่วันนี้',
      wheelPhases: {
        period: 'ช่วงประจำเดือน',
        ovulation: 'วันไข่ตก (คาดการณ์)',
        fertile: 'ช่วงเจริญพันธุ์',
        follicular: 'ระยะฟอลลิคูลาร์',
        luteal: 'ระยะลูเทียล',
      },
      phaseGuide: {
        period: {
          title: 'คำแนะนำช่วงประจำเดือน',
          body: 'จิบน้ำอุ่นให้เพียงพอ พักผ่อนมากขึ้น และประคบอุ่นหากมีอาการปวดท้องน้อย',
        },
        period_due_today: {
          title: 'วันครบกำหนดรอบใหม่',
          body: 'เตรียมผ้าอนามัยติดตัวไว้ และแตะบันทึกวันแรกได้ทันทีเมื่อประจำเดือนมา',
        },
        late: {
          title: 'ประจำเดือนคลาดเคลื่อนจากคาดการณ์',
          body: 'รอบเดือนสามารถเลื่อนได้จากความเครียด การพักผ่อน หรือฮอร์โมน หากมาแล้วแตะบันทึกได้ทันที',
        },
        ovulation: {
          title: 'คำแนะนำวันไข่ตก',
          body: 'ระดับพลังงานมักสูงขึ้นและมูกปากมดลูกใสขึ้น โอกาสตั้งครรภ์สูงสุดในรอบนี้',
        },
        fertile: {
          title: 'คำแนะนำช่วงเจริญพันธุ์',
          body: 'อยู่ในช่วงใกล้ตกไข่ เหมาะกับการติดตามอุณหภูมิร่างกายหรือการวางแผนมีบุตร',
        },
        follicular: {
          title: 'คำแนะนำระยะฟอลลิคูลาร์',
          body: 'หลังประจำเดือนหมด ร่างกายค่อยๆ ฟื้นพลังงาน เหมาะกับกิจกรรมที่ใช้สมาธิและออกกำลังกาย',
        },
        luteal: {
          title: 'คำแนะนำระยะลูเทียล',
          body: 'อาจเริ่มอ่อนเพลีย คัดตึงหน้าอก หรืออารมณ์อ่อนไหวง่าย แนะนำลดคาเฟอีนและนอนให้พอ',
        },
      },
    },
    pwa: {
      installTitle: 'เพิ่ม Roselle ลงหน้าจอโฮม',
      installBodyPrompt: 'เปิดใช้งานได้ทันทีเหมือนแอปและใช้งานออฟไลน์ได้เต็มรูปแบบ',
      installAction: 'ติดตั้ง',
      installBodyIos: 'แตะปุ่มแชร์ด้านล่าง แล้วเลือก "เพิ่มไปยังหน้าจอโฮม" เพื่อใช้งานแบบเต็มหน้าจอ',
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
      selectedDay: {
        periodStartButton: 'ประจำเดือนเริ่มวันนี้',
        periodStartActive: 'เริ่มประจำเดือนวันนี้แล้ว',
        periodEndButton: 'ประจำเดือนหมดวันนี้',
        periodEndActive: 'บันทึกว่าหมดวันนี้แล้ว',
        openDetails: 'บันทึกอาการและอารมณ์',
        editDetails: 'แก้ไขบันทึกของวันนี้',
        autoEndHint: (days) => `หากไม่ได้กดหยุด ระบบจะจบรอบอัตโนมัติใน ${days} วันตามค่าตั้งค่า`,
        noLogsForDay: 'ยังไม่ได้บันทึกอาการหรืออารมณ์ในวันนี้',
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
      trackersSection: 'บันทึกเสริม',
      weightLabel: 'น้ำหนัก',
      weightUnit: 'กก.',
      weightPlaceholder: 'เช่น 52.5',
      weightError: 'กรุณาระบุน้ำหนักระหว่าง 20 ถึง 250 กก.',
      bbtLabel: 'อุณหภูมิร่างกาย (BBT)',
      bbtUnit: '°C',
      bbtPlaceholder: 'เช่น 36.55',
      bbtError: 'กรุณาระบุอุณหภูมิระหว่าง 34.0 ถึง 42.0 °C',
      pillLabel: 'ยาคุมกำเนิดรายวัน',
      pillTaken: 'ทานยาคุมแล้ว',
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
      trackersTitle: 'หมวดบันทึกเสริม',
      trackersDescription: 'เปิดเฉพาะรายการที่ต้องการให้แสดงในหน้าบันทึกรายวัน',
      trackerWeight: 'น้ำหนัก (กก.)',
      trackerBbt: 'อุณหภูมิร่างกายพื้นฐาน BBT (°C)',
      trackerPill: 'การทานยาคุมกำเนิดรายวัน',
      pinTitle: 'ล็อกแอปด้วยรหัส PIN',
      pinDescription: 'ปกป้องข้อมูลบนเครื่องด้วยรหัส 4 หลักทุกครั้งที่เปิดแอป',
      pinStatusOn: 'เปิดใช้งานแล้ว',
      pinStatusOff: 'ปิดอยู่',
      pinSetupButton: 'ตั้งรหัส PIN 4 หลัก',
      pinChangeButton: 'เปลี่ยนรหัส PIN',
      pinDisableButton: 'ปิดรหัส PIN',
      pinLockNowButton: 'ล็อกตอนนี้',
      pinSetupTitle: 'ตั้งรหัส PIN 4 หลัก',
      pinConfirmTitle: 'ยืนยันรหัส PIN อีกครั้ง',
      pinVerifyCurrentTitle: 'ใส่รหัส PIN ปัจจุบัน',
      pinNewTitle: 'ตั้งรหัส PIN ใหม่',
      pinDisableTitle: 'ยืนยันรหัสเพื่อปิดการล็อก',
      pinMismatchError: 'รหัส PIN ไม่ตรงกัน กรุณาลองอีกครั้ง',
      pinWrongError: 'รหัส PIN ไม่ถูกต้อง',
      pinSavedFeedback: 'บันทึกรหัส PIN เรียบร้อยแล้ว',
      pinChangedFeedback: 'เปลี่ยนรหัส PIN เรียบร้อยแล้ว',
      pinDisabledFeedback: 'ปิดการล็อกด้วย PIN แล้ว',
      pinUnlockTitle: 'ใส่รหัส PIN เพื่อเปิด Roselle',
      pinUnlockSubtitle: 'รหัสของคุณถูกเก็บแบบเข้ารหัสบนเครื่องนี้เท่านั้น',
      pinDeleteDigit: 'ลบตัวเลข',
      pinForgotButton: 'ลืมรหัส PIN?',
      pinForgotTitle: 'ล้างข้อมูลเพื่อปลดล็อกแอป',
      pinForgotBody:
        'หากลืมรหัส PIN ระบบไม่สามารถกู้คืนรหัสเดิมได้ คุณสามารถล้างประวัติรอบเดือน บันทึกรายวัน และรหัส PIN ทั้งหมดบนเครื่องนี้เพื่อเริ่มใช้งานใหม่',
      pinForgotConfirmAction: 'ล้างข้อมูลทั้งหมดและปลดล็อก',
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
    appName: 'Roselle',
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
      lastPeriodPlaceholder: 'Select date (optional)',
      lastPeriodHint: 'Pick a start date or skip to log later.',
      futureDateError: 'Date cannot be in the future.',
      periodLengthTitle: 'How long does your period usually last?',
      periodLengthBody: 'Typical length is 5 days. Predictions adapt as you log more cycles.',
      cycleLengthTitle: 'How long is your typical cycle?',
      cycleLengthBody: 'Counted from day 1 of one period to day 1 of the next (default 28 days).',
      startTracking: 'Start tracking',
      skipForNow: 'Skip for now',
    },
    landing: {
      openApp: 'Open app',
      github: 'GitHub',
      headline: 'Track your cycle and ovulation privately, strictly on your device',
      subhead:
        'Log periods, symptoms, and moods in seconds. No account, no ads, and full offline support as an installable PWA.',
      primaryCta: 'Start tracking',
      secondaryCta: 'View source on GitHub',
      previewTabToday: 'Today',
      previewTabCalendar: 'Calendar',
      previewCaption: 'Interactive preview, tap to explore',
      featuresTitle: 'Built for quiet daily check-ins',
      features: [
        {
          index: '01',
          title: 'Private and local-first on your device',
          body: 'All logs stay in on-device IndexedDB storage with zero login walls, no tracking scripts, and full JSON backup export and restore.',
        },
        {
          index: '02',
          title: 'Adaptive predictions with smart auto-end',
          body: 'Estimates upcoming cycles, ovulation, and fertile windows from your last 6 cycles, and wraps up active periods automatically if you forget to mark the end date.',
        },
        {
          index: '03',
          title: 'Installable offline PWA and open source',
          body: 'Add to your iOS or Android home screen for standalone offline use, switch between Thai and English anytime, and inspect the MIT-licensed source.',
        },
      ],
      legendTitle: 'Clear at a glance with color and shape',
      legendBody:
        'Every cycle phase pairs hue with distinct geometry so status never relies on color alone.',
      closingTitle: 'Start logging now, no account needed',
      closingBody:
        'Every record stays strictly on your device with full JSON backup whenever you want.',
      closingCta: 'Open Roselle',
      footerLicense: 'Open Source (MIT License)',
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
      endPeriodToday: 'Period ended today',
      periodEndedToday: 'Marked period ended today',
      nextPeriodLabel: 'Next period (est.)',
      ovulationDateLabel: 'Ovulation (est.)',
      todayLogHeading: "Today's Log",
      noLogsToday: 'No symptoms or moods logged for today yet',
      addDailyLog: 'Log symptoms and mood',
      emptyTitle: 'No cycle data yet',
      emptyBody: 'Log your first period day to start estimating upcoming cycles and ovulation.',
      wheelAriaLabel: 'Interactive cycle wheel',
      wheelDayAriaLabel: (day, dateStr) => `Cycle Day ${day} (${dateStr})`,
      wheelBackToToday: 'Back to today',
      wheelPhases: {
        period: 'Period Phase',
        ovulation: 'Estimated Ovulation',
        fertile: 'Fertile Window',
        follicular: 'Follicular Phase',
        luteal: 'Luteal Phase',
      },
      phaseGuide: {
        period: {
          title: 'Period care guide',
          body: 'Stay hydrated, rest a little extra, and use gentle warmth if cramps show up.',
        },
        period_due_today: {
          title: 'Cycle due today',
          body: 'Keep supplies handy and tap Log Period Today as soon as bleeding starts.',
        },
        late: {
          title: 'Slightly late cycle',
          body: 'Cycles naturally shift with sleep, stress, or routine changes. Log when your flow begins.',
        },
        ovulation: {
          title: 'Ovulation day guide',
          body: 'Energy and cervical mucus clarity often peak around now alongside the highest conception chance.',
        },
        fertile: {
          title: 'Fertile window guide',
          body: 'Approaching estimated ovulation. Basal temperature or symptom notes can help pinpoint your pattern.',
        },
        follicular: {
          title: 'Follicular phase guide',
          body: 'Rising estrogen often brings steadier energy after menstruation, well suited for focus and movement.',
        },
        luteal: {
          title: 'Luteal phase guide',
          body: 'Energy can gradually wind down before your next period. Lighter caffeine and steady sleep help.',
        },
      },
    },
    pwa: {
      installTitle: 'Add Roselle to Home Screen',
      installBodyPrompt: 'Launch like a native app anytime with full offline access.',
      installAction: 'Install',
      installBodyIos: 'Tap Share in Safari, then choose "Add to Home Screen" for full-screen offline use.',
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
      selectedDay: {
        periodStartButton: 'Period started',
        periodStartActive: 'Marked as period start',
        periodEndButton: 'Period ended',
        periodEndActive: 'Marked as period end',
        openDetails: 'Log symptoms & mood',
        editDetails: 'Edit daily log',
        autoEndHint: (days) => `Auto-ends after ${days} days based on your cycle defaults if unmarked`,
        noLogsForDay: 'No symptoms or moods logged on this day',
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
      trackersSection: 'Health Trackers',
      weightLabel: 'Weight',
      weightUnit: 'kg',
      weightPlaceholder: 'e.g. 52.5',
      weightError: 'Enter a weight between 20 and 250 kg.',
      bbtLabel: 'Basal Body Temp (BBT)',
      bbtUnit: '°C',
      bbtPlaceholder: 'e.g. 36.55',
      bbtError: 'Enter a temperature between 34.0 and 42.0 °C.',
      pillLabel: 'Daily contraceptive pill',
      pillTaken: 'Pill taken',
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
      trackersTitle: 'Optional Trackers',
      trackersDescription: 'Choose extra health fields to show in Daily Log.',
      trackerWeight: 'Weight (kg)',
      trackerBbt: 'Basal Body Temperature (°C)',
      trackerPill: 'Daily contraceptive pill',
      pinTitle: 'App PIN Lock',
      pinDescription: 'Require a local 4-digit PIN whenever you open the app.',
      pinStatusOn: 'Enabled',
      pinStatusOff: 'Off',
      pinSetupButton: 'Set 4-digit PIN',
      pinChangeButton: 'Change PIN',
      pinDisableButton: 'Disable PIN',
      pinLockNowButton: 'Lock now',
      pinSetupTitle: 'Set 4-digit PIN',
      pinConfirmTitle: 'Confirm your PIN',
      pinVerifyCurrentTitle: 'Enter current PIN',
      pinNewTitle: 'Enter new PIN',
      pinDisableTitle: 'Enter PIN to disable lock',
      pinMismatchError: 'PINs do not match. Try again.',
      pinWrongError: 'Incorrect PIN.',
      pinSavedFeedback: 'PIN lock enabled.',
      pinChangedFeedback: 'PIN updated.',
      pinDisabledFeedback: 'PIN lock disabled.',
      pinUnlockTitle: 'Enter PIN to unlock Roselle',
      pinUnlockSubtitle: 'Your PIN is verified locally on this device.',
      pinDeleteDigit: 'Delete digit',
      pinForgotButton: 'Forgot PIN?',
      pinForgotTitle: 'Reset data to unlock app',
      pinForgotBody:
        'Forgotten PINs cannot be recovered. You can permanently erase all cycle history, daily logs, and the PIN lock on this device to start fresh.',
      pinForgotConfirmAction: 'Erase all data & unlock',
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
