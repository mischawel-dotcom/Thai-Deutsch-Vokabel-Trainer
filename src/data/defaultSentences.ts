export type SentenceEntry = {
  thai: string;
  german: string;
  // Optional hint to track which vocab entry introduced this sentence.
  sourceThaiWord?: string;
};

export type SentenceBlock = {
  lesson: number;
  rangeStart: number;
  rangeEnd: number;
  unlockThresholdTestPassed: number;
  sentences: SentenceEntry[];
};

// Pilot block: Lesson 1, vocab range 1-50, 5 starter sentences.
// Rule A is enforced manually here: Thai sentence uses only vocab from range 1-50.
export const DEFAULT_SENTENCE_BLOCKS: SentenceBlock[] = [
  {
    lesson: 1,
    rangeStart: 1,
    rangeEnd: 50,
    unlockThresholdTestPassed: 50,
    sentences: [
      {
        thai: "ฉันกินข้าว",
        german: "Ich esse Reis.",
        sourceThaiWord: "กิน",
      },
      {
        thai: "เขาดื่มน้ำ",
        german: "Er/Sie trinkt Wasser.",
        sourceThaiWord: "ดื่ม",
      },
      {
        thai: "พรุ่งนี้ฉันไปโรงเรียน",
        german: "Morgen gehe ich zur Schule.",
        sourceThaiWord: "พรุ่งนี้",
      },
      {
        thai: "เราซื้ออาหาร",
        german: "Wir kaufen Essen.",
        sourceThaiWord: "ซื้อ",
      },
      {
        thai: "พวกเขาอยู่บ้านวันนี้",
        german: "Sie sind heute zu Hause.",
        sourceThaiWord: "พวกเขา",
      },
    ],
  },
  {
    lesson: 1,
    rangeStart: 1,
    rangeEnd: 100,
    unlockThresholdTestPassed: 100,
    sentences: [
      {
        thai: "ผู้ชายเป็นครู",
        german: "Der Mann ist Lehrer.",
        sourceThaiWord: "ผู้ชาย",
      },
      {
        thai: "ผู้หญิงเป็นพยาบาล",
        german: "Die Frau ist Krankenpflegerin.",
        sourceThaiWord: "ผู้หญิง",
      },
      {
        thai: "พวกเราอยู่ที่โรงเรียน",
        german: "Wir sind in der Schule.",
        sourceThaiWord: "พวกเรา",
      },
      {
        thai: "ลูกค้าซื้ออาหาร",
        german: "Der Kunde / die Kundin kauft Essen.",
        sourceThaiWord: "ลูกค้า",
      },
      {
        thai: "พรุ่งนี้พวกเราไปโรงเรียนไหม",
        german: "Gehen wir morgen zur Schule?",
        sourceThaiWord: "พรุ่งนี้",
      },
    ],
  },
  {
    lesson: 1,
    rangeStart: 1,
    rangeEnd: 150,
    unlockThresholdTestPassed: 150,
    sentences: [
      {
        thai: "ครูสอนนักเรียน",
        german: "Der Lehrer / die Lehrerin unterrichtet den Schüler / die Schülerin.",
        sourceThaiWord: "สอน",
      },
      {
        thai: "นักเรียนถามครู",
        german: "Der Schüler / die Schülerin fragt den Lehrer / die Lehrerin.",
        sourceThaiWord: "ถาม",
      },
      {
        thai: "พนักงานตอบลูกค้า",
        german: "Der Angestellte / die Angestellte antwortet der Kundin / dem Kunden.",
        sourceThaiWord: "ตอบ",
      },
      {
        thai: "ฉันอ่านและเขียน",
        german: "Ich lese und schreibe.",
        sourceThaiWord: "อ่าน",
      },
      {
        thai: "เขาไม่เข้าใจ",
        german: "Er/Sie versteht nicht.",
        sourceThaiWord: "เข้าใจ",
      },
    ],
  },
  {
    lesson: 1,
    rangeStart: 1,
    rangeEnd: 200,
    unlockThresholdTestPassed: 200,
    sentences: [
      {
        thai: "ฉันหิวและกระหาย",
        german: "Ich habe Hunger und Durst.",
        sourceThaiWord: "หิว",
      },
      {
        thai: "วันนี้ฉันเหนื่อย",
        german: "Heute bin ich müde.",
        sourceThaiWord: "เหนื่อย",
      },
      {
        thai: "เพื่อนป่วย",
        german: "Der Freund / die Freundin ist krank.",
        sourceThaiWord: "ป่วย",
      },
      {
        thai: "หมอช่วยเพื่อน",
        german: "Der Arzt / die Ärztin hilft dem Freund / der Freundin.",
        sourceThaiWord: "หมอ",
      },
      {
        thai: "เขาโกรธ แต่ฉันไม่โกรธ",
        german: "Er/Sie ist wütend, aber ich bin nicht wütend.",
        sourceThaiWord: "โกรธ",
      },
    ],
  },
  {
    lesson: 2,
    rangeStart: 1,
    rangeEnd: 50,
    unlockThresholdTestPassed: 50,
    sentences: [
      {
        thai: "สวัสดี ฉันขอบคุณคุณนะ",
        german: "Hallo, ich wollte dir noch danke sagen.",
        sourceThaiWord: "ขอบคุณ",
      },
      {
        thai: "ห้องน้ำอยู่ที่ไหน",
        german: "Wo ist die Toilette?",
        sourceThaiWord: "ห้องน้ำ",
      },
      {
        thai: "ฉันไปตลาดตอนเช้า",
        german: "Ich gehe am Morgen zum Markt.",
        sourceThaiWord: "ตลาด",
      },
      {
        thai: "ฉันซื้อกระเป๋าเดินทาง",
        german: "Ich kaufe einen Koffer.",
        sourceThaiWord: "กระเป๋าเดินทาง",
      },
      {
        thai: "เมืองนี้มีสะพาน",
        german: "Diese Stadt hat eine Brücke.",
        sourceThaiWord: "สะพาน",
      },
    ],
  },
  {
    lesson: 2,
    rangeStart: 1,
    rangeEnd: 100,
    unlockThresholdTestPassed: 100,
    sentences: [
      {
        thai: "ฉันไปด้วยรถไฟฟ้า",
        german: "Ich fahre mit dem Skytrain.",
        sourceThaiWord: "รถไฟฟ้า",
      },
      {
        thai: "รถใต้ดินเร็วมาก",
        german: "Die U-Bahn ist sehr schnell.",
        sourceThaiWord: "รถใต้ดิน",
      },
      {
        thai: "วันนี้ฉันกินผักและผลไม้",
        german: "Heute esse ich Gemüse und Obst.",
        sourceThaiWord: "ผัก",
      },
      {
        thai: "ฉันดื่มกาแฟและชา",
        german: "Ich trinke Kaffee und Tee.",
        sourceThaiWord: "กาแฟ",
      },
      {
        thai: "สถานีรถไฟอยู่ในเมือง",
        german: "Der Bahnhof ist in der Stadt.",
        sourceThaiWord: "สถานีรถไฟ",
      },
    ],
  },
  {
    lesson: 2,
    rangeStart: 1,
    rangeEnd: 150,
    unlockThresholdTestPassed: 150,
    sentences: [
      {
        thai: "ฉันสวมเสื้อสีแดง",
        german: "Ich trage ein rotes Shirt.",
        sourceThaiWord: "สวม",
      },
      {
        thai: "เขาถอดรองเท้า",
        german: "Er/Sie zieht die Schuhe aus.",
        sourceThaiWord: "ถอด",
      },
      {
        thai: "ฉันเลือกเสื้อผ้าสีฟ้า",
        german: "Ich wähle blaue Kleidung.",
        sourceThaiWord: "เลือก",
      },
      {
        thai: "พรุ่งนี้เราไปเที่ยว",
        german: "Morgen reisen wir in den Urlaub.",
        sourceThaiWord: "เที่ยว",
      },
      {
        thai: "ฉันฝันถึงทะเล",
        german: "Ich träume vom Meer.",
        sourceThaiWord: "ฝัน",
      },
    ],
  },
  {
    lesson: 2,
    rangeStart: 1,
    rangeEnd: 200,
    unlockThresholdTestPassed: 200,
    sentences: [
      {
        thai: "ฉันยิ้มและหัวเราะ",
        german: "Ich lächle und lache.",
        sourceThaiWord: "ยิ้ม",
      },
      {
        thai: "วันนี้ฉันทำอาหารในห้องครัว",
        german: "Heute koche ich in der Küche.",
        sourceThaiWord: "ทำอาหาร",
      },
      {
        thai: "วันหยุดเราไปสวน",
        german: "Am Feiertag gehen wir in den Park.",
        sourceThaiWord: "วันหยุด",
      },
      {
        thai: "ฉันไปธนาคารและร้านขายยา",
        german: "Ich gehe zur Bank und zur Apotheke.",
        sourceThaiWord: "ธนาคาร",
      },
      {
        thai: "พรุ่งนี้เราไปสนามบินและขึ้นเครื่องบิน",
        german: "Morgen fahren wir zum Flughafen und fliegen mit dem Flugzeug.",
        sourceThaiWord: "สนามบิน",
      },
    ],
  },
  {
    lesson: 3,
    rangeStart: 1,
    rangeEnd: 50,
    unlockThresholdTestPassed: 50,
    sentences: [
      {
        thai: "ฉันซื้อสับปะรดและมะม่วง",
        german: "Ich habe Ananas und Mango gekauft.",
        sourceThaiWord: "สับปะรด",
      },
      {
        thai: "วันนี้อากาศหนาวและลมแรง",
        german: "Heute ist das Wetter kalt und der Wind ist stark.",
        sourceThaiWord: "อากาศ",
      },
      {
        thai: "พรุ่งนี้เราไปชายหาด",
        german: "Morgen gehen wir an den Strand.",
        sourceThaiWord: "ชายหาด",
      },
      {
        thai: "ฉันไปด้วยรถเมล์",
        german: "Ich fahre mit dem Bus.",
        sourceThaiWord: "รถเมล์",
      },
      {
        thai: "ฉันซื้อตั๋วแล้ว",
        german: "Ich habe das Ticket schon gekauft.",
        sourceThaiWord: "ตั๋ว",
      },
    ],
  },
  {
    lesson: 3,
    rangeStart: 1,
    rangeEnd: 100,
    unlockThresholdTestPassed: 100,
    sentences: [
      {
        thai: "คุณดื่มนมหรือน้ำส้ม",
        german: "Trinkst du lieber Milch oder Orangensaft?",
        sourceThaiWord: "นม",
      },
      {
        thai: "วันนี้ฉันกินบะหมี่",
        german: "Heute esse ich Nudeln.",
        sourceThaiWord: "บะหมี่",
      },
      {
        thai: "ฉันเปิดตู้เย็น",
        german: "Ich öffne den Kühlschrank.",
        sourceThaiWord: "ตู้เย็น",
      },
      {
        thai: "ฉันใช้ผ้าเช็ดตัว",
        german: "Ich benutze ein Handtuch.",
        sourceThaiWord: "ผ้าเช็ดตัว",
      },
      {
        thai: "พรุ่งนี้เราประชุม",
        german: "Morgen haben wir eine Besprechung.",
        sourceThaiWord: "ประชุม",
      },
    ],
  },
  {
    lesson: 3,
    rangeStart: 1,
    rangeEnd: 150,
    unlockThresholdTestPassed: 150,
    sentences: [
      {
        thai: "ฉันลืมรหัสผ่าน",
        german: "Ich habe das Passwort vergessen.",
        sourceThaiWord: "รหัสผ่าน",
      },
      {
        thai: "วันนี้รถติดมาก",
        german: "Heute gibt es viel Stau.",
        sourceThaiWord: "รถติด",
      },
      {
        thai: "ฉันพกร่ม",
        german: "Ich habe einen Regenschirm dabei.",
        sourceThaiWord: "ร่ม",
      },
      {
        thai: "ฉันส่งรายงานทางอีเมล",
        german: "Ich schicke den Bericht per E-Mail.",
        sourceThaiWord: "รายงาน",
      },
      {
        thai: "พรุ่งนี้ฉันไปสัมภาษณ์",
        german: "Morgen gehe ich zum Interview.",
        sourceThaiWord: "สัมภาษณ์",
      },
    ],
  },
  {
    lesson: 3,
    rangeStart: 1,
    rangeEnd: 200,
    unlockThresholdTestPassed: 200,
    sentences: [
      {
        thai: "ฉันใส่เสื้อยืด",
        german: "Ich trage ein T-Shirt.",
        sourceThaiWord: "เสื้อยืด",
      },
      {
        thai: "โต๊ะอยู่ข้างโซฟา",
        german: "Der Tisch steht neben dem Sofa.",
        sourceThaiWord: "โต๊ะ",
      },
      {
        thai: "ฉันเก็บเอกสารทันที",
        german: "Ich lege das Dokument sofort weg.",
        sourceThaiWord: "เอกสาร",
      },
      {
        thai: "วันนี้ฉันไอและมีไข้",
        german: "Heute huste ich und habe Fieber.",
        sourceThaiWord: "ไอ",
      },
      {
        thai: "พรุ่งนี้ฉันซื้อของขวัญ",
        german: "Morgen kaufe ich ein Geschenk.",
        sourceThaiWord: "ของขวัญ",
      },
    ],
  },
  {
    lesson: 4,
    rangeStart: 1,
    rangeEnd: 50,
    unlockThresholdTestPassed: 50,
    sentences: [
      {
        thai: "ช่วยวางตะเกียบและแก้วบนโต๊ะ",
        german: "Bitte lege Essstäbchen und Gläser auf den Tisch.",
        sourceThaiWord: "ตะเกียบ",
      },
      {
        thai: "วันนี้ฝนตกและมืด",
        german: "Heute regnet es und es ist dunkel.",
        sourceThaiWord: "ฝนตก",
      },
      {
        thai: "ฉันจ่ายด้วยบัตรเครดิต",
        german: "Ich bezahle mit Kreditkarte.",
        sourceThaiWord: "บัตรเครดิต",
      },
      {
        thai: "เราเช่าห้องใกล้ๆ มหาวิทยาลัย",
        german: "Wir mieten ein Zimmer ganz nah an der Universität.",
        sourceThaiWord: "มหาวิทยาลัย",
      },
      {
        thai: "ฉันหลงทาง ช่วยด้วย",
        german: "Ich habe mich verlaufen, Hilfe!",
        sourceThaiWord: "หลงทาง",
      },
    ],
  },
  {
    lesson: 4,
    rangeStart: 1,
    rangeEnd: 100,
    unlockThresholdTestPassed: 100,
    sentences: [
      {
        thai: "วันนี้อากาศชื้นและมีหมอก",
        german: "Heute ist das Wetter feucht und es gibt Nebel.",
        sourceThaiWord: "ชื้น",
      },
      {
        thai: "ฉันลืมกุญแจที่บ้าน",
        german: "Ich habe den Schlüssel zu Hause vergessen.",
        sourceThaiWord: "กุญแจ",
      },
      {
        thai: "พรุ่งนี้เรานัดหมายตรงเวลา",
        german: "Morgen haben wir einen Termin und sind pünktlich.",
        sourceThaiWord: "นัดหมาย",
      },
      {
        thai: "ฉันมีคำถาม แต่เขาไม่มีคำตอบ",
        german: "Ich habe eine Frage, aber er/sie hat keine Antwort.",
        sourceThaiWord: "คำถาม",
      },
      {
        thai: "ครูอธิบายภาษาเยอรมัน",
        german: "Der Lehrer / die Lehrerin erklärt Deutsch.",
        sourceThaiWord: "อธิบาย",
      },
    ],
  },
  {
    lesson: 4,
    rangeStart: 1,
    rangeEnd: 150,
    unlockThresholdTestPassed: 150,
    sentences: [
      {
        thai: "ฉันเตรียมงานบนโต๊ะทำงานแล้ว",
        german: "Ich habe die Arbeit auf dem Schreibtisch vorbereitet.",
        sourceThaiWord: "เตรียม",
      },
      {
        thai: "ฉันส่งข้อความและโทรกลับ",
        german: "Ich sende eine Nachricht und rufe zurück.",
        sourceThaiWord: "ส่งข้อความ",
      },
      {
        thai: "พรุ่งนี้เราไปพิพิธภัณฑ์",
        german: "Morgen gehen wir ins Museum.",
        sourceThaiWord: "พิพิธภัณฑ์",
      },
      {
        thai: "ฉันทำส้มตำใส่พริก",
        german: "Ich mache Papayasalat mit Chili.",
        sourceThaiWord: "ส้มตำ",
      },
      {
        thai: "สวนนี้มีต้นไม้และดอกไม้",
        german: "In diesem Park gibt es Bäume und Blumen.",
        sourceThaiWord: "ต้นไม้",
      },
    ],
  },
  {
    lesson: 4,
    rangeStart: 1,
    rangeEnd: 200,
    unlockThresholdTestPassed: 200,
    sentences: [
      {
        thai: "สุดสัปดาห์เราไปสวนสัตว์",
        german: "Am Wochenende gehen wir in den Zoo.",
        sourceThaiWord: "สวนสัตว์",
      },
      {
        thai: "ผีเสื้อและผึ้งชอบดอกไม้",
        german: "Schmetterlinge und Bienen lieben Blumen.",
        sourceThaiWord: "ผีเสื้อ",
      },
      {
        thai: "เราแยกขยะเพื่อสิ่งแวดล้อม",
        german: "Wir trennen Müll für die Umwelt.",
        sourceThaiWord: "สิ่งแวดล้อม",
      },
      {
        thai: "ที่นี่เงียบ ไม่ดัง",
        german: "Hier ist es ruhig, nicht laut.",
        sourceThaiWord: "เงียบ",
      },
      {
        thai: "เขาใจดีและสุภาพ",
        german: "Er/Sie ist nett und höflich.",
        sourceThaiWord: "สุภาพ",
      },
    ],
  },
  {
    lesson: 5,
    rangeStart: 1,
    rangeEnd: 50,
    unlockThresholdTestPassed: 50,
    sentences: [
      {
        thai: "ฉันดูทีวีบ่อย",
        german: "Ich sehe oft fern.",
        sourceThaiWord: "ดูทีวี",
      },
      {
        thai: "เราควรไปด้วยกัน",
        german: "Wir sollten zusammen gehen.",
        sourceThaiWord: "ควร",
      },
      {
        thai: "วันนี้ฉันดีใจ แต่เขาเสียใจ",
        german: "Heute bin ich froh, aber er/sie ist traurig.",
        sourceThaiWord: "ดีใจ",
      },
      {
        thai: "ฉันเข้าใจแล้ว พูดช้าๆ",
        german: "Ich habe verstanden, bitte langsam sprechen.",
        sourceThaiWord: "ฉันเข้าใจแล้ว",
      },
      {
        thai: "ลมแรงทางตะวันออก",
        german: "Im Osten ist starker Wind.",
        sourceThaiWord: "ลมแรง",
      },
    ],
  },
  {
    lesson: 5,
    rangeStart: 1,
    rangeEnd: 100,
    unlockThresholdTestPassed: 100,
    sentences: [
      {
        thai: "ฉันกินข้าวสวยกับแครอท",
        german: "Ich esse gekochten Reis mit Karotte.",
        sourceThaiWord: "ข้าวสวย",
      },
      {
        thai: "ฉันแพ้ขิง",
        german: "Ich bin allergisch gegen Ingwer.",
        sourceThaiWord: "แพ้",
      },
      {
        thai: "เรามีนัดหมอภายหลัง",
        german: "Wir haben später einen Arzttermin.",
        sourceThaiWord: "นัดหมอ",
      },
      {
        thai: "ฉันบันทึกไฟล์แล้ว",
        german: "Ich habe die Datei gespeichert.",
        sourceThaiWord: "บันทึก",
      },
      {
        thai: "ถ้าลบไฟล์ ต้องแก้ไขอีกครั้ง",
        german: "Wenn man die Datei löscht, muss man sie noch einmal bearbeiten.",
        sourceThaiWord: "ลบ",
      },
    ],
  },
  {
    lesson: 5,
    rangeStart: 1,
    rangeEnd: 150,
    unlockThresholdTestPassed: 150,
    sentences: [
      {
        thai: "ฉันชอบว่ายน้ำและเดินเล่น",
        german: "Ich mag schwimmen und spazieren.",
        sourceThaiWord: "ว่ายน้ำ",
      },
      {
        thai: "พรุ่งนี้เราตั้งแคมป์",
        german: "Morgen gehen wir campen.",
        sourceThaiWord: "ตั้งแคมป์",
      },
      {
        thai: "ฉันมีแผนและเป้าหมาย",
        german: "Ich habe einen Plan und ein Ziel.",
        sourceThaiWord: "แผน",
      },
      {
        thai: "นี่คือตัวอย่างที่ดี",
        german: "Das ist ein gutes Beispiel.",
        sourceThaiWord: "ตัวอย่าง",
      },
      {
        thai: "ฉันจ่ายด้วยบัตรเดบิต",
        german: "Ich bezahle mit Debitkarte.",
        sourceThaiWord: "บัตรเดบิต",
      },
    ],
  },
  {
    lesson: 5,
    rangeStart: 1,
    rangeEnd: 200,
    unlockThresholdTestPassed: 200,
    sentences: [
      {
        thai: "ลุงกับป้าอยู่ที่นี่",
        german: "Onkel und Tante sind hier.",
        sourceThaiWord: "ลุง",
      },
      {
        thai: "ฉันฝากเงินและโอนเงิน",
        german: "Ich zahle Geld ein und überweise Geld.",
        sourceThaiWord: "ฝากเงิน",
      },
      {
        thai: "เราอยากประหยัดค่าเช่า",
        german: "Wir möchten bei der Miete sparen.",
        sourceThaiWord: "ประหยัด",
      },
      {
        thai: "ฉันใช้ค้อนกับตะปู",
        german: "Ich benutze Hammer und Nagel.",
        sourceThaiWord: "ค้อน",
      },
      {
        thai: "รถช้าลงก่อนวงเวียน",
        german: "Das Auto wird vor dem Kreisverkehr langsamer.",
        sourceThaiWord: "ช้าลง",
      },
    ],
  },
  {
    lesson: 5,
    rangeStart: 1,
    rangeEnd: 249,
    unlockThresholdTestPassed: 249,
    sentences: [
      {
        thai: "คนขับเบรกหน้าปั๊มน้ำมัน",
        german: "Der Fahrer bremst vor der Tankstelle.",
        sourceThaiWord: "เบรก",
      },
      {
        thai: "วันนี้พยากรณ์อากาศบอกว่าฝนตก",
        german: "Heute sagt die Wettervorhersage, dass es regnet.",
        sourceThaiWord: "พยากรณ์อากาศ",
      },
      {
        thai: "ฉันทบทวนคำศัพท์และไวยากรณ์",
        german: "Ich wiederhole Wortschatz und Grammatik.",
        sourceThaiWord: "คำศัพท์",
      },
      {
        thai: "นักเรียนจดในสมุด",
        german: "Der Schüler / die Schülerin notiert im Heft.",
        sourceThaiWord: "จด",
      },
      {
        thai: "ฉันชอบศิลปะและภาพวาด",
        german: "Ich mag Kunst und Gemälde.",
        sourceThaiWord: "ศิลปะ",
      },
    ],
  },
  {
    lesson: 6,
    rangeStart: 1,
    rangeEnd: 5,
    unlockThresholdTestPassed: 0,
    sentences: [
      {
        thai: "สวัสดี ฉันชื่อ...",
        german: "Hallo, ich heiße...",
        sourceThaiWord: "สวัสดี",
      },
      {
        thai: "ฉันมาจากเยอรมนี",
        german: "Ich komme aus Deutschland.",
        sourceThaiWord: "ฉัน",
      },
      {
        thai: "ยินดีที่ได้รู้จัก",
        german: "Freut mich, dich kennenzulernen.",
        sourceThaiWord: "ยินดีต้อนรับ",
      },
      {
        thai: "ฉันพูดภาษาไทยได้นิดหน่อย",
        german: "Ich spreche ein bisschen Thai.",
        sourceThaiWord: "ภาษาไทย",
      },
      {
        thai: "คุณพูดภาษาอังกฤษได้ไหม",
        german: "Sprechen Sie Englisch?",
        sourceThaiWord: "ภาษาอังกฤษ",
      },
    ],
  },
  {
    lesson: 6,
    rangeStart: 6,
    rangeEnd: 10,
    unlockThresholdTestPassed: 0,
    sentences: [
      {
        thai: "ห้องน้ำอยู่ที่ไหน",
        german: "Wo ist die Toilette?",
        sourceThaiWord: "ห้องน้ำ",
      },
      {
        thai: "ฉันจะไปสถานีรถไฟได้อย่างไร",
        german: "Wie komme ich zum Bahnhof?",
        sourceThaiWord: "สถานีรถไฟ",
      },
      {
        thai: "ฉันต้องการตั๋วไป...",
        german: "Ich möchte ein Ticket nach...",
        sourceThaiWord: "ตั๋ว",
      },
      {
        thai: "ป้ายรถเมล์ที่ใกล้ที่สุดอยู่ที่ไหน",
        german: "Wo ist die nächste Bushaltestelle?",
        sourceThaiWord: "ป้ายรถเมล์",
      },
      {
        thai: "กรุณาขับช้าๆ",
        german: "Bitte fahren Sie langsam.",
        sourceThaiWord: "กรุณา",
      },
    ],
  },
  {
    lesson: 6,
    rangeStart: 11,
    rangeEnd: 15,
    unlockThresholdTestPassed: 0,
    sentences: [
      {
        thai: "ฉันจองไว้แล้ว",
        german: "Ich habe eine Reservierung.",
        sourceThaiWord: "จอง",
      },
      {
        thai: "ฉันต้องการห้องเดี่ยว",
        german: "Ich hätte gern ein Einzelzimmer.",
        sourceThaiWord: "ห้องเดี่ยว",
      },
      {
        thai: "รวมอาหารเช้าหรือไม่",
        german: "Ist Frühstück inklusive?",
        sourceThaiWord: "อาหารเช้า",
      },
      {
        thai: "ขอใบเสร็จด้วย",
        german: "Die Rechnung bitte.",
        sourceThaiWord: "ใบเสร็จ",
      },
      {
        thai: "ไม่เผ็ดนะ",
        german: "Nicht scharf, bitte.",
        sourceThaiWord: "ไม่เผ็ด",
      },
    ],
  },
  {
    lesson: 6,
    rangeStart: 16,
    rangeEnd: 20,
    unlockThresholdTestPassed: 0,
    sentences: [
      {
        thai: "ช่วยฉันหน่อยได้ไหม",
        german: "Helfen Sie mir bitte.",
        sourceThaiWord: "ช่วย",
      },
      {
        thai: "ฉันปวดท้อง",
        german: "Ich habe Bauchschmerzen.",
        sourceThaiWord: "ปวดท้อง",
      },
      {
        thai: "ฉันต้องการพบหมอ",
        german: "Ich brauche einen Arzt.",
        sourceThaiWord: "หมอ",
      },
      {
        thai: "ร้านขายยาที่ใกล้ที่สุดอยู่ที่ไหน",
        german: "Wo ist die nächste Apotheke?",
        sourceThaiWord: "ร้านขายยา",
      },
      {
        thai: "กรุณาเรียกตำรวจให้หน่อย",
        german: "Rufen Sie bitte die Polizei.",
        sourceThaiWord: "ตำรวจ",
      },
    ],
  },
  {
    lesson: 6,
    rangeStart: 21,
    rangeEnd: 25,
    unlockThresholdTestPassed: 0,
    sentences: [
      {
        thai: "อันนี้ราคาเท่าไหร่",
        german: "Wie viel kostet das?",
        sourceThaiWord: "ราคาเท่าไหร่",
      },
      {
        thai: "อันนี้แพงเกินไป",
        german: "Das ist zu teuer.",
        sourceThaiWord: "แพง",
      },
      {
        thai: "มีเงินทอนไหม",
        german: "Haben Sie Wechselgeld?",
        sourceThaiWord: "เงิน",
      },
      {
        thai: "ช่วยพูดอีกครั้งได้ไหม",
        german: "Können Sie das bitte wiederholen?",
        sourceThaiWord: "อีกครั้ง",
      },
      {
        thai: "ขอบคุณมากสำหรับความช่วยเหลือ",
        german: "Vielen Dank für Ihre Hilfe.",
        sourceThaiWord: "ขอบคุณมาก",
      },
    ],
  },
];

