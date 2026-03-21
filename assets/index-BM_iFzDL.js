const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Home-DncuDPTr.js","assets/ui-vendor-BahQtKPg.js","assets/react-vendor-BXhlGoOM.js","assets/icons-vendor-D7usVfZy.js","assets/rolldown-runtime-y2wrX6ue.js","assets/db-vendor-CHTJOe2d.js","assets/card-DsURvtGS.js","assets/defaults-DMuUkw78.js","assets/lessonProgress-Ci-N-SOS.js","assets/VocabList-Cg2Wg1hY.js","assets/Learn-BXqOWVZ1.js","assets/tts-rxGj32ET.js","assets/transliteration-BQDfem29.js","assets/cefrFirst-B__9tvy6.js","assets/usePersistedSession-B2wcv9da.js","assets/Test-BuXT0v7G.js","assets/shuffle-B5YwDmdQ.js","assets/Exam-bmBRfIlw.js","assets/Games-BiRm5e29.js","assets/Settings-BGLTOWhf.js","assets/csv-vendor-Bhq18DUu.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-y2wrX6ue.js";import{a as t,c as n,i as r,n as i,o as a,r as o,s,t as c}from"./icons-vendor-D7usVfZy.js";import{n as l,r as u}from"./react-vendor-BXhlGoOM.js";import{t as d}from"./db-vendor-CHTJOe2d.js";import{t as f}from"./csv-vendor-Bhq18DUu.js";import{a as p,c as m,d as h,f as g,i as _,l as v,n as y,o as b,p as x,r as ee,s as te,t as S,u as C}from"./ui-vendor-BahQtKPg.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ne=u(),w=e(n()),T=l();const E=new class extends d{constructor(){super(`thaiVocabTrainer_v4`),this.version(3).stores({vocab:`++id, thai, german, lesson, createdAt, updatedAt`,progress:`entryId, dueAt, updatedAt`}),this.version(4).stores({vocab:`++id, thai, german, lesson, createdAt, updatedAt`,progress:`entryId, dueAt, lastReviewed, updatedAt`}),this.version(5).stores({vocab:`++id, thai, german, lesson, viewed, createdAt, updatedAt`,progress:`entryId, dueAt, lastReviewed, updatedAt`}),this.version(6).stores({vocab:`++id, thai, german, lesson, viewed, createdAt, updatedAt`,progress:`entryId, dueAt, lastReviewed, updatedAt`}),this.version(7).stores({vocab:`++id, thai, german, lesson, viewed, createdAt, updatedAt`,progress:`entryId, dueAt, lastReviewed, updatedAt`,numbersVocab:`++id, arabic, thaiWord, thaiDigit, lesson, viewed, createdAt, updatedAt`,numbersProgress:`entryId, dueAt, lastReviewed, updatedAt`}),this.version(8).stores({vocab:`++id, thai, german, lesson, viewed, createdAt, updatedAt`,progress:`entryId, dueAt, lastReviewed, updatedAt`,numbersVocab:`++id, arabic, thaiWord, thaiDigit, lesson, viewed, createdAt, updatedAt`,numbersProgress:`entryId, dueAt, lastReviewed, updatedAt`,sentencesVocab:`++id, thai, german, lesson, rangeStart, rangeEnd, viewed, createdAt, updatedAt`,sentencesProgress:`entryId, dueAt, lastReviewed, updatedAt`}),this.vocab=this.table(`vocab`),this.progress=this.table(`progress`),this.numbersVocab=this.table(`numbersVocab`),this.numbersProgress=this.table(`numbersProgress`),this.sentencesVocab=this.table(`sentencesVocab`),this.sentencesProgress=this.table(`sentencesProgress`)}};var re=1440*60*1e3;function D(e,t,n){return Math.max(t,Math.min(n,e))}function O(e,t){let n=Date.now(),r=e??{entryId:-1,ease:2.5,intervalDays:0,repetitions:0,dueAt:n,updatedAt:n},i=r.ease,a=r.repetitions,o=r.intervalDays;if(t===0)return a=0,o=0,i=D(i-.2,1.3,3),{...r,ease:i,repetitions:a,intervalDays:o,dueAt:n+600*1e3,lastGrade:t,updatedAt:n};if(a+=1,t===1&&(i=D(i-.05,1.3,3)),t===3&&(i=D(i+.05,1.3,3)),a===1)o=1;else if(a===2)o=t===3?4:3;else{let e=t===1?1.2:t===2?i:i*1.3;o=Math.max(1,Math.round(o*e))}return{...r,ease:i,repetitions:a,intervalDays:o,dueAt:n+o*re,lastGrade:t,updatedAt:n}}async function k(e){if(await E.table(`progress`).get(e))return;let t=Date.now();await E.table(`progress`).put({entryId:e,ease:2.5,intervalDays:0,repetitions:0,dueAt:t,updatedAt:t})}async function A(e){let t=Array.from(new Set(e.filter(e=>Number.isFinite(e)&&e>0)));if(t.length===0)return;let n=E.table(`progress`),r=await n.bulkGet(t),i=Date.now(),a=t.filter((e,t)=>!r[t]).map(e=>({entryId:e,ease:2.5,intervalDays:0,repetitions:0,dueAt:i,updatedAt:i}));a.length>0&&await n.bulkPut(a)}async function j(e){let t=Array.from(new Set(e.filter(e=>Number.isFinite(e)&&e>0)));if(t.length===0)return;let n=E.table(`numbersProgress`),r=await n.bulkGet(t),i=Date.now(),a=t.filter((e,t)=>!r[t]).map(e=>({entryId:e,ease:2.5,intervalDays:0,repetitions:0,dueAt:i,updatedAt:i}));a.length>0&&await n.bulkPut(a)}async function M(e){let t=Array.from(new Set(e.filter(e=>Number.isFinite(e)&&e>0)));if(t.length===0)return;let n=E.table(`sentencesProgress`),r=await n.bulkGet(t),i=Date.now(),a=t.filter((e,t)=>!r[t]).map(e=>({entryId:e,ease:2.5,intervalDays:0,repetitions:0,dueAt:i,updatedAt:i}));a.length>0&&await n.bulkPut(a)}async function ie(e,t){let n=E.table(`progress`),r=O(await n.get(e),t);r.entryId=e,r.lastReviewed=Date.now(),await n.put(r)}async function ae(e,t){let n=E.table(`numbersProgress`),r=O(await n.get(e),t);r.entryId=e,r.lastReviewed=Date.now(),await n.put(r)}var N=e(f(),1),P=`thai,german,transliteration,pos,tags,lesson,exampleThai,exampleGerman\r
กิน,essen,gin,Verb,"Essen,A1",1,ฉันกินข้าว,Ich esse Reis.\r
ดื่ม,trinken,duem,Verb,"Essen,A1",1,ฉันดื่มน้ำ,Ich trinke Wasser.\r
น้ำ,Wasser,nam,Nomen,"Essen,A1",1,น้ำเย็น,Kaltes Wasser.\r
ข้าว,Reis,khao,Nomen,"Essen,A1",1,ข้าวอร่อย,Der Reis ist lecker.\r
ไป,gehen/fahren (sich begeben),paai,Verb,"Grundlagen,A1",1,ฉันไปโรงเรียน,Ich gehe zur Schule.\r
มา,kommen,maa,Verb,"Grundlagen,A1",1,เขามาที่บ้าน,Er kommt nach Hause.\r
อยู่,sein/wohnen,yuu,Verb,"Grundlagen,A1",1,ฉันอยู่ที่นี่,Ich bin hier.\r
มี,haben,mii,Verb,"Grundlagen,A1",1,ฉันมีเวลา,Ich habe Zeit.\r
ได้,können / bekommen,dai,Verb,"Grundwortschatz,A1",1,ฉันทำได้,Ich kann es machen.\r
ไม่ได้,nicht können / nicht haben,mai dai,Verb,"Grundwortschatz,A1",1,ฉันไปไม่ได้,Ich kann nicht gehen.\r
ไม่,nein/nicht,mai,Partikel,"Grundlagen,A1",1,ไม่เป็นไร,Kein Problem.\r
ใช่,ja,chai,Partikel,"Grundlagen,A1",1,ใช่ครับ,Ja.\r
บ้าน,Haus,baan,Nomen,"Grundlagen,A1",1,บ้านใหญ่,Das Haus ist groß.\r
รถ,Fahrzeug/Auto,rot,Nomen,"Transport,A1",1,รถใหม่,Ein neues Auto.\r
คน,Mensch,khon,Nomen,"Grundlagen,A1",1,คนเยอะ,Viele Menschen.\r
วันนี้,heute,wanii,Adverb,"Zeit,A1",1,วันนี้ร้อน,Heute ist es heiß.\r
พรุ่งนี้,morgen,phrung-nii,Adverb,"Zeit,A1",1,พรุ่งนี้ทำงาน,Morgen arbeite ich.\r
มะรืนนี้,übermorgen,ma ruen ni,Nomen,"Zeit,A1",1,มะรืนนี้ฉันทำงาน,Übermorgen arbeite ich.\r
ทำ,machen,tam,Verb,"Grundlagen,A1",1,ฉันทำงาน,Ich arbeite.\r
งาน,Arbeit,ngaan,Nomen,"Grundlagen,A1",1,งานเยอะ,Viel Arbeit.\r
เรียน,lernen,rian,Verb,"Schule,A1",1,ฉันเรียนภาษาไทย,Ich lerne Thai.\r
ภาษา,Sprache,phaa-saa,Nomen,"Schule,A1",1,ภาษาไทย,Die thailändische Sprache.\r
ดี,gut,dii,Adjektiv,"Grundlagen,A1",1,ดีมาก,Sehr gut.\r
ใหญ่,groß,yai,Adjektiv,"Grundlagen,A1",1,บ้านใหญ่,Ein großes Haus.\r
เล็ก,klein,lek,Adjektiv,"Grundlagen,A1",1,ห้องเล็ก,Ein kleines Zimmer.\r
ยาว,lang,yao,Adjektiv,"Adjektive,A1",1,ถนนนี้ยาว,Die Straße ist lang.\r
สั้น,kurz,san,Adjektiv,"Adjektive,A1",1,ประโยคนี้สั้น,Das ist kurz.\r
ดู,sehen,duu,Verb,"Grundlagen,A1",1,ฉันดูทีวี,Ich sehe fern.\r
ฟัง,hören,fang,Verb,"Grundlagen,A1",1,ฉันฟังเพลง,Ich höre Musik.\r
ซื้อ,kaufen,sue,Verb,"Einkaufen,A1",1,ฉันซื้อของ,Ich kaufe Reis.\r
ทำงาน,arbeiten,tham-ngaan,Verb,"Arbeit,A1",1,ฉันทำงานที่นี่,Ich arbeite hier.\r
พัก,ausruhen,phak,Verb,"Grundlagen,A1",1,ฉันพักผ่อน,Ich ruhe mich aus.\r
เดิน,zu Fuß gehen,dern,Verb,"Grundlagen,A1",1,ฉันเดินเร็ว,Ich gehe schnell.\r
เงิน,Geld,ngoen,Nomen,"Grundlagen,A1",1,มีเงิน,Geld haben.\r
เวลา,Zeit,welaa,Nomen,"Grundlagen,A1",1,ไม่มีเวลา,Keine Zeit.\r
วัน,Tag,wan,Nomen,"Grundlagen,A1",1,วันนี้เป็นวันที่ดี,Heute ist ein schöner Tag.\r
อาหาร,Essen,aahaan,Nomen,"Essen,A1",1,อาหารไทย,Thailändisches Essen.\r
โรงเรียน,Schule,rong-rian,Nomen,"Bildung,A1",1,ไปโรงเรียน,Zur Schule gehen.\r
เร็ว,schnell,reo,Adjektiv,"Grundlagen,A1",1,รถเร็ว,Das Auto ist schnell.\r
ช้า,langsam,chaa,Adjektiv,"Grundlagen,A1",1,เดินช้า,Langsam gehen.\r
ขาย,verkaufen,khaai,Verb,"Einkaufen,A1",1,เขาขายอาหาร,Er verkauft Essen.\r
ราคา,Preis,raa-khaa,Nomen,"Einkaufen,A1",1,ราคาถูก,Der Preis ist günstig.\r
แพง,teuer,paeng,Adjektiv,"Einkaufen,A1",1,ของแพง,Das ist teuer.\r
ฉัน,ich,chan,Pronomen,"Grundlagen,A1",1,ฉันชื่อมาเรีย,Ich heiße Maria.\r
ผม,ich (maennlich),pom,Pronomen,"Grundlagen,A1",1,ผมชื่อไมเคิล,Ich heiße Michael.\r
คุณ,du/Sie,khun,Pronomen,"Grundlagen,A1",1,คุณชื่ออะไร,Wie heißt du?\r
เขา,er/sie (3.P),khao,Pronomen,"Grundlagen,A1",1,เขาไปโรงเรียน,Er/Sie geht zur Schule.\r
เรา,wir / ich (umgangssp.),rao,Pronomen,"Grundlagen,A1",1,เราจะไปเที่ยวด้วยกัน,Wir fahren zusammen in den Urlaub.\r
พวกเขา,sie (Plural),phuak khao,Pronomen,"Personen,A1",1,พวกเขาอยู่ที่นี่,Sie sind hier.\r
ผู้ชาย,Mann,phu chai,Nomen,"Personen,A1",1,ผู้ชายตัวใหญ่,Der Mann ist groß.\r
ผู้หญิง,Frau,phu ying,Nomen,"Personen,A1",1,ผู้หญิงสวย,Die Frau ist schön.\r
เด็ก,Kind,dek,Nomen,"Personen,A1",1,เด็กกินข้าว,Das Kind isst Reis.\r
ครู,Lehrer/Lehrerin,khru,Nomen,"Personen,Schule,A1",1,ครูพูดภาษาไทย,Der Lehrer spricht Thai.\r
นักเรียน,Schüler/Schülerin,nak rian,Nomen,"Personen,Schule,A1",1,นักเรียนเรียนภาษาไทย,Der Schüler/Die Schülerin lernt Thai.\r
พยาบาล,Krankenpfleger/in,phayaban,Nomen,"Personen,Gesundheit,A1",4,พยาบาลช่วยคน,Der Krankenpfleger/Die Krankenpflegerin hilft Menschen.\r
พนักงาน,Angestellte/r,phanakngan,Nomen,"Personen,Berufe,A1",4,พนักงานทำงาน,Der Angestellte/Die Angestellte arbeitet.\r
เจ้านาย,Chef/in,jao nai,Nomen,"Personen,Berufe,A1",4,เจ้านายพูดช้า,Der Chef/Die Chefin spricht langsam.\r
ลูกค้า,Kunde/Kundin,luk kha,Nomen,"Personen,Alltag,A1",4,ลูกค้าซื้อข้าว,Die Kundin kauft Reis.\r
นักท่องเที่ยว,Tourist/in,nak thong thiao,Nomen,"Reisen,Personen,A1",4,นักท่องเที่ยวไปเที่ยว,Der Tourist macht Urlaub.\r
คนไทย,Thailänder/in,khon thai,Nomen,"Personen,Nationalitäten,A1",1,เขาเป็นคนไทย,Er/Sie ist Thailänder/in.\r
นามสกุล,Nachname,nam sakun,Nomen,"Personen,A1",1,นามสกุลของคุณคืออะไร,Wie ist dein Nachname?\r
ชื่อแรก,Vorname,chue raek,Nomen,"Personen,A1",1,ชื่อแรกของฉันคืออันนา,Mein Vorname ist Anna.\r
อาชีพ,Beruf,achip,Nomen,"Personen,Berufe,A1",1,อาชีพของคุณคืออะไร,Was ist dein Beruf?\r
พวกเรา,wir,phuak-rao,Pronomen,"Grundlagen,A1",1,พวกเราอยู่ที่นี่,Wir sind hier.\r
ทุกคน,alle,thuk-khon,Pronomen,"Grundlagen,A1",1,ทุกคนมาถึงแล้ว,Alle sind angekommen.\r
ใคร,wer,khrai,Fragewort,"Grundlagen,A1",1,ใครมาอยู่ที่นี่,Wer ist hierher gekommen?\r
อะไร,was,a-rai,Fragewort,"Grundlagen,A1",1,นี่คืออะไร,Was ist das?\r
ที่ไหน,wo,thii-nai,Fragewort,"Grundlagen,A1",1,คุณอยู่ที่ไหน,Wo bist du?\r
เมื่อไหร่,wann,muea-rai,Fragewort,"Grundlagen,A1",1,คุณจะมาเมื่อไหร่,Wann kommst du?\r
ทำไม,warum,tham-mai,Fragewort,"Grundlagen,A1",1,ทำไมคุณมาสาย,Warum bist du spät?\r
ยังไง,wie (auf welche Weise),yang-ngai,Fragewort,"Grundlagen,A1",1,จะไปยังไง,Wie soll ich hingehen?\r
เท่าไหร่,wie viel / wie teuer,thao-rai,Fragewort,"Grundlagen,A1",1,ของนี้เท่าไหร่,Wie viel kostet das?\r
ครับ,"(höflich, männlich)",khrap,Partikel,"Grundlagen,A1",1,ครับ,"(höflich, männlich)"\r
ค่ะ,"(höflich, weiblich)",kha,Partikel,"Grundlagen,A1",1,ค่ะ,"(höflich, weiblich)"\r
นะ,bitte/okay? (weich),na,Partikel,"Grundlagen,A1",1,นะ,bitte/okay? (weich)\r
ไหม,Fragepartikel,mai,Partikel,"Grundlagen,A1",1,ไหม,Fragepartikel\r
แล้ว,schon/bereits,laeo,Partikel,"Grundlagen,A1",1,ฉันทำเสร็จแล้ว,Ich bin schon fertig.\r
ยัง,noch,yang,Partikel,"Grundlagen,A1",1,เขายังไม่มาถึง,Er ist immer noch nicht da.\r
กำลัง,gerade (Progressiv),kamlang,Partikel,"Grundlagen,A1",1,ฉันกำลังเรียนภาษาไทย,Ich lerne gerade Thailändisch.\r
เลย,überhaupt / sofort,loei,Partikel,"Grundlagen,A1",1,ทำเลย,Mach es sofort!\r
สิ,doch / mach mal,si,Partikel,"Grundwortschatz,A1",1,ลองอีกทีสิ,Versuch es doch noch mal.\r
และ,und,lae,Konjunktion,"Grundlagen,A1",1,ฉันชอบกาแฟและชา,Ich mag Kaffee und Tee.\r
หรือ,oder,rue,Konjunktion,"Grundlagen,A1",1,คุณต้องการกาแฟหรือน้ำชา,Möchtest du Kaffee oder Wasser?\r
แต่,aber,tae,Konjunktion,"Grundlagen,A1",1,เขาอยากไปแต่เขาไม่มีเวลา,"Er möchte gehen, aber er hat keine Zeit."\r
เพราะ,weil,phro,Konjunktion,"Grundlagen,A1",1,เธอยิ้มเพราะมีความสุข,"Sie lächelt, weil sie glücklich ist."\r
ถ้า,wenn/falls,thaa,Konjunktion,"Grundlagen,A1",1,ถ้าฝนตกเราจะอยู่บ้าน,"Wenn es regnet, bleiben wir zu Hause."\r
กับ,mit,kap,Präposition,"Grundlagen,A1",1,ฉันไปตลาดกับเพื่อน,Ich gehe mit einem Freund auf den Markt.\r
ใน,in,nai,Präposition,"Grundwortschatz,A1",1,ฉันอยู่ในบ้าน,Ich bin im Haus.\r
นอก,außerhalb,nok,Präposition,"Orte,Richtung,A1",1,เขารออยู่นอกบ้าน,Er wartet außerhalb des Hauses.\r
บน,auf,bon,Präposition,"Orte,Richtung,A1",1,หนังสืออยู่บนโต๊ะ,Das Buch liegt auf dem Tisch.\r
หน้า,vor / Vorderseite,na,Präposition,"Orte,Richtung,A1",1,ฉันยืนหน้าบ้าน,Ich stehe vor dem Haus.\r
ข้าง,Seite / neben,khang,Präposition,"Orte,Richtung,A1",1,ร้านอยู่ข้างโรงเรียน,Der Laden ist neben der Schule.\r
ซ้าย,links,sai,Adverb,"Orte,Richtung,A1",1,ไปทางซ้าย,Geh nach links.\r
ขวา,rechts,khwa,Adverb,"Orte,Richtung,A1",1,เลี้ยวขวา,Biege rechts ab.\r
ที่,Ort / Relativmarker,thi,Präposition,"Grundwortschatz,A1",1,เขาอยู่ที่โรงเรียน,Er ist in der Schule.\r
โดย,durch/mit (Mittel),doi,Präposition,"Grundlagen,A1",1,เราเดินทางโดยรถไฟ,Wir reisen mit dem Zug.\r
ก่อน,vorher,gon,Adverb,"Grundlagen,A1",1,โปรดเช็คเอกสารก่อนส่ง,"Bitte prüfe die Unterlagen, bevor du sie abschickst."\r
หลัง,nachher,lang,Adverb,"Grundlagen,A1",1,หลังประชุมเราจะไปซื้อของ,Nachher gehen wir einkaufen.\r
เป็น,sein,pen,Verb,"Grundlagen,A1",1,ฉันเป็นครู,Ich bin Lehrerin/Lehrer.\r
พูด,sprechen,phuut,Verb,"Grundlagen,A1",1,เขาพูดภาษาไทยและเยอรมัน,Er spricht Thai und Deutsch.\r
สอน,unterrichten,son,Verb,"Verben,Schule,A1",1,ครูสอนภาษาไทย,Der Lehrer unterrichtet Thai.\r
บอก,sagen,bok,Verb,"Grundlagen,A1",1,แม่บอกให้ฉันกลับบ้านเร็ว,"Mama sagt mir, ich soll früh nach Hause kommen."\r
ถาม,fragen,thaam,Verb,"Grundlagen,A1",1,ฉันจะถามคุณพรุ่งนี้,Ich frage dich morgen.\r
ตอบ,antworten,top,Verb,"Grundlagen,A1",1,เขาตอบอีเมลทันที,Er antwortet sofort auf die E-Mail.\r
อ่าน,lesen,aan,Verb,"Bildung,A1",1,ฉันอ่านหนังสือ,Ich lese ein Buch.\r
เขียน,schreiben,khian,Verb,"Bildung,A1",1,ฉันเขียนอีเมล,Ich schreibe eine E-Mail.\r
รู้,wissen/kennen,ruu,Verb,"Grundlagen,A1",1,ฉันรู้อยู่แล้ว,Ich weiß es schon.\r
เข้าใจ,verstehen,khao-jai,Verb,"Grundlagen,A1",1,ฉันเข้าใจมัน,Ich verstehe es.\r
ชอบ,mögen,chop,Verb,"Verben,Gefühle,A1",1,ฉันชอบกาแฟ,Ich mag Kaffee.\r
รัก,lieben,rak,Verb,"Verben,Gefühle,A1",1,ฉันรักครอบครัว,Ich liebe meine Familie.\r
รู้จัก,kennen,ru jak,Verb,"Verben,Denken,A1",1,ฉันรู้จักคุณ,Ich kenne dich.\r
คิด,denken,khit,Verb,"Grundlagen,A1",1,ฉันคิดถึงบ้าน,Ich denke an Zuhause.\r
ช่วย,helfen,chuay,Verb,"Grundlagen,A1",1,ช่วยฉันหน่อยได้ไหม,Kannst du mir bitte helfen?\r
รอ,warten,raw,Verb,"Grundlagen,A1",1,ฉันรอคุณอยู่ที่หน้าประตู,Ich warte auf dich vor der Tür.\r
เริ่ม,beginnen,roem,Verb,"Grundlagen,A1",1,ฉันเริ่มงานใหม่วันนี้,Ich habe heute mit dem neuen Job angefangen.\r
จบ,enden,chop,Verb,"Grundlagen,A1",1,ฉันจบงานแล้ว,Ich bin mit der Arbeit fertig.\r
เปิด,öffnen/anmachen,poet,Verb,"Grundlagen,A1",1,กรุณาเปิดไฟ,Bitte mach das Licht an.\r
ปิด,schließen/ausmachen,pit,Verb,"Grundlagen,A1",1,กรุณาปิดหน้าต่าง,Bitte mach das Fenster zu.\r
เข้า,hineingehen,khao,Verb,"Grundlagen,A1",1,ฉันเข้าไปในบ้าน,Ich gehe ins Haus.\r
ออก,hinausgehen,ok,Verb,"Grundlagen,A1",1,ฉันออกไปข้างนอก,Ich gehe raus.\r
กลับ,zurückkehren,klap,Verb,"Grundlagen,A1",1,ฉันกลับบ้านตอนเย็น,Ich komme abends nach Hause.\r
ถึง,ankommen,thueng,Verb,"Verben,Alltag,Reisen,A1",1,ฉันถึงบ้านแล้ว,Ich bin schon zu Hause angekommen.\r
นอน,schlafen,non,Verb,"Grundlagen,A1",1,ฉันไปนอนแล้ว,Ich gehe jetzt schlafen.\r
ตื่น,aufwachen,tuen,Verb,"Grundlagen,A1",1,ฉันตื่นเช้า,Ich wache früh auf.\r
นั่ง,sitzen,nang,Verb,"Grundlagen,A1",1,โปรดนั่งตรงนี้,Bitte setz dich hier.\r
ยืน,stehen,yuen,Verb,"Grundlagen,A1",1,เขายืนหน้าประตู,Er steht vor der Tür.\r
วิ่ง,laufen,wing,Verb,"Grundlagen,A1",1,ฉันวิ่งทุกเช้า,Ich laufe jeden Morgen.\r
จ่าย,bezahlen (allgemein),jaai,Verb,"Einkaufen,A1",1,ฉันจ่ายเงินที่แคชเชียร์,Ich bezahle an der Kasse.\r
ใช้,benutzen,chai,Verb,"Grundlagen,A1",1,ฉันใช้โทรศัพท์ทุกวัน,Ich benutze mein Handy jeden Tag.\r
ให้,geben,hai,Verb,"Grundlagen,A1",1,ฉันให้คุณของขวัญ,Ich gebe dir ein Geschenk.\r
เอา,nehmen,ao,Verb,"Grundlagen,A1",1,ฉันเอาน้ำหนึ่งแก้ว,Ich nehme ein Glas Wasser.\r
รับ,empfangen/annehmen,rap,Verb,"Grundlagen,A1",1,ฉันรับพัสดุ,Ich nehme das Paket an.\r
ส่ง,senden/bringen,song,Verb,"Grundlagen,A1",1,ฉันส่งอีเมล,Ich schicke eine E-Mail.\r
โทร,anrufen,tho,Verb,"Telefon,A1",1,ฉันโทรหาแม่,Ich rufe meine Mutter an.\r
ถ่ายรูป,fotografieren,thaai-ruup,Verb,"Freizeit,A1",1,ฉันถ่ายรูปที่สวน,Ich mache ein Foto im Park.\r
อาบน้ำ,duschen / baden,ap nam,Verb,"Körper,Alltag,A1",1,ฉันอาบน้ำตอนเช้า,Ich dusche morgens.\r
แต่งตัว,sich anziehen,taeng tua,Verb,"Kleidung,Alltag,A1",1,ฉันแต่งตัวไปทำงาน,Ich ziehe mich für die Arbeit an.\r
ไม่ดี,schlecht,mai di,Adjektiv,"Adjektive,A1",1,วันนี้อากาศไม่ดี,Heute ist das Wetter schlecht.\r
สวย,schön,suai,Adjektiv,"Adjektive,A1",1,ดอกไม้นี้สวย,Diese Blume ist schön.\r
หล่อ,hübsch (männlich),lo,Adjektiv,"Adjektive,A1",1,เขาหล่อ,Er ist hübsch.\r
น่ารัก,süß / lieb,na rak,Adjektiv,"Adjektive,A1",1,เด็กคนนี้น่ารัก,Dieses Kind ist süß.\r
ใหม่,neu,mai,Adjektiv,"Adjektive,A1",1,นี่คือรถใหม่,Ich habe heute ein neues Auto gesehen.\r
เก่า,alt,gao,Adjektiv,"Adjektive,A1",1,บ้านนี้เก่า,Dieses Haus ist alt.\r
ถูก,billig / richtig,thuk,Adjektiv,"Einkaufen,Adjektive,A1",1,เสื้อตัวนี้ถูก,Dieses T-Shirt ist billig.\r
ง่าย,einfach,ngai,Adjektiv,"Adjektive,A1",1,แบบฝึกนี้ง่าย,Diese Übung ist einfach.\r
ยาก,schwierig,yak,Adjektiv,"Adjektive,A1",1,ภาษาไทยยาก,Thai ist schwierig.\r
ว่าง,frei,wang,Adjektiv,"Zeit,Alltag,A1",1,วันนี้ฉันว่าง,Heute habe ich frei.\r
ยุ่ง,beschäftigt,yung,Adjektiv,"Zeit,Alltag,A1",1,ตอนนี้ฉันยุ่ง,Jetzt bin ich beschäftigt.\r
สะอาด,sauber,sa-at,Adjektiv,"Haus,Alltag,A1",1,ห้องนี้สะอาด,Dieses Zimmer ist sauber.\r
สกปรก,schmutzig,sokkaprok,Adjektiv,"Haus,Alltag,A1",1,รองเท้านี้สกปรก,Diese Schuhe sind schmutzig.\r
ร้อน,heiß,ron,Adjektiv,"Wetter,Adjektive,A1",1,วันนี้อากาศร้อน,Heute ist das Wetter heiß.\r
เย็น,kalt / kühl,yen,Adjektiv,"Wetter,Adjektive,A1",1,น้ำเย็นมาก,Das Wasser ist sehr kühl.\r
หิว,hungrig,hiu,Adjektiv,"Essen,Gefühle,A1",1,ฉันหิวแล้ว,Ich habe Hunger.\r
อิ่ม,satt,im,Adjektiv,"Essen,Gefühle,A1",1,ฉันอิ่มแล้ว,Ich bin satt.\r
แข็งแรง,gesund / stark,khaeng raeng,Adjektiv,"Gesundheit,A1",1,ฉันแข็งแรง,Ich bin gesund.\r
มีความสุข,glücklich,mi khwam suk,Adjektiv,"Gefühle,A1",1,ฉันมีความสุข,Ich bin glücklich.\r
สนุก,spaßig,sanuk,Adjektiv,"Freizeit,A1",1,เกมนี้สนุก,Dieses Spiel macht Spaß.\r
กระหาย,durstig,grahai,Adjektiv,"Essen,Gefühle,A1",1,ฉันกระหายน้ำ,Ich bin durstig.\r
เหนื่อย,müde,nueai,Adjektiv,"Gefühle,Gesundheit,A1",1,ฉันเหนื่อยมาก,Ich bin sehr müde.\r
ง่วง,schläfrig,nguang,Adjektiv,"Gefühle,Gesundheit,A1",1,ฉันง่วงแล้ว,Ich bin schläfrig.\r
ป่วย,krank,puai,Adjektiv,"Gesundheit,A1",1,ฉันป่วยวันนี้,Ich bin heute krank.\r
เผ็ด,scharf,phet,Adjektiv,"Essen,A1",1,แกงนี้เผ็ด,Dieses Curry ist scharf.\r
หวาน,süß,wan,Adjektiv,"Essen,A1",1,ชานี้หวาน,Dieser Tee ist süß.\r
เค็ม,salzig,khem,Adjektiv,"Essen,A1",1,ซุปนี้เค็ม,Diese Suppe ist salzig.\r
เปรี้ยว,sauer,priao,Adjektiv,"Essen,A1",1,มะนาวนี้เปรี้ยว,Diese Limette ist sauer.\r
ขม,bitter,khom,Adjektiv,"Essen,A1",1,กาแฟนี้ขม,Dieser Kaffee ist bitter.\r
อร่อย,lecker,aroi,Adjektiv,"Essen,A1",1,อาหารนี้อร่อย,Dieses Essen ist lecker.\r
หมอ,Arzt/Ärztin,mo,Nomen,"Personen,Gesundheit,A1",1,หมอช่วยคน,Der Arzt/Die Ärztin hilft Menschen.\r
ครอบครัว,Familie,khrop khrua,Nomen,"Familie,A1",1,ฉันมีครอบครัวใหญ่,Ich habe eine grosse Familie.\r
พ่อ,Vater,pho,Nomen,"Familie,A1",1,พ่อของฉันชื่อสมชาย,Mein Vater heißt Somchai.\r
แม่,Mutter,mae,Nomen,"Familie,A1",1,แม่ของฉันใจดี,Meine Mutter ist nett.\r
พ่อแม่,Eltern,pho mae,Nomen,"Familie,A1",1,พ่อแม่ของฉันอยู่ที่นี่,Meine Eltern sind hier.\r
พี่,ältere Bezugsperson / ältere*r (Anrede),phi,Anrede,"Familie,A1",1,พี่ครับ ร้านกาแฟอยู่ที่ไหน,"Entschuldigung, wo ist das Café?"\r
น้อง,jüngere Bezugsperson / jüngere*r (Anrede),nong,Anrede,"Familie,A1",1,น้องครับ ช่วยหน่อย,"Hey, kannst du bitte helfen?"\r
พี่ชาย,älterer Bruder,phi chai,Nomen,"Familie,A1",1,พี่ชายของฉันทำงาน,Mein älterer Bruder arbeitet.\r
พี่สาว,ältere Schwester,phi sao,Nomen,"Familie,A1",1,พี่สาวของฉันสวย,Meine ältere Schwester ist schön.\r
น้องชาย,jüngerer Bruder,nong chai,Nomen,"Familie,A1",1,น้องชายของฉันกินข้าว,Mein jüngerer Bruder isst Reis.\r
น้องสาว,jüngere Schwester,nong sao,Nomen,"Familie,A1",1,น้องสาวของฉันอยู่บ้าน,Meine jüngere Schwester ist zu Hause.\r
ลูก,Kind (eigenes),luk,Nomen,"Familie,A1",1,ลูกของฉันชื่อมีนา,Mein Kind heißt Mina.\r
ลูกชาย,Sohn,luk chai,Nomen,"Familie,A1",1,ลูกชายของฉันชื่อทอม,Mein Sohn heißt Tom.\r
ลูกสาว,Tochter,luk sao,Nomen,"Familie,A1",1,ลูกสาวของฉันชื่อมีนา,Meine Tochter heißt Mina.\r
สามี,Ehemann,sami,Nomen,"Familie,A1",1,สามีของฉันทำงาน,Mein Ehemann arbeitet.\r
ภรรยา,Ehefrau,phanraya,Nomen,"Familie,A1",1,ภรรยาของฉันสวย,Meine Ehefrau ist schön.\r
ยาย,Großmutter (mütterlich),yai,Nomen,"Familie,A1",1,ยายของฉันอยู่บ้าน,Meine Großmutter ist zu Hause.\r
ปู่,Großvater (väterlicherseits),puu,Nomen,"Familie,A1",1,ปู่ของฉันอยู่บ้าน,Mein Großvater ist zu Hause.\r
ญาติ,Verwandte,yat,Nomen,"Familie,A1",1,ญาติของฉันมาแล้ว,Meine Verwandten sind schon da.\r
ชื่อ,Name,chue,Nomen,"Personen,A1",1,ชื่อของฉันคือมาเรีย,Mein Name ist Maria.\r
อายุ,Alter,ayu,Nomen,"Personen,A1",1,ฉันอายุยี่สิบปี,Ich bin zwanzig Jahre alt.\r
เพื่อน,Freund/Freundin,phuean,Nomen,"Personen,A1",1,เพื่อนมาแล้ว,Der Freund/Die Freundin ist schon da.\r
ตำรวจ,Polizist/in,tamruat,Nomen,"Personen,Berufe,A1",1,ตำรวจมาเร็ว,Der Polizist/Die Polizistin kommt schnell.\r
สูง,hoch / groß,sung,Adjektiv,"Adjektive,A1",1,ตึกนี้สูง,Dieses Gebäude ist hoch.\r
ต่ำ,niedrig,tam,Adjektiv,"Adjektive,A1",1,โต๊ะนี้ต่ำ,Dieser Tisch ist niedrig.\r
หนัก,schwer,nak,Adjektiv,"Adjektive,A1",1,กระเป๋านี้หนัก,Diese Tasche ist schwer.\r
เบา,leicht,bao,Adjektiv,"Adjektive,A1",1,กล่องนี้เบา,Diese Box ist leicht.\r
ใกล้,nah,glai,Adjektiv,"Orte,Richtung,A1",1,บ้านฉันอยู่ใกล้,Mein Haus ist nah.\r
ไกล,weit,glai,Adjektiv,"Orte,Richtung,A1",1,โรงเรียนอยู่ไกล,Die Schule ist weit.\r
เต็ม,voll,tem,Adjektiv,"Alltag,A1",1,แก้วนี้เต็ม,Dieses Glas ist voll.\r
ว่างเปล่า,leer,wang plao,Adjektiv,"Alltag,A1",1,กล่องนี้ว่างเปล่า,Diese Box ist leer.\r
โกรธ,wütend,grot,Adjektiv,"Gefühle,A1",1,เขาโกรธ,Er ist wütend.\r
กลัว,ängstlich,klua,Adjektiv,"Gefühle,A1",1,ฉันกลัว,Ich habe Angst.\r
สวัสดี,Hallo,sawasdee,Interjektion,"Höflichkeit,A1",1,สวัสดีครับ,Hallo.\r
ขอบคุณ,Danke,khop khun,Interjektion,"Höflichkeit,A1",2,ขอบคุณครับ,Danke.\r
ขอบคุณมาก,vielen Dank,khop khun mak,Interjektion,"Höflichkeit,A1",2,ขอบคุณมากครับ,Vielen Dank.\r
ขอโทษ,Entschuldigung,kho thot,Interjektion,"Höflichkeit,A1",2,ขอโทษครับ,Entschuldigung.\r
ลาก่อน,Auf Wiedersehen,la gon,Interjektion,"Höflichkeit,A1",2,ลาก่อนครับ,Auf Wiedersehen.\r
กรุณา,bitte,karuna,Interjektion,"Höflichkeit,A1",2,กรุณารอสักครู่,Bitte warten Sie kurz.\r
มาก,sehr/viel,maak,Adverb,"Grundlagen,A1",2,ฉันชอบมาก,Ich mag es sehr.\r
น้อย,wenig,noi,Adverb,"Grundlagen,A1",2,มีคนน้อยมาก,Es gibt sehr wenige Leute.\r
ตอนนี้,jetzt,ton ni,Adverb,"Zeit,A1",2,ตอนนี้ฉันเรียนภาษาไทย,Jetzt lerne ich Thai.\r
เมื่อวาน,gestern,muea wan,Nomen,"Zeit,A1",2,เมื่อวานฉันอยู่บ้าน,Gestern war ich zu Hause.\r
เมื่อวานซืน,vorgestern,muea wan suen,Nomen,"Zeit,A1",2,เมื่อวานซืนฉันไปตลาด,Vorgestern bin ich zum Markt gegangen.\r
ศูนย์,Null,suun,Zahl,"Grundlagen,A1",2,ศูนย์,Null\r
หนึ่ง,eins,nueng,Zahl,"Grundlagen,A1",2,หนึ่ง,eins\r
สอง,zwei,song,Zahl,"Grundlagen,A1",2,สอง,zwei\r
สาม,drei,saam,Zahl,"Grundlagen,A1",2,สาม,drei\r
สี่,vier,sii,Zahl,"Grundlagen,A1",2,สี่,vier\r
ห้า,fünf,haa,Zahl,"Grundlagen,A1",2,ห้า,fünf\r
หก,sechs,hok,Zahl,"Grundlagen,A1",2,หก,sechs\r
เจ็ด,sieben,jet,Zahl,"Grundlagen,A1",2,เจ็ด,sieben\r
แปด,acht,paet,Zahl,"Grundlagen,A1",2,แปด,acht\r
เก้า,neun,gao,Zahl,"Grundlagen,A1",2,เก้า,neun\r
สิบ,zehn,sip,Zahl,"Grundlagen,A1",2,สิบ,zehn\r
ขนมปัง,Brot,khanom pang,Nomen,"Essen,A1",2,ฉันกินขนมปังตอนเช้า,Ich esse morgens Brot.\r
เดือน,Monat,duean,Nomen,"Zeit,A1",2,เดือนนี้ฝนตกมาก,Diesen Monat regnet es viel.\r
ปี,Jahr,pi,Nomen,"Zeit,A1",2,ปีนี้ฉันไปเยอรมนี,Dieses Jahr fahre ich nach Deutschland.\r
วันจันทร์,Montag,wan jan,Nomen,"Zeit,A1",2,วันจันทร์ฉันทำงาน,Am Montag arbeite ich.\r
วันอังคาร,Dienstag,wan angkhan,Nomen,"Zeit,A1",2,วันอังคารฉันเรียนภาษาไทย,Am Dienstag lerne ich Thai.\r
วันพุธ,Mittwoch,wan phut,Nomen,"Zeit,A1",2,วันพุธฉันไปตลาด,Am Mittwoch gehe ich zum Markt.\r
วันพฤหัสบดี,Donnerstag,wan pharuehatsabodi,Nomen,"Zeit,A1",2,วันพฤหัสบดีฉันว่าง,Am Donnerstag habe ich frei.\r
วันศุกร์,Freitag,wan suk,Nomen,"Zeit,A1",2,วันศุกร์ฉันเจอเพื่อน,Am Freitag treffe ich Freunde.\r
วันเสาร์,Samstag,wan sao,Nomen,"Zeit,A1",2,วันเสาร์ฉันพักผ่อน,Am Samstag ruhe ich mich aus.\r
วันอาทิตย์,Sonntag,wan athit,Nomen,"Zeit,A1",2,วันอาทิตย์ฉันอยู่บ้าน,Am Sonntag bin ich zu Hause.\r
เช้า,Morgen,chao,Nomen,"Zeit,A1",2,พรุ่งนี้เช้าฉันตื่นเร็ว,Morgen früh wache ich früh auf.\r
วันนี้ตอนเช้า,heute Morgen,wan ni ton chao,Nomen,"Zeit,A1",2,วันนี้ตอนเช้าฉันวิ่ง,Heute Morgen bin ich gelaufen.\r
สาย,später Vormittag,sai,Nomen,"Zeit,A1",2,ฉันไปโรงเรียนตอนสาย,Ich gehe am späten Vormittag zur Schule.\r
เที่ยง,Mittag,thiang,Nomen,"Zeit,A1",2,ตอนเที่ยงฉันกินข้าว,Mittags esse ich Reis.\r
บ่าย,Nachmittag,bai,Nomen,"Zeit,A1",2,ตอนบ่ายฉันทำงาน,Am Nachmittag arbeite ich.\r
กลางคืน,Nacht,klang khuen,Nomen,"Zeit,A1",2,กลางคืนฉันนอนหลับ,Nachts schlafe ich.\r
นาที,Minute,nathi,Nomen,"Zeit,A1",2,รอห้านาที,Warte fünf Minuten.\r
ชั่วโมง,Stunde,chua mong,Nomen,"Zeit,A1",2,ฉันเรียนหนึ่งชั่วโมง,Ich lerne eine Stunde.\r
โมง,Uhr,mong,Nomen,"Zeit,A1",2,ตอนนี้สามโมง,Jetzt ist es drei Uhr.\r
ห้อง,Zimmer,hong,Nomen,"Grundlagen,A1",2,ห้องนี้ใหญ่มาก,Dieses Zimmer ist sehr groß.\r
ห้องน้ำ,Toilette,hong-nam,Nomen,"Grundlagen,A1",2,ห้องน้ำอยู่ที่ไหน,Wo ist die Toilette?\r
ตลาด,Markt,ta-laat,Nomen,"Einkaufen,A1",2,ฉันไปตลาดทุกวัน,Ich gehe jeden Tag zum Markt.\r
กระเป๋าเดินทาง,Koffer,grapao dern thang,Nomen,"Transport,Reisen,A1",2,ฉันมีกระเป๋าเดินทาง,Ich habe einen Koffer.\r
เงินบาท,Baht,ngoen baht,Nomen,"Einkaufen,A1",2,ฉันจ่ายเงินบาทไทย,Ich bezahle in Baht.\r
ตะเกียบ,Essstäbchen,takiep,Nomen,"Essen,Trinken,A1",4,ฉันใช้ตะเกียบ,Ich benutze Essstäbchen.\r
ขวด,Flasche,khuat,Nomen,"Essen,Trinken,A1",1,นี่คือขวดน้ำ,Stell die Flasche bitte auf den Tisch.\r
แก้ว,Glas / Becher,kaeo,Nomen,"Essen,Trinken,A1",1,ฉันขอแก้วน้ำ,Ich möchte ein Glas Wasser.\r
ถุง,Tüte / Beutel,thung,Nomen,"Einkaufen,A1",2,ขอถุงหนึ่งใบ,Bitte eine Tüte.\r
เมือง,Stadt,mueang,Nomen,"Orte,A1",2,เมืองนี้ใหญ่,Diese Stadt ist groß.\r
สะพาน,Brücke,saphan,Nomen,"Orte,A1",2,สะพานนี้ยาว,Diese Brücke ist lang.\r
ร้าน,Laden/Shop,raan,Nomen,"Einkaufen,A1",2,ร้านนี้เปิดเมื่อไหร่,Wann öffnet dieser Laden?\r
ร้านอาหาร,Restaurant,raan-aahaan,Nomen,"Essen,A1",2,เราไปร้านอาหารกันไหม,Gehen wir zusammen ins Restaurant?\r
เมนู,Speisekarte,menu,Nomen,"Essen,Orte,A1",2,ขอเมนูหน่อย,Bitte die Speisekarte.\r
เช็คบิล,bezahlen / Rechnung bitte,chek bin,Verb,"Essen,Verben,A1",2,ขอเช็คบิลครับ,Die Rechnung bitte.\r
อิ่มแล้ว,ich bin schon satt,im laeo,Satz,"Essen,A1",2,ขอบคุณครับ อิ่มแล้ว,"Danke, ich bin schon satt."\r
ไม่เผ็ด,nicht scharf,mai phet,Adjektiv,"Essen,A1",2,ขออาหารไม่เผ็ด,Bitte nicht scharf.\r
โรงแรม,Hotel,rong-raem,Nomen,"Reisen,A1",2,ฉันพักที่โรงแรม,Ich übernachte im Hotel.\r
ถนน,Straße,tha-non,Nomen,"Reisen,A1",2,ถนนนี้ชื่ออะไร,Wie heißt diese Straße?\r
ทะเล,Meer,tha-lay,Nomen,"Reisen,A1",2,ฉันชอบทะเล,Ich mag das Meer.\r
แม่น้ำ,Fluss,mae nam,Nomen,"Natur,Orte,A1",2,แม่น้ำสายนี้ยาว,Dieser Fluss ist lang.\r
ประเทศ,Land,prathet,Nomen,"Reisen,Orte,A1",2,ฉันชอบประเทศนี้,Ich mag dieses Land.\r
กรุงเทพฯ,Bangkok,Krung Thep,Nomen,"Reisen,Orte,A1",2,ฉันอยู่กรุงเทพฯ,Ich bin in Bangkok.\r
ประเทศไทย,Thailand,Prathet Thai,Nomen,"Reisen,Orte,A1",2,ประเทศไทยสวยมาก,Thailand ist sehr schön.\r
ทางเข้า,Eingang,thang khao,Nomen,"Orte,Richtung,A1",2,ทางเข้าอยู่ข้างหน้า,Der Eingang ist vorne.\r
ทางออก,Ausgang,thang ok,Nomen,"Orte,Richtung,A1",2,ทางออกอยู่ข้างหลัง,Der Ausgang ist hinten.\r
ตรงข้าม,gegenüber,trong kham,Präposition,"Orte,Richtung,A1",2,ธนาคารอยู่ตรงข้ามโรงเรียน,Die Bank ist gegenüber der Schule.\r
ระหว่าง,zwischen,rawang,Präposition,"Orte,Richtung,A1",2,ร้านกาแฟอยู่ระหว่างธนาคารกับโรงพยาบาล,Das Café ist zwischen der Bank und dem Krankenhaus.\r
แถวนี้,hier in der Nähe,thaeo ni,Adverb,"Orte,Richtung,A1",2,มีตลาดแถวนี้ไหม,Gibt es hier in der Nähe einen Markt?\r
รถยนต์,Auto (PKW),rot yon,Nomen,"Transport,A1",2,เขามีรถยนต์,Er hat ein Auto.\r
รถไฟฟ้า,Skytrain / Bahn,rot fai fa,Nomen,"Transport,A1",2,ฉันไปด้วยรถไฟฟ้า,Ich fahre mit dem Skytrain.\r
รถใต้ดิน,U-Bahn,rot tai din,Nomen,"Transport,A1",2,รถใต้ดินเร็วมาก,Die U-Bahn ist sehr schnell.\r
รถไฟ,Zug,rot-fai,Nomen,"Reisen,A1",2,รถไฟสะดวกกว่ารถเมล์,Der Zug ist bequemer als der Bus.\r
ผลไม้,Obst,phon-la-mai,Nomen,"Essen,A1",2,ฉันชอบกินผลไม้,Ich esse gern Obst.\r
ผัก,Gemüse,phak,Nomen,"Essen,A1",2,ผักดีต่อสุขภาพ,Gemüse ist gesund.\r
ปลา,Fisch,plaa,Nomen,"Essen,A1",2,ปลาสดมาก,Der Fisch ist sehr frisch.\r
ไก่,Huhn,gai,Nomen,"Essen,A1",2,ฉันสั่งไก่ทอด,Ich bestelle gebratenes Hähnchen.\r
หมู,Schwein,muu,Nomen,"Essen,A1",2,ฉันไม่กินหมู,Ich esse kein Schweinefleisch.\r
กุ้ง,Garnele,kung,Nomen,"Essen,Trinken,A1",2,ฉันชอบกุ้ง,Ich mag Garnelen.\r
ไข่,Ei,khai,Nomen,"Essen,Trinken,A1",2,ฉันกินไข่ตอนเช้า,Ich esse morgens ein Ei.\r
กาแฟ,Kaffee,gafae,Nomen,"Essen,Trinken,A1",2,ตอนเช้าฉันดื่มกาแฟ,Morgens trinke ich Kaffee.\r
ชา,Tee,cha,Nomen,"Essen,Trinken,A1",2,ฉันชอบชาร้อน,Ich mag heißen Tee.\r
น้ำผลไม้,Saft,nam phonlamai,Nomen,"Essen,Trinken,A1",2,ฉันดื่มน้ำผลไม้,Ich trinke Saft.\r
กับข้าว,Beilage zum Reis,kap khao,Nomen,"Essen,Trinken,A1",2,วันนี้มีกับข้าวอร่อย,Heute gibt es leckere Beilagen zum Reis.\r
ซุป,Suppe,sup,Nomen,"Essen,Trinken,A1",2,ซุปร้อนมาก,Die Suppe ist sehr heiß.\r
หัว,Kopf,hua,Nomen,"Körper,A1",2,หัวของฉันปวด,Mein Kopf tut weh.\r
ตา,Auge,ta,Nomen,"Körper,A1",2,ตาของฉันเจ็บ,Mein Auge tut weh.\r
หู,Ohr,hu,Nomen,"Körper,A1",2,หูของฉันเจ็บ,Mein Ohr tut weh.\r
จมูก,Nase,jamuk,Nomen,"Körper,A1",2,จมูกของฉันเจ็บ,Meine Nase tut weh.\r
ปาก,Mund,pak,Nomen,"Körper,A1",2,ปากของฉันแห้ง,Mein Mund ist trocken.\r
ฟัน,Zahn,fan,Nomen,"Körper,A1",2,ฟันของฉันเจ็บ,Mein Zahn tut weh.\r
มือ,Hand,mue,Nomen,"Körper,A1",2,มือของฉันเปียก,Meine Hand ist nass.\r
เท้า,Fuß,thao,Nomen,"Körper,A1",2,เท้าของฉันเจ็บ,Mein Fuß tut weh.\r
ปวด,Schmerzen haben (dumpf/innerlich),puat,Verb,"Gesundheit,A1",2,ฉันปวดหัว,Ich habe Kopfschmerzen.\r
ประตู,Tür,pra-tuu,Nomen,"Zuhause,A1",2,ประตูเปิด,Die Tür ist offen.\r
เตียง,Bett,tiang,Nomen,"Zuhause,A1",2,ฉันนอนในเตียง,Ich bin im Bett.\r
ไฟ,Licht,fai,Nomen,"Zuhause,A1",2,โปรดเปิดไฟเหนือ,Bitte mach das Licht an.\r
โทรศัพท์,Telefon,tho-ra-sap,Nomen,"Telefon,A1",2,โทรศัพท์ของฉันหาย,Mein Telefon ist verloren.\r
ซูเปอร์มาร์เก็ต,Supermarkt,supermarket,Nomen,"Einkaufen,Orte,A1",2,ซูเปอร์มาร์เก็ตอยู่ใกล้บ้าน,Der Supermarkt ist in der Nähe des Hauses.\r
ไปรษณีย์,Post,praisani,Nomen,"Alltag,Orte,A1",2,ฉันไปไปรษณีย์,Ich gehe zur Post.\r
ห้องนอน,Schlafzimmer,hong-non,Nomen,"Zuhause,A1",2,ฉันนอนเกือหี้องโเชุ,Ich schlafe im Schlafzimmer.\r
สถานีรถไฟ,Bahnhof,sathani rot fai,Nomen,"Reisen,Orte,A1",2,สถานีรถไฟอยู่ในเมือง,Der Bahnhof ist in der Stadt.\r
ป้ายรถเมล์,Bushaltestelle,pai rot me,Nomen,"Reisen,Orte,A1",2,ฉันรอที่ป้ายรถเมล์,Ich warte an der Bushaltestelle.\r
รูป,Foto/Bild,ruup,Nomen,"Grundlagen,A1",2,ขอบจ่อต่องถีหรืองไหม,Kann ich ein Foto machen?\r
เกลือ,Salz,kluea,Nomen,"Essen,Trinken,A1",4,ใส่เกลือนิดหน่อย,Gib ein bisschen Salz dazu.\r
ฝน,Regen,fon,Nomen,"Wetter,A1",2,มีหรืดจตนวันเคา,Es regnet heute.\r
ลม,Wind,lom,Nomen,"Wetter,A1",2,มีลมผุ่งมูลวันนี้,Es ist windig heute.\r
ภาษาไทย,Thailändisch (Sprache),phaa-saa-thai,Nomen,"Bildung,A1",2,ฉันเรียนภาษาไทย,Ich lerne Thai.\r
ภาษาอังกฤษ,Englisch (Sprache),phaa-saa-ang-grit,Nomen,"Bildung,A1",2,เขาพูดภาษาอังกฤษ,Er spricht Englisch.\r
เสื้อ,Shirt / Oberteil,suea,Nomen,"Kleidung,A1",2,ฉันใส่เสื้อสีแดง,Ich trage ein rotes Shirt.\r
กางเกง,Hose,kangkeng,Nomen,"Kleidung,A1",2,กางเกงนี้ใหม่,Diese Hose ist neu.\r
รองเท้า,Schuhe,rong thao,Nomen,"Kleidung,A1",2,รองเท้าของฉันเปียก,Meine Schuhe sind nass.\r
กระเป๋า,Tasche,grapao,Nomen,"Transport,Alltag,A1",2,ฉันมีกระเป๋าใบใหญ่,Ich habe eine große Tasche.\r
หมวก,Hut,muak,Nomen,"Kleidung,A1",2,หมวกนี้สีดำ,Dieser Hut ist schwarz.\r
แว่นตา,Brille,waen ta,Nomen,"Kleidung,A1",2,ฉันใส่แว่นตา,Ich trage eine Brille.\r
นาฬิกา,Uhr / Armbanduhr,nalika,Nomen,"Kleidung,Alltag,A1",2,นาฬิกาของฉันใหม่,Meine Armbanduhr ist neu.\r
เสื้อผ้า,Kleidung,suea pha,Nomen,"Kleidung,A1",2,ฉันซักเสื้อผ้า,Ich wasche Kleidung.\r
สวม,tragen / anziehen,suam,Verb,"Kleidung,Verben,A1",2,ฉันสวมหมวก,Ich trage einen Hut.\r
ถอด,ausziehen / abnehmen,thot,Verb,"Kleidung,Verben,A1",2,ฉันถอดรองเท้า,Ich ziehe die Schuhe aus.\r
ซัก,waschen,sak,Verb,"Kleidung,Haus,A1",2,ฉันซักเสื้อผ้า,Ich wasche Kleidung.\r
สีแดง,rot,si daeng,Adjektiv,"Farben,A1",2,เสื้อสีแดงสวย,Das rote Shirt ist schön.\r
สีฟ้า,blau,si fa,Adjektiv,"Farben,A1",2,ท้องฟ้าสีฟ้า,Der Himmel ist blau.\r
สีเขียว,grün,si khiao,Adjektiv,"Farben,A1",2,ต้นไม้สีเขียว,Der Baum ist grün.\r
สีดำ,schwarz,si dam,Adjektiv,"Farben,A1",2,รถสีดำ,Das Auto ist schwarz.\r
สีขาว,weiß,si khao,Adjektiv,"Farben,A1",2,รองเท้าสีขาว,Weiße Schuhe.\r
สีน้ำเงิน,dunkelblau,si nam ngoen,Adjektiv,"Farben,A1",2,กระเป๋าสีน้ำเงิน,Die Tasche ist dunkelblau.\r
สี,Farbe,sii,Nomen,"Grundlagen,A1",2,ฉันชอบสีแดง,Ich mag rot.\r
แดง,rot,daeng,Adjektiv,"Grundlagen,A1",2,มันแดง,Es ist rot.\r
เขียว,grün,khiao,Adjektiv,"Grundlagen,A1",2,มันเขียว,Es ist grün.\r
เหลือง,gelb,lueang,Adjektiv,"Grundlagen,A1",2,มันเหลือง,Es ist gelb.\r
น้ำเงิน,blau,naam-ngoen,Adjektiv,"Grundlagen,A1",2,มันน้ำเงิน,Es ist blau.\r
ดำ,schwarz,dam,Adjektiv,"Grundlagen,A1",2,มันดำ,Es ist schwarz.\r
ขาว,weiß,khao,Adjektiv,"Grundlagen,A1",2,มันขาว,Es ist weiß.\r
แอปเปิล,Apfel,aeppoen,Nomen,"Essen,Trinken,Obst,A1",4,แอปเปิลนี้หวาน,Dieser Apfel ist süß.\r
หยุด,anhalten / stoppen,yut,Verb,"Transport,Verben,A1",2,รถหยุดแล้ว,Das Fahrzeug hat angehalten.\r
ลอง,anprobieren / versuchen,long,Verb,"Einkaufen,Verben,A1",2,ฉันลองเสื้อ,Ich probiere das Shirt an.\r
เลือก,auswählen,lueak,Verb,"Einkaufen,Verben,A1",2,ฉันเลือกอันนี้,Ich wähle dieses hier.\r
ขอ,bitten/verlangen,kho,Verb,"Grundlagen,A1",2,ฉันขอ,Ich bitte/verlange.\r
จอง,reservieren / buchen,jong,Verb,"Reisen,A1",2,ฉันจองโรงแรม,Ich buche ein Hotel.\r
แลก,wechseln / tauschen,laek,Verb,"Einkaufen,Verben,A1",2,ฉันแลกเงิน,Ich wechsle Geld.\r
คืน,zurückgeben,khuen,Verb,"Einkaufen,Verben,A1",2,ฉันคืนสินค้า,Ich gebe die Ware zurück.\r
เดินทาง,reisen,dern thang,Verb,"Reisen,Verben,A1",2,ฉันเดินทางพรุ่งนี้,Ich reise morgen.\r
เที่ยว,reisen / besichtigen,thiao,Verb,"Reisen,A1",2,ฉันเที่ยวกรุงเทพฯ,Ich besichtige Bangkok.\r
ส่งถึง,zustellen,song thueng,Verb,"Transport,Verben,A1",2,เขาส่งถึงบ้าน,Er liefert bis nach Hause.\r
กระโปรง,Rock,graprong,Nomen,"Kleidung,A1",4,กระโปรงนี้สวย,Dieser Rock ist schön.\r
ขึ้น,einsteigen / hinauf,khuen,Verb,"Transport,Verben,A1",2,ฉันขึ้นรถไฟ,Ich steige in den Zug ein.\r
ควัน,Rauch,khwan,Nomen,"Natur,A1",2,ควันจากรถเยอะมาก,Es gibt viel Rauch von den Autos.\r
ฝุ่น,Staub,fun,Nomen,"Natur,A1",2,ห้องนี้มีฝุ่นเยอะ,In diesem Zimmer ist viel Staub.\r
เคลื่อนย้าย,bewegen,khluean yai,Verb,"Verben,A1",2,เราต้องเคลื่อนย้ายโต๊ะ,Wir müssen den Tisch bewegen.\r
ถือ,halten/tragen,thue,Verb,"Verben,A1",2,เขาถือกระเป๋าหนัก,Er trägt eine schwere Tasche.\r
วาง,legen/stellen,wang,Verb,"Verben,A1",2,วางหนังสือบนโต๊ะ,Leg das Buch auf den Tisch.\r
ยก,heben,yok,Verb,"Verben,A1",2,ช่วยยกกล่องนี้หน่อย,"Bitte hilf mir, diese Kiste zu heben."\r
ลาก,ziehen,lak,Verb,"Verben,A1",2,เขาลากกระเป๋าไปสถานี,Er zieht den Koffer zum Bahnhof.\r
ผลัก,schieben,phlak,Verb,"Verben,A1",2,กรุณาผลักประตู,Bitte schieb die Tür.\r
ฝัน,träumen,fan,Verb,"Verben,A1",2,เมื่อคืนฉันฝันแปลก ๆ,Ich habe letzte Nacht seltsam geträumt.\r
หัวเราะ,lachen,huaro,Verb,"Verben,A1",2,เด็ก ๆ หัวเราะเสียงดัง,Die Kinder lachen laut.\r
ร้องไห้,weinen,rong hai,Verb,"Verben,A1",2,เขาร้องไห้เพราะเสียใจ,"Er weint, weil er traurig ist."\r
ยิ้ม,lächeln,yim,Verb,"Verben,A1",2,เธอยิ้มให้ฉัน,Sie lächelt mich an.\r
กอด,umarmen,kot,Verb,"Verben,A1",2,แม่กอดลูกแน่น,Die Mutter umarmt ihr Kind fest.\r
จูบ,küssen,chup,Verb,"Verben,A1",2,เขาจูบภรรยาก่อนออกจากบ้าน,Er küsst seine Frau vor dem Verlassen des Hauses.\r
แต่งงาน,heiraten,taeng ngan,Verb,"Familie,A1",2,พวกเขาจะแต่งงานปีหน้า,Sie werden nächstes Jahr heiraten.\r
หย่า,sich scheiden,ya,Verb,"Familie,A1",2,ทั้งคู่ตัดสินใจหย่า,"Das Paar entscheidet sich, sich scheiden zu lassen."\r
อนุญาต,erlauben,anuyat,Verb,"Verben,A1",2,ครูอนุญาตให้เราออกก่อน,"Der Lehrer erlaubt uns, früher zu gehen."\r
ห้าม,verbieten,ham,Verb,"Verben,A1",2,ที่นี่ห้ามสูบบุหรี่,Hier ist Rauchen verboten.\r
บทเรียน,Lektion,bot rian,Nomen,"Bildung,A1",2,นี่คือบทเรียน,Die heutige Lektion war nicht schwer.\r
การบ้าน,Hausaufgabe,kan ban,Nomen,"Bildung,A1",2,ทำการบ้านดิ,Mach die Hausaufgabe.\r
ข้อสอบ,Prüfung,kho sop,Nomen,"Bildung,A1",2,ข้อสอบยาก,Die Prüfung ist schwierig.\r
คะแนน,Punktzahl,khanaen,Nomen,"Bildung,A1",2,นี่คือคะแนน,Ich habe im Test eine gute Punktzahl erreicht.\r
บริษัท,Firma,borisat,Nomen,"Arbeit,A1",2,ฉันทำงานในบริษัท,Ich arbeite in einer Firma.\r
เงินเดือน,Gehalt,ngen duean,Nomen,"Arbeit,A1",2,เงินเดือนเพียงพอหรือไม่,Das Gehalt ist ausreichend.\r
วันหยุด,Feiertag,wan yut,Nomen,"Zeit,A1",2,ฉันมีวันหยุดพรุ่งนี้,Ich habe morgen frei.\r
วันเกิด,Geburtstag,wan koet,Nomen,"Zeit,A1",2,นี่คือวันเกิด,Morgen feiern wir ihren Geburtstag.\r
วัด,Tempel,wat,Nomen,"Orte,A1",2,เราไปวัด,Wir gehen zum Tempel.\r
พระ,Mönch,phra,Nomen,"Kultur,A1",2,นี่คือพระ,Am Morgen geben wir dem Mönch Essen.\r
ร้านกาแฟ,Café,ran kafe,Nomen,"Orte,A1",2,เราไปร้านกาแฟสักภาวินบรีหลิซิ่,Lass uns zu einem Café gehen und einen Kaffee trinken.\r
ร้านขายยา,Apotheke,ran khai ya,Nomen,"Orte,A1",2,ฉันซื้อยาที่ร้านขายยา,Ich kaufe Medikamente in der Apotheke.\r
ร้านเสื้อผ้า,Kleidungsgeschäft,ran suea pha,Nomen,"Orte,A1",2,ร้านเสื้อผ้ามีเสื้อสวย,Der Kleidungsladen hat schöne Hemden.\r
เค้ก,Kuchen,khek,Nomen,"Essen,A1",2,นี่คือเค้ก,Zum Geburtstag gibt es einen großen Kuchen.\r
ขนม,Süßigkeit,khanom,Nomen,"Essen,A1",2,เด็กชอบขนม,Kinder lieben Süßigkeiten.\r
เนย,Butter,noei,Nomen,"Essen,A1",2,นี่คือเนย,Ich streiche etwas Butter auf das Brot.\r
ชีส,Käse,chi,Nomen,"Essen,A1",2,นี่คือชีส,Im Sandwich sind Käse und Tomaten.\r
ไอศกรีม,Eis,aisakrim,Nomen,"Essen,A1",2,นี่คือไอศกรีม,Kinder essen im Sommer gern Eis.\r
แตงโม,Wassermelone,taeng mo,Nomen,"Essen,A1",2,แตงโมเย็นมาก,Die Wassermelone ist sehr kühl.\r
ส้ม,Orange,som,Nomen,"Essen,A1",2,ส้มนี้เปรี้ยว,Diese Orange ist sauer.\r
กล้วย,Banane,kluai,Nomen,"Essen,A1",2,กล้วยสุกแล้ว,Die Banane ist reif.\r
ถุงเท้า,Socken,thung thao,Nomen,"Kleidung,A1",4,ถุงเท้านี้สีขาว,Diese Socken sind weiß.\r
มะม่วง,Mango,mamuang,Nomen,"Essen,A1",2,มะม่วงนี้หวาน,Diese Mango ist süß.\r
สับปะรด,Ananas,sapparot,Nomen,"Essen,A1",3,สับปะรดเขียว,Ananas ist grün.\r
มะเขือเทศ,Tomate,makhuea thet,Nomen,"Essen,A1",3,มะเขือเทศแดง,Die Tomate ist rot.\r
แตงกวา,Gurke,taeng kwa,Nomen,"Essen,A1",3,แตงกวาสด,Die Gurke ist frisch.\r
มันฝรั่ง,Kartoffel,man farang,Nomen,"Essen,A1",3,มันฝรั่งขาว,Die Kartoffel ist weiß.\r
ข้าวผัด,Gebratener Reis,khao phat,Nomen,"Essen,A1",3,ข้าวผัดอร่อย,Gebratener Reis ist lecker.\r
ผัดไทย,Pad Thai,phat thai,Nomen,"Essen,A1",3,นี่คือผัดไทย,Heute essen wir zum Mittag Pad Thai.\r
ต้มยำ,Tom Yum Suppe,tom yam,Nomen,"Essen,A1",3,นี่คือต้มยำ,Tom Yum ist für mich zu scharf.\r
แกง,Curry,kaeng,Nomen,"Essen,A1",3,นี่คือแกง,Zum Abendessen gibt es heute Curry.\r
สด,frisch,sot,Adjektiv,"Essen,A1",3,มันสด,Es ist frisch.\r
เสียง,Geräusch,siang,Nomen,"Sinne,A1",3,นี่คือเสียง,Dieses Geräusch kommt aus der Küche.\r
อากาศ,Wetter,akat,Nomen,"Natur,A1",3,แดดวันนี้สวยโดดไม่,Das Wetter heute ist schön.\r
เมฆ,Wolke,mek,Nomen,"Natur,A1",3,ท้องฟ้ามีเมฆมาก,Der Himmel ist voll von Wolken.\r
พายุ,Sturm,phayu,Nomen,"Natur,A1",3,นี่คือพายุ,Heute Nacht kommt wahrscheinlich ein Sturm.\r
ฟ้า,Himmel,fa,Nomen,"Natur,A1",3,นี่คือฟ้า,Der Himmel ist heute sehr klar.\r
แดด,Sonne,phra athit,Nomen,"Natur,A1",3,แดดวันนี้แรงมาก,Die Sonne scheint sehr hell.\r
หนาว,kalt,nao,Adjektiv,"Wetter,A1",3,ฤดูหนาวหนาวมาก,Im Winter ist es sehr kalt.\r
อุ่น,warm,op un,Adjektiv,"Wetter,A1",3,ชาอุ่นๆ,Warmer Tee.\r
แห้ง,trocken,haeng,Adjektiv,"Wetter,A1",3,เสื้อนี้แห้งแล้ว,Dieses Shirt ist schon trocken.\r
เกาะ,Insel,ko,Nomen,"Natur,A1",3,นี่คือเกาะ,Im Urlaub fahren wir auf eine Insel.\r
ชายหาด,Strand,chai hat,Nomen,"Natur,A1",3,เราไปชายหาดกัน,Lass uns zum Strand gehen.\r
น้ำตก,Wasserfall,nam tok,Nomen,"Natur,A1",3,นี่คือน้ำตก,Am Wasserfall machen wir viele Fotos.\r
รถเมล์,Bus,rot bat,Nomen,"Transport,A1",3,ฉันนั่งรถเมล์ทุกวัน,Ich fahre jeden Tag mit dem Bus.\r
แท็กซี่,Taxi,thaeksi,Nomen,"Transport,A1",3,ฉันเรียกแท็กซี่,Ich rufe ein Taxi.\r
รถตู้,Minivan,rot tu,Nomen,"Transport,A1",3,นี่คือรถตู้,Wir fahren mit dem Minivan zum Markt.\r
จักรยาน,Fahrrad,jakrayan,Nomen,"Transport,A1",3,ฉันขี่จักรยาน,Ich fahre Fahrrad.\r
มอเตอร์ไซค์,Motorrad,motor sai,Nomen,"Transport,A1",3,เขาขี่มอเตอร์ไซค์,Er fährt Motorrad.\r
เรือ,Boot,ruea,Nomen,"Transport,A1",3,เราไปทางเกาะด้วยเรือ,Wir fahren mit dem Boot zur Insel.\r
ตั๋ว,Ticket,tua,Nomen,"Transport,A1",3,ฉันซื้อตั๋วรถไฟ,Ich kaufe ein Zugticket.\r
การเดินทาง,Reise,kan doen thang,Nomen,"Transport,A1",3,นี่คือการเดินทาง,"Die Reise war lang, aber schön."\r
สัมภาระ,Gepäck,samphara,Nomen,"Transport,A1",3,นี่คือสัมภาระ,Dein Gepäck steht schon im Bus.\r
นักศึกษา,Student,nak sueksa,Nomen,"Bildung,A1",3,นักศึกษาคนนี้เรียนภาษาไทย,Dieser Student lernt Thai.\r
ลง,aussteigen / hinunter,long,Verb,"Transport,Verben,A1",3,ฉันลงรถเมล์,Ich steige aus dem Bus aus.\r
ขับ,fahren / lenken,khap,Verb,"Transport,Verben,A1",3,เขาขับรถ,Er fährt Auto.\r
เลี้ยว,abbiegen,liao,Verb,"Transport,Verben,A1",3,เลี้ยวซ้ายตรงนี้,Biege hier links ab.\r
นาน,lange,nan,Adverb,"Zeit,A1",3,ฉันรอนาน,Ich warte lange.\r
ไม่เคย,nie,mai khoei,Adverb,"Zeit,A1",3,ฉันไม่เคยไปเชียงใหม่,Ich war noch nie in Chiang Mai.\r
เคย,schon einmal,khoei,Partikel,"Zeit,Erfahrung,A1",3,ฉันเคยไปกรุงเทพ,Ich war schon einmal in Bangkok.\r
สายไป,zu spät,sai bpai,Adjektiv,"Zeit,A1",3,ฉันมาสายไป,Ich komme zu spät.\r
เร็วไป,zu früh,reo bpai,Adjektiv,"Zeit,A1",3,คุณมาเร็วไป,Du kommst zu früh.\r
ขา,Bein,kha,Nomen,"Körper,A1",1,ขาของฉันเจ็บ,Mein Bein tut weh.\r
ไม่เป็นไร,kein Problem,mai pen rai,Satz,"Höflichkeit,A1",4,ไม่เป็นไรครับ,Kein Problem.\r
ช่วยด้วย,Hilfe!,chuai duai,Interjektion,"Notfall,A1",4,ช่วยด้วย!,Hilfe!\r
ราคาเท่าไหร่,wie viel kostet das?,raa-khaa-thao-rai,Phrase,"Einkaufen,A1",4,ราคาเท่าไหร่,wie viel kostet das?\r
ฉันไม่รู้,ich weiß nicht,chan-mai-ruu,Phrase,"Grundlagen,A1",4,ฉันไม่รู้,ich weiß nicht\r
กรกฎาคม,Juli,karakadakhom,Nomen,"Zeit,Monate,A1",4,กรกฎาคมฝนตกมาก,Im Juli regnet es viel.\r
กันยายน,September,kanyayon,Nomen,"Zeit,Monate,A1",4,กันยายนอากาศดี,Im September ist das Wetter gut.\r
ใกล้ๆ,ganz nah,glai glai,Adverb,"Orte,Richtung,A1",4,ร้านอยู่ใกล้ๆ,Der Laden ist ganz nah.\r
ข้างใน,drinnen,khang nai,Adverb,"Orte,Richtung,A1",4,เขาอยู่ข้างใน,Er ist drinnen.\r
ข้างนอก,draußen,khang nok,Adverb,"Orte,Richtung,A1",4,เด็กเล่นข้างนอก,Die Kinder spielen draußen.\r
ฝนตก,es regnet,fon-tok,Phrase,"Wetter,A1",4,ฝนตก,es regnet\r
แดดออก,die Sonne scheint,daet-ok,Phrase,"Wetter,A1",4,แดดออก,die Sonne scheint\r
ผัด,gebraten / pfannenrühren,phat,Verb,"Essen,Verben,A1",1,ฉันผัดผัก,Ich brate Gemüse an.\r
ย่าง,grillen,yang,Verb,"Essen,Verben,A1",4,พ่อย่างปลา,Papa grillt Fisch.\r
เบียร์,Bier,bia,Nomen,"Essen,Trinken,A1",4,เขาดื่มเบียร์,Er trinkt Bier.\r
ไวน์,Wein,wai,Nomen,"Essen,Trinken,A1",4,เธอดื่มไวน์,Sie trinkt Wein.\r
อันนี้,dieses hier,an ni,Pronomen,"Fragen,Grundwortschatz,A1",4,ฉันเอาอันนี้,Ich nehme dieses hier.\r
อันนั้น,jenes dort,an nan,Pronomen,"Fragen,Grundwortschatz,A1",4,ฉันไม่เอาอันนั้น,Ich nehme jenes dort nicht.\r
ใช่ไหม,nicht wahr?,chai mai,Partikel,"Fragen,A1",4,อันนี้ดีใช่ไหม,"Du kommst morgen, nicht wahr?"\r
ได้ไหม,geht das? / darf ich?,dai mai,Partikel,"Fragen,A1",4,ฉันลองได้ไหม,Darf ich probieren?\r
มีไหม,gibt es?,mi mai,Partikel,"Fragen,A1",4,มีน้ำไหม,Gibt es Wasser?\r
เอาไหม,willst du?,ao mai,Partikel,"Fragen,A1",4,เอากาแฟไหม,Willst du Kaffee?\r
มืด,dunkel,muet,Adjektiv,"Eigenschaften,A1",2,ห้องนี้มืดเกินไป,Dieses Zimmer ist zu dunkel.\r
สว่าง,hell,sawang,Adjektiv,"Eigenschaften,A1",4,ห้องนี้สว่างมาก,Dieses Zimmer ist sehr hell.\r
แคบ,eng,khaep,Adjektiv,"Eigenschaften,A1",4,ซอยนี้แคบมาก,Diese Gasse ist sehr eng.\r
กว้าง,breit,kwang,Adjektiv,"Eigenschaften,A1",4,ถนนเส้นนี้กว้าง,Diese Straße ist breit.\r
ลึก,tief,luek,Adjektiv,"Eigenschaften,A1",4,น้ำตรงนี้ลึก,Das Wasser ist hier tief.\r
ตื้น,flach,tuen,Adjektiv,"Eigenschaften,A1",4,น้ำตรงนี้ตื้น,Das Wasser ist hier flach.\r
ทื่อ,stumpf,thue,Adjektiv,"Eigenschaften,A1",4,มีดเล่มนี้ทื่อ,Dieses Messer ist stumpf.\r
เรียบ,glatt,riap,Adjektiv,"Eigenschaften,A1",4,พื้นนี้เรียบมาก,Dieser Boden ist sehr glatt.\r
หยาบ,rau,yap,Adjektiv,"Eigenschaften,A1",4,ผ้านี้หยาบไปหน่อย,Dieser Stoff ist etwas rau.\r
นุ่ม,weich,num,Adjektiv,"Eigenschaften,A1",4,หมอนใบนี้นุ่มมาก,Dieses Kissen ist sehr weich.\r
แข็ง,hart,khaeng,Adjektiv,"Eigenschaften,A1",4,ขนมปังนี้แข็งเกินไป,Dieses Brot ist zu hart.\r
บางครั้ง,manchmal,baang-khrang,Adverb,"Grundlagen,A1",2,บางครั้งฉันทำอาหาร,Manchmal koche ich.\r
เสมอ,immer,sa-moe,Adverb,"Grundlagen,A1",2,ฉันตื่นเช้าเสมอ,Ich wache immer früh auf.\r
บ่อย,oft,boi,Adverb,"Zeit,A1",5,ฉันไปที่ร้านนี้บ่อย,Ich gehe oft in diesen Laden.\r
เพียง,nur,phiang,Adverb,"Grammatik,A1",5,ฉันมีเวลาเพียงสิบนาที,Ich habe nur zehn Minuten Zeit.\r
เกือบ,fast,kueap,Adverb,"Grammatik,A1",5,ฉันเกือบลืมกระเป๋า,Ich hätte fast die Tasche vergessen.\r
เหมือนกัน,gleich sein,muean kan,Verb,"Grammatik,A1",5,สองประโยคนี้เหมือนกัน,Die zwei Sätze sind gleich.\r
ทั้งหมด,alles/gesamt,thangmot,Pronomen,"Grammatik,A1",5,ฉันอ่านทั้งหมดแล้ว,Ich habe alles gelesen.\r
บางส่วน,ein Teil,bang suan,Pronomen,"Grammatik,A1",5,คำนี้คือบางส่วน,Ich verstehe nur einen Teil des Textes.\r
แต่ละ,jeder einzelne,tae la,Pronomen,"Grammatik,A1",5,คำนี้คือแต่ละ,Jeder einzelne Schritt ist wichtig.\r
ควร,sollte,khuan,Modalverb,"Grammatik,A1",5,ฉันใช้คำว่าควรบ่อย,Du solltest heute früher schlafen.\r
อาจจะ,vielleicht/könnte,at ja,Modalverb,"Grammatik,A1",5,ฉันใช้คำว่าอาจจะบ่อย,Vielleicht komme ich etwas später.\r
แน่นอน,sicher/definitiv,nae non,Adverb,"Grammatik,A1",5,คำนี้คือแน่นอน,Morgen komme ich ganz sicher.\r
ดูทีวี,fernsehen,du thiiwii,Verb,"Medien,A1",5,ตอนเย็นฉันดูทีวี,Am Abend sehe ich fern.\r
อยู่ต่อ,bleiben,yu to,Verb,"Verben,Alltag,A1",5,วันนี้ฉันอยู่ต่อที่บ้าน,Ich bleibe heute zu Hause.\r
คุ้ม,günstig,khum,Adjektiv,"Einkaufen,A1",5,ร้านนี้คุ้มมาก,Dieser Laden ist sehr günstig.\r
ด้วยกัน,zusammen,duai gan,Adverb,"Grundwortschatz,A1",5,เราไปด้วยกัน,Wir gehen zusammen.\r
วันหยุดพักผ่อน,Urlaub,wan yut phak phon,Nomen,"Reisen,A1",5,วันหยุดพักผ่อนนี้เราไปทะเล,Im Urlaub fahren wir ans Meer.\r
ด้วย,mit/auch,duai,Präposition,"Grundwortschatz,A1",5,ฉันไปตลาดด้วย,Ich gehe auch auf den Markt.\r
ต้องการ,wollen/benötigen,tong kan,Verb,"Grundwortschatz,A1",5,ฉันต้องการน้ำ,Ich möchte Wasser.\r
หน่อย,ein bisschen / bitte (Partikel),noi,Partikel,"Grundwortschatz,A1",5,ช่วยฉันหน่อย,Kannst du mir bitte helfen?\r
ทาง,Weg/Richtung,thang,Nomen,"Grundwortschatz,A1",5,ไปทางซ้าย,Geh nach links.\r
ใส่,tragen / hineinlegen,sai,Verb,"Grundwortschatz,A1",5,ฉันใส่หมวก,Ich trage einen Hut.\r
ตอน,Zeitpunkt / Abschnitt,ton,Nomen,"Grundwortschatz,A1",5,วันนี้ฉันทำงานตอนเช้า,Heute arbeite ich am Morgen.\r
เพื่อ,für / damit,phuea,Präposition,"Grundwortschatz,A1",5,ฉันเรียนภาษาไทยเพื่อทำงาน,Ich lerne Thai für die Arbeit.\r
ว่า,dass,waa,Konjunktion,"Grundwortschatz,A1",5,ฉันรู้ว่าเขาอยู่บ้าน,"Ich weiß, dass er zu Hause ist."\r
จะ,werden / (Futurpartikel),ja,Partikel,"Grundwortschatz,A1",5,พรุ่งนี้ฉันจะไปตลาด,Morgen werde ich auf den Markt gehen.\r
เก็บ,aufbewahren / wegräumen,kep,Verb,"Grundwortschatz,A1",5,ฉันเก็บหนังสือบนโต๊ะ,Ich lege das Buch auf den Tisch.\r
รวม,inklusive / insgesamt,ruam,Adjektiv,"Grundwortschatz,A1",5,รวมอาหารเช้าหรือไม่,Ist Frühstück inklusive?\r
ทอน,Wechselgeld geben,thon,Verb,"Grundwortschatz,A1",5,ช่วยทอนเงินหน่อย,Bitte geben Sie mir Wechselgeld.\r
นิดหน่อย,ein bisschen,nit noi,Adverb,"Grundwortschatz,A1",5,ฉันพูดภาษาไทยได้นิดหน่อย,Ich spreche ein bisschen Thai.\r
สำหรับ,für,samrap,Präposition,"Grundwortschatz,A1",5,ขอบคุณมากสำหรับความช่วยเหลือ,Vielen Dank für Ihre Hilfe.\r
ความ,Nominalpräfix (Abstraktbildung),khwam,Präfix,"Grundwortschatz,A1",5,ความฝันของฉันคือการเดินทางรอบโลก,Mein Traum ist eine Weltreise.\r
นี้,"dieser/diese/dieses (nah, unhöflich-neutral)",nii,Demonstrativpronomen,"Grundwortschatz,A1",5,เมืองนี้มีสะพาน,Diese Stadt hat eine Brücke.\r
นี่,hier/dies hier,nii,Adverb,"Grundwortschatz,A1",5,ลุงกับป้าอยู่ที่นี่,Onkel und Tante sind hier.\r
พก,mitnehmen / bei sich tragen,phok,Verb,"Grundwortschatz,A1",5,ฉันพกร่ม,Ich habe einen Regenschirm dabei.\r
ต้อง,müssen,tong,Modalverb,"Grundwortschatz,A1",5,ฉันต้องไปธนาคาร,Ich muss zur Bank.\r
คือ,ist/sind (definierend),khue,Verb,"Grundwortschatz,A1",5,นี่คือตัวอย่างที่ดี,Das ist ein gutes Beispiel.\r
ยิน,sich freuen / erfreut sein (in festen Wendungen),yin,Verb,"Grundwortschatz,A1",5,ยินดีที่ได้รู้จัก,"Freut mich, dich kennenzulernen."\r
ขับรถ,Auto fahren,khap-rot,Verb,"Reisen,A2",2,ฉันขับรถไปทำงาน,Ich fahre mit dem Auto zur Arbeit.\r
ออกกำลังกาย,Sport treiben,ok-kamlang-kai,Verb,"Gesundheit,A2",2,ฉันออกกำลังกายทุกเช้า,Ich mache morgens Sport.\r
ทำอาหาร,kochen (allgemein),tham-aahaan,Verb,"Essen,A2",2,ฉันทำอาหารเย็น,Ich koche das Abendessen.\r
ล้าง,waschen/spülen,laang,Verb,"Zuhause,A2",2,ฉันล้างจาน,Ich spüle das Geschirr.\r
ทำความสะอาด,putzen,tham-khwaam-sa-aat,Verb,"Zuhause,A2",2,ฉันทำความสะอาดบ้าน,Ich putze die Wohnung.\r
ซักผ้า,Wäsche waschen,sak-phaa,Verb,"Zuhause,A2",2,ฉันซักผ้าวันเสาร์,Ich wasche am Samstag die Wäsche.\r
ยี่สิบ,zwanzig,yii-sip,Zahl,"Grundlagen,A2",2,ยี่สิบ,zwanzig\r
ร้อย,hundert,roi,Zahl,"Grundlagen,A2",2,ร้อย,hundert\r
พัน,tausend,phan,Zahl,"Grundlagen,A2",2,พัน,tausend\r
ห้องครัว,Küche,hong-khrua,Nomen,"Zuhause,A2",2,แม่ทำอาหารในห้องครัว,Mama kocht in der Küche.\r
โรงพยาบาล,Krankenhaus,rong-pha-yaa-baan,Nomen,"Gesundheit,A2",2,เขาไปโรงพยาบาล,Er ist im Krankenhaus.\r
ธนาคาร,Bank,tha-na-khaan,Nomen,"Einkaufen,A2",2,ฉันต้องไปธนาคาร,Ich muss zur Bank.\r
สนามบิน,Flughafen,sa-naam-bin,Nomen,"Reisen,A2",2,ฉันไปสนามบิน,Ich fahre zum Flughafen.\r
สถานี,Station,sa-thaa-nii,Nomen,"Reisen,A2",2,สถานีอยู่ไกลไหม,Wo ist der Bahnhof?\r
สวน,Park/Garten,suan,Nomen,"Zuhause,A2",2,เราไปเดินเล่นในสวน,Wir spazieren im Park.\r
ภูเขา,Berg,phuu-khao,Nomen,"Reisen,A2",2,ภูเขาสูงมาก,Der Berg ist sehr hoch.\r
เครื่องบิน,Flugzeug,khrueang-bin,Nomen,"Reisen,A2",2,เครื่องบินขึ้นแล้ว,Das Flugzeug ist schon gestartet.\r
เนื้อ,Fleisch,nuea,Nomen,"Essen,A2",3,ฉันไม่กินเนื้อ,Ich esse kein Fleisch.\r
สัปดาห์,Woche,sapda,Nomen,"Zeit,A2",3,ฉันทำงานห้าวันต่อสัปดาห์,Ich arbeite fünf Tage pro Woche.\r
กระจก,Spiegel,krajok,Nomen,"Haushalt,A2",3,นี่คือกระจก,Zu Hause brauche ich oft Spiegel.\r
กางเกงยีนส์,Jeans,kangkeng yin,Nomen,"Kleidung,A2",3,นี่คือกางเกงยีนส์,Diese Jeans passt mir sehr gut.\r
การท่องเที่ยว,Tourismus,kan thongthiao,Nomen,"Reisen,A2",3,นี่คือการท่องเที่ยว,Der Tourismus ist wichtig fuer die Region.\r
กำแพง,Wand,kamphaeng,Nomen,"Haushalt,A2",3,นี่คือกำแพง,An der Wand haengt ein Kalender.\r
กำไร,Gewinn,kamrai,Nomen,"Arbeit,A2",3,นี่คือกำไร,Dieses Jahr macht die Firma mehr Gewinn.\r
ก๋วยเตี๋ยว,Nudelsuppe,kuai tiao,Nomen,"Essen,A2",3,นี่คือก๋วยเตี๋ยว,Die Nudelsuppe ist sehr heiss.\r
ขาดทุน,Verlust,khatthun,Nomen,"Arbeit,A2",3,นี่คือขาดทุน,Letzten Monat gab es leider Verlust.\r
ข้าวเหนียว,Klebreis,khao niao,Nomen,"Essen,A2",3,นี่คือข้าวเหนียว,Zu Mango passt Klebreis sehr gut.\r
คลินิก,Klinik,khlinik,Nomen,"Gesundheit,A2",3,นี่คือคลินิก,Die Klinik ist nur fuenf Minuten entfernt.\r
คอ,Hals,kho,Nomen,"Körper,A2",3,นี่คือคอ,Beim Sport achte ich auf Hals.\r
คุกกี้,Keks,khukki,Nomen,"Essen,A2",3,นี่คือคุกกี้,Zum Kaffee nehme ich einen Keks.\r
จองล่วงหน้า,im Voraus buchen,jong luang na,Verb,"Reisen,A2",3,ฉันจองล่วงหน้า,In der Hauptsaison solltest du im Voraus buchen.\r
จัดการ,organisieren/verwalten,jatkan,Verb,"Arbeit,A2",3,ฉันจัดการ,Sie organisiert das Team sehr gut.\r
จาน,Teller,jan,Nomen,"Haushalt,A2",3,นี่คือจาน,Zu Hause brauche ich oft Teller.\r
จาม,niesen,jam,Verb,"Gesundheit,A2",3,ฉันจาม,Wegen des Staubs muss ich staendig niesen.\r
ชานเมือง,Vorstadt,chan mueang,Nomen,"Orte,A2",3,นี่คือชานเมือง,In der Vorstadt sind die Mieten guenstiger.\r
ชาม,Schüssel,cham,Nomen,"Haushalt,A2",3,นี่คือชาม,Die Suppe ist in einer grossen Schuessel.\r
ชุดว่ายน้ำ,Badeanzug,chut wai nam,Nomen,"Kleidung,A2",3,นี่คือชุดว่ายน้ำ,Vergiss deinen Badeanzug fuer den Strand nicht.\r
ช็อกโกแลต,Schokolade,chokkolat,Nomen,"Essen,A2",3,นี่คือช็อกโกแลต,Ich esse nur ein kleines Stueck Schokolade.\r
ช้อน,Löffel,chon,Nomen,"Haushalt,A2",3,นี่คือช้อน,Zu Hause brauche ich oft Löffel.\r
ช้อนชา,Teelöffel,chon cha,Nomen,"Essen,A2",3,นี่คือช้อนชา,Ich nehme einen Teeloeffel Zucker.\r
ช้อนโต๊ะ,Esslöffel,chon to,Nomen,"Essen,A2",3,นี่คือช้อนโต๊ะ,Fuer das Rezept brauchst du einen Essloeffel Oel.\r
ซอย,Gasse,soi,Nomen,"Orte,A2",3,นี่คือซอย,Das Cafe ist in einer kleinen Gasse.\r
ซีอิ๊ว,Sojasauce,si iu,Nomen,"Essen,A2",3,นี่คือซีอิ๊ว,Gib nicht zu viel Sojasauce in die Pfanne.\r
ดาวน์โหลด,herunterladen,dao lot,Verb,"Technik,A2",3,ฉันดาวน์โหลด,Bei der Arbeit muss ich oft herunterladen.\r
ด่านตรวจ,Kontrollstelle,dan truat,Nomen,"Reisen,A2",3,นี่คือด่านตรวจ,An der Kontrollstelle wurden alle Fahrzeuge geprueft.\r
ติดต่อ,kontaktieren,tit to,Verb,"Arbeit,A2",3,ฉันติดต่อ,Bei Fragen koennen Sie uns jederzeit kontaktieren.\r
ตู้,Schrank,tu,Nomen,"Haushalt,A2",3,นี่คือตู้,Die Glaeser stehen im oberen Schrank.\r
ตู้เย็น,Kühlschrank,tu yen,Nomen,"Haushalt,A2",3,นี่คือตู้เย็น,Zu Hause brauche ich oft Kühlschrank.\r
ตู้เสื้อผ้า,Kleiderschrank,tu suea pha,Nomen,"Haushalt,A2",3,นี่คือตู้เสื้อผ้า,Die Jacke haengt im Kleiderschrank.\r
ต่างหู,Ohrring,tang hu,Nomen,"Kleidung,A2",3,นี่คือต่างหู,Sie traegt heute goldene Ohrringe.\r
ต้ม,kochen/sieden,tom,Verb,"Essen,A2",3,ฉันต้ม,Heute koche ich Reis und Suppe.\r
ถังขยะ,Mülleimer,thang khaya,Nomen,"Haushalt,A2",3,นี่คือถังขยะ,Wirf das bitte in den Muelleimer.\r
ถั่ว,Bohne/Nuss,thua,Nomen,"Essen,A2",3,นี่คือถั่ว,Im Salat sind Bohnen und Nuesse.\r
ถุงมือ,Handschuh,thung mue,Nomen,"Kleidung,A2",3,นี่คือถุงมือ,Ohne Handschuhe sind meine Haende sofort kalt.\r
ทอด,braten/frittieren,thot,Verb,"Essen,A2",3,ฉันทอด,Ich brate den Fisch in der Pfanne.\r
ที่นอน,Matratze,thi non,Nomen,"Haushalt,A2",3,นี่คือที่นอน,Die Matratze ist fuer mich zu weich.\r
ท้อง,Bauch,thong,Nomen,"Körper,A2",3,นี่คือท้อง,Beim Sport achte ich auf Bauch.\r
นม,Milch,nom,Nomen,"Essen,A2",3,นี่คือนม,Im Supermarkt kaufe ich oft Milch.\r
นิ้ว,Finger,nio,Nomen,"Körper,A2",3,นี่คือนิ้ว,Beim Sport achte ich auf Finger.\r
น้ำปลา,Fischsauce,nam pla,Nomen,"Essen,A2",3,นี่คือน้ำปลา,Fuer den typischen Geschmack kommt etwas Fischsauce dazu.\r
น้ำผึ้ง,Honig,nam phueng,Nomen,"Essen,A2",3,นี่คือน้ำผึ้ง,Ich trinke Tee mit etwas Honig.\r
น้ำมัน,Öl,nam man,Nomen,"Essen,A2",3,นี่คือน้ำมัน,Zum Braten nehme ich nur wenig Oel.\r
น้ำส้ม,Orangensaft,nam som,Nomen,"Essen,A2",3,นี่คือน้ำส้ม,Morgens trinke ich ein Glas Orangensaft.\r
น้ำแข็ง,Eiswürfel,nam khaeng,Nomen,"Essen,A2",3,นี่คือน้ำแข็ง,Bitte gib drei Eiswuerfel ins Glas.\r
บะหมี่,Nudeln,ba mi,Nomen,"Essen,A2",3,นี่คือบะหมี่,Abends koche ich oft Nudeln.\r
บัญชี,Konto,banchi,Nomen,"Arbeit,A2",3,นี่คือบัญชี,Im Buero brauche ich Konto.\r
ประชุม,Besprechung,prachum,Nomen,"Arbeit,A2",3,นี่คือประชุม,Um neun Uhr haben wir eine Besprechung.\r
ประสบการณ์,Erfahrung,prasopkan,Nomen,"Arbeit,A2",3,นี่คือประสบการณ์,Fuer diese Stelle braucht man Erfahrung.\r
ปวดท้อง,Bauchschmerzen,puat thong,Nomen,"Gesundheit,A2",3,นี่คือปวดท้อง,Nach dem Essen bekam ich Bauchschmerzen.\r
ปวดหัว,Kopfschmerzen,puat hua,Nomen,"Gesundheit,A2",3,นี่คือปวดหัว,Ich habe nach der Arbeit oft Kopfschmerzen.\r
ผสม,mischen,phasom,Verb,"Essen,A2",3,ฉันผสม,Mische zuerst Mehl und Wasser gut.\r
ผ้า,Stoff,pha,Nomen,"Kleidung,A2",3,นี่คือผ้า,Dieser Stoff fuehlt sich sehr weich an.\r
ผ้าห่ม,Decke,pha hom,Nomen,"Haushalt,A2",3,นี่คือผ้าห่ม,Zu Hause brauche ich oft Decke.\r
ผ้าเช็ดตัว,Handtuch,pha chet tua,Nomen,"Haushalt,A2",3,นี่คือผ้าเช็ดตัว,Zu Hause brauche ich oft Handtuch.\r
พัดลม,Ventilator,phat lom,Nomen,"Haushalt,A2",3,นี่คือพัดลม,Bei Hitze laeuft der Ventilator den ganzen Tag.\r
พิมพ์,tippen/drucken,phim,Verb,"Arbeit,A2",3,ฉันพิมพ์,Bei der Arbeit muss ich oft tippen/drucken.\r
พื้น,Boden,phuen,Nomen,"Haushalt,A2",3,นี่คือพื้น,Der Boden ist nach dem Wischen noch nass.\r
ฟักทอง,Kürbis,fak thong,Nomen,"Essen,A2",3,นี่คือฟักทอง,Im Herbst machen wir oft Kuerbissuppe.\r
มะนาว,Limette,manao,Nomen,"Essen,A2",3,นี่คือมะนาว,Ein wenig Limette macht den Geschmack frischer.\r
มีด,Messer,mit,Nomen,"Haushalt,A2",3,นี่คือมีด,Zu Hause brauche ich oft Messer.\r
ยา,Medizin,ya,Nomen,"Gesundheit,A2",3,นี่คือยา,In der Apotheke frage ich nach Medizin.\r
ยาสีฟัน,Zahnpasta,ya si fan,Nomen,"Haushalt,A2",3,นี่คือยาสีฟัน,Zu Hause brauche ich oft Zahnpasta.\r
รถติด,Stau,rot tit,Nomen,"Verkehr,A2",3,นี่คือรถติด,Wegen des Staus komme ich zu spaet.\r
รหัสผ่าน,Passwort,rahat phan,Nomen,"Technik,A2",3,นี่คือรหัสผ่าน,Am Computer nutze ich Passwort.\r
รองเท้าบูท,Stiefel,rong thao but,Nomen,"Kleidung,A2",3,นี่คือรองเท้าบูท,Bei Regen ziehe ich Stiefel an.\r
รองเท้าแตะ,Sandalen,rong thao tae,Nomen,"Kleidung,A2",3,นี่คือรองเท้าแตะ,Am Strand trage ich nur Sandalen.\r
รายงาน,Bericht,raingan,Nomen,"Arbeit,A2",3,นี่คือรายงาน,Den Bericht gebe ich bis morgen ab.\r
ร่ม,Regenschirm,rom,Nomen,"Kleidung,A2",3,นี่คือร่ม,"Nimm einen Regenschirm mit, es wird gleich regnen."\r
ลายเซ็น,Unterschrift,laisen,Nomen,"Arbeit,A2",3,นี่คือลายเซ็น,Hier fehlt noch deine Unterschrift.\r
ลาออก,kündigen,la ok,Verb,"Arbeit,A2",3,ฉันลาออก,Er kuendigt zum Monatsende.\r
วีซ่า,Visum,wisa,Nomen,"Reisen,A2",3,นี่คือวีซ่า,Fuer diese Reise brauche ich ein Visum.\r
สถานีตำรวจ,Polizeistation,sathani tamruat,Nomen,"Stadt,A2",3,นี่คือสถานีตำรวจ,Die Polizeistation ist gleich neben dem Markt.\r
สบู่,Seife,sabu,Nomen,"Haushalt,A2",3,นี่คือสบู่,Zu Hause brauche ich oft Seife.\r
สมัคร,bewerben/anmelden,samak,Verb,"Arbeit,A2",3,ฉันสมัคร,Bei der Arbeit muss ich oft bewerben/anmelden.\r
สร้อยคอ,Halskette,soi kho,Nomen,"Kleidung,A2",3,นี่คือสร้อยคอ,Die Halskette war ein Geschenk von meiner Mutter.\r
สัมภาษณ์,Interview,samphat,Nomen,"Arbeit,A2",3,นี่คือสัมภาษณ์,Morgen habe ich ein Interview.\r
สำนักงาน,Büro,samnakngan,Nomen,"Arbeit,A2",3,นี่คือสำนักงาน,Mein Buero ist im dritten Stock.\r
สี่แยก,Kreuzung,si yaek,Nomen,"Orte,A2",3,นี่คือสี่แยก,An der Kreuzung biegen wir links ab.\r
สุขภาพ,Gesundheit,sukkhaphap,Nomen,"Gesundheit,A2",3,นี่คือสุขภาพ,Fuer meine Gesundheit gehe ich regelmaessig spazieren.\r
สแกน,scannen,saekaen,Verb,"Technik,A2",3,ฉันสแกน,Kannst du dieses Dokument bitte scannen?\r
ส้อม,Gabel,som,Nomen,"Haushalt,A2",3,นี่คือส้อม,Zu Hause brauche ich oft Gabel.\r
หนังสือเดินทาง,Reisepass,nangsue doenthang,Nomen,"Reisen,A2",3,นี่คือหนังสือเดินทาง,Bitte zeigen Sie Ihren Reisepass.\r
หน้าต่าง,Fenster,nataang,Nomen,"Haushalt,A2",3,นี่คือหน้าต่าง,Zu Hause brauche ich oft Fenster.\r
หมอน,Kissen,mon,Nomen,"Haushalt,A2",3,นี่คือหมอน,Zu Hause brauche ich oft Kissen.\r
หมู่บ้าน,Dorf,mu ban,Nomen,"Orte,A2",3,นี่คือหมู่บ้าน,Das Dorf liegt in den Bergen.\r
หวี,Kamm,wi,Nomen,"Haushalt,A2",3,นี่คือหวี,Ich suche morgens oft meinen Kamm.\r
หัวหน้า,Chef/Vorgesetzter,huana,Nomen,"Arbeit,A2",3,นี่คือหัวหน้า,Mein Chef hat heute viele Termine.\r
หัวใจ,Herz,huachai,Nomen,"Körper,A2",3,นี่คือหัวใจ,Beim Sport achte ich auf Herz.\r
หั่น,schneiden,han,Verb,"Essen,A2",3,ฉันหั่น,Kannst du bitte die Tomaten klein schneiden?\r
ห้องพัก,Hotelzimmer,hong phak,Nomen,"Reisen,A2",3,นี่คือห้องพัก,Das Hotelzimmer ist sauber und ruhig.\r
อก,Brust,ok,Nomen,"Körper,A2",3,นี่คืออก,Seit gestern habe ich Schmerzen in der Brust.\r
อบ,backen,op,Verb,"Essen,A2",3,ฉันอบ,Am Wochenende backe ich einen Kuchen.\r
อัปโหลด,hochladen,ap lot,Verb,"Technik,A2",3,ฉันอัปโหลด,Bitte lade das Foto in die Cloud hoch.\r
อีเมล,E-Mail,i-meo,Nomen,"Arbeit,A2",3,นี่คืออีเมล,Im Buero brauche ich E-Mail.\r
อุบัติเหตุ,Unfall,ubathet,Nomen,"Gesundheit,A2",3,นี่คืออุบัติเหตุ,Auf der Kreuzung gab es einen Unfall.\r
เก้าอี้,Stuhl,kao i,Nomen,"Haushalt,A2",3,นี่คือเก้าอี้,Zu Hause brauche ich oft Stuhl.\r
เขต,Bezirk,khet,Nomen,"Orte,A2",3,นี่คือเขต,Ich wohne in einem ruhigen Bezirk.\r
เครื่องซักผ้า,Waschmaschine,khrueang sak pha,Nomen,"Haushalt,A2",3,นี่คือเครื่องซักผ้า,Die Waschmaschine ist schon wieder kaputt.\r
เงินสด,Bargeld,ngen sot,Nomen,"Arbeit,A2",3,นี่คือเงินสด,Ich habe heute kein Bargeld dabei.\r
เจ็บ,"wehtun/schmerzen (allgemein, auch verletzen)",jep,Verb,"Gesundheit,A2",3,ฉันเจ็บ,Mein Bein tut heute noch weh.\r
เช็กอิน,einchecken,chek in,Verb,"Reisen,A2",3,ฉันเช็กอิน,Wir checken um 14 Uhr im Hotel ein.\r
เช็กเอาต์,auschecken,chek aut,Verb,"Reisen,A2",3,ฉันเช็กเอาต์,Morgen checken wir frueh aus.\r
เพดาน,Zimmerdecke,phedan,Nomen,"Haushalt,A2",3,นี่คือเพดาน,An der Zimmerdecke haengt eine Lampe.\r
เพื่อนร่วมงาน,Kollege,phuean ruam ngan,Nomen,"Arbeit,A2",3,นี่คือเพื่อนร่วมงาน,Ich bespreche das mit meinem Kollegen.\r
เลือด,Blut,lueat,Nomen,"Körper,A2",3,นี่คือเลือด,Nach dem Unfall war Blut auf dem Hemd.\r
เล็บ,Nagel,lep,Nomen,"Körper,A2",3,นี่คือเล็บ,Ich schneide mir heute die Naegel.\r
เว็บไซต์,Webseite,websai,Nomen,"Technik,A2",3,นี่คือเว็บไซต์,Am Computer nutze ich Webseite.\r
เสิร์ฟ,servieren,soef,Verb,"Essen,A2",3,ฉันเสิร์ฟ,Das Restaurant serviert das Essen sehr schnell.\r
เสื้อกันหนาว,Pullover,suea kan nao,Nomen,"Kleidung,A2",3,นี่คือเสื้อกันหนาว,"Abends wird es kalt, deshalb ziehe ich einen Pullover an."\r
เสื้อยืด,T-Shirt,suea yuet,Nomen,"Kleidung,A2",3,นี่คือเสื้อยืด,Im Laden suche ich neue T-Shirt.\r
เสื้อเชิ้ต,Hemd,suea choet,Nomen,"Kleidung,A2",3,นี่คือเสื้อเชิ้ต,Fuer das Meeting trage ich ein weisses Hemd.\r
เสื้อโค้ท,Mantel,suea khot,Nomen,"Kleidung,A2",3,นี่คือเสื้อโค้ท,Im Winter brauche ich einen warmen Mantel.\r
เห็ด,Pilz,het,Nomen,"Essen,A2",3,นี่คือเห็ด,In der Suppe sind frische Pilze.\r
เอกสาร,Dokument,eksan,Nomen,"Arbeit,A2",3,นี่คือเอกสาร,Bitte schick mir das Dokument per E-Mail.\r
แชมพู,Shampoo,chaemphu,Nomen,"Haushalt,A2",3,นี่คือแชมพู,Zu Hause brauche ich oft Shampoo.\r
แปรงสีฟัน,Zahnbürste,praeng si fan,Nomen,"Haushalt,A2",3,นี่คือแปรงสีฟัน,Zu Hause brauche ich oft Zahnbürste.\r
แป้ง,Mehl,paeng,Nomen,"Essen,A2",3,นี่คือแป้ง,Fuer den Kuchen brauchen wir Mehl.\r
การ์ด,Karte,kat,Nomen,"Soziales,A2",3,ฉันเขียนการ์ดให้เพื่อน,Ich schreibe eine Karte für einen Freund.\r
แผล,Wunde,phlae,Nomen,"Gesundheit,A2",3,นี่คือแผล,Die Wunde heilt langsam.\r
แฟชั่น,Mode,faechan,Nomen,"Kleidung,A2",3,นี่คือแฟชั่น,Sie interessiert sich sehr fuer Mode.\r
แยม,Marmelade,yaem,Nomen,"Essen,A2",3,นี่คือแยม,Zum Fruehstueck esse ich Brot mit Marmelade.\r
แหวน,Ring,waen,Nomen,"Kleidung,A2",3,นี่คือแหวน,Er traegt den Ring an der linken Hand.\r
แอร์,Klimaanlage,ae,Nomen,"Reisen,A2",3,นี่คือแอร์,Die Klimaanlage laeuft die ganze Nacht.\r
แฮม,Schinken,haem,Nomen,"Essen,A2",3,นี่คือแฮม,Auf dem Sandwich ist Schinken und Kaese.\r
โครงการ,Projekt,khrongkan,Nomen,"Arbeit,A2",3,นี่คือโครงการ,Das Projekt endet Ende des Monats.\r
โซฟา,Sofa,sofa,Nomen,"Haushalt,A2",3,นี่คือโซฟา,Im Wohnzimmer steht ein bequemes Sofa.\r
โต๊ะ,Tisch,to,Nomen,"Haushalt,A2",3,นี่คือโต๊ะ,Zu Hause brauche ich oft Tisch.\r
โยเกิร์ต,Joghurt,yokoet,Nomen,"Essen,A2",3,นี่คือโยเกิร์ต,Nachmittags esse ich oft Joghurt mit Obst.\r
ใบกำกับภาษี,Rechnung,bai kamkap phasi,Nomen,"Arbeit,A2",3,นี่คือใบกำกับภาษี,Die Rechnung wird heute noch geschickt.\r
ใบเสร็จ,Quittung,baiset,Nomen,"Arbeit,A2",3,นี่คือใบเสร็จ,Kann ich bitte die Quittung bekommen?\r
ไกด์,Reiseführer,kai,Nomen,"Reisen,A2",3,นี่คือไกด์,Unser Reisefuehrer spricht sehr gut Deutsch.\r
ไข้,Fieber,khai,Nomen,"Gesundheit,A2",3,นี่คือไข้,In der Apotheke frage ich nach Fieber.\r
ไฟจราจร,Ampel,fai jarajon,Nomen,"Verkehr,A2",3,นี่คือไฟจราจร,Warte bitte an der Ampel.\r
ไมโครเวฟ,Mikrowelle,maikhrowef,Nomen,"Haushalt,A2",3,นี่คือไมโครเวฟ,Ich waerme das Essen in der Mikrowelle auf.\r
ไม้กวาด,Besen,mai kwat,Nomen,"Haushalt,A2",3,นี่คือไม้กวาด,Mit dem Besen fege ich den Boden.\r
ไส้กรอก,Wurst,saikrok,Nomen,"Essen,A2",3,นี่คือไส้กรอก,Heute gibt es Wurst mit Reis.\r
ไหล่,Schulter,lai,Nomen,"Körper,A2",3,นี่คือไหล่,Beim Sport achte ich auf Schulter.\r
ไอ,husten,ai,Verb,"Gesundheit,A2",3,ฉันไอ,Im Alltag muss ich häufig husten.\r
อาจารย์,Dozent,ajan,Nomen,"Bildung,A2",3,นี่คืออาจารย์,Heute benutze ich das Wort Dozent in einem Satz.\r
โรงงาน,Fabrik,rong ngan,Nomen,"Arbeit,A2",3,เขาทำงานในโรงงาน,Er arbeitet in einer Fabrik.\r
ตำแหน่ง,Position,tamnaeng,Nomen,"Arbeit,A2",3,นี่คือตำแหน่ง,Heute benutze ich das Wort Position in einem Satz.\r
เทศกาล,Festival,thetsakan,Nomen,"Kultur,A2",3,นี่คือเทศกาล,Heute benutze ich das Wort Festival in einem Satz.\r
ประเพณี,Tradition,prapheni,Nomen,"Kultur,A2",3,นี่คือประเพณี,Heute benutze ich das Wort Tradition in einem Satz.\r
ศาสนา,Religion,satsana,Nomen,"Kultur,A2",3,นี่คือศาสนา,Heute benutze ich das Wort Religion in einem Satz.\r
ตลาดนัด,Flohmarkt,talat nat,Nomen,"Orte,A2",3,ตลาดนัดเปิดเฉพาะวันเสาร์อาทิตย์,Der Flohmarkt ist nur am Wochenende offen.\r
ห้างสรรพสินค้า,Einkaufszentrum,hang sap sin kha,Nomen,"Orte,A2",3,ห้างสรรพสินค้าใหญ่,Das Einkaufszentrum ist groß.\r
ทันที,sofort,thanthi,Adverb,"Zeit,A2",3,ถ้าถึงแล้วโทรหาฉันทันที,"Ruf mich sofort an, wenn du ankommst."\r
มกราคม,Januar,makarakhom,Nomen,"Zeit,A2",3,ฉันจะเริ่มงานใหม่ในเดือนมกราคม,Ich beginne im Januar eine neue Arbeit.\r
กุมภาพันธ์,Februar,kumphaphan,Nomen,"Zeit,A2",3,เดือนกุมภาพันธ์สั้นกว่าเดือนอื่น,Der Februar ist kürzer als andere Monate.\r
มีนาคม,März,minakhom,Nomen,"Zeit,A2",3,อากาศเริ่มร้อนในเดือนมีนาคม,Im März wird es langsam heiß.\r
เมษายน,April,mesayon,Nomen,"Zeit,A2",3,เราไปเที่ยวทะเลในเดือนเมษายน,Im April fahren wir ans Meer.\r
พฤษภาคม,Mai,phruesaphakhom,Nomen,"Zeit,A2",3,เดือนพฤษภาคมมีวันหยุดหลายวัน,Im Mai gibt es viele Feiertage.\r
มิถุนายน,Juni,mithunayon,Nomen,"Zeit,A2",3,ฝนตกบ่อยในเดือนมิถุนายน,Im Juni regnet es oft.\r
สิงหาคม,August,singhakhom,Nomen,"Zeit,A2",3,เราย้ายบ้านในเดือนสิงหาคม,Wir ziehen im August um.\r
ตุลาคม,Oktober,tulakhom,Nomen,"Zeit,A2",3,ฉันมีสอบใหญ่ในเดือนตุลาคม,Ich habe im Oktober eine große Prüfung.\r
พฤศจิกายน,November,phruetsachikayon,Nomen,"Zeit,A2",3,อากาศเย็นขึ้นในเดือนพฤศจิกายน,Im November wird es kühler.\r
ธันวาคม,Dezember,thanwakhom,Nomen,"Zeit,A2",3,เดือนธันวาคมมีบรรยากาศเทศกาล,Im Dezember ist Feststimmung.\r
คนต่างชาติ,Ausländer/in,khon tang chat,Nomen,"Personen,Nationalitäten,A1",3,เขาเป็นคนต่างชาติ,Er/Sie ist Ausländer/in.\r
บัตรเครดิต,Kreditkarte,bat khredit,Nomen,"Einkaufen,A2",4,คำนี้คือบัตรเครดิต,Ich zahle heute mit Kreditkarte.\r
ธนบัตร,Banknote,thanabat,Nomen,"Finanzen,A2",4,คำนี้คือธนบัตร,Ich habe nur noch einen Geldschein dabei.\r
เหรียญ,Münze,rian,Nomen,"Finanzen,A2",4,คำนี้คือเหรียญ,Für den Automaten brauche ich eine Münze.\r
เพลง,Lied,phleng,Nomen,"Medien,A2",4,คำนี้คือเพลง,Dieses Lied kenne ich schon.\r
ตรงไป,geradeaus gehen,trong pai,Verb,"Verkehr,A2",4,ฉันใช้คำว่าตรงไปบ่อย,Geh geradeaus bis zur Ampel.\r
เช่า,mieten,chao,Verb,"Finanzen,A2",4,ฉันใช้คำว่าเช่าบ่อย,Wir wollen nächstes Jahr eine Wohnung mieten.\r
มหาวิทยาลัย,Universität,mahawitthayalai,Nomen,"Bildung,A2",4,คำนี้คือมหาวิทยาลัย,Meine Schwester studiert an der Universität.\r
จน,arm,chon,Adjektiv,"Finanzen,A2",4,คำนี้คือจน,"Er ist nicht reich, aber auch nicht arm."\r
ส่วนลด,Rabatt,suan lot,Nomen,"Einkaufen,A2",4,คำนี้คือส่วนลด,Mit diesem Rabatt ist es viel günstiger.\r
หลงทาง,sich verirren,long thang,Verb,"Reisen,A2",4,เราอาจหลงทางในเมืองใหม่,Wir können uns in einer neuen Stadt verirren.\r
เปียก,nass,piak,Adjektiv,"Eigenschaften,A2",4,เสื้อผ้ายังเปียกอยู่,Die Kleidung ist noch nass.\r
เสีย,verdorben,sia,Adjektiv,"Essen,A2",4,มันเสีย,Es ist verdorben.\r
กลิ่น,Geruch,klin,Nomen,"Sinne,A2",4,นี่คือกลิ่น,Dieser Geruch erinnert mich an Kindheit.\r
รสชาติ,Geschmack,rotchat,Nomen,"Essen,A2",4,นี่คือรสชาติ,Der Geschmack ist heute besonders gut.\r
หมอก,Nebel,mok,Nomen,"Natur,A2",4,นี่คือหมอก,Am Morgen liegt dichter Nebel über der Straße.\r
อุณหภูมิ,Temperatur,unhaphum,Nomen,"Natur,A2",4,นี่คืออุณหภูมิ,Die Temperatur fällt heute Nacht stark.\r
ชื้น,feucht,chuen,Adjektiv,"Wetter,A2",4,มันชื้น,Es ist feucht.\r
ทะเลสาบ,See,thale sap,Nomen,"Natur,A2",4,นี่คือทะเลสาบ,Am See ist es am Abend sehr ruhig.\r
ถ้ำ,Höhle,tham,Nomen,"Natur,A2",4,นี่คือถ้ำ,In der Höhle ist es kühl und dunkel.\r
ทางด่วน,Autobahn,thang duan,Nomen,"Transport,A2",4,นี่คือทางด่วน,Über die Autobahn sind wir schneller angekommen.\r
ท่าเรือ,Hafen,tha ruea,Nomen,"Transport,A2",4,นี่คือท่าเรือ,Wir treffen uns am Hafen um acht.\r
ผู้โดยสาร,Passagier,phu doisan,Nomen,"Transport,A2",4,นี่คือผู้โดยสาร,Alle Passagiere müssen jetzt einsteigen.\r
อาหารเช้า,Frühstück,ahan chao,Nomen,"Essen,A2",4,ฉันกินอาหารเช้า,Ich esse Frühstück.\r
อาหารกลางวัน,Mittagessen,ahan klang wan,Nomen,"Essen,A2",4,ตอนเที่ยงฉันกินอาหารกลางวัน,Mittags esse ich Mittagessen.\r
อาหารเย็น,Abendessen,ahan yen,Nomen,"Essen,A2",4,เย็นนี้เรากินอาหารเย็นด้วยกัน,Heute Abend essen wir Abendessen zusammen.\r
ตรงเวลา,pünktlich,trong wela,Adjektiv,"Zeit,A2",4,เขามาถึงตรงเวลา,Er kommt pünktlich an.\r
กุญแจ,Schlüssel,gun-jae,Nomen,"Zuhause,A2",4,ฉันลืมกุญแจ,Ich habe den Schlüssel vergessen.\r
อินเทอร์เณ็ต,Internet,in-thoe-noet,Nomen,"Arbeit,A2",4,อินเทอร์เณ็ตเร็วมาก,Das Internet ist schnell.\r
ที่อยู่,Adresse,thii-yuu,Nomen,"Grundlagen,A2",4,ที่อยู่ของฉันสงครมหลายคุงเทพ,Meine Adresse ist in Bangkok.\r
โรงหนัง,Kino,rong-nang,Nomen,"Freizeit,A2",4,เราไปโรงหนังนั่ว,Lass uns heute ins Kino gehen.\r
สวนสาธารณะ,Park,suan-saa-thaa-ra-na,Nomen,"Reisen,A2",4,ป่สวนสาธารณะข่างหน้อยกี่คน,Der Park hat viele Bäume.\r
ห้องนั่งเล่น,Wohnzimmer,hong-nang-len,Nomen,"Zuhause,A2",4,เราดูทีวีหอในห้องนั่งเล่น,Wollen wir fernschauen im Wohnzimmer?\r
ห้องเรียน,Klassenzimmer,hong-rian,Nomen,"Bildung,A2",4,วัอะเมื่อจากห้องเรียน,Wann verlasse ich das Klassenzimmer?\r
สนามกีฬา,Sportplatz,sa-naam-gii-laa,Nomen,"Freizeit,A2",4,เราสำกลิกคนในสนามกีฬา,Lass uns auf dem Sportplatz Sport machen.\r
ของขวัญ,Geschenk,khong khwan,Nomen,"Soziales,A2",4,เขาให้ของขวัญวันเกิดฉัน,Er gibt mir ein Geburtstagsgeschenk.\r
กล้อง,Kamera,klong,Nomen,"Technik,A2",4,คำนี้คือกล้อง,Nimm die Kamera für den Ausflug mit.\r
ดนตรี,Musik,dontri,Nomen,"Medien,A2",4,คำนี้คือดนตรี,Musik hilft mir beim Lernen.\r
กีฬา,Sport,kila,Nomen,"Freizeit,A2",4,คำนี้คือกีฬา,Sport ist gut für die Gesundheit.\r
บัตรประชาชน,Ausweis,bat-pra-chaa-chon,Nomen,"Grundlagen,A2",4,ฉันต้องมีบัตรประชาชน,Ich brauche einen Ausweis.\r
ปัญหา,Problem,panha,Nomen,"Abstrakt,A2",4,คำนี้คือปัญหา,Das Problem lösen wir zusammen.\r
คำถาม,Frage,khamtham,Nomen,"Abstrakt,A2",4,คำนี้คือคำถาม,Hast du noch eine Frage?\r
คำตอบ,Antwort,khamtop,Nomen,"Abstrakt,A2",4,คำนี้คือคำตอบ,Die Antwort ist einfacher als gedacht.\r
นัดหมาย,Termin,nat-maai,Nomen,"Grundlagen,A2",4,ฉันมีนัดหมายวันพรุ่งนี้,Ich habe morgen einen Termin.\r
ข่าว,Nachrichten,khao,Nomen,"Medien,A2",4,คำนี้คือข่าว,Ich schaue jeden Abend die Nachrichten.\r
ภาษาเยอรมัน,Deutsch (Sprache),phaa-saa-yoe-ra-man,Nomen,"Bildung,A2",4,ฉันรักภาษาเยอรมัน,Ich liebe Deutsch.\r
น้ำตาล,braun,naam-taan,Adjektiv,"Grundlagen,A2",4,มันน้ำตาล,Es ist braun.\r
ชมพู,rosa,chom-phuu,Adjektiv,"Grundlagen,A2",4,มันชมพู,Es ist rosa.\r
เทา,grau,thao,Adjektiv,"Grundlagen,A2",4,มันเทา,Es ist grau.\r
เลี้ยวซ้าย,links abbiegen,liao sai,Verb,"Verkehr,A2",4,ฉันใช้คำว่าเลี้ยวซ้ายบ่อย,An der nächsten Kreuzung bieg links ab.\r
เลี้ยวขวา,rechts abbiegen,liao khwa,Verb,"Verkehr,A2",4,ฉันใช้คำว่าเลี้ยวขวาบ่อย,Nach dem Markt bieg rechts ab.\r
เริ่มต้น,anfangen,roem-ton,Verb,"Grundlagen,A2",4,ฉันเริ่มต้น,Ich fange an.\r
สำคัญ,wichtig,samkhan,Adjektiv,"Eigenschaften,A2",4,เรื่องนี้สำคัญมาก,Diese Sache ist sehr wichtig.\r
จำเป็น,notwendig,jampen,Adjektiv,"Eigenschaften,A2",4,การพักผ่อนเป็นสิ่งจำเป็น,Erholung ist notwendig.\r
ปลอดภัย,sicher,plodphai,Adjektiv,"Eigenschaften,A2",4,ย่านนี้ค่อนข้างปลอดภัย,Diese Gegend ist ziemlich sicher.\r
ทำกับข้าว,(Thai-)Gerichte kochen,tham-kap-khao,Verb,"Essen,A2",4,ฉันทำกับข้าว,Ich koche.\r
ลืม,vergessen,luem,Verb,"Verben,A2",4,ฉันลืมกุญแจที่บ้าน,Ich habe den Schlüssel zu Hause vergessen.\r
จำ,sich erinnern,jam,Verb,"Verben,A2",4,ฉันจำชื่อเขาได้,Ich erinnere mich an seinen Namen.\r
พบ,treffen,phop,Verb,"Grundlagen,A2",4,ฉันพบ,Ich treffe.\r
จำต้อง,müssen,jam tong,Modalverb,"Grammatik,A2",4,ฉันใช้คำว่าจำต้องบ่อย,Ich muss heute leider länger arbeiten.\r
อธิบาย,erklären,athibai,Verb,"Verben,A2",4,ครูอธิบายบทเรียนชัดเจน,Der Lehrer erklärt die Lektion klar.\r
แนะนำ,empfehlen/vorstellen,nae-nam,Verb,"Grundlagen,A2",4,ฉันแนะนำ,Ich empfehle/stelle vor.\r
เตรียม,vorbereiten,triam,Verb,"Grundlagen,A2",4,ฉันเตรียม,Ich bereite vor.\r
เยี่ยม,besuchen,yiam,Verb,"Grundlagen,A2",4,ฉันเยี่ยม,Ich besuche.\r
โทรกลับ,zurückrufen,tho-klap,Verb,"Telefon,A2",4,ฉันโทรกลับ,Ich rufe zurück.\r
ส่งข้อความ,Nachricht senden,song-kho-khwaam,Verb,"Telefon,A2",4,ฉันส่งข้อความ,Ich sende eine Nachricht.\r
ถ่ายเอกสาร,kopieren,thaai-eek-ka-saan,Verb,"Arbeit,A2",4,ฉันถ่ายเอกสาร,Ich kopiere.\r
ซ่อมแซม,reparieren,somsaem,Verb,"Haus,A2",4,ฉันใช้คำว่าซ่อมแซมบ่อย,Er repariert heute den kaputten Stuhl.\r
ชำระเงิน,eine Zahlung leisten / begleichen,cham-ra-ngoen,Verb,"Einkaufen,A2",4,ฉันชำระเงิน,Ich bezahle.\r
ขึ้นรถ,einsteigen,khuen-rot,Verb,"Reisen,A2",4,ฉันขึ้นรถ,Ich steige ein.\r
ลงรถ,aussteigen,long-rot,Verb,"Reisen,A2",4,ฉันลงรถ,Ich steige aus.\r
เปลี่ยน,wechseln,plian,Verb,"Grundlagen,A2",4,ฉันเปลี่ยน,Ich wechsle.\r
ย้าย,umziehen/versetzen,yaai,Verb,"Grundlagen,A2",4,ฉันย้าย,Ich ziehe um/versetze.\r
เริ่มเรียน,anfangen zu lernen,roem-rian,Verb,"Bildung,A2",4,ฉันเริ่มเรียน,Ich fange an zu lernen.\r
หยุดพัก,Pause machen,yut-phak,Verb,"Arbeit,A2",4,ฉันหยุดพัก,Ich mache Pause.\r
พร้อม,bereit,phrom,Adjektiv,"Grundlagen,A2",4,มันพร้อม,Es ist bereit.\r
จริง,echt/wirklich,jing,Adjektiv,"Grundlagen,A2",4,มันจริง,Es ist echt/wirklich.\r
เร็วๆนี้,bald,reo-reo-nii,Adverb,"Grundlagen,A2",4,เร็วๆนี้,bald\r
ช้าๆ,langsam (bitte),chaa-chaa,Adverb,"Grundlagen,A2",4,ช้าๆ,langsam (bitte)\r
โต๊ะทำงาน,Schreibtisch,to-tham-ngaan,Nomen,"Arbeit,A2",4,โต๊ะทำงานของฉันสะอาด,Mein Schreibtisch ist sauber.\r
คีย์บอร์ด,Tastatur,khii-bot,Nomen,"Arbeit,A2",4,ฉันพิมพ์ด้วยคีย์บอร์ด,Ich tippe mit der Tastatur.\r
เมาส์,Maus (PC),mao,Nomen,"Arbeit,A2",4,เมาส์ไม่ทำงาน,Die Maus funktioniert nicht.\r
หน้าจอ,Bildschirm,na jo,Nomen,"Technik,A2",4,คำนี้คือหน้าจอ,Der Bildschirm ist zu dunkel eingestellt.\r
เครื่องพิมพ์,Drucker,khrueang-phim,Nomen,"Arbeit,A2",4,เครื่องพิมพ์เสีย,Der Drucker ist kaputt.\r
ปลั๊กไฟ,Steckdose,plak fai,Nomen,"Haus,A2",4,คำนี้คือปลั๊กไฟ,Die Steckdose ist hinter dem Schrank.\r
สายชาร์จ,Ladekabel,sai chat,Nomen,"Technik,A2",4,คำนี้คือสายชาร์จ,Wo ist mein Ladekabel geblieben?\r
แบตเตอรี่,Batterie,baettoeri,Nomen,"Technik,A2",4,คำนี้คือแบตเตอรี่,Die Batterie ist fast leer.\r
หม้อ,Topf,mo,Nomen,"Haushalt,A2",4,คำนี้คือหม้อ,Die Suppe kocht im Topf seit zehn Minuten.\r
กระทะ,Pfanne,kratha,Nomen,"Haushalt,A2",4,คำนี้คือกระทะ,Brate das Gemüse in der Pfanne kurz an.\r
ร้านสะดวกซื้อ,Minimarkt,raan-sa-duak-sue,Nomen,"Einkaufen,A2",4,ร้านสะดวกซื้ออยู่ตรงนี้,Der Minimarkt ist gleich hier.\r
โรงพัก,Polizeiwache,rong-phak,Nomen,"Grundlagen,A2",4,โรงพักอยู่ไกล,Die Polizeiwache ist weit weg.\r
พิพิธภัณฑ์,Museum,phiphitthaphan,Nomen,"Kultur,A2",4,คำนี้คือพิพิธภัณฑ์,Am Sonntag besuchen wir ein Museum.\r
ห้องสมุด,Bibliothek,hong samut,Nomen,"Bildung,A2",4,คำนี้คือห้องสมุด,In der Bibliothek ist es ruhig.\r
สระว่ายน้ำ,Schwimmbad/Pool,sa-waai-nam,Nomen,"Freizeit,A2",4,สระว่ายน้ำเปิดวันจันทร์,Das Schwimmbad ist montags geöffnet.\r
ส้มตำ,Papayasalat,som-tam,Nomen,"Essen,A2",4,ส้มตำเผ็ด,Der Papayasalat ist scharf.\r
พริก,Chili,phrik,Nomen,"Essen,A2",4,พริกแดง,Die Chili ist rot.\r
กระเทียม,Knoblauch,kra-thiam,Nomen,"Essen,A2",4,กระเทียมร้อน,Knoblauch ist warm.\r
หัวหอม,Zwiebel,hua-hom,Nomen,"Essen,A2",4,หัวหอมอ่อน,Die Zwiebel ist zart.\r
ข้าวโพด,Mais,khao-phot,Nomen,"Essen,A2",4,ข้าวโพดนุ่ม,Mais ist zart.\r
เสื้อกันฝน,Regenjacke,suea-kan-fon,Nomen,"Kleidung,A2",4,เสื้อกันฝนสีเขียว,Die Regenjacke ist grün.\r
กาต้มน้ำ,Wasserkocher,ka tom nam,Nomen,"Haushalt,A2",4,คำนี้คือกาต้มน้ำ,Der Wasserkocher ist schon heiß.\r
ผ้าปูที่นอน,Bettlaken,pha pu thi non,Nomen,"Haushalt,A2",4,ฉันซักผ้าปูที่นอนทุกสัปดาห์,Ich wasche das Bettlaken jede Woche.\r
สำรอง,reservieren/Reserve,samrong,Verb,"Reisen,A2",4,ฉันสำรองห้องพักล่วงหน้า,Ich reserviere das Zimmer im Voraus.\r
เลื่อน,verschieben,luean,Verb,"Zeit,A2",4,เราต้องเลื่อนการประชุม,Wir müssen das Treffen verschieben.\r
ยกเลิก,stornieren,yok loek,Verb,"Reisen,A2",4,ฉันต้องยกเลิกการจอง,Ich muss die Buchung stornieren.\r
ล่าช้า,verspätet,la cha,Adjektiv,"Reisen,A2",4,รถไฟมาล่าช้า,Der Zug ist verspätet.\r
แนะนำทาง,den Weg weisen,naenam thang,Verb,"Reisen,A2",4,เขาแนะนำทางไปโรงแรม,Er zeigt den Weg zum Hotel.\r
ใบไม้,Blatt,bai mai,Nomen,"Natur,A2",4,ใบไม้ร่วงเต็มสวน,Die Blätter fallen im ganzen Garten.\r
ต้นไม้,Baum,ton mai,Nomen,"Natur,A2",4,หน้าบ้านมีต้นไม้ใหญ่,Vor dem Haus steht ein großer Baum.\r
ดอกไม้,Blume,dok mai,Nomen,"Natur,A2",4,เธอซื้อดอกไม้ให้แม่,Sie kauft Blumen für ihre Mutter.\r
หญ้า,Gras,ya,Nomen,"Natur,A2",4,เด็ก ๆ วิ่งบนหญ้า,Die Kinder laufen über das Gras.\r
เมล็ด,Samen,malet,Nomen,"Natur,A2",4,เราปลูกต้นไม้จากเมล็ด,Wir pflanzen einen Baum aus Samen.\r
สวนสัตว์,Zoo,suan sat,Nomen,"Orte,A2",4,วันอาทิตย์เราไปสวนสัตว์,Am Sonntag gehen wir in den Zoo.\r
ปลาโลมา,Delfin,pla loma,Nomen,"Tiere,A2",4,เด็กชอบดูปลาโลมา,Kinder sehen gerne Delfine.\r
เต่า,Schildkröte,tao,Nomen,"Tiere,A2",4,เต่าเดินช้ามาก,Die Schildkröte läuft sehr langsam.\r
กระต่าย,Kaninchen,kratai,Nomen,"Tiere,A2",4,กระต่ายกินแครอท,Das Kaninchen frisst Karotten.\r
ไก่งวง,Truthahn,kai nguang,Nomen,"Tiere,A2",4,ในฟาร์มมีไก่งวงหลายตัว,Auf dem Bauernhof gibt es viele Truthähne.\r
เป็ด,Ente,pet,Nomen,"Tiere,A2",4,เป็ดว่ายน้ำในบ่อ,Die Ente schwimmt im Teich.\r
ไก่ชน,Kampfhahn,kai chon,Nomen,"Tiere,A2",4,เขาเลี้ยงไก่ชนที่บ้าน,Er hält zu Hause Kampfhähne.\r
ผีเสื้อ,Schmetterling,phi suea,Nomen,"Tiere,A2",4,ผีเสื้อบินรอบดอกไม้,Der Schmetterling fliegt um die Blumen.\r
ยุง,Mücke,yung,Nomen,"Tiere,A2",4,ตอนกลางคืนมียุงเยอะมาก,Nachts gibt es sehr viele Mücken.\r
แมลงวัน,Fliege,maelang wan,Nomen,"Tiere,A2",4,แมลงวันบินเข้าครัว,Eine Fliege fliegt in die Küche.\r
มด,Ameise,mot,Nomen,"Tiere,A2",4,มดเดินเป็นแถวบนโต๊ะ,Die Ameisen laufen in einer Reihe über den Tisch.\r
ผึ้ง,Biene,phueng,Nomen,"Tiere,A2",4,ผึ้งบินรอบดอกไม้,Die Biene fliegt um die Blumen.\r
แมงมุม,Spinne,maengmum,Nomen,"Tiere,A2",4,มีแมงมุมอยู่ที่มุมห้อง,In der Ecke ist eine Spinne.\r
จระเข้,Krokodil,jorakhe,Nomen,"Tiere,A2",4,จระเข้ว่ายน้ำช้ามาก,Das Krokodil schwimmt sehr langsam.\r
ค้างคาว,Fledermaus,khangkhaw,Nomen,"Tiere,A2",4,ตอนเย็นเห็นค้างคาวบิน,Am Abend sieht man Fledermäuse fliegen.\r
ขยะ,Müll,khaya,Nomen,"Natur,A2",4,กรุณาทิ้งขยะลงถัง,Bitte wirf den Müll in den Eimer.\r
มลพิษ,Verschmutzung,monlapit,Nomen,"Natur,A2",4,เมืองใหญ่มีมลพิษมาก,In Großstädten gibt es viel Verschmutzung.\r
สิ่งแวดล้อม,Umwelt,singwaetlom,Nomen,"Natur,A2",4,เราต้องดูแลสิ่งแวดล้อม,Wir müssen die Umwelt schützen.\r
โยน,werfen,yon,Verb,"Verben,A2",4,อย่าโยนขวดลงพื้น,Wirf die Flasche nicht auf den Boden.\r
จับ,fangen/greifen,chap,Verb,"Verben,A2",4,เด็กพยายามจับลูกบอล,"Das Kind versucht, den Ball zu fangen."\r
ปล่อย,loslassen,ploi,Verb,"Verben,A2",4,ค่อย ๆ ปล่อยมือ,Lass langsam los.\r
ช่วยเหลือ,helfen/unterstützen,chuai luea,Verb,"Verben,A2",4,เพื่อนช่วยเหลือฉันมาก,Ein Freund unterstützt mir sehr.\r
เชื่อ,glauben,chuea,Verb,"Verben,A2",4,ฉันเชื่อคำพูดของเขา,Ich glaube seinen Worten.\r
สงสัย,sich wundern/zweifeln,songsai,Verb,"Verben,A2",4,ฉันสงสัยว่าทำไมเขามาช้า,"Ich frage mich, warum er spät kommt."\r
ป้องกัน,schützen,pongkan,Verb,"Verben,A2",4,หน้ากากช่วยป้องกันฝุ่น,Eine Maske schützt vor Staub.\r
เตือน,warnen/erinnern,tuean,Verb,"Verben,A2",4,ช่วยเตือนฉันพรุ่งนี้,Bitte erinnere mich morgen daran.\r
เงียบ,leise/ruhig,ngiap,Adjektiv,"Eigenschaften,A2",4,ห้องนี้เงียบมาก,Dieses Zimmer ist sehr ruhig.\r
ดัง,laut,dang,Adjektiv,"Eigenschaften,A2",4,เพลงนี้ดังเกินไป,Dieses Lied ist zu laut.\r
พิเศษ,besonders,phiset,Adjektiv,"Eigenschaften,A2",4,วันนี้มีเมนูพิเศษ,Heute gibt es ein besonderes Menü.\r
ธรรมดา,gewöhnlich,thammada,Adjektiv,"Eigenschaften,A2",4,วันนี้เป็นวันธรรมดา,Heute ist ein gewöhnlicher Tag.\r
สะดวก,bequem,saduak,Adjektiv,"Eigenschaften,A2",4,รถไฟฟ้าสะดวกมาก,Die U-Bahn ist sehr praktisch.\r
อันตราย,gefährlich,antarai,Adjektiv,"Eigenschaften,A2",4,ถนนนี้อันตรายตอนกลางคืน,Diese Straße ist nachts gefährlich.\r
เรียบร้อย,ordentlich/fertig,riaproi,Adjektiv,"Eigenschaften,A2",4,งานเสร็จเรียบร้อยแล้ว,Die Arbeit ist ordentlich fertig.\r
นก,Vogel,nok,Nomen,"Tiere,A2",5,นกร้องเพลง,Der Vogel singt.\r
วัว,Kuh,wua,Nomen,"Tiere,A2",5,วัวกินหญ้า,Die Kuh isst Gras.\r
ดีใจ,froh,dii-jai,Adjektiv,"Grundlagen,A2",5,มันดีใจ,Es ist froh.\r
เสียใจ,traurig,sia-jai,Adjektiv,"Grundlagen,A2",5,มันเสียใจ,Es ist traurig.\r
กังวล,besorgt,kang-won,Adjektiv,"Grundlagen,A2",5,มันกังวล,Es ist besorgt.\r
ขอหน่อย,bitte (kurz),kho-noi,Phrase,"Grundlagen,A2",5,ขอหน่อย,bitte (kurz)\r
ไปทางไหน,wo geht's lang?,pai-thaang-nai,Phrase,"Reisen,A2",5,ไปทางไหน,wo geht's lang?\r
ฉันเข้าใจแล้ว,ich habe verstanden,chan-khao-jai-laeo,Phrase,"Grundlagen,A2",5,ฉันเข้าใจแล้ว,ich habe verstanden\r
พูดช้าๆ,bitte langsam sprechen,phuut-chaa-chaa,Phrase,"Grundlagen,A2",5,พูดช้าๆ,bitte langsam sprechen\r
สิบเอ็ด,elf,sip-et,Zahl,"Grundlagen,A2",5,สิบเอ็ด,elf\r
สิบสอง,zwölf,sip-song,Zahl,"Grundlagen,A2",5,สิบสอง,zwölf\r
สิบสาม,dreizehn,sip-saam,Zahl,"Grundlagen,A2",5,สิบสาม,dreizehn\r
สิบสี่,vierzehn,sip-sii,Zahl,"Grundlagen,A2",5,สิบสี่,vierzehn\r
สิบห้า,fünfzehn,sip-haa,Zahl,"Grundlagen,A2",5,สิบห้า,fünfzehn\r
สิบหก,sechzehn,sip-hok,Zahl,"Grundlagen,A2",5,สิบหก,sechzehn\r
สิบเจ็ด,siebzehn,sip-jet,Zahl,"Grundlagen,A2",5,สิบเจ็ด,siebzehn\r
สิบแปด,achtzehn,sip-paet,Zahl,"Grundlagen,A2",5,สิบแปด,achtzehn\r
สิบเก้า,neunzehn,sip-gao,Zahl,"Grundlagen,A2",5,สิบเก้า,neunzehn\r
สามสิบ,dreißig,saam-sip,Zahl,"Grundlagen,A2",5,สามสิบ,dreißig\r
สี่สิบ,vierzig,sii-sip,Zahl,"Grundlagen,A2",5,สี่สิบ,vierzig\r
ห้าสิบ,fünfzig,haa-sip,Zahl,"Grundlagen,A2",5,ห้าสิบ,fünfzig\r
หกสิบ,sechzig,hok-sip,Zahl,"Grundlagen,A2",5,หกสิบ,sechzig\r
เจ็ดสิบ,siebzig,jet-sip,Zahl,"Grundlagen,A2",5,เจ็ดสิบ,siebzig\r
แปดสิบ,achtzig,paet-sip,Zahl,"Grundlagen,A2",5,แปดสิบ,achtzig\r
เก้าสิบ,neunzig,gao-sip,Zahl,"Grundlagen,A2",5,เก้าสิบ,neunzig\r
หนึ่งร้อย,hundert,nueng-roi,Zahl,"Grundlagen,A2",5,หนึ่งร้อย,hundert\r
สองร้อย,zweihundert,song-roi,Zahl,"Grundlagen,A2",5,สองร้อย,zweihundert\r
พันหนึ่ง,eintausend (ausgeschriebene Form),phan-nueng,Zahl,"Grundlagen,A2",5,พันหนึ่ง,tausend\r
เหนือ,Norden,nuea,Nomen,"Reisen,A2",5,ไปเหนือกันได้ไหม,Können wir in den Norden gehen?\r
ใต้,Süden,tai,Nomen,"Reisen,A2",5,ใต้ร้อน,Der Süden ist heiß.\r
ตะวันออก,Osten,ta-wan-ok,Nomen,"Reisen,A2",5,ตะวันออกไกล,Der Osten ist weit weg.\r
ตะวันตก,Westen,ta-wan-tok,Nomen,"Reisen,A2",5,ตะวันตกสวย,Der Westen ist schön.\r
ข้างหน้า,vorne,khaang-naa,Nomen,"Reisen,A2",5,มีรถข้างหน้า,Es gibt ein Auto vorne.\r
ข้างหลัง,hinten,khaang-lang,Nomen,"Reisen,A2",5,นั่งข้างหลัง,Hinten sitzen.\r
ลมแรง,starker Wind,lom-raeng,Phrase,"Wetter,A2",5,ลมแรง,starker Wind\r
ข้าวสวย,Reis (gekocht),khao-suay,Nomen,"Essen,A2",5,ข้าวสวยอร่อย,Der Reis ist lecker.\r
เส้น,Nudeln (allg.),sen,Nomen,"Essen,A2",5,เส้นนุ่ม,Die Nudeln sind weich.\r
หมี่,Nudeln (thin),mii,Nomen,"Essen,A2",5,หมี่ทำเร็ว,Nudeln gehen schnell zu machen.\r
แครอท,Karotte,khrae-rot,Nomen,"Essen,A2",5,แครอทส้ม,Die Karotte ist orange.\r
ขิง,Ingwer,khing,Nomen,"Essen,A2",5,ขิงร้อน,Ingwer ist warm.\r
ใบกะเพรา,Thai-Basilikum,bai-ga-phrao,Nomen,"Essen,A2",5,ใบกะเพราว่า,Thai-Basilikum aromatisch.\r
น้ำชา,Tee (Getränk),nam-chaa,Nomen,"Essen,A2",5,น้ำชาร้อน,Tee ist heiß.\r
ยาแก้ปวด,Schmerzmittel,yaa-kae-puat,Nomen,"Gesundheit,A2",5,ฉันต้องยาแก้ปวด,Ich brauche Schmerzmittel.\r
แพ้,allergisch sein,phae,Verb,"Gesundheit,A2",5,ฉันแพ้,Ich allergisch sein.\r
อาการ,Symptom,aa-gaan,Nomen,"Gesundheit,A2",5,อาการเป็นไง,Wie sind die Symptome?\r
นัดหมอ,Arzttermin,nat-mo,Nomen,"Gesundheit,A2",5,ฉันมีนัดหมอ,Ich habe einen Arzttermin.\r
ห้องประชุม,Besprechungsraum,hong-pra-chum,Nomen,"Arbeit,A2",5,ห้องประชุมสะอาด,Der Besprechungsraum ist sauber.\r
ไฟล์,Datei,fai,Nomen,"Arbeit,A2",5,เปิดไฟล์นี้,Öffne diese Datei.\r
แพ็ก,Packung,phaek,Nomen,"Einkaufen,A2",5,คำนี้คือแพ็ก,Nimm bitte eine Packung Milch mit.\r
ขนาด,Größe,kha-naat,Nomen,"Einkaufen,A2",5,ขนาด S ได้ไหม,Hast du Größe S?\r
สีไหน,welche Farbe,sii-nai,Phrase,"Einkaufen,A2",5,สีไหน,welche Farbe\r
ลองได้ไหม,kann ich probieren?,long-dai-mai,Phrase,"Einkaufen,A2",5,ลองได้ไหม,kann ich probieren?\r
ห้องเดี่ยว,Einzelzimmer,hong-diao,Nomen,"Reisen,A2",5,หนึ่งห้องเดี่ยว,"Ein Einzelzimmer, bitte."\r
ใกล้เคียง,ähnlich,klai khiang,Adjektiv,"Eigenschaften,A2",5,สองคำนี้ความหมายใกล้เคียงกัน,Diese zwei Wörter haben eine ähnliche Bedeutung.\r
แตกต่าง,unterschiedlich,taek tang,Adjektiv,"Eigenschaften,A2",5,สองแบบนี้แตกต่างกันมาก,Diese zwei Varianten sind sehr unterschiedlich.\r
แทบจะ,fast/beinahe,thaep ja,Adverb,"Zeit,A2",5,ฉันแทบจะลืมกุญแจ,Ich hätte beinahe den Schlüssel vergessen.\r
อารมณ์,Stimmung,arom,Nomen,"Gefühle,A2",5,วันนี้อารมณ์ของเขาไม่ค่อยดี,Seine Stimmung ist heute nicht so gut.\r
ความสุข,Glück,khwamsuk,Nomen,"Gefühle,A2",5,ความสุขของฉันคือครอบครัว,Mein Glück ist meine Familie.\r
ความเศร้า,Traurigkeit,khwam sao,Nomen,"Gefühle,A2",5,เธอพยายามซ่อนความเศร้า,Sie versucht ihre Traurigkeit zu verbergen.\r
ความรัก,Liebe,khwam rak,Nomen,"Gefühle,A2",5,ความรักทำให้คนเข้มแข็ง,Liebe macht Menschen stark.\r
ความหวัง,Hoffnung,khwam wang,Nomen,"Gefühle,A2",5,เรายังมีความหวัง,Wir haben noch Hoffnung.\r
ความฝัน,Traum,khwam fan,Nomen,"Gefühle,A2",5,ความฝันของฉันคือการเดินทางรอบโลก,Mein Traum ist eine Weltreise.\r
ความลับ,Geheimnis,khwam lap,Nomen,"Gefühle,A2",5,นี่เป็นความลับระหว่างเรา,Das bleibt ein Geheimnis zwischen uns.\r
มิตรภาพ,Freundschaft,mittraphap,Nomen,"Soziales,A2",5,มิตรภาพของเราแน่นแฟ้นมาก,Unsere Freundschaft ist sehr stark.\r
ศัตรู,Feind,satru,Nomen,"Soziales,A2",5,เขาไม่อยากมีศัตรู,Er will keine Feinde haben.\r
คนรัก,Partner/in,khon rak,Nomen,"Soziales,A2",4,เขาไปเที่ยวกับคนรักของเขา,Er reist mit seiner Partnerin.\r
นัด,Termin/Verabredung,nat,Nomen,"Soziales,A2",4,พรุ่งนี้ฉันมีนัดกับหมอ,Morgen habe ich einen Termin beim Arzt.\r
ปาร์ตี้,Party,pati,Nomen,"Soziales,A2",4,คืนนี้เราจะไปปาร์ตี้กัน,Heute Abend gehen wir auf eine Party.\r
เชิญ,einladen,choen,Verb,"Soziales,A2",4,ฉันจะเชิญเพื่อนมาที่บ้าน,Ich werde Freunde nach Hause einladen.\r
อวยพร,gratulieren/wünschen,uai phon,Verb,"Soziales,A2",4,ทุกคนอวยพรวันเกิดให้เธอ,Alle gratulieren ihr zum Geburtstag.\r
ขอบใจ,danke (informell),khop chai,Interjektion,"Soziales,A2",4,ขอบใจมากที่ช่วยฉัน,"Danke dir, dass du mir geholfen hast."\r
ยินดีต้อนรับ,willkommen,yin di ton rap,Interjektion,"Soziales,A2",4,ยินดีต้อนรับสู่บ้านของเรา,Willkommen in unserem Zuhause.\r
สุภาพ,höflich,suphap,Adjektiv,"Soziales,A2",4,เธอพูดอย่างสุภาพมาก,Sie spricht sehr höflich.\r
ใจดี,nett,jai di,Adjektiv,"Soziales,A2",4,ครูคนนี้ใจดีมาก,Diese Lehrerin ist sehr nett.\r
ใจร้าย,gemein,jai rai,Adjektiv,"Soziales,A2",4,อย่าใจร้ายกับน้อง,Sei nicht gemein zum Jüngeren.\r
ขี้อาย,schüchtern,khi ai,Adjektiv,"Soziales,A2",4,เขาขี้อายนิดหน่อย,Er ist etwas schüchtern.\r
มั่นใจ,selbstsicher,manchai,Adjektiv,"Soziales,A2",4,เธอดูมั่นใจเวลาพูด,Sie wirkt beim Sprechen selbstsicher.\r
ซื่อสัตย์,ehrlich,suesat,Adjektiv,"Soziales,A2",4,ฉันชอบคนที่ซื่อสัตย์,Ich mag ehrliche Menschen.\r
ขยัน,fleißig,khayan,Adjektiv,"Soziales,A2",4,เขาเป็นนักเรียนที่ขยันมาก,Er ist ein sehr fleißiger Schüler.\r
สุดสัปดาห์,Wochenende,sut sapda,Nomen,"Zeit,A2",4,สุดสัปดาห์นี้เราไปต่างจังหวัด,Dieses Wochenende fahren wir aus der Stadt.\r
ครึ่ง,Hälfte,khrueng,Nomen,"Zeit,A2",4,แบ่งเค้กให้ฉันครึ่งหนึ่ง,Gib mir die Hälfte des Kuchens.\r
ช่วง,Zeitraum,chuang,Nomen,"Zeit,A2",5,ช่วงนี้ฉันงานเยอะมาก,In diesem Zeitraum habe ich sehr viel Arbeit.\r
ลำดับ,Reihenfolge,lamdap,Nomen,"Zeit,A2",5,กรุณาพูดตามลำดับ,Bitte sprich der Reihenfolge nach.\r
ภายหลัง,später/nachher,phai lang,Adverb,"Zeit,A2",5,เราค่อยคุยกันภายหลัง,Wir sprechen später darüber.\r
ในที่สุด,schließlich,nai thisut,Adverb,"Zeit,A2",5,ในที่สุดเขาก็มาถึง,Schließlich ist er angekommen.\r
ประมาณ,ungefähr,praman,Adverb,"Zeit,A2",5,ฉันจะถึงประมาณหกโมง,Ich komme ungefähr um sechs an.\r
ค่อนข้าง,ziemlich,khon khang,Adverb,"Grammatik,A2",5,งานนี้ค่อนข้างยาก,Diese Aufgabe ist ziemlich schwer.\r
ทีละ,jeweils/einer nach dem anderen,thi la,Adverb,"Grammatik,A2",5,กรุณาเข้าทีละคน,Bitte kommt einer nach dem anderen hinein.\r
ต่างกัน,verschieden sein,tang kan,Verb,"Grammatik,A2",5,สองคำนี้ต่างกันนิดหน่อย,Die zwei Wörter sind etwas verschieden.\r
อีกครั้ง,noch einmal,ik khrang,Adverb,"Grammatik,A2",5,คำนี้คืออีกครั้ง,Kannst du das bitte noch einmal sagen?\r
ทัน,rechtzeitig schaffen,than,Verb,"Grammatik,A2",5,ฉันใช้คำว่าทันบ่อย,"Wir müssen uns beeilen, damit wir rechtzeitig ankommen."\r
ภาพยนตร์,Film,phapphayon,Nomen,"Medien,A2",5,คำนี้คือภาพยนตร์,Am Wochenende schauen wir einen Film.\r
ละคร,Drama/Serie,lakhon,Nomen,"Medien,A2",5,คำนี้คือละคร,Sie sieht jeden Abend eine Serie.\r
รูปภาพ,Bild,rupphap,Nomen,"Medien,A2",5,คำนี้คือรูปภาพ,Abends sprechen wir über Bild.\r
หูฟัง,Kopfhörer,hu fang,Nomen,"Technik,A2",5,คำนี้คือหูฟัง,Mit Kopfhörern kann ich besser lernen.\r
ลำโพง,Lautsprecher,lamphong,Nomen,"Technik,A2",5,คำนี้คือลำโพง,Der Lautsprecher ist zu laut eingestellt.\r
ปุ่ม,Knopf/Taste,pum,Nomen,"Technik,A2",5,คำนี้คือปุ่ม,Drück bitte die richtige Taste.\r
คลิก,klicken,khlik,Verb,"Technik,A2",5,ฉันใช้คำว่าคลิกบ่อย,Klick bitte auf diesen Link.\r
บันทึก,speichern/aufzeichnen,banthuek,Verb,"Technik,A2",5,ฉันใช้คำว่าบันทึกบ่อย,"Vergiss nicht, die Datei zu speichern."\r
ลบ,löschen,lop,Verb,"Technik,A2",5,ฉันใช้คำว่าลบบ่อย,Lösch bitte die alte Version.\r
แก้ไข,bearbeiten/korrigieren,kaekhai,Verb,"Technik,A2",5,ฉันใช้คำว่าแก้ไขบ่อย,Ich muss den Text noch korrigieren.\r
ค้นหา,suchen,khonha,Verb,"Technik,A2",5,ฉันใช้คำว่าค้นหาบ่อย,Such bitte die Information im Internet.\r
แชร์,teilen,chae,Verb,"Technik,A2",5,ฉันใช้คำว่าแชร์บ่อย,Teile den Link mit der Gruppe.\r
ฟุตบอล,Fußball,futbon,Nomen,"Freizeit,A2",5,คำนี้คือฟุตบอล,Am Wochenende spielen wir Fußball.\r
วอลเลย์บอล,Volleyball,wolleibon,Nomen,"Freizeit,A2",5,คำนี้คือวอลเลย์บอล,In der Schule spielen sie Volleyball.\r
บาสเกตบอล,Basketball,basketbon,Nomen,"Freizeit,A2",5,คำนี้คือบาสเกตบอล,Mein Bruder trainiert Basketball.\r
ว่ายน้ำ,schwimmen,wai nam,Verb,"Freizeit,A2",5,ฉันใช้คำว่าว่ายน้ำบ่อย,Im Sommer gehe ich oft schwimmen.\r
เดินเล่น,spazieren,doen len,Verb,"Freizeit,A2",5,ฉันใช้คำว่าเดินเล่นบ่อย,Nach dem Essen gehen wir spazieren.\r
ปีนเขา,wandern/bergsteigen,pin khao,Verb,"Freizeit,A2",5,ฉันใช้คำว่าปีนเขาบ่อย,Im Urlaub gehen wir in den Bergen wandern.\r
ตั้งแคมป์,campen,tang khaemp,Verb,"Freizeit,A2",5,ฉันใช้คำว่าตั้งแคมป์บ่อย,Im Sommer gehen wir oft campen.\r
ตกปลา,angeln,tok pla,Verb,"Freizeit,A2",5,ฉันใช้คำว่าตกปลาบ่อย,Mein Vater geht am Wochenende angeln.\r
วาดรูป,zeichnen,wat rup,Verb,"Freizeit,A2",5,ฉันใช้คำว่าวาดรูปบ่อย,Das Kind zeichnet jeden Nachmittag.\r
ระบายสี,ausmalen,rabai si,Verb,"Freizeit,A2",5,ฉันใช้คำว่าระบายสีบ่อย,Sie malt das Bild mit Buntstiften aus.\r
อ่านหนังสือพิมพ์,Zeitung lesen,an nangsue phim,Verb,"Freizeit,A2",5,ฉันใช้คำว่าอ่านหนังสือพิมพ์บ่อย,Mein Opa liest morgens die Zeitung.\r
ฟังเพลง,Musik hören,fang phleng,Verb,"Freizeit,A2",5,ฉันใช้คำว่าฟังเพลงบ่อย,Beim Arbeiten höre ich gerne Musik.\r
เต้นรำ,tanzen,ten ram,Verb,"Freizeit,A2",5,ฉันใช้คำว่าเต้นรำบ่อย,Auf der Party tanzen alle zusammen.\r
ทำสวน,gärtnern,tham suan,Verb,"Freizeit,A2",5,ฉันใช้คำว่าทำสวนบ่อย,Am Sonntag gärtnert meine Mutter im Hof.\r
สะสม,sammeln,sasom,Verb,"Freizeit,A2",5,ฉันใช้คำว่าสะสมบ่อย,Er sammelt alte Münzen.\r
เกม,Spiel,kem,Nomen,"Freizeit,A2",5,คำนี้คือเกม,Am Wochenende geht es oft um Spiel.\r
ของเล่น,Spielzeug,khong len,Nomen,"Freizeit,A2",5,คำนี้คือของเล่น,Am Wochenende geht es oft um Spielzeug.\r
เหตุผล,Grund,hetphon,Nomen,"Abstrakt,A2",5,คำนี้คือเหตุผล,Im Unterricht diskutieren wir über Grund.\r
ผลลัพธ์,Ergebnis,phonlup,Nomen,"Abstrakt,A2",5,คำนี้คือผลลัพธ์,Im Unterricht diskutieren wir über Ergebnis.\r
ความคิด,Gedanke,khwamkhit,Nomen,"Abstrakt,A2",5,คำนี้คือความคิด,Im Unterricht diskutieren wir über Gedanke.\r
โอกาส,Gelegenheit,okat,Nomen,"Abstrakt,A2",5,คำนี้คือโอกาส,Im Unterricht diskutieren wir über Gelegenheit.\r
แผน,Plan,phaen,Nomen,"Abstrakt,A2",5,คำนี้คือแผน,Im Unterricht diskutieren wir über Plan.\r
เป้าหมาย,Ziel,paomai,Nomen,"Abstrakt,A2",5,คำนี้คือเป้าหมาย,Mein Ziel ist ein besseres Thai.\r
อนาคต,Zukunft,anakhot,Nomen,"Abstrakt,A2",5,คำนี้คืออนาคต,Wir planen für die Zukunft.\r
อดีต,Vergangenheit,adit,Nomen,"Abstrakt,A2",5,คำนี้คืออดีต,Über die Vergangenheit spricht er selten.\r
ปัจจุบัน,Gegenwart,patchuban,Nomen,"Abstrakt,A2",5,คำนี้คือปัจจุบัน,Im Moment zählt die Gegenwart.\r
ตัวอย่าง,Beispiel,tuayang,Nomen,"Abstrakt,A2",5,คำนี้คือตัวอย่าง,Im Unterricht diskutieren wir über Beispiel.\r
วิธี,Methode,withi,Nomen,"Abstrakt,A2",5,คำนี้คือวิธี,Im Unterricht diskutieren wir über Methode.\r
กฎ,Regel,kot,Nomen,"Abstrakt,A2",5,คำนี้คือกฎ,Im Unterricht diskutieren wir über Regel.\r
สิทธิ,Recht,sitthi,Nomen,"Abstrakt,A2",5,คำนี้คือสิทธิ,Im Unterricht diskutieren wir über Recht.\r
หน้าที่,Pflicht,nathi,Nomen,"Abstrakt,A2",5,คำนี้คือหน้าที่,Im Unterricht diskutieren wir über Pflicht.\r
เสียงส่วนใหญ่,Mehrheit,siang suan yai,Nomen,"Abstrakt,A2",5,คำนี้คือเสียงส่วนใหญ่,Im Unterricht diskutieren wir über Mehrheit.\r
ชนิด,Art/Sorte,chanit,Nomen,"Abstrakt,A2",5,คำนี้คือชนิด,Diese Frucht gibt es in vielen Sorten.\r
ระดับ,Niveau,radap,Nomen,"Abstrakt,A2",5,คำนี้คือระดับ,Im Unterricht diskutieren wir über Niveau.\r
ราคาเดิม,Originalpreis,rakha doem,Nomen,"Einkaufen,A2",5,คำนี้คือราคาเดิม,Beim Einkaufen achte ich auf Originalpreis.\r
โปรโมชั่น,Aktion,pro mo chan,Nomen,"Einkaufen,A2",5,คำนี้คือโปรโมชั่น,Beim Einkaufen achte ich auf Aktion.\r
คูปอง,Gutschein,khupong,Nomen,"Einkaufen,A2",5,คำนี้คือคูปอง,Mit dem Gutschein bekommst du Rabatt.\r
บัตรเดบิต,Debitkarte,bat debit,Nomen,"Einkaufen,A2",5,คำนี้คือบัตรเดบิต,Ich bezahle heute mit der Debitkarte.\r
ผ่อน,in Raten zahlen,phon,Verb,"Einkaufen,A2",5,ฉันใช้คำว่าผ่อนบ่อย,Im Geschäft will ich die Ware in Raten zahlen.\r
คืนสินค้า,Ware zurückgeben,khuen sinkha,Verb,"Einkaufen,A2",5,ฉันใช้คำว่าคืนสินค้าบ่อย,Im Geschäft will ich die Ware Ware zurückgeben.\r
แลกเปลี่ยน,umtauschen,laek plian,Verb,"Einkaufen,A2",5,ฉันใช้คำว่าแลกเปลี่ยนบ่อย,Im Geschäft will ich die Ware umtauschen.\r
วัสดุ,Material,watsadu,Nomen,"Einkaufen,A2",5,คำนี้คือวัสดุ,Beim Einkaufen achte ich auf Material.\r
ไม้,Holz,mai,Nomen,"Material,A2",5,คำนี้คือไม้,Dieses Produkt besteht aus Holz.\r
เหล็ก,Eisen,lek,Nomen,"Material,A2",5,คำนี้คือเหล็ก,Dieses Produkt besteht aus Eisen.\r
ทอง,Gold,thong,Nomen,"Material,A2",5,คำนี้คือทอง,Dieses Produkt besteht aus Gold.\r
พลาสติก,Plastik,phlastik,Nomen,"Material,A2",5,คำนี้คือพลาสติก,Dieses Produkt besteht aus Plastik.\r
แก้วน้ำ,Trinkglas,kaeo nam,Nomen,"Haushalt,A2",5,คำนี้คือแก้วน้ำ,In der Küche benutze ich Trinkglas.\r
กระป๋อง,Dose,krapong,Nomen,"Einkaufen,A2",5,คำนี้คือกระป๋อง,Beim Einkaufen achte ich auf Dose.\r
คู่,Paar,khu,Nomen,"Einkaufen,A2",5,คำนี้คือคู่,Beim Einkaufen achte ich auf Paar.\r
โหล,Dutzend,lo,Nomen,"Einkaufen,A2",5,คำนี้คือโหล,Beim Einkaufen achte ich auf Dutzend.\r
หลาน,Enkel/Neffe/Nichte,lan,Nomen,"Familie,A2",5,คำนี้คือหลาน,Am Wochenende besuchen uns unsere Enkel.\r
ลุง,Onkel,lung,Nomen,"Familie,A2",5,คำนี้คือลุง,In unserer Familie spricht man oft über Onkel.\r
ป้า,Tante,pa,Nomen,"Familie,A2",5,คำนี้คือป้า,In unserer Familie spricht man oft über Tante.\r
เขย,Schwiegersohn,khoei,Nomen,"Familie,A2",5,คำนี้คือเขย,In unserer Familie spricht man oft über Schwiegersohn.\r
สะใภ้,Schwiegertochter,saphai,Nomen,"Familie,A2",5,คำนี้คือสะใภ้,In unserer Familie spricht man oft über Schwiegertochter.\r
คู่สมรส,Ehepartner,khu somrot,Nomen,"Familie,A2",5,คำนี้คือคู่สมรส,In unserer Familie spricht man oft über Ehepartner.\r
ครอบครอง,besitzen,khropkhrong,Verb,"Familie,A2",5,ฉันใช้คำว่าครอบครองบ่อย,"Zu Hause versuche ich, besser zu besitzen."\r
เลี้ยงดู,aufziehen,liang du,Verb,"Familie,A2",5,ฉันใช้คำว่าเลี้ยงดูบ่อย,"Zu Hause versuche ich, besser zu aufziehen."\r
คลอด,gebären,khlot,Verb,"Familie,A2",5,ฉันใช้คำว่าคลอดบ่อย,"Zu Hause versuche ich, besser zu gebären."\r
ตั้งครรภ์,schwanger sein,tang khan,Verb,"Familie,A2",5,ฉันใช้คำว่าตั้งครรภ์บ่อย,"Zu Hause versuche ich, besser zu schwanger sein."\r
ทารก,Säugling,tharok,Nomen,"Familie,A2",5,คำนี้คือทารก,In unserer Familie spricht man oft über Säugling.\r
วัยรุ่น,Jugendlicher,wai run,Nomen,"Personen,A2",5,คำนี้คือวัยรุ่น,Im Alltag treffe ich häufig Jugendlicher.\r
ผู้ใหญ่,Erwachsener,phu yai,Nomen,"Personen,A2",5,คำนี้คือผู้ใหญ่,Im Alltag treffe ich häufig Erwachsener.\r
ผู้สูงอายุ,Senior,phu sung ayu,Nomen,"Personen,A2",5,คำนี้คือผู้สูงอายุ,Im Alltag treffe ich häufig Senior.\r
ถอนเงิน,Geld abheben,thon ngoen,Verb,"Finanzen,A2",5,ฉันใช้คำว่าถอนเงินบ่อย,Ich hebe am Automaten Geld ab.\r
ฝากเงิน,Geld einzahlen,fak ngoen,Verb,"Finanzen,A2",5,ฉันใช้คำว่าฝากเงินบ่อย,Sie zahlt jeden Monat Geld ein.\r
โอนเงิน,Geld überweisen,on ngoen,Verb,"Finanzen,A2",5,ฉันใช้คำว่าโอนเงินบ่อย,Ich überweise das Geld heute noch.\r
หนี้,Schuld,ni,Nomen,"Finanzen,A2",5,คำนี้คือหนี้,Bei der Bank geht es heute um Schuld.\r
ดอกเบี้ย,Zinsen,dok bia,Nomen,"Finanzen,A2",5,คำนี้คือดอกเบี้ย,Die Zinsen sind dieses Jahr gestiegen.\r
ประหยัด,sparen,prayat,Verb,"Finanzen,A2",5,ฉันใช้คำว่าประหยัดบ่อย,Bei der Bank kann ich direkt sparen.\r
ฟุ่มเฟือย,verschwenderisch,fum fueai,Adjektiv,"Finanzen,A2",5,คำนี้คือฟุ่มเฟือย,Im Moment fühlt sich die Lage eher verschwenderisch an.\r
รวย,reich,ruai,Adjektiv,"Finanzen,A2",5,คำนี้คือรวย,Im Moment fühlt sich die Lage eher reich an.\r
ค่าเช่า,Miete,kha chao,Nomen,"Finanzen,A2",5,คำนี้คือค่าเช่า,Die Miete in der Stadt ist teuer.\r
ภาษี,Steuer,phasi,Nomen,"Finanzen,A2",5,คำนี้คือภาษี,Die Steuer ist dieses Jahr höher.\r
หลังคา,Dach,langkha,Nomen,"Haus,A2",5,คำนี้คือหลังคา,Zu Hause brauchen wir Dach.\r
บันไดเลื่อน,Rolltreppe,bandai luean,Nomen,"Orte,A2",5,คำนี้คือบันไดเลื่อน,Nimm die Rolltreppe nach oben.\r
ระเบียง,Balkon,rabieng,Nomen,"Haus,A2",5,คำนี้คือระเบียง,Zu Hause brauchen wir Balkon.\r
รั้ว,Zaun,rua,Nomen,"Haus,A2",5,คำนี้คือรั้ว,Zu Hause brauchen wir Zaun.\r
ประแจ,Schraubenschlüssel,prachae,Nomen,"Werkzeug,A2",5,คำนี้คือประแจ,Für die Reparatur brauche ich Schraubenschlüssel.\r
ค้อน,Hammer,khon,Nomen,"Werkzeug,A2",5,คำนี้คือค้อน,Für die Reparatur brauche ich Hammer.\r
ตะปู,Nagel Metall,tapu,Nomen,"Werkzeug,A2",5,คำนี้คือตะปู,Für die Reparatur brauche ich Nagel Metall.\r
สกรู,Schraube,sakru,Nomen,"Werkzeug,A2",5,คำนี้คือสกรู,Für die Reparatur brauche ich Schraube.\r
กาว,Kleber,kao,Nomen,"Werkzeug,A2",5,คำนี้คือกาว,Für die Reparatur brauche ich Kleber.\r
เชือก,Seil,chueak,Nomen,"Werkzeug,A2",5,คำนี้คือเชือก,Für die Reparatur brauche ich Seil.\r
สายไฟ,Kabel,sai fai,Nomen,"Technik,A2",5,คำนี้คือสายไฟ,Für den Alltag ist Kabel sehr nützlich.\r
หลอดไฟ,Glühbirne,lot fai,Nomen,"Haus,A2",5,คำนี้คือหลอดไฟ,Zu Hause brauchen wir Glühbirne.\r
สวิตช์,Schalter,sawit,Nomen,"Haus,A2",5,คำนี้คือสวิตช์,Der Schalter ist neben der Tür.\r
เขียง,Schneidebrett,khiang,Nomen,"Haushalt,A2",5,คำนี้คือเขียง,In der Küche benutze ich Schneidebrett.\r
ตู้แช่แข็ง,Gefrierschrank,tu chae khaeng,Nomen,"Haushalt,A2",5,คำนี้คือตู้แช่แข็ง,In der Küche benutze ich Gefrierschrank.\r
ผงซักฟอก,Waschmittel,phong sak fok,Nomen,"Haushalt,A2",5,คำนี้คือผงซักฟอก,In der Küche benutze ich Waschmittel.\r
น้ำยาล้างจาน,Spülmittel,nam ya lang jan,Nomen,"Haushalt,A2",5,คำนี้คือน้ำยาล้างจาน,In der Küche benutze ich Spülmittel.\r
แปรง,Bürste,praeng,Nomen,"Haushalt,A2",5,คำนี้คือแปรง,In der Küche benutze ich Bürste.\r
ถัง,Eimer/Fass,thang,Nomen,"Haushalt,A2",5,คำนี้คือถัง,Hol bitte einen Eimer mit Wasser.\r
ผ้าเช็ดจาน,Geschirrtuch,pha chet jan,Nomen,"Haushalt,A2",5,คำนี้คือผ้าเช็ดจาน,In der Küche benutze ich Geschirrtuch.\r
ทางเท้า,Gehweg,thang thao,Nomen,"Verkehr,A2",5,คำนี้คือทางเท้า,Bitte geh auf dem Gehweg.\r
สะพานลอย,Fußgängerbrücke,saphan loi,Nomen,"Verkehr,A2",5,คำนี้คือสะพานลอย,Wir überqueren die Straße über die Fußgängerbrücke.\r
วงเวียน,Kreisverkehr,wong wian,Nomen,"Verkehr,A2",5,คำนี้คือวงเวียน,An diesem Kreisverkehr ist immer viel Verkehr.\r
ช้าลง,langsamer werden,cha long,Verb,"Verkehr,A2",5,ฉันใช้คำว่าช้าลงบ่อย,Beim Fahren muss man rechtzeitig langsamer werden.\r
เร่ง,beschleunigen,reng,Verb,"Verkehr,A2",5,ฉันใช้คำว่าเร่งบ่อย,Beim Fahren muss man rechtzeitig beschleunigen.\r
เบรก,bremsen,brek,Verb,"Verkehr,A2",5,ฉันใช้คำว่าเบรกบ่อย,Brems bitte vor der Kurve.\r
ที่นั่ง,Sitzplatz,thi nang,Nomen,"Verkehr,A2",5,คำนี้คือที่นั่ง,Unterwegs sehe ich oft Sitzplatz.\r
คนขับ,Fahrer,khon khap,Nomen,"Verkehr,A2",5,คำนี้คือคนขับ,Unterwegs sehe ich oft Fahrer.\r
ใบขับขี่,Führerschein,bai khap khi,Nomen,"Verkehr,A2",5,คำนี้คือใบขับขี่,Unterwegs sehe ich oft Führerschein.\r
เติมน้ำมัน,tanken,toem nam man,Verb,"Verkehr,A2",5,ฉันใช้คำว่าเติมน้ำมันบ่อย,Ich tanke vor der langen Fahrt.\r
ปั๊มน้ำมัน,Tankstelle,pam nam man,Nomen,"Verkehr,A2",5,คำนี้คือปั๊มน้ำมัน,Die nächste Tankstelle ist zwei Kilometer entfernt.\r
ล้อ,Rad,lo,Nomen,"Verkehr,A2",5,คำนี้คือล้อ,Unterwegs sehe ich oft Rad.\r
ฟ้าร้อง,Donner,fa rong,Nomen,"Natur,A2",5,คำนี้คือฟ้าร้อง,Bei Gewitter hört man lauten Donner.\r
ฟ้าแลบ,Blitz,fa laep,Nomen,"Natur,A2",5,คำนี้คือฟ้าแลบ,Nachts sieht man oft Blitze am Himmel.\r
น้ำท่วม,Überschwemmung,nam thuam,Nomen,"Natur,A2",5,คำนี้คือน้ำท่วม,Nach dem starken Regen gab es eine Überschwemmung.\r
แผ่นดินไหว,Erdbeben,phaendin wai,Nomen,"Natur,A2",5,คำนี้คือแผ่นดินไหว,Das Erdbeben hat viele Häuser beschädigt.\r
ภัยแล้ง,Dürre,phai laeng,Nomen,"Natur,A2",5,คำนี้คือภัยแล้ง,Im Norden gibt es dieses Jahr Dürre.\r
คลื่น,Welle,khluen,Nomen,"Natur,A2",5,คำนี้คือคลื่น,In der Natur begegnet man oft Welle.\r
กระแสลม,Luftströmung,krasae lom,Nomen,"Natur,A2",5,คำนี้คือกระแสลม,In der Natur begegnet man oft Luftströmung.\r
รุ้ง,Regenbogen,rung,Nomen,"Natur,A2",5,คำนี้คือรุ้ง,Nach dem Regen sieht man einen Regenbogen.\r
ฤดู,Jahreszeit,rue du,Nomen,"Zeit,A2",5,คำนี้คือฤดู,In Thailand gibt es drei Jahreszeiten.\r
ฤดูฝน,Regenzeit,rue du fon,Nomen,"Zeit,A2",5,คำนี้คือฤดูฝน,In der Regenzeit regnet es fast jeden Tag.\r
ฤดูร้อน,heiße Jahreszeit,rue du ron,Nomen,"Zeit,A2",5,คำนี้คือฤดูร้อน,In der heißen Jahreszeit ist es sehr heiß.\r
ฤดูหนาว,kühle Jahreszeit,rue du nao,Nomen,"Zeit,A2",5,คำนี้คือฤดูหนาว,In der kühlen Jahreszeit trage ich eine Jacke.\r
พยากรณ์อากาศ,Wettervorhersage,phayakon akat,Nomen,"Natur,A2",5,คำนี้คือพยากรณ์อากาศ,Ich schaue morgens immer die Wettervorhersage.\r
ชุ่มชื้น,humid,chum chuen,Adjektiv,"Wetter,A2",5,คำนี้คือชุ่มชื้น,In dieser Situation klingt humid passend.\r
แสงแดด,Sonnenlicht,saeng daet,Nomen,"Natur,A2",5,คำนี้คือแสงแดด,In der Natur begegnet man oft Sonnenlicht.\r
วิชา,Fach,wicha,Nomen,"Bildung,A2",5,คำนี้คือวิชา,In der Schule verwenden wir oft Fach.\r
ภาคเรียน,Semester,phak rian,Nomen,"Bildung,A2",5,คำนี้คือภาคเรียน,In der Schule verwenden wir oft Semester.\r
สมุด,Heft,samut,Nomen,"Bildung,A2",5,คำนี้คือสมุด,In der Schule verwenden wir oft Heft.\r
ยางลบ,Radiergummi,yang lop,Nomen,"Bildung,A2",5,คำนี้คือยางลบ,In der Schule verwenden wir oft Radiergummi.\r
ไม้บรรทัด,Lineal,mai bantat,Nomen,"Bildung,A2",5,คำนี้คือไม้บรรทัด,In der Schule verwenden wir oft Lineal.\r
ครูใหญ่,Schulleiter,khru yai,Nomen,"Bildung,A2",5,คำนี้คือครูใหญ่,Der Schulleiter spricht heute mit den Eltern.\r
นักวิจัย,Forscher,nak wijai,Nomen,"Bildung,A2",5,คำนี้คือนักวิจัย,In der Schule verwenden wir oft Forscher.\r
ทุนการศึกษา,Stipendium,thun kansueksa,Nomen,"Bildung,A2",5,คำนี้คือทุนการศึกษา,In der Schule verwenden wir oft Stipendium.\r
สอบผ่าน,bestehen,sop phan,Verb,"Bildung,A2",5,ฉันใช้คำว่าสอบผ่านบ่อย,"Im Kurs lernen wir, korrekt zu bestehen."\r
สอบตก,durchfallen,sop tok,Verb,"Bildung,A2",5,ฉันใช้คำว่าสอบตกบ่อย,"Im Kurs lernen wir, korrekt zu durchfallen."\r
ทบทวน,wiederholen,thopthuan,Verb,"Bildung,A2",5,ฉันใช้คำว่าทบทวนบ่อย,"Im Kurs lernen wir, korrekt zu wiederholen."\r
ฝึกฝน,üben,fuek fon,Verb,"Bildung,A2",5,ฉันใช้คำว่าฝึกฝนบ่อย,"Im Kurs lernen wir, korrekt zu üben."\r
จด,notieren,chot,Verb,"Bildung,A2",5,ฉันใช้คำว่าจดบ่อย,"Im Kurs lernen wir, korrekt zu notieren."\r
ทำบุญ,Verdienst machen,tham bun,Verb,"Kultur,A2",5,ฉันใช้คำว่าทำบุญบ่อย,Im Tempel sieht man viele Menschen Verdienst machen.\r
ไหว้,grüßen/verehren,wai,Verb,"Kultur,A2",5,ฉันใช้คำว่าไหว้บ่อย,In Thailand grüßt man oft mit einem Wai.\r
สวดมนต์,beten/chanten,suat mon,Verb,"Kultur,A2",5,ฉันใช้คำว่าสวดมนต์บ่อย,Am Abend hört man im Tempel Gebete.\r
วันพระ,Buddhistischer Feiertag,wan phra,Nomen,"Kultur,A2",5,คำนี้คือวันพระ,Im Tempel lernen wir etwas über Buddhistischer Feiertag.\r
เจดีย์,Pagode,chedi,Nomen,"Kultur,A2",5,คำนี้คือเจดีย์,Im Tempel lernen wir etwas über Pagode.\r
พระพุทธรูป,Buddhastatue,phra phuttharup,Nomen,"Kultur,A2",5,คำนี้คือพระพุทธรูป,Im Tempel lernen wir etwas über Buddhastatue.\r
นิทรรศการ,Ausstellung,nitthatsakan,Nomen,"Kultur,A2",5,คำนี้คือนิทรรศการ,Im Tempel lernen wir etwas über Ausstellung.\r
ศิลปะ,Kunst,sinlapa,Nomen,"Kultur,A2",5,คำนี้คือศิลปะ,Im Tempel lernen wir etwas über Kunst.\r
ภาพวาด,Gemälde,phap wat,Nomen,"Kultur,A2",5,คำนี้คือภาพวาด,Im Tempel lernen wir etwas über Gemälde.\r
ประวัติศาสตร์,Geschichte Historie,prawattisat,Nomen,"Kultur,A2",5,คำนี้คือประวัติศาสตร์,Im Tempel lernen wir etwas über Geschichte Historie.\r
สำเนียง,Akzent,samniang,Nomen,"Sprache,A2",5,คำนี้คือสำเนียง,Er hat einen klaren Akzent.\r
คำศัพท์,Wortschatz,khamsap,Nomen,"Sprache,A2",5,คำนี้คือคำศัพท์,Ich wiederhole jeden Tag neuen Wortschatz.\r
ไวยากรณ์,Grammatik,waiyakon,Nomen,"Sprache,A2",5,คำนี้คือไวยากรณ์,Grammatik braucht Zeit und Übung.\r
กฎหมาย,Gesetz,kotmai,Nomen,"Gesellschaft,A2",5,คำนี้คือกฎหมาย,Jeder muss das Gesetz respektieren.\r
คิม,Kim,kim,Eigenname,"Eigenname,A1",5,ฉันชื่อคิม,Ich heiße Kim.\r
จาก,aus/von,jaak,Präposition,"Grundlagen,A1",5,ฉันมาจากประเทศไทย,Ich komme aus Thailand.\r
เรียก,rufen,riak,Verb,"Grundlagen,A1",5,กรุณาเรียกตำรวจให้หน่อย,Rufen Sie bitte die Polizei.\r
`;function oe(e){if(e==null||String(e).trim()===``)return null;let t=String(e).trim();if(!/^\d+$/.test(t))return null;let n=Number.parseInt(t,10);return Number.isFinite(n)&&n>0?n:null}function se(e){let t=(e??``).split(`,`).map(e=>e.trim()).filter(Boolean);return t.length>0?t:void 0}function F(e){if(!e||e.length===0)return!1;let t=e.map(e=>e.trim().toLowerCase());return t.includes(`a1`)||t.includes(`a2`)}function ce(e){let t=(e.thai??``).trim(),n=(e.german??``).trim();if(!t||!n)return null;let r=oe(e.lesson),i=se(e.tags);if(r===null||!F(i))return null;let a=Date.now();return{thai:t,german:n,transliteration:(e.transliteration??``).trim()||void 0,pos:(e.pos??``).trim()||void 0,lesson:r,tags:i,exampleThai:(e.exampleThai??``).trim()||void 0,exampleGerman:(e.exampleGerman??``).trim()||void 0,createdAt:a,updatedAt:a}}function le(){let e=N.default.parse(P,{header:!0,skipEmptyLines:!0}),t=e.errors.filter(e=>{let t=String(e.code??``);return t!==`TooManyFields`&&t!==`TooFewFields`});if(t.length>0)throw Error(`DEFAULT_VOCAB parse error: ${t[0]?.message??`unknown error`}`);e.errors.length>0&&console.warn(`[DEFAULT_VOCAB] Non-fatal CSV parse warnings: ${e.errors.length}. Continuing with parsed rows.`);let n=(e.data??[]).map(ce).filter(e=>e!==null),r=(e.data??[]).length-n.length;return r>0&&console.warn(`[DEFAULT_VOCAB] Ignored ${r} invalid CSV row(s).`),n}const I=le(),ue=9999999;var L=[`๐`,`๑`,`๒`,`๓`,`๔`,`๕`,`๖`,`๗`,`๘`,`๙`],de=[`ศูนย์`,`หนึ่ง`,`สอง`,`สาม`,`สี่`,`ห้า`,`หก`,`เจ็ด`,`แปด`,`เก้า`],R=[`suun`,`nüng`,`song`,`sam`,`sii`,`haa`,`hok`,`chet`,`päät`,`gao`],fe=[`null`,`eins`,`zwei`,`drei`,`vier`,`fuenf`,`sechs`,`sieben`,`acht`,`neun`],pe={10:`zehn`,11:`elf`,12:`zwoelf`,13:`dreizehn`,14:`vierzehn`,15:`fuenfzehn`,16:`sechzehn`,17:`siebzehn`,18:`achtzehn`,19:`neunzehn`},me={20:`zwanzig`,30:`dreissig`,40:`vierzig`,50:`fuenfzig`,60:`sechzig`,70:`siebzig`,80:`achtzig`,90:`neunzig`};function z(e){if(!Number.isInteger(e))throw Error(`Only integers are supported: ${e}`);if(e<0||e>9999999)throw Error(`Number out of range (0-${ue}): ${e}`)}function he(e){return z(e),String(e).split(``).map(e=>L[Number(e)]).join(``)}function ge(e){if(e===0)return de[0];if(e<10)return de[e];let t=[1e5,1e4,1e3,100,10,1],n=[`แสน`,`หมื่น`,`พัน`,`ร้อย`,`สิบ`,``],r=[],i=e;for(let a=0;a<t.length;a+=1){let o=t[a],s=Math.floor(i/o);if(i%=o,s!==0){if(o===10){s===1?r.push(`สิบ`):s===2?r.push(`ยี่สิบ`):r.push(`${de[s]}สิบ`);continue}if(o===1&&s===1&&e>1){r.push(`เอ็ด`);continue}r.push(`${de[s]}${n[a]}`)}}return r.join(``)}function _e(e){if(e===0)return R[0];if(e<10)return R[e];let t=[1e5,1e4,1e3,100,10,1],n=[`sään`,`müün`,`pan`,`roi`,`sip`,``],r=[],i=e;for(let a=0;a<t.length;a+=1){let o=t[a],s=Math.floor(i/o);if(i%=o,s!==0){if(o===10){s===1?r.push(`sip`):s===2?r.push(`ji-sip`):r.push(`${R[s]}-sip`);continue}if(o===1&&s===1&&e>1){r.push(`et`);continue}o===1?r.push(R[s]):r.push(`${R[s]}-${n[a]}`)}}return r.join(`-`)}function ve(e){if(z(e),e<1e6)return ge(e);let t=Math.floor(e/1e6),n=e%1e6,r=t===1?`หนึ่งล้าน`:`${ge(t)}ล้าน`;return n===0?r:`${r}${ge(n)}`}function ye(e){if(z(e),e<1e6)return _e(e);let t=Math.floor(e/1e6),n=e%1e6,r=t===1?`nüng-lan`:`${_e(t)}-lan`;return n===0?r:`${r}-${_e(n)}`}function be(e){if(e<10)return fe[e];if(e<20)return pe[e];if(e<100){let t=Math.floor(e/10)*10,n=e%10;return n===0?me[t]:`${n===1?`ein`:fe[n]}und${me[t]}`}let t=Math.floor(e/100),n=e%100,r=t===1?`einhundert`:`${fe[t]}hundert`;return n===0?r:`${r}${be(n)}`}function xe(e){if(z(e),e<1e3)return be(e);if(e<1e6){let t=Math.floor(e/1e3),n=e%1e3,r=t===1?`eintausend`:`${be(t)}tausend`;return n===0?r:`${r}${be(n)}`}let t=Math.floor(e/1e6),n=e%1e6,r=t===1?`eine Million`:`${fe[t]} Millionen`;return n===0?r:`${r} ${xe(n)}`}function Se(e){return z(e),{arabic:e,thaiDigit:he(e),thaiWord:ve(e),transliteration:ye(e),german:xe(e)}}var Ce=[1e3,1e4,1e5,1e6];const we=[...Array.from({length:101},(e,t)=>t),...Ce].map(e=>({...Se(e),lesson:1,tags:[`Numbers`,`A1`,`Kardinalzahlen`],createdAt:0,updatedAt:0})),Te=[{lesson:1,rangeStart:1,rangeEnd:50,unlockThresholdTestPassed:50,sentences:[{thai:`ฉันกินข้าว`,german:`Ich esse Reis.`,sourceThaiWord:`กิน`},{thai:`เขาดื่มน้ำ`,german:`Er/Sie trinkt Wasser.`,sourceThaiWord:`ดื่ม`},{thai:`พรุ่งนี้ฉันไปโรงเรียน`,german:`Morgen gehe ich zur Schule.`,sourceThaiWord:`พรุ่งนี้`},{thai:`เราซื้ออาหาร`,german:`Wir kaufen Essen.`,sourceThaiWord:`ซื้อ`},{thai:`พวกเขาอยู่บ้านวันนี้`,german:`Sie sind heute zu Hause.`,sourceThaiWord:`พวกเขา`}]},{lesson:1,rangeStart:1,rangeEnd:100,unlockThresholdTestPassed:100,sentences:[{thai:`ผู้ชายเป็นครู`,german:`Der Mann ist Lehrer.`,sourceThaiWord:`ผู้ชาย`},{thai:`ผู้หญิงเป็นพยาบาล`,german:`Die Frau ist Krankenpflegerin.`,sourceThaiWord:`ผู้หญิง`},{thai:`พวกเราอยู่ที่โรงเรียน`,german:`Wir sind in der Schule.`,sourceThaiWord:`พวกเรา`},{thai:`ลูกค้าซื้ออาหาร`,german:`Der Kunde / die Kundin kauft Essen.`,sourceThaiWord:`ลูกค้า`},{thai:`พรุ่งนี้พวกเราไปโรงเรียนไหม`,german:`Gehen wir morgen zur Schule?`,sourceThaiWord:`พรุ่งนี้`}]},{lesson:1,rangeStart:1,rangeEnd:150,unlockThresholdTestPassed:150,sentences:[{thai:`ครูสอนนักเรียน`,german:`Der Lehrer / die Lehrerin unterrichtet den Schüler / die Schülerin.`,sourceThaiWord:`สอน`},{thai:`นักเรียนถามครู`,german:`Der Schüler / die Schülerin fragt den Lehrer / die Lehrerin.`,sourceThaiWord:`ถาม`},{thai:`พนักงานตอบลูกค้า`,german:`Der Angestellte / die Angestellte antwortet der Kundin / dem Kunden.`,sourceThaiWord:`ตอบ`},{thai:`ฉันอ่านและเขียน`,german:`Ich lese und schreibe.`,sourceThaiWord:`อ่าน`},{thai:`เขาไม่เข้าใจ`,german:`Er/Sie versteht nicht.`,sourceThaiWord:`เข้าใจ`}]},{lesson:1,rangeStart:1,rangeEnd:200,unlockThresholdTestPassed:200,sentences:[{thai:`ฉันหิวและกระหาย`,german:`Ich habe Hunger und Durst.`,sourceThaiWord:`หิว`},{thai:`วันนี้ฉันเหนื่อย`,german:`Heute bin ich müde.`,sourceThaiWord:`เหนื่อย`},{thai:`เพื่อนป่วย`,german:`Der Freund / die Freundin ist krank.`,sourceThaiWord:`ป่วย`},{thai:`หมอช่วยเพื่อน`,german:`Der Arzt / die Ärztin hilft dem Freund / der Freundin.`,sourceThaiWord:`หมอ`},{thai:`เขาโกรธ แต่ฉันไม่โกรธ`,german:`Er/Sie ist wütend, aber ich bin nicht wütend.`,sourceThaiWord:`โกรธ`}]},{lesson:2,rangeStart:1,rangeEnd:50,unlockThresholdTestPassed:50,sentences:[{thai:`สวัสดี ฉันขอบคุณคุณนะ`,german:`Hallo, ich wollte dir noch danke sagen.`,sourceThaiWord:`ขอบคุณ`},{thai:`ห้องน้ำอยู่ที่ไหน`,german:`Wo ist die Toilette?`,sourceThaiWord:`ห้องน้ำ`},{thai:`ฉันไปตลาดตอนเช้า`,german:`Ich gehe am Morgen zum Markt.`,sourceThaiWord:`ตลาด`},{thai:`ฉันซื้อกระเป๋าเดินทาง`,german:`Ich kaufe einen Koffer.`,sourceThaiWord:`กระเป๋าเดินทาง`},{thai:`เมืองนี้มีสะพาน`,german:`Diese Stadt hat eine Brücke.`,sourceThaiWord:`สะพาน`}]},{lesson:2,rangeStart:1,rangeEnd:100,unlockThresholdTestPassed:100,sentences:[{thai:`ฉันไปด้วยรถไฟฟ้า`,german:`Ich fahre mit dem Skytrain.`,sourceThaiWord:`รถไฟฟ้า`},{thai:`รถใต้ดินเร็วมาก`,german:`Die U-Bahn ist sehr schnell.`,sourceThaiWord:`รถใต้ดิน`},{thai:`วันนี้ฉันกินผักและผลไม้`,german:`Heute esse ich Gemüse und Obst.`,sourceThaiWord:`ผัก`},{thai:`ฉันดื่มกาแฟและชา`,german:`Ich trinke Kaffee und Tee.`,sourceThaiWord:`กาแฟ`},{thai:`สถานีรถไฟอยู่ในเมือง`,german:`Der Bahnhof ist in der Stadt.`,sourceThaiWord:`สถานีรถไฟ`}]},{lesson:2,rangeStart:1,rangeEnd:150,unlockThresholdTestPassed:150,sentences:[{thai:`ฉันสวมเสื้อสีแดง`,german:`Ich trage ein rotes Shirt.`,sourceThaiWord:`สวม`},{thai:`เขาถอดรองเท้า`,german:`Er/Sie zieht die Schuhe aus.`,sourceThaiWord:`ถอด`},{thai:`ฉันเลือกเสื้อผ้าสีฟ้า`,german:`Ich wähle blaue Kleidung.`,sourceThaiWord:`เลือก`},{thai:`พรุ่งนี้เราไปเที่ยว`,german:`Morgen reisen wir in den Urlaub.`,sourceThaiWord:`เที่ยว`},{thai:`ฉันฝันถึงทะเล`,german:`Ich träume vom Meer.`,sourceThaiWord:`ฝัน`}]},{lesson:2,rangeStart:1,rangeEnd:200,unlockThresholdTestPassed:200,sentences:[{thai:`ฉันยิ้มและหัวเราะ`,german:`Ich lächle und lache.`,sourceThaiWord:`ยิ้ม`},{thai:`วันนี้ฉันทำอาหารในห้องครัว`,german:`Heute koche ich in der Küche.`,sourceThaiWord:`ทำอาหาร`},{thai:`วันหยุดเราไปสวน`,german:`Am Feiertag gehen wir in den Park.`,sourceThaiWord:`วันหยุด`},{thai:`ฉันไปธนาคารและร้านขายยา`,german:`Ich gehe zur Bank und zur Apotheke.`,sourceThaiWord:`ธนาคาร`},{thai:`พรุ่งนี้เราไปสนามบินและขึ้นเครื่องบิน`,german:`Morgen fahren wir zum Flughafen und fliegen mit dem Flugzeug.`,sourceThaiWord:`สนามบิน`}]},{lesson:3,rangeStart:1,rangeEnd:50,unlockThresholdTestPassed:50,sentences:[{thai:`ฉันซื้อสับปะรดและมะม่วง`,german:`Ich habe Ananas und Mango gekauft.`,sourceThaiWord:`สับปะรด`},{thai:`วันนี้อากาศหนาวและลมแรง`,german:`Heute ist das Wetter kalt und der Wind ist stark.`,sourceThaiWord:`อากาศ`},{thai:`พรุ่งนี้เราไปชายหาด`,german:`Morgen gehen wir an den Strand.`,sourceThaiWord:`ชายหาด`},{thai:`ฉันไปด้วยรถเมล์`,german:`Ich fahre mit dem Bus.`,sourceThaiWord:`รถเมล์`},{thai:`ฉันซื้อตั๋วแล้ว`,german:`Ich habe das Ticket schon gekauft.`,sourceThaiWord:`ตั๋ว`}]},{lesson:3,rangeStart:1,rangeEnd:100,unlockThresholdTestPassed:100,sentences:[{thai:`คุณดื่มนมหรือน้ำส้ม`,german:`Trinkst du lieber Milch oder Orangensaft?`,sourceThaiWord:`นม`},{thai:`วันนี้ฉันกินบะหมี่`,german:`Heute esse ich Nudeln.`,sourceThaiWord:`บะหมี่`},{thai:`ฉันเปิดตู้เย็น`,german:`Ich öffne den Kühlschrank.`,sourceThaiWord:`ตู้เย็น`},{thai:`ฉันใช้ผ้าเช็ดตัว`,german:`Ich benutze ein Handtuch.`,sourceThaiWord:`ผ้าเช็ดตัว`},{thai:`พรุ่งนี้เราประชุม`,german:`Morgen haben wir eine Besprechung.`,sourceThaiWord:`ประชุม`}]},{lesson:3,rangeStart:1,rangeEnd:150,unlockThresholdTestPassed:150,sentences:[{thai:`ฉันลืมรหัสผ่าน`,german:`Ich habe das Passwort vergessen.`,sourceThaiWord:`รหัสผ่าน`},{thai:`วันนี้รถติดมาก`,german:`Heute gibt es viel Stau.`,sourceThaiWord:`รถติด`},{thai:`ฉันพกร่ม`,german:`Ich habe einen Regenschirm dabei.`,sourceThaiWord:`ร่ม`},{thai:`ฉันส่งรายงานทางอีเมล`,german:`Ich schicke den Bericht per E-Mail.`,sourceThaiWord:`รายงาน`},{thai:`พรุ่งนี้ฉันไปสัมภาษณ์`,german:`Morgen gehe ich zum Interview.`,sourceThaiWord:`สัมภาษณ์`}]},{lesson:3,rangeStart:1,rangeEnd:200,unlockThresholdTestPassed:200,sentences:[{thai:`ฉันใส่เสื้อยืด`,german:`Ich trage ein T-Shirt.`,sourceThaiWord:`เสื้อยืด`},{thai:`โต๊ะอยู่ข้างโซฟา`,german:`Der Tisch steht neben dem Sofa.`,sourceThaiWord:`โต๊ะ`},{thai:`ฉันเก็บเอกสารทันที`,german:`Ich lege das Dokument sofort weg.`,sourceThaiWord:`เอกสาร`},{thai:`วันนี้ฉันไอและมีไข้`,german:`Heute huste ich und habe Fieber.`,sourceThaiWord:`ไอ`},{thai:`พรุ่งนี้ฉันซื้อของขวัญ`,german:`Morgen kaufe ich ein Geschenk.`,sourceThaiWord:`ของขวัญ`}]},{lesson:4,rangeStart:1,rangeEnd:50,unlockThresholdTestPassed:50,sentences:[{thai:`ช่วยวางตะเกียบและแก้วบนโต๊ะ`,german:`Bitte lege Essstäbchen und Gläser auf den Tisch.`,sourceThaiWord:`ตะเกียบ`},{thai:`วันนี้ฝนตกและมืด`,german:`Heute regnet es und es ist dunkel.`,sourceThaiWord:`ฝนตก`},{thai:`ฉันจ่ายด้วยบัตรเครดิต`,german:`Ich bezahle mit Kreditkarte.`,sourceThaiWord:`บัตรเครดิต`},{thai:`เราเช่าห้องใกล้ๆ มหาวิทยาลัย`,german:`Wir mieten ein Zimmer ganz nah an der Universität.`,sourceThaiWord:`มหาวิทยาลัย`},{thai:`ฉันหลงทาง ช่วยด้วย`,german:`Ich habe mich verlaufen, Hilfe!`,sourceThaiWord:`หลงทาง`}]},{lesson:4,rangeStart:1,rangeEnd:100,unlockThresholdTestPassed:100,sentences:[{thai:`วันนี้อากาศชื้นและมีหมอก`,german:`Heute ist das Wetter feucht und es gibt Nebel.`,sourceThaiWord:`ชื้น`},{thai:`ฉันลืมกุญแจที่บ้าน`,german:`Ich habe den Schlüssel zu Hause vergessen.`,sourceThaiWord:`กุญแจ`},{thai:`พรุ่งนี้เรานัดหมายตรงเวลา`,german:`Morgen haben wir einen Termin und sind pünktlich.`,sourceThaiWord:`นัดหมาย`},{thai:`ฉันมีคำถาม แต่เขาไม่มีคำตอบ`,german:`Ich habe eine Frage, aber er/sie hat keine Antwort.`,sourceThaiWord:`คำถาม`},{thai:`ครูอธิบายภาษาเยอรมัน`,german:`Der Lehrer / die Lehrerin erklärt Deutsch.`,sourceThaiWord:`อธิบาย`}]},{lesson:4,rangeStart:1,rangeEnd:150,unlockThresholdTestPassed:150,sentences:[{thai:`ฉันเตรียมงานบนโต๊ะทำงานแล้ว`,german:`Ich habe die Arbeit auf dem Schreibtisch vorbereitet.`,sourceThaiWord:`เตรียม`},{thai:`ฉันส่งข้อความและโทรกลับ`,german:`Ich sende eine Nachricht und rufe zurück.`,sourceThaiWord:`ส่งข้อความ`},{thai:`พรุ่งนี้เราไปพิพิธภัณฑ์`,german:`Morgen gehen wir ins Museum.`,sourceThaiWord:`พิพิธภัณฑ์`},{thai:`ฉันทำส้มตำใส่พริก`,german:`Ich mache Papayasalat mit Chili.`,sourceThaiWord:`ส้มตำ`},{thai:`สวนนี้มีต้นไม้และดอกไม้`,german:`In diesem Park gibt es Bäume und Blumen.`,sourceThaiWord:`ต้นไม้`}]},{lesson:4,rangeStart:1,rangeEnd:200,unlockThresholdTestPassed:200,sentences:[{thai:`สุดสัปดาห์เราไปสวนสัตว์`,german:`Am Wochenende gehen wir in den Zoo.`,sourceThaiWord:`สวนสัตว์`},{thai:`ผีเสื้อและผึ้งชอบดอกไม้`,german:`Schmetterlinge und Bienen lieben Blumen.`,sourceThaiWord:`ผีเสื้อ`},{thai:`เราเก็บขยะและช่วยสิ่งแวดล้อม`,german:`Wir sammeln Müll und helfen der Umwelt.`,sourceThaiWord:`สิ่งแวดล้อม`},{thai:`ที่นี่เงียบ ไม่ดัง`,german:`Hier ist es ruhig, nicht laut.`,sourceThaiWord:`เงียบ`},{thai:`เขาใจดีและสุภาพ`,german:`Er/Sie ist nett und höflich.`,sourceThaiWord:`สุภาพ`}]},{lesson:5,rangeStart:1,rangeEnd:50,unlockThresholdTestPassed:50,sentences:[{thai:`ฉันดูทีวีบ่อย`,german:`Ich sehe oft fern.`,sourceThaiWord:`ดูทีวี`},{thai:`เราควรไปด้วยกัน`,german:`Wir sollten zusammen gehen.`,sourceThaiWord:`ควร`},{thai:`วันนี้ฉันดีใจ แต่เขาเสียใจ`,german:`Heute bin ich froh, aber er/sie ist traurig.`,sourceThaiWord:`ดีใจ`},{thai:`ฉันเข้าใจแล้ว พูดช้าๆ`,german:`Ich habe verstanden, bitte langsam sprechen.`,sourceThaiWord:`ฉันเข้าใจแล้ว`},{thai:`ลมแรงทางตะวันออก`,german:`Im Osten ist starker Wind.`,sourceThaiWord:`ลมแรง`}]},{lesson:5,rangeStart:1,rangeEnd:100,unlockThresholdTestPassed:100,sentences:[{thai:`ฉันกินข้าวสวยกับแครอท`,german:`Ich esse gekochten Reis mit Karotte.`,sourceThaiWord:`ข้าวสวย`},{thai:`ฉันแพ้ขิง`,german:`Ich bin allergisch gegen Ingwer.`,sourceThaiWord:`แพ้`},{thai:`เรามีนัดหมอภายหลัง`,german:`Wir haben später einen Arzttermin.`,sourceThaiWord:`นัดหมอ`},{thai:`ฉันบันทึกไฟล์แล้ว`,german:`Ich habe die Datei gespeichert.`,sourceThaiWord:`บันทึก`},{thai:`ถ้าลบไฟล์ ต้องแก้ไขอีกครั้ง`,german:`Wenn man die Datei löscht, muss man sie noch einmal bearbeiten.`,sourceThaiWord:`ลบ`}]},{lesson:5,rangeStart:1,rangeEnd:150,unlockThresholdTestPassed:150,sentences:[{thai:`ฉันชอบว่ายน้ำและเดินเล่น`,german:`Ich mag schwimmen und spazieren.`,sourceThaiWord:`ว่ายน้ำ`},{thai:`พรุ่งนี้เราตั้งแคมป์`,german:`Morgen gehen wir campen.`,sourceThaiWord:`ตั้งแคมป์`},{thai:`ฉันมีแผนและเป้าหมาย`,german:`Ich habe einen Plan und ein Ziel.`,sourceThaiWord:`แผน`},{thai:`นี่คือตัวอย่างที่ดี`,german:`Das ist ein gutes Beispiel.`,sourceThaiWord:`ตัวอย่าง`},{thai:`ฉันจ่ายด้วยบัตรเดบิต`,german:`Ich bezahle mit Debitkarte.`,sourceThaiWord:`บัตรเดบิต`}]},{lesson:5,rangeStart:1,rangeEnd:200,unlockThresholdTestPassed:200,sentences:[{thai:`ลุงกับป้าอยู่ที่นี่`,german:`Onkel und Tante sind hier.`,sourceThaiWord:`ลุง`},{thai:`ฉันฝากเงินและโอนเงิน`,german:`Ich zahle Geld ein und überweise Geld.`,sourceThaiWord:`ฝากเงิน`},{thai:`เราประหยัดค่าเช่า`,german:`Wir sparen bei der Miete.`,sourceThaiWord:`ประหยัด`},{thai:`ฉันใช้ค้อนกับตะปู`,german:`Ich benutze Hammer und Nagel.`,sourceThaiWord:`ค้อน`},{thai:`รถช้าลงก่อนวงเวียน`,german:`Das Auto wird vor dem Kreisverkehr langsamer.`,sourceThaiWord:`ช้าลง`}]},{lesson:5,rangeStart:1,rangeEnd:249,unlockThresholdTestPassed:249,sentences:[{thai:`คนขับเบรกหน้าปั๊มน้ำมัน`,german:`Der Fahrer bremst vor der Tankstelle.`,sourceThaiWord:`เบรก`},{thai:`วันนี้พยากรณ์อากาศบอกว่าฝนตก`,german:`Heute sagt die Wettervorhersage, dass es regnet.`,sourceThaiWord:`พยากรณ์อากาศ`},{thai:`ฉันทบทวนคำศัพท์และไวยากรณ์`,german:`Ich wiederhole Wortschatz und Grammatik.`,sourceThaiWord:`คำศัพท์`},{thai:`นักเรียนจดในสมุด`,german:`Der Schüler / die Schülerin notiert im Heft.`,sourceThaiWord:`จด`},{thai:`ฉันชอบศิลปะและภาพวาด`,german:`Ich mag Kunst und Gemälde.`,sourceThaiWord:`ศิลปะ`}]},{lesson:6,rangeStart:1,rangeEnd:5,unlockThresholdTestPassed:0,sentences:[{thai:`สวัสดี ฉันชื่อคิม`,german:`Hallo, ich heiße Kim.`,sourceThaiWord:`สวัสดี`},{thai:`ฉันมาจากประเทศไทย`,german:`Ich komme aus Thailand.`,sourceThaiWord:`ประเทศไทย`},{thai:`ยินดีที่ได้รู้จัก`,german:`Freut mich, dich kennenzulernen.`,sourceThaiWord:`ยินดีต้อนรับ`},{thai:`ฉันพูดภาษาไทยได้นิดหน่อย`,german:`Ich spreche ein bisschen Thai.`,sourceThaiWord:`ภาษาไทย`},{thai:`คุณพูดภาษาอังกฤษได้ไหม`,german:`Sprechen Sie Englisch?`,sourceThaiWord:`ภาษาอังกฤษ`}]},{lesson:6,rangeStart:6,rangeEnd:10,unlockThresholdTestPassed:0,sentences:[{thai:`ห้องน้ำอยู่ที่ไหน`,german:`Wo ist die Toilette?`,sourceThaiWord:`ห้องน้ำ`},{thai:`สถานีรถไฟอยู่ที่ไหน`,german:`Wo ist der Bahnhof?`,sourceThaiWord:`สถานีรถไฟ`},{thai:`ฉันต้องการตั๋วไปกรุงเทพฯ`,german:`Ich möchte ein Ticket nach Bangkok.`,sourceThaiWord:`ตั๋ว`},{thai:`ป้ายรถเมล์อยู่ที่ไหน`,german:`Wo ist die Bushaltestelle?`,sourceThaiWord:`ป้ายรถเมล์`},{thai:`กรุณาขับช้าๆ`,german:`Bitte fahren Sie langsam.`,sourceThaiWord:`กรุณา`}]},{lesson:6,rangeStart:11,rangeEnd:15,unlockThresholdTestPassed:0,sentences:[{thai:`ฉันจองแล้ว`,german:`Ich habe eine Reservierung.`,sourceThaiWord:`จอง`},{thai:`ฉันต้องการห้องเดี่ยว`,german:`Ich hätte gern ein Einzelzimmer.`,sourceThaiWord:`ห้องเดี่ยว`},{thai:`รวมอาหารเช้าหรือไม่`,german:`Ist Frühstück inklusive?`,sourceThaiWord:`อาหารเช้า`},{thai:`ขอใบเสร็จด้วย`,german:`Die Rechnung bitte.`,sourceThaiWord:`ใบเสร็จ`},{thai:`ไม่เผ็ดนะ`,german:`Nicht scharf, bitte.`,sourceThaiWord:`ไม่เผ็ด`}]},{lesson:6,rangeStart:16,rangeEnd:20,unlockThresholdTestPassed:0,sentences:[{thai:`ช่วยฉันหน่อยได้ไหม`,german:`Helfen Sie mir bitte.`,sourceThaiWord:`ช่วย`},{thai:`ฉันปวดท้อง`,german:`Ich habe Bauchschmerzen.`,sourceThaiWord:`ปวดท้อง`},{thai:`ฉันต้องการพบหมอ`,german:`Ich brauche einen Arzt.`,sourceThaiWord:`หมอ`},{thai:`มีร้านขายยาอยู่ที่ไหน`,german:`Wo ist eine Apotheke?`,sourceThaiWord:`ร้านขายยา`},{thai:`กรุณาเรียกตำรวจให้หน่อย`,german:`Rufen Sie bitte die Polizei.`,sourceThaiWord:`ตำรวจ`}]},{lesson:6,rangeStart:21,rangeEnd:25,unlockThresholdTestPassed:0,sentences:[{thai:`อันนี้ราคาเท่าไหร่`,german:`Wie viel kostet das?`,sourceThaiWord:`ราคาเท่าไหร่`},{thai:`กางเกงแพงมาก`,german:`Die Hose ist sehr teuer.`,sourceThaiWord:`กางเกง`},{thai:`มีเงินทอนไหม`,german:`Haben Sie Wechselgeld?`,sourceThaiWord:`เงิน`},{thai:`ช่วยพูดอีกครั้งได้ไหม`,german:`Können Sie das bitte wiederholen?`,sourceThaiWord:`อีกครั้ง`},{thai:`ขอบคุณมากสำหรับความช่วยเหลือ`,german:`Vielen Dank für Ihre Hilfe.`,sourceThaiWord:`ขอบคุณมาก`}]}];function Ee(e){var t,n,r=``;if(typeof e==`string`||typeof e==`number`)r+=e;else if(typeof e==`object`)if(Array.isArray(e)){var i=e.length;for(t=0;t<i;t++)e[t]&&(n=Ee(e[t]))&&(r&&(r+=` `),r+=n)}else for(n in e)e[n]&&(r&&(r+=` `),r+=n);return r}function De(){for(var e,t,n=0,r=``,i=arguments.length;n<i;n++)(e=arguments[n])&&(t=Ee(e))&&(r&&(r+=` `),r+=t);return r}var Oe=(e,t)=>{let n=Array(e.length+t.length);for(let t=0;t<e.length;t++)n[t]=e[t];for(let r=0;r<t.length;r++)n[e.length+r]=t[r];return n},ke=(e,t)=>({classGroupId:e,validator:t}),Ae=(e=new Map,t=null,n)=>({nextPart:e,validators:t,classGroupId:n}),je=`-`,Me=[],Ne=`arbitrary..`,Pe=e=>{let t=Le(e),{conflictingClassGroups:n,conflictingClassGroupModifiers:r}=e;return{getClassGroupId:e=>{if(e.startsWith(`[`)&&e.endsWith(`]`))return Ie(e);let n=e.split(je);return Fe(n,n[0]===``&&n.length>1?1:0,t)},getConflictingClassGroupIds:(e,t)=>{if(t){let t=r[e],i=n[e];return t?i?Oe(i,t):t:i||Me}return n[e]||Me}}},Fe=(e,t,n)=>{if(e.length-t===0)return n.classGroupId;let r=e[t],i=n.nextPart.get(r);if(i){let n=Fe(e,t+1,i);if(n)return n}let a=n.validators;if(a===null)return;let o=t===0?e.join(je):e.slice(t).join(je),s=a.length;for(let e=0;e<s;e++){let t=a[e];if(t.validator(o))return t.classGroupId}},Ie=e=>e.slice(1,-1).indexOf(`:`)===-1?void 0:(()=>{let t=e.slice(1,-1),n=t.indexOf(`:`),r=t.slice(0,n);return r?Ne+r:void 0})(),Le=e=>{let{theme:t,classGroups:n}=e;return Re(n,t)},Re=(e,t)=>{let n=Ae();for(let r in e){let i=e[r];ze(i,n,r,t)}return n},ze=(e,t,n,r)=>{let i=e.length;for(let a=0;a<i;a++){let i=e[a];Be(i,t,n,r)}},Be=(e,t,n,r)=>{if(typeof e==`string`){Ve(e,t,n);return}if(typeof e==`function`){He(e,t,n,r);return}Ue(e,t,n,r)},Ve=(e,t,n)=>{let r=e===``?t:We(t,e);r.classGroupId=n},He=(e,t,n,r)=>{if(Ge(e)){ze(e(r),t,n,r);return}t.validators===null&&(t.validators=[]),t.validators.push(ke(n,e))},Ue=(e,t,n,r)=>{let i=Object.entries(e),a=i.length;for(let e=0;e<a;e++){let[a,o]=i[e];ze(o,We(t,a),n,r)}},We=(e,t)=>{let n=e,r=t.split(je),i=r.length;for(let e=0;e<i;e++){let t=r[e],i=n.nextPart.get(t);i||(i=Ae(),n.nextPart.set(t,i)),n=i}return n},Ge=e=>`isThemeGetter`in e&&e.isThemeGetter===!0,Ke=e=>{if(e<1)return{get:()=>void 0,set:()=>{}};let t=0,n=Object.create(null),r=Object.create(null),i=(i,a)=>{n[i]=a,t++,t>e&&(t=0,r=n,n=Object.create(null))};return{get(e){let t=n[e];if(t!==void 0)return t;if((t=r[e])!==void 0)return i(e,t),t},set(e,t){e in n?n[e]=t:i(e,t)}}},qe=`!`,Je=`:`,Ye=[],Xe=(e,t,n,r,i)=>({modifiers:e,hasImportantModifier:t,baseClassName:n,maybePostfixModifierPosition:r,isExternal:i}),Ze=e=>{let{prefix:t,experimentalParseClassName:n}=e,r=e=>{let t=[],n=0,r=0,i=0,a,o=e.length;for(let s=0;s<o;s++){let o=e[s];if(n===0&&r===0){if(o===Je){t.push(e.slice(i,s)),i=s+1;continue}if(o===`/`){a=s;continue}}o===`[`?n++:o===`]`?n--:o===`(`?r++:o===`)`&&r--}let s=t.length===0?e:e.slice(i),c=s,l=!1;s.endsWith(qe)?(c=s.slice(0,-1),l=!0):s.startsWith(qe)&&(c=s.slice(1),l=!0);let u=a&&a>i?a-i:void 0;return Xe(t,l,c,u)};if(t){let e=t+Je,n=r;r=t=>t.startsWith(e)?n(t.slice(e.length)):Xe(Ye,!1,t,void 0,!0)}if(n){let e=r;r=t=>n({className:t,parseClassName:e})}return r},Qe=e=>{let t=new Map;return e.orderSensitiveModifiers.forEach((e,n)=>{t.set(e,1e6+n)}),e=>{let n=[],r=[];for(let i=0;i<e.length;i++){let a=e[i],o=a[0]===`[`,s=t.has(a);o||s?(r.length>0&&(r.sort(),n.push(...r),r=[]),n.push(a)):r.push(a)}return r.length>0&&(r.sort(),n.push(...r)),n}},$e=e=>({cache:Ke(e.cacheSize),parseClassName:Ze(e),sortModifiers:Qe(e),...Pe(e)}),et=/\s+/,tt=(e,t)=>{let{parseClassName:n,getClassGroupId:r,getConflictingClassGroupIds:i,sortModifiers:a}=t,o=[],s=e.trim().split(et),c=``;for(let e=s.length-1;e>=0;--e){let t=s[e],{isExternal:l,modifiers:u,hasImportantModifier:d,baseClassName:f,maybePostfixModifierPosition:p}=n(t);if(l){c=t+(c.length>0?` `+c:c);continue}let m=!!p,h=r(m?f.substring(0,p):f);if(!h){if(!m){c=t+(c.length>0?` `+c:c);continue}if(h=r(f),!h){c=t+(c.length>0?` `+c:c);continue}m=!1}let g=u.length===0?``:u.length===1?u[0]:a(u).join(`:`),_=d?g+qe:g,v=_+h;if(o.indexOf(v)>-1)continue;o.push(v);let y=i(h,m);for(let e=0;e<y.length;++e){let t=y[e];o.push(_+t)}c=t+(c.length>0?` `+c:c)}return c},nt=(...e)=>{let t=0,n,r,i=``;for(;t<e.length;)(n=e[t++])&&(r=rt(n))&&(i&&(i+=` `),i+=r);return i},rt=e=>{if(typeof e==`string`)return e;let t,n=``;for(let r=0;r<e.length;r++)e[r]&&(t=rt(e[r]))&&(n&&(n+=` `),n+=t);return n},it=(e,...t)=>{let n,r,i,a,o=o=>(n=$e(t.reduce((e,t)=>t(e),e())),r=n.cache.get,i=n.cache.set,a=s,s(o)),s=e=>{let t=r(e);if(t)return t;let a=tt(e,n);return i(e,a),a};return a=o,(...e)=>a(nt(...e))},at=[],B=e=>{let t=t=>t[e]||at;return t.isThemeGetter=!0,t},ot=/^\[(?:(\w[\w-]*):)?(.+)\]$/i,st=/^\((?:(\w[\w-]*):)?(.+)\)$/i,ct=/^\d+\/\d+$/,lt=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,ut=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,dt=/^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,ft=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,pt=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,V=e=>ct.test(e),H=e=>!!e&&!Number.isNaN(Number(e)),U=e=>!!e&&Number.isInteger(Number(e)),mt=e=>e.endsWith(`%`)&&H(e.slice(0,-1)),W=e=>lt.test(e),ht=()=>!0,gt=e=>ut.test(e)&&!dt.test(e),_t=()=>!1,vt=e=>ft.test(e),yt=e=>pt.test(e),bt=e=>!G(e)&&!q(e),xt=e=>J(e,Pt,_t),G=e=>ot.test(e),K=e=>J(e,Ft,gt),St=e=>J(e,It,H),Ct=e=>J(e,Mt,_t),wt=e=>J(e,Nt,yt),Tt=e=>J(e,Rt,vt),q=e=>st.test(e),Et=e=>Y(e,Ft),Dt=e=>Y(e,Lt),Ot=e=>Y(e,Mt),kt=e=>Y(e,Pt),At=e=>Y(e,Nt),jt=e=>Y(e,Rt,!0),J=(e,t,n)=>{let r=ot.exec(e);return r?r[1]?t(r[1]):n(r[2]):!1},Y=(e,t,n=!1)=>{let r=st.exec(e);return r?r[1]?t(r[1]):n:!1},Mt=e=>e===`position`||e===`percentage`,Nt=e=>e===`image`||e===`url`,Pt=e=>e===`length`||e===`size`||e===`bg-size`,Ft=e=>e===`length`,It=e=>e===`number`,Lt=e=>e===`family-name`,Rt=e=>e===`shadow`,zt=it(()=>{let e=B(`color`),t=B(`font`),n=B(`text`),r=B(`font-weight`),i=B(`tracking`),a=B(`leading`),o=B(`breakpoint`),s=B(`container`),c=B(`spacing`),l=B(`radius`),u=B(`shadow`),d=B(`inset-shadow`),f=B(`text-shadow`),p=B(`drop-shadow`),m=B(`blur`),h=B(`perspective`),g=B(`aspect`),_=B(`ease`),v=B(`animate`),y=()=>[`auto`,`avoid`,`all`,`avoid-page`,`page`,`left`,`right`,`column`],b=()=>[`center`,`top`,`bottom`,`left`,`right`,`top-left`,`left-top`,`top-right`,`right-top`,`bottom-right`,`right-bottom`,`bottom-left`,`left-bottom`],x=()=>[...b(),q,G],ee=()=>[`auto`,`hidden`,`clip`,`visible`,`scroll`],te=()=>[`auto`,`contain`,`none`],S=()=>[q,G,c],C=()=>[V,`full`,`auto`,...S()],ne=()=>[U,`none`,`subgrid`,q,G],w=()=>[`auto`,{span:[`full`,U,q,G]},U,q,G],T=()=>[U,`auto`,q,G],E=()=>[`auto`,`min`,`max`,`fr`,q,G],re=()=>[`start`,`end`,`center`,`between`,`around`,`evenly`,`stretch`,`baseline`,`center-safe`,`end-safe`],D=()=>[`start`,`end`,`center`,`stretch`,`center-safe`,`end-safe`],O=()=>[`auto`,...S()],k=()=>[V,`auto`,`full`,`dvw`,`dvh`,`lvw`,`lvh`,`svw`,`svh`,`min`,`max`,`fit`,...S()],A=()=>[e,q,G],j=()=>[...b(),Ot,Ct,{position:[q,G]}],M=()=>[`no-repeat`,{repeat:[``,`x`,`y`,`space`,`round`]}],ie=()=>[`auto`,`cover`,`contain`,kt,xt,{size:[q,G]}],ae=()=>[mt,Et,K],N=()=>[``,`none`,`full`,l,q,G],P=()=>[``,H,Et,K],oe=()=>[`solid`,`dashed`,`dotted`,`double`],se=()=>[`normal`,`multiply`,`screen`,`overlay`,`darken`,`lighten`,`color-dodge`,`color-burn`,`hard-light`,`soft-light`,`difference`,`exclusion`,`hue`,`saturation`,`color`,`luminosity`],F=()=>[H,mt,Ot,Ct],ce=()=>[``,`none`,m,q,G],le=()=>[`none`,H,q,G],I=()=>[`none`,H,q,G],ue=()=>[H,q,G],L=()=>[V,`full`,...S()];return{cacheSize:500,theme:{animate:[`spin`,`ping`,`pulse`,`bounce`],aspect:[`video`],blur:[W],breakpoint:[W],color:[ht],container:[W],"drop-shadow":[W],ease:[`in`,`out`,`in-out`],font:[bt],"font-weight":[`thin`,`extralight`,`light`,`normal`,`medium`,`semibold`,`bold`,`extrabold`,`black`],"inset-shadow":[W],leading:[`none`,`tight`,`snug`,`normal`,`relaxed`,`loose`],perspective:[`dramatic`,`near`,`normal`,`midrange`,`distant`,`none`],radius:[W],shadow:[W],spacing:[`px`,H],text:[W],"text-shadow":[W],tracking:[`tighter`,`tight`,`normal`,`wide`,`wider`,`widest`]},classGroups:{aspect:[{aspect:[`auto`,`square`,V,G,q,g]}],container:[`container`],columns:[{columns:[H,G,q,s]}],"break-after":[{"break-after":y()}],"break-before":[{"break-before":y()}],"break-inside":[{"break-inside":[`auto`,`avoid`,`avoid-page`,`avoid-column`]}],"box-decoration":[{"box-decoration":[`slice`,`clone`]}],box:[{box:[`border`,`content`]}],display:[`block`,`inline-block`,`inline`,`flex`,`inline-flex`,`table`,`inline-table`,`table-caption`,`table-cell`,`table-column`,`table-column-group`,`table-footer-group`,`table-header-group`,`table-row-group`,`table-row`,`flow-root`,`grid`,`inline-grid`,`contents`,`list-item`,`hidden`],sr:[`sr-only`,`not-sr-only`],float:[{float:[`right`,`left`,`none`,`start`,`end`]}],clear:[{clear:[`left`,`right`,`both`,`none`,`start`,`end`]}],isolation:[`isolate`,`isolation-auto`],"object-fit":[{object:[`contain`,`cover`,`fill`,`none`,`scale-down`]}],"object-position":[{object:x()}],overflow:[{overflow:ee()}],"overflow-x":[{"overflow-x":ee()}],"overflow-y":[{"overflow-y":ee()}],overscroll:[{overscroll:te()}],"overscroll-x":[{"overscroll-x":te()}],"overscroll-y":[{"overscroll-y":te()}],position:[`static`,`fixed`,`absolute`,`relative`,`sticky`],inset:[{inset:C()}],"inset-x":[{"inset-x":C()}],"inset-y":[{"inset-y":C()}],start:[{start:C()}],end:[{end:C()}],top:[{top:C()}],right:[{right:C()}],bottom:[{bottom:C()}],left:[{left:C()}],visibility:[`visible`,`invisible`,`collapse`],z:[{z:[U,`auto`,q,G]}],basis:[{basis:[V,`full`,`auto`,s,...S()]}],"flex-direction":[{flex:[`row`,`row-reverse`,`col`,`col-reverse`]}],"flex-wrap":[{flex:[`nowrap`,`wrap`,`wrap-reverse`]}],flex:[{flex:[H,V,`auto`,`initial`,`none`,G]}],grow:[{grow:[``,H,q,G]}],shrink:[{shrink:[``,H,q,G]}],order:[{order:[U,`first`,`last`,`none`,q,G]}],"grid-cols":[{"grid-cols":ne()}],"col-start-end":[{col:w()}],"col-start":[{"col-start":T()}],"col-end":[{"col-end":T()}],"grid-rows":[{"grid-rows":ne()}],"row-start-end":[{row:w()}],"row-start":[{"row-start":T()}],"row-end":[{"row-end":T()}],"grid-flow":[{"grid-flow":[`row`,`col`,`dense`,`row-dense`,`col-dense`]}],"auto-cols":[{"auto-cols":E()}],"auto-rows":[{"auto-rows":E()}],gap:[{gap:S()}],"gap-x":[{"gap-x":S()}],"gap-y":[{"gap-y":S()}],"justify-content":[{justify:[...re(),`normal`]}],"justify-items":[{"justify-items":[...D(),`normal`]}],"justify-self":[{"justify-self":[`auto`,...D()]}],"align-content":[{content:[`normal`,...re()]}],"align-items":[{items:[...D(),{baseline:[``,`last`]}]}],"align-self":[{self:[`auto`,...D(),{baseline:[``,`last`]}]}],"place-content":[{"place-content":re()}],"place-items":[{"place-items":[...D(),`baseline`]}],"place-self":[{"place-self":[`auto`,...D()]}],p:[{p:S()}],px:[{px:S()}],py:[{py:S()}],ps:[{ps:S()}],pe:[{pe:S()}],pt:[{pt:S()}],pr:[{pr:S()}],pb:[{pb:S()}],pl:[{pl:S()}],m:[{m:O()}],mx:[{mx:O()}],my:[{my:O()}],ms:[{ms:O()}],me:[{me:O()}],mt:[{mt:O()}],mr:[{mr:O()}],mb:[{mb:O()}],ml:[{ml:O()}],"space-x":[{"space-x":S()}],"space-x-reverse":[`space-x-reverse`],"space-y":[{"space-y":S()}],"space-y-reverse":[`space-y-reverse`],size:[{size:k()}],w:[{w:[s,`screen`,...k()]}],"min-w":[{"min-w":[s,`screen`,`none`,...k()]}],"max-w":[{"max-w":[s,`screen`,`none`,`prose`,{screen:[o]},...k()]}],h:[{h:[`screen`,`lh`,...k()]}],"min-h":[{"min-h":[`screen`,`lh`,`none`,...k()]}],"max-h":[{"max-h":[`screen`,`lh`,...k()]}],"font-size":[{text:[`base`,n,Et,K]}],"font-smoothing":[`antialiased`,`subpixel-antialiased`],"font-style":[`italic`,`not-italic`],"font-weight":[{font:[r,q,St]}],"font-stretch":[{"font-stretch":[`ultra-condensed`,`extra-condensed`,`condensed`,`semi-condensed`,`normal`,`semi-expanded`,`expanded`,`extra-expanded`,`ultra-expanded`,mt,G]}],"font-family":[{font:[Dt,G,t]}],"fvn-normal":[`normal-nums`],"fvn-ordinal":[`ordinal`],"fvn-slashed-zero":[`slashed-zero`],"fvn-figure":[`lining-nums`,`oldstyle-nums`],"fvn-spacing":[`proportional-nums`,`tabular-nums`],"fvn-fraction":[`diagonal-fractions`,`stacked-fractions`],tracking:[{tracking:[i,q,G]}],"line-clamp":[{"line-clamp":[H,`none`,q,St]}],leading:[{leading:[a,...S()]}],"list-image":[{"list-image":[`none`,q,G]}],"list-style-position":[{list:[`inside`,`outside`]}],"list-style-type":[{list:[`disc`,`decimal`,`none`,q,G]}],"text-alignment":[{text:[`left`,`center`,`right`,`justify`,`start`,`end`]}],"placeholder-color":[{placeholder:A()}],"text-color":[{text:A()}],"text-decoration":[`underline`,`overline`,`line-through`,`no-underline`],"text-decoration-style":[{decoration:[...oe(),`wavy`]}],"text-decoration-thickness":[{decoration:[H,`from-font`,`auto`,q,K]}],"text-decoration-color":[{decoration:A()}],"underline-offset":[{"underline-offset":[H,`auto`,q,G]}],"text-transform":[`uppercase`,`lowercase`,`capitalize`,`normal-case`],"text-overflow":[`truncate`,`text-ellipsis`,`text-clip`],"text-wrap":[{text:[`wrap`,`nowrap`,`balance`,`pretty`]}],indent:[{indent:S()}],"vertical-align":[{align:[`baseline`,`top`,`middle`,`bottom`,`text-top`,`text-bottom`,`sub`,`super`,q,G]}],whitespace:[{whitespace:[`normal`,`nowrap`,`pre`,`pre-line`,`pre-wrap`,`break-spaces`]}],break:[{break:[`normal`,`words`,`all`,`keep`]}],wrap:[{wrap:[`break-word`,`anywhere`,`normal`]}],hyphens:[{hyphens:[`none`,`manual`,`auto`]}],content:[{content:[`none`,q,G]}],"bg-attachment":[{bg:[`fixed`,`local`,`scroll`]}],"bg-clip":[{"bg-clip":[`border`,`padding`,`content`,`text`]}],"bg-origin":[{"bg-origin":[`border`,`padding`,`content`]}],"bg-position":[{bg:j()}],"bg-repeat":[{bg:M()}],"bg-size":[{bg:ie()}],"bg-image":[{bg:[`none`,{linear:[{to:[`t`,`tr`,`r`,`br`,`b`,`bl`,`l`,`tl`]},U,q,G],radial:[``,q,G],conic:[U,q,G]},At,wt]}],"bg-color":[{bg:A()}],"gradient-from-pos":[{from:ae()}],"gradient-via-pos":[{via:ae()}],"gradient-to-pos":[{to:ae()}],"gradient-from":[{from:A()}],"gradient-via":[{via:A()}],"gradient-to":[{to:A()}],rounded:[{rounded:N()}],"rounded-s":[{"rounded-s":N()}],"rounded-e":[{"rounded-e":N()}],"rounded-t":[{"rounded-t":N()}],"rounded-r":[{"rounded-r":N()}],"rounded-b":[{"rounded-b":N()}],"rounded-l":[{"rounded-l":N()}],"rounded-ss":[{"rounded-ss":N()}],"rounded-se":[{"rounded-se":N()}],"rounded-ee":[{"rounded-ee":N()}],"rounded-es":[{"rounded-es":N()}],"rounded-tl":[{"rounded-tl":N()}],"rounded-tr":[{"rounded-tr":N()}],"rounded-br":[{"rounded-br":N()}],"rounded-bl":[{"rounded-bl":N()}],"border-w":[{border:P()}],"border-w-x":[{"border-x":P()}],"border-w-y":[{"border-y":P()}],"border-w-s":[{"border-s":P()}],"border-w-e":[{"border-e":P()}],"border-w-t":[{"border-t":P()}],"border-w-r":[{"border-r":P()}],"border-w-b":[{"border-b":P()}],"border-w-l":[{"border-l":P()}],"divide-x":[{"divide-x":P()}],"divide-x-reverse":[`divide-x-reverse`],"divide-y":[{"divide-y":P()}],"divide-y-reverse":[`divide-y-reverse`],"border-style":[{border:[...oe(),`hidden`,`none`]}],"divide-style":[{divide:[...oe(),`hidden`,`none`]}],"border-color":[{border:A()}],"border-color-x":[{"border-x":A()}],"border-color-y":[{"border-y":A()}],"border-color-s":[{"border-s":A()}],"border-color-e":[{"border-e":A()}],"border-color-t":[{"border-t":A()}],"border-color-r":[{"border-r":A()}],"border-color-b":[{"border-b":A()}],"border-color-l":[{"border-l":A()}],"divide-color":[{divide:A()}],"outline-style":[{outline:[...oe(),`none`,`hidden`]}],"outline-offset":[{"outline-offset":[H,q,G]}],"outline-w":[{outline:[``,H,Et,K]}],"outline-color":[{outline:A()}],shadow:[{shadow:[``,`none`,u,jt,Tt]}],"shadow-color":[{shadow:A()}],"inset-shadow":[{"inset-shadow":[`none`,d,jt,Tt]}],"inset-shadow-color":[{"inset-shadow":A()}],"ring-w":[{ring:P()}],"ring-w-inset":[`ring-inset`],"ring-color":[{ring:A()}],"ring-offset-w":[{"ring-offset":[H,K]}],"ring-offset-color":[{"ring-offset":A()}],"inset-ring-w":[{"inset-ring":P()}],"inset-ring-color":[{"inset-ring":A()}],"text-shadow":[{"text-shadow":[`none`,f,jt,Tt]}],"text-shadow-color":[{"text-shadow":A()}],opacity:[{opacity:[H,q,G]}],"mix-blend":[{"mix-blend":[...se(),`plus-darker`,`plus-lighter`]}],"bg-blend":[{"bg-blend":se()}],"mask-clip":[{"mask-clip":[`border`,`padding`,`content`,`fill`,`stroke`,`view`]},`mask-no-clip`],"mask-composite":[{mask:[`add`,`subtract`,`intersect`,`exclude`]}],"mask-image-linear-pos":[{"mask-linear":[H]}],"mask-image-linear-from-pos":[{"mask-linear-from":F()}],"mask-image-linear-to-pos":[{"mask-linear-to":F()}],"mask-image-linear-from-color":[{"mask-linear-from":A()}],"mask-image-linear-to-color":[{"mask-linear-to":A()}],"mask-image-t-from-pos":[{"mask-t-from":F()}],"mask-image-t-to-pos":[{"mask-t-to":F()}],"mask-image-t-from-color":[{"mask-t-from":A()}],"mask-image-t-to-color":[{"mask-t-to":A()}],"mask-image-r-from-pos":[{"mask-r-from":F()}],"mask-image-r-to-pos":[{"mask-r-to":F()}],"mask-image-r-from-color":[{"mask-r-from":A()}],"mask-image-r-to-color":[{"mask-r-to":A()}],"mask-image-b-from-pos":[{"mask-b-from":F()}],"mask-image-b-to-pos":[{"mask-b-to":F()}],"mask-image-b-from-color":[{"mask-b-from":A()}],"mask-image-b-to-color":[{"mask-b-to":A()}],"mask-image-l-from-pos":[{"mask-l-from":F()}],"mask-image-l-to-pos":[{"mask-l-to":F()}],"mask-image-l-from-color":[{"mask-l-from":A()}],"mask-image-l-to-color":[{"mask-l-to":A()}],"mask-image-x-from-pos":[{"mask-x-from":F()}],"mask-image-x-to-pos":[{"mask-x-to":F()}],"mask-image-x-from-color":[{"mask-x-from":A()}],"mask-image-x-to-color":[{"mask-x-to":A()}],"mask-image-y-from-pos":[{"mask-y-from":F()}],"mask-image-y-to-pos":[{"mask-y-to":F()}],"mask-image-y-from-color":[{"mask-y-from":A()}],"mask-image-y-to-color":[{"mask-y-to":A()}],"mask-image-radial":[{"mask-radial":[q,G]}],"mask-image-radial-from-pos":[{"mask-radial-from":F()}],"mask-image-radial-to-pos":[{"mask-radial-to":F()}],"mask-image-radial-from-color":[{"mask-radial-from":A()}],"mask-image-radial-to-color":[{"mask-radial-to":A()}],"mask-image-radial-shape":[{"mask-radial":[`circle`,`ellipse`]}],"mask-image-radial-size":[{"mask-radial":[{closest:[`side`,`corner`],farthest:[`side`,`corner`]}]}],"mask-image-radial-pos":[{"mask-radial-at":b()}],"mask-image-conic-pos":[{"mask-conic":[H]}],"mask-image-conic-from-pos":[{"mask-conic-from":F()}],"mask-image-conic-to-pos":[{"mask-conic-to":F()}],"mask-image-conic-from-color":[{"mask-conic-from":A()}],"mask-image-conic-to-color":[{"mask-conic-to":A()}],"mask-mode":[{mask:[`alpha`,`luminance`,`match`]}],"mask-origin":[{"mask-origin":[`border`,`padding`,`content`,`fill`,`stroke`,`view`]}],"mask-position":[{mask:j()}],"mask-repeat":[{mask:M()}],"mask-size":[{mask:ie()}],"mask-type":[{"mask-type":[`alpha`,`luminance`]}],"mask-image":[{mask:[`none`,q,G]}],filter:[{filter:[``,`none`,q,G]}],blur:[{blur:ce()}],brightness:[{brightness:[H,q,G]}],contrast:[{contrast:[H,q,G]}],"drop-shadow":[{"drop-shadow":[``,`none`,p,jt,Tt]}],"drop-shadow-color":[{"drop-shadow":A()}],grayscale:[{grayscale:[``,H,q,G]}],"hue-rotate":[{"hue-rotate":[H,q,G]}],invert:[{invert:[``,H,q,G]}],saturate:[{saturate:[H,q,G]}],sepia:[{sepia:[``,H,q,G]}],"backdrop-filter":[{"backdrop-filter":[``,`none`,q,G]}],"backdrop-blur":[{"backdrop-blur":ce()}],"backdrop-brightness":[{"backdrop-brightness":[H,q,G]}],"backdrop-contrast":[{"backdrop-contrast":[H,q,G]}],"backdrop-grayscale":[{"backdrop-grayscale":[``,H,q,G]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[H,q,G]}],"backdrop-invert":[{"backdrop-invert":[``,H,q,G]}],"backdrop-opacity":[{"backdrop-opacity":[H,q,G]}],"backdrop-saturate":[{"backdrop-saturate":[H,q,G]}],"backdrop-sepia":[{"backdrop-sepia":[``,H,q,G]}],"border-collapse":[{border:[`collapse`,`separate`]}],"border-spacing":[{"border-spacing":S()}],"border-spacing-x":[{"border-spacing-x":S()}],"border-spacing-y":[{"border-spacing-y":S()}],"table-layout":[{table:[`auto`,`fixed`]}],caption:[{caption:[`top`,`bottom`]}],transition:[{transition:[``,`all`,`colors`,`opacity`,`shadow`,`transform`,`none`,q,G]}],"transition-behavior":[{transition:[`normal`,`discrete`]}],duration:[{duration:[H,`initial`,q,G]}],ease:[{ease:[`linear`,`initial`,_,q,G]}],delay:[{delay:[H,q,G]}],animate:[{animate:[`none`,v,q,G]}],backface:[{backface:[`hidden`,`visible`]}],perspective:[{perspective:[h,q,G]}],"perspective-origin":[{"perspective-origin":x()}],rotate:[{rotate:le()}],"rotate-x":[{"rotate-x":le()}],"rotate-y":[{"rotate-y":le()}],"rotate-z":[{"rotate-z":le()}],scale:[{scale:I()}],"scale-x":[{"scale-x":I()}],"scale-y":[{"scale-y":I()}],"scale-z":[{"scale-z":I()}],"scale-3d":[`scale-3d`],skew:[{skew:ue()}],"skew-x":[{"skew-x":ue()}],"skew-y":[{"skew-y":ue()}],transform:[{transform:[q,G,``,`none`,`gpu`,`cpu`]}],"transform-origin":[{origin:x()}],"transform-style":[{transform:[`3d`,`flat`]}],translate:[{translate:L()}],"translate-x":[{"translate-x":L()}],"translate-y":[{"translate-y":L()}],"translate-z":[{"translate-z":L()}],"translate-none":[`translate-none`],accent:[{accent:A()}],appearance:[{appearance:[`none`,`auto`]}],"caret-color":[{caret:A()}],"color-scheme":[{scheme:[`normal`,`dark`,`light`,`light-dark`,`only-dark`,`only-light`]}],cursor:[{cursor:[`auto`,`default`,`pointer`,`wait`,`text`,`move`,`help`,`not-allowed`,`none`,`context-menu`,`progress`,`cell`,`crosshair`,`vertical-text`,`alias`,`copy`,`no-drop`,`grab`,`grabbing`,`all-scroll`,`col-resize`,`row-resize`,`n-resize`,`e-resize`,`s-resize`,`w-resize`,`ne-resize`,`nw-resize`,`se-resize`,`sw-resize`,`ew-resize`,`ns-resize`,`nesw-resize`,`nwse-resize`,`zoom-in`,`zoom-out`,q,G]}],"field-sizing":[{"field-sizing":[`fixed`,`content`]}],"pointer-events":[{"pointer-events":[`auto`,`none`]}],resize:[{resize:[`none`,``,`y`,`x`]}],"scroll-behavior":[{scroll:[`auto`,`smooth`]}],"scroll-m":[{"scroll-m":S()}],"scroll-mx":[{"scroll-mx":S()}],"scroll-my":[{"scroll-my":S()}],"scroll-ms":[{"scroll-ms":S()}],"scroll-me":[{"scroll-me":S()}],"scroll-mt":[{"scroll-mt":S()}],"scroll-mr":[{"scroll-mr":S()}],"scroll-mb":[{"scroll-mb":S()}],"scroll-ml":[{"scroll-ml":S()}],"scroll-p":[{"scroll-p":S()}],"scroll-px":[{"scroll-px":S()}],"scroll-py":[{"scroll-py":S()}],"scroll-ps":[{"scroll-ps":S()}],"scroll-pe":[{"scroll-pe":S()}],"scroll-pt":[{"scroll-pt":S()}],"scroll-pr":[{"scroll-pr":S()}],"scroll-pb":[{"scroll-pb":S()}],"scroll-pl":[{"scroll-pl":S()}],"snap-align":[{snap:[`start`,`end`,`center`,`align-none`]}],"snap-stop":[{snap:[`normal`,`always`]}],"snap-type":[{snap:[`none`,`x`,`y`,`both`]}],"snap-strictness":[{snap:[`mandatory`,`proximity`]}],touch:[{touch:[`auto`,`none`,`manipulation`]}],"touch-x":[{"touch-pan":[`x`,`left`,`right`]}],"touch-y":[{"touch-pan":[`y`,`up`,`down`]}],"touch-pz":[`touch-pinch-zoom`],select:[{select:[`none`,`text`,`all`,`auto`]}],"will-change":[{"will-change":[`auto`,`scroll`,`contents`,`transform`,q,G]}],fill:[{fill:[`none`,...A()]}],"stroke-w":[{stroke:[H,Et,K,St]}],stroke:[{stroke:[`none`,...A()]}],"forced-color-adjust":[{"forced-color-adjust":[`auto`,`none`]}]},conflictingClassGroups:{overflow:[`overflow-x`,`overflow-y`],overscroll:[`overscroll-x`,`overscroll-y`],inset:[`inset-x`,`inset-y`,`start`,`end`,`top`,`right`,`bottom`,`left`],"inset-x":[`right`,`left`],"inset-y":[`top`,`bottom`],flex:[`basis`,`grow`,`shrink`],gap:[`gap-x`,`gap-y`],p:[`px`,`py`,`ps`,`pe`,`pt`,`pr`,`pb`,`pl`],px:[`pr`,`pl`],py:[`pt`,`pb`],m:[`mx`,`my`,`ms`,`me`,`mt`,`mr`,`mb`,`ml`],mx:[`mr`,`ml`],my:[`mt`,`mb`],size:[`w`,`h`],"font-size":[`leading`],"fvn-normal":[`fvn-ordinal`,`fvn-slashed-zero`,`fvn-figure`,`fvn-spacing`,`fvn-fraction`],"fvn-ordinal":[`fvn-normal`],"fvn-slashed-zero":[`fvn-normal`],"fvn-figure":[`fvn-normal`],"fvn-spacing":[`fvn-normal`],"fvn-fraction":[`fvn-normal`],"line-clamp":[`display`,`overflow`],rounded:[`rounded-s`,`rounded-e`,`rounded-t`,`rounded-r`,`rounded-b`,`rounded-l`,`rounded-ss`,`rounded-se`,`rounded-ee`,`rounded-es`,`rounded-tl`,`rounded-tr`,`rounded-br`,`rounded-bl`],"rounded-s":[`rounded-ss`,`rounded-es`],"rounded-e":[`rounded-se`,`rounded-ee`],"rounded-t":[`rounded-tl`,`rounded-tr`],"rounded-r":[`rounded-tr`,`rounded-br`],"rounded-b":[`rounded-br`,`rounded-bl`],"rounded-l":[`rounded-tl`,`rounded-bl`],"border-spacing":[`border-spacing-x`,`border-spacing-y`],"border-w":[`border-w-x`,`border-w-y`,`border-w-s`,`border-w-e`,`border-w-t`,`border-w-r`,`border-w-b`,`border-w-l`],"border-w-x":[`border-w-r`,`border-w-l`],"border-w-y":[`border-w-t`,`border-w-b`],"border-color":[`border-color-x`,`border-color-y`,`border-color-s`,`border-color-e`,`border-color-t`,`border-color-r`,`border-color-b`,`border-color-l`],"border-color-x":[`border-color-r`,`border-color-l`],"border-color-y":[`border-color-t`,`border-color-b`],translate:[`translate-x`,`translate-y`,`translate-none`],"translate-none":[`translate`,`translate-x`,`translate-y`,`translate-z`],"scroll-m":[`scroll-mx`,`scroll-my`,`scroll-ms`,`scroll-me`,`scroll-mt`,`scroll-mr`,`scroll-mb`,`scroll-ml`],"scroll-mx":[`scroll-mr`,`scroll-ml`],"scroll-my":[`scroll-mt`,`scroll-mb`],"scroll-p":[`scroll-px`,`scroll-py`,`scroll-ps`,`scroll-pe`,`scroll-pt`,`scroll-pr`,`scroll-pb`,`scroll-pl`],"scroll-px":[`scroll-pr`,`scroll-pl`],"scroll-py":[`scroll-pt`,`scroll-pb`],touch:[`touch-x`,`touch-y`,`touch-pz`],"touch-x":[`touch`],"touch-y":[`touch`],"touch-pz":[`touch`]},conflictingClassGroupModifiers:{"font-size":[`leading`]},orderSensitiveModifiers:[`*`,`**`,`after`,`backdrop`,`before`,`details-content`,`file`,`first-letter`,`first-line`,`marker`,`placeholder`,`selection`]}});function X(...e){return zt(De(e))}var Bt=g,Vt=w.forwardRef(({className:e,...t},n)=>(0,T.jsx)(h,{ref:n,className:X(`inline-flex h-10 items-center justify-center gap-1 overflow-x-auto rounded-md bg-muted p-1 text-muted-foreground`,e),...t}));Vt.displayName=h.displayName;var Z=w.forwardRef(({className:e,...t},n)=>(0,T.jsx)(x,{ref:n,className:X(`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:relative data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm`,e),...t}));Z.displayName=x.displayName;var Ht=w.forwardRef(({className:e,...t},n)=>(0,T.jsx)(C,{ref:n,className:X(`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`,e),...t}));Ht.displayName=C.displayName;var Ut=e=>typeof e==`boolean`?`${e}`:e===0?`0`:e;const Wt=De;var Gt=((e,t)=>n=>{if(t?.variants==null)return Wt(e,n?.class,n?.className);let{variants:r,defaultVariants:i}=t,a=Object.keys(r).map(e=>{let t=n?.[e],a=i?.[e];if(t===null)return null;let o=Ut(t)||Ut(a);return r[e][o]}),o=n&&Object.entries(n).reduce((e,t)=>{let[n,r]=t;return r===void 0||(e[n]=r),e},{});return Wt(e,a,t?.compoundVariants?.reduce((e,t)=>{let{class:n,className:r,...a}=t;return Object.entries(a).every(e=>{let[t,n]=e;return Array.isArray(n)?n.includes({...i,...o}[t]):{...i,...o}[t]===n})?[...e,n,r]:e},[]),n?.class,n?.className)})(`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,{variants:{variant:{default:`bg-primary text-primary-foreground shadow hover:bg-primary/90`,destructive:`bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90`,outline:`border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground`,secondary:`bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80`,ghost:`hover:bg-accent hover:text-accent-foreground`,link:`text-primary underline-offset-4 hover:underline`},size:{default:`h-10 px-4 py-2`,sm:`h-9 rounded-md px-3 text-sm`,lg:`h-11 rounded-md px-8`,icon:`h-10 w-10`}},defaultVariants:{variant:`default`,size:`default`}}),Kt=w.forwardRef(({className:e,variant:t,size:n,asChild:r=!1,...i},a)=>(0,T.jsx)(r?v:`button`,{className:X(Gt({variant:t,size:n,className:e})),ref:a,...i}));Kt.displayName=`Button`;var qt=b,Jt=p,Yt=w.forwardRef(({className:e,...t},n)=>(0,T.jsx)(_,{ref:n,className:X(`fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`,e),...t}));Yt.displayName=_.displayName;var Xt=w.forwardRef(({className:e,children:t,...n},r)=>(0,T.jsxs)(Jt,{children:[(0,T.jsx)(Yt,{}),(0,T.jsx)(y,{ref:r,className:X(`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg`,e),...n,children:t})]}));Xt.displayName=y.displayName;var Zt=({className:e,...t})=>(0,T.jsx)(`div`,{className:X(`flex flex-col space-y-1.5 text-center sm:text-left`,e),...t});Zt.displayName=`DialogHeader`;var Qt=({className:e,...t})=>(0,T.jsx)(`div`,{className:X(`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2`,e),...t});Qt.displayName=`DialogFooter`;var $t=w.forwardRef(({className:e,...t},n)=>(0,T.jsx)(te,{ref:n,className:X(`text-lg font-semibold leading-none tracking-tight`,e),...t}));$t.displayName=te.displayName;var en=w.forwardRef(({className:e,...t},n)=>(0,T.jsx)(ee,{ref:n,className:X(`text-sm text-muted-foreground`,e),...t}));en.displayName=ee.displayName;var tn=`modulepreload`,nn=function(e){return`/Thai-Deutsch-Vokabel-Trainer/`+e},rn={};const Q=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=nn(t,n),t in rn)return;rn[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:tn,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};var an=(0,w.lazy)(()=>Q(()=>import(`./Home-DncuDPTr.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8]))),on=(0,w.lazy)(()=>Q(()=>import(`./VocabList-Cg2Wg1hY.js`),__vite__mapDeps([9,5,4,2,3]))),sn=(0,w.lazy)(()=>Q(()=>import(`./Learn-BXqOWVZ1.js`),__vite__mapDeps([10,1,2,3,4,5,11,6,7,12,13,14]))),cn=(0,w.lazy)(()=>Q(()=>import(`./Test-BuXT0v7G.js`),__vite__mapDeps([15,1,2,3,4,5,11,6,7,12,13,14,8,16]))),ln=(0,w.lazy)(()=>Q(()=>import(`./Exam-bmBRfIlw.js`),__vite__mapDeps([17,1,2,3,4,5,11,6,13,14,8,16]))),un=(0,w.lazy)(()=>Q(()=>import(`./Games-BiRm5e29.js`),__vite__mapDeps([18,1,2,3,4,5,11,6,13,16]))),dn=(0,w.lazy)(()=>Q(()=>import(`./Settings-BGLTOWhf.js`),__vite__mapDeps([19,1,2,3,4,5,20,11,6]))),fn=[`home`,`list`,`learn`,`test`,`exam`,`games`,`settings`];function $(e,t){return`${e.trim()}__${(t??``).trim().toLowerCase()}`}function pn(e,t,n){return`${e}__${t.trim()}__${n.trim()}`}function mn(e,t,n,r,i){return`${e.trim()}__${t.trim()}__${n}__${r}__${i}`}var hn=`vocabDataSource`,gn=`custom_csv`;function _n(e){return fn.includes(e)}function vn(){try{let e=sessionStorage.getItem(`lastRoute`);if(e&&_n(e))return e}catch{}try{let e=localStorage.getItem(`lastRoute`);if(e&&_n(e))return e}catch{}return null}function yn(){if(typeof window>`u`)return`home`;let e=window.location.hash.replace(`#`,``);return _n(e)?e:vn()??`home`}function bn(){let e=localStorage.getItem(`theme`);return e===`dark`?!0:e!==`light`}function xn(){let[e,n]=(0,w.useState)(yn),[l,u]=(0,w.useState)(!1),[d,f]=(0,w.useState)(!0),[p,m]=(0,w.useState)(!1),[h,g]=(0,w.useState)(!1),[_,v]=(0,w.useState)(!1),y=(0,w.useRef)(null);(0,w.useEffect)(()=>{let e=!0;return(async()=>{try{console.log(`[App Init] Starting vocab initialization...`);let t=await E.vocab.count(),n=I.length;if(!e)return;if(console.log(`[App Init] Current DB count: ${t}, expected: ${n}`),t===0){console.log(`[App Init] DB is empty, loading ${n} entries...`);let e=Date.now(),t=I.map(t=>({...t,createdAt:e,updatedAt:e}));await E.transaction(`rw`,E.vocab,E.progress,async()=>{if(await E.vocab.count()===0){await E.vocab.bulkAdd(t);let e=await E.vocab.toCollection().primaryKeys();console.log(`[App Init] Initialized ${e.length} vocab entries, creating progress records...`),await A(e),console.log(`[App Init] Created progress records for ${e.length} entries`)}});let r=await E.vocab.count(),i=await E.progress.count();console.log(`✅ [App Init] Default vocab loaded: ${n} entries, DB now has ${r} total, ${i} progress records`)}else{let e=await E.progress.count();if(e<t){let n=await E.vocab.toCollection().primaryKeys();console.log(`[App Init] DB populated (${t} entries), repairing progress records (${e} -> ${n.length})...`),await A(n);let r=await E.progress.count();console.log(`✅ [App Init] Progress records repaired: ${r}`)}else console.log(`[App Init] DB already populated with ${t} entries and ${e} progress records, skipping load`)}if(localStorage.getItem(hn)!==gn){let e=await E.vocab.where(`thai`).equals(`ไม่`).and(e=>e.german===`no/nicht`).modify(e=>{e.german=`nein/nicht`,e.updatedAt=Date.now()});e>0&&console.log(`[App Init] Corrected ${e} vocab entry/entries: no/nicht -> nein/nicht`);let t=await E.vocab.toArray(),n=new Map(I.map(e=>[$(e.thai,e.transliteration),e])),r=new Map;for(let e of t){let t=$(e.thai,e.transliteration),n=r.get(t);n?n.push(e):r.set(t,[e])}let i=[],a=new Set;for(let[e,t]of n.entries()){let n=r.get(e)??[];if(n.length===0)continue;let o=n.find(e=>Number(e.lesson)===Number(t.lesson))??n[0];o.id!=null&&(await E.vocab.update(o.id,{thai:t.thai,german:t.german,transliteration:t.transliteration,pos:t.pos,lesson:t.lesson,tags:t.tags,exampleThai:t.exampleThai,exampleGerman:t.exampleGerman,updatedAt:Date.now()}),a.add(o.id));for(let e of n)e.id==null||e.id===o.id||i.push(e.id)}i.length>0&&(await E.transaction(`rw`,E.vocab,E.progress,async()=>{await E.vocab.bulkDelete(i),await E.progress.bulkDelete(i)}),console.log(`[App Init] Removed ${i.length} duplicate default vocab entries`)),a.size>0&&await A(Array.from(a));let o=new Set((await E.vocab.toArray()).map(e=>$(e.thai,e.transliteration))),s=I.filter(e=>!o.has($(e.thai,e.transliteration)));if(s.length>0){let e=Date.now(),t=s.map(t=>({...t,createdAt:e,updatedAt:e}));await A((await E.vocab.bulkAdd(t,{allKeys:!0})).map(e=>Number(e)).filter(e=>Number.isFinite(e)&&e>0)),console.log(`[App Init] Added ${t.length} missing default vocab entries`)}}else{console.log(`[App Init] Custom CSV source active, skipping default vocab overwrite sync.`);let e=await E.vocab.count();if(e<n){let t=new Set((await E.vocab.toArray()).map(e=>$(e.thai,e.transliteration))),n=I.filter(e=>!t.has($(e.thai,e.transliteration)));if(n.length>0){let t=Date.now(),r=n.map(e=>({...e,createdAt:t,updatedAt:t}));await A((await E.vocab.bulkAdd(r,{allKeys:!0})).map(e=>Number(e)).filter(e=>Number.isFinite(e)&&e>0)),console.log(`[App Init] Custom source fallback added ${r.length} missing defaults (${e} -> ${e+r.length})`)}}}let r=await E.numbersVocab.count(),i=we.length;if(r===0){let e=Date.now(),t=we.map(t=>({...t,createdAt:e,updatedAt:e}));await E.numbersVocab.bulkAdd(t),await j(await E.numbersVocab.toCollection().primaryKeys()),console.log(`✅ [App Init] Default numbers loaded: ${i} entries`)}else{let e=await E.numbersProgress.count();if(e<r){let t=await E.numbersVocab.toCollection().primaryKeys();await j(t),console.log(`[App Init] Numbers progress repaired: ${e} -> ${t.length}`)}}let a=await E.numbersVocab.toArray(),o=new Map(we.map(e=>[pn(e.arabic,e.thaiWord,e.thaiDigit),e])),s=new Map;for(let e of a){let t=pn(e.arabic,e.thaiWord,e.thaiDigit),n=s.get(t);n?n.push(e):s.set(t,[e])}let c=[],l=new Set;for(let[e,t]of o.entries()){let n=s.get(e)??[];if(n.length===0)continue;let r=n[0];r.id!=null&&(await E.numbersVocab.update(r.id,{arabic:t.arabic,thaiWord:t.thaiWord,thaiDigit:t.thaiDigit,german:t.german,transliteration:t.transliteration,lesson:t.lesson,tags:t.tags,updatedAt:Date.now()}),l.add(r.id));for(let e of n)e.id==null||e.id===r.id||c.push(e.id)}c.length>0&&(await E.transaction(`rw`,E.numbersVocab,E.numbersProgress,async()=>{await E.numbersVocab.bulkDelete(c),await E.numbersProgress.bulkDelete(c)}),console.log(`[App Init] Removed ${c.length} duplicate default numbers`)),l.size>0&&await j(Array.from(l));let u=new Set((await E.numbersVocab.toArray()).map(e=>pn(e.arabic,e.thaiWord,e.thaiDigit))),d=we.filter(e=>!u.has(pn(e.arabic,e.thaiWord,e.thaiDigit)));if(d.length>0){let e=Date.now(),t=d.map(t=>({...t,createdAt:e,updatedAt:e}));await j((await E.numbersVocab.bulkAdd(t,{allKeys:!0})).map(e=>Number(e)).filter(e=>Number.isFinite(e)&&e>0)),console.log(`[App Init] Added ${t.length} missing default number entries`)}let f=Te.flatMap(e=>e.sentences.map(t=>({thai:t.thai,german:t.german,lesson:e.lesson,rangeStart:e.rangeStart,rangeEnd:e.rangeEnd,unlockThresholdTestPassed:e.unlockThresholdTestPassed,sourceThaiWord:t.sourceThaiWord,tags:[`Sentences`,`L${e.lesson}`,`R${e.rangeStart}-${e.rangeEnd}`],viewed:!1,createdAt:0,updatedAt:0}))),p=await E.sentencesVocab.count(),m=f.length;if(p===0){let e=Date.now(),t=f.map(t=>({...t,createdAt:e,updatedAt:e}));await E.sentencesVocab.bulkAdd(t),await M(await E.sentencesVocab.toCollection().primaryKeys()),console.log(`✅ [App Init] Default sentences loaded: ${m} entries`)}else{let e=await E.sentencesProgress.count();if(e<p){let t=await E.sentencesVocab.toCollection().primaryKeys();await M(t),console.log(`[App Init] Sentence progress repaired: ${e} -> ${t.length}`)}}let h=await E.sentencesVocab.toArray(),g=new Map(f.map(e=>[mn(e.thai,e.german,e.lesson,e.rangeStart,e.rangeEnd),e])),_=new Map;for(let e of h){let t=mn(e.thai,e.german,e.lesson,e.rangeStart,e.rangeEnd),n=_.get(t);n?n.push(e):_.set(t,[e])}let v=[],y=new Set;for(let[e,t]of g.entries()){let n=_.get(e)??[];if(n.length===0)continue;let r=n[0];r.id!=null&&(await E.sentencesVocab.update(r.id,{thai:t.thai,german:t.german,lesson:t.lesson,rangeStart:t.rangeStart,rangeEnd:t.rangeEnd,unlockThresholdTestPassed:t.unlockThresholdTestPassed,sourceThaiWord:t.sourceThaiWord,tags:t.tags,updatedAt:Date.now()}),y.add(r.id));for(let e of n)e.id==null||e.id===r.id||v.push(e.id)}v.length>0&&(await E.transaction(`rw`,E.sentencesVocab,E.sentencesProgress,async()=>{await E.sentencesVocab.bulkDelete(v),await E.sentencesProgress.bulkDelete(v)}),console.log(`[App Init] Removed ${v.length} duplicate default sentences`)),y.size>0&&await M(Array.from(y));let b=new Set((await E.sentencesVocab.toArray()).map(e=>mn(e.thai,e.german,e.lesson,e.rangeStart,e.rangeEnd))),x=f.filter(e=>!b.has(mn(e.thai,e.german,e.lesson,e.rangeStart,e.rangeEnd)));if(x.length>0){let e=Date.now(),t=x.map(t=>({...t,createdAt:e,updatedAt:e}));await M((await E.sentencesVocab.bulkAdd(t,{allKeys:!0})).map(e=>Number(e)).filter(e=>Number.isFinite(e)&&e>0)),console.log(`[App Init] Added ${t.length} missing default sentence entries`)}}catch(e){console.error(`Failed to load default vocab:`,e)}})(),()=>{e=!1}},[]),(0,w.useEffect)(()=>{localStorage.getItem(`showVocabPage`)===`true`&&f(!0)},[]),(0,w.useEffect)(()=>{let e=e=>{f(e.detail?.visible??!1)};return window.addEventListener(`vocabPageVisibilityChanged`,e),()=>window.removeEventListener(`vocabPageVisibilityChanged`,e)},[]),(0,w.useEffect)(()=>{let e=e=>{g(!!e.detail?.active)};return window.addEventListener(`learnSessionVisibilityChanged`,e),()=>window.removeEventListener(`learnSessionVisibilityChanged`,e)},[]),(0,w.useEffect)(()=>{let e=e=>{let t=e?.detail;typeof t==`string`&&_n(t)&&n(t)};return window.addEventListener(`appNavigate`,e),()=>window.removeEventListener(`appNavigate`,e)},[]),(0,w.useEffect)(()=>{let e=()=>{let e=window.location.hash.replace(`#`,``);if(_n(e)){n(e);return}let t=vn();t&&n(t)};return e(),window.addEventListener(`hashchange`,e),()=>window.removeEventListener(`hashchange`,e)},[]),(0,w.useEffect)(()=>{window.location.hash!==`#${e}`&&window.history.replaceState(null,``,`#${e}`);try{sessionStorage.setItem(`lastRoute`,e),localStorage.setItem(`lastRoute`,e)}catch{}},[e]),(0,w.useEffect)(()=>{v(!1)},[e]),(0,w.useEffect)(()=>{if(!_)return;let e=e=>{y.current&&!y.current.contains(e.target)&&v(!1)};return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[_]),(0,w.useEffect)(()=>{e===`list`&&!d&&n(`home`)},[d,e]),(0,w.useEffect)(()=>{let e=bn();u(e),document.documentElement.classList.toggle(`dark`,e)},[]),(0,w.useEffect)(()=>{let e=localStorage.getItem(`theme`);if(e===`dark`||e===`light`)return;let t=window.matchMedia?.(`(prefers-color-scheme: dark)`);if(!t)return;let n=e=>{u(e.matches),document.documentElement.classList.toggle(`dark`,e.matches)};return t.addEventListener?.(`change`,n),()=>t.removeEventListener?.(`change`,n)},[]);function b(){let e=!l;u(e),document.documentElement.classList.toggle(`dark`,e),localStorage.setItem(`theme`,e?`dark`:`light`)}let x=e===`exam`||e===`settings`||e===`list`;return(0,T.jsxs)(`div`,{className:`min-h-screen bg-background text-foreground`,children:[(0,T.jsxs)(`div`,{className:`mx-auto max-w-3xl p-4 pb-24 md:pb-4`,children:[(0,T.jsxs)(`header`,{className:`mb-6 space-y-3`,children:[(0,T.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-3`,children:[(0,T.jsx)(`h2`,{className:`text-xl font-semibold`,children:`Thai–Deutsch Vokabeltrainer`}),(0,T.jsx)(Kt,{variant:`outline`,size:`sm`,onClick:b,title:`Hell/Dunkel umschalten`,children:l?`☀️ Light`:`🌙 Dark`})]}),(0,T.jsx)(Bt,{value:e,onValueChange:e=>n(e),className:`hidden md:block`,children:(0,T.jsxs)(Vt,{className:`w-full justify-start`,children:[(0,T.jsx)(Z,{value:`home`,children:`Home`}),(0,T.jsx)(Z,{value:`learn`,children:`Lernen`}),(0,T.jsx)(Z,{value:`test`,children:`Tests`}),(0,T.jsx)(Z,{value:`exam`,children:`Examen`}),(0,T.jsx)(Z,{value:`games`,children:`Spiele`}),(0,T.jsx)(Z,{value:`settings`,title:`Einstellungen`,children:`⚙️`})]})})]}),(0,T.jsxs)(w.Suspense,{fallback:(0,T.jsx)(`div`,{className:`rounded-md border p-4 text-sm text-muted-foreground`,children:`Lade Seite...`}),children:[e===`home`&&(0,T.jsx)(an,{onNavigate:n}),e===`list`&&(0,T.jsx)(on,{}),e===`learn`&&(0,T.jsx)(sn,{}),e===`test`&&(0,T.jsx)(cn,{}),e===`exam`&&(0,T.jsx)(ln,{}),e===`games`&&(0,T.jsx)(un,{}),e===`settings`&&(0,T.jsx)(dn,{})]}),(0,T.jsx)(qt,{open:p,onOpenChange:m,children:(0,T.jsxs)(Xt,{className:`max-w-2xl max-h-[80vh] overflow-y-auto`,children:[(0,T.jsxs)(Zt,{children:[(0,T.jsx)($t,{className:`text-2xl`,children:`📱 Thai Vocab Trainer - Benutzer Anleitung`}),(0,T.jsx)(en,{children:`Hier findest du eine Übersicht aller Funktionen`})]}),(0,T.jsxs)(`div`,{className:`space-y-6 pr-4`,children:[(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`h3`,{className:`font-bold text-lg mb-3`,children:`🏠 Home Seite (Startseite)`}),(0,T.jsx)(`p`,{className:`text-sm text-muted-foreground mb-3`,children:`Die Home Seite zeigt dir einen Überblick über denen Lernfortschritt mit vier Haupt-Indikatoren:`}),(0,T.jsxs)(`ul`,{className:`space-y-2 text-sm`,children:[(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Heute fällig (⭐):`}),` Zeigt wie viele Karten heute zur Wiederholung fällig sind. Klick auf die Karte zum automatischen Starten!`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Vokabeln (📚):`}),` Gesamtanzahl aller Vokabeln in deinem Wortschatz`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Streak (🔥):`}),` Deine aktuelle Lern-Serie (Tage hintereinander)`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Heutiges Lernziel:`}),` Fortschrittsbalken für deine tägliche Lernquote`]})]})]}),(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`h3`,{className:`font-bold text-lg mb-3`,children:`📚 Learn (Lernen)`}),(0,T.jsxs)(`ul`,{className:`space-y-2 text-sm`,children:[(0,T.jsx)(`li`,{children:`Neue Karten kennenlernen oder Karten wiederholen`}),(0,T.jsx)(`li`,{children:`Klick "Markiere als gelernt" wenn du die Karte beherrschst`}),(0,T.jsx)(`li`,{children:`Die App merkt sich deine Lernfortschritte (Spaced Repetition)`})]})]}),(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`h3`,{className:`font-bold text-lg mb-3`,children:`🧪 Test (Abfrage)`}),(0,T.jsxs)(`ul`,{className:`space-y-2 text-sm`,children:[(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Lernrichtung:`}),` Wird automatisch aus deinen Einstellungen übernommen`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Quick-Start - Gelernte Karten:`}),` Testet deine gelernten Karten`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Custom Test:`}),` Wähle eine genaue Anzahl von Karten`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Lektionen-Tests (L1-L4):`}),` Tests für spezifische Lektionen`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Navigation:`}),` Mit Pfeilen ⬅️➡️ zwischen Karten navigieren`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Richtung ändern:`}),` In den Einstellungen konfigurieren`]})]})]}),(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`h3`,{className:`font-bold text-lg mb-3`,children:`📊 Exam (Prüfung)`}),(0,T.jsxs)(`ul`,{className:`space-y-2 text-sm`,children:[(0,T.jsx)(`li`,{children:`Formale Prüfung mit Bestehensgrenze (85% richtig = bestanden)`}),(0,T.jsx)(`li`,{children:`Detailliertes Ergebnis am Ende`}),(0,T.jsx)(`li`,{children:`Nutze das für realistische Lernzielkontrolle`})]})]}),(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`h3`,{className:`font-bold text-lg mb-3`,children:`🎮 Spiele`}),(0,T.jsxs)(`ul`,{className:`space-y-2 text-sm`,children:[(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Blitzrunde:`}),` 60 Sekunden, so viele Antworten wie möglich`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`4er-Quiz:`}),` 10 Multiple-Choice-Fragen mit Punktewertung`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Hör-Spiel:`}),` Audio abspielen und passende Übersetzung wählen`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Filter:`}),` Spiele optional nur mit fälligen Karten oder pro Lektion`]})]})]}),(0,T.jsxs)(`div`,{children:[(0,T.jsx)(`h3`,{className:`font-bold text-lg mb-3`,children:`⚙️ Einstellungen (Settings)`}),(0,T.jsxs)(`ul`,{className:`space-y-2 text-sm`,children:[(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Tägliches Lernziel:`}),` Maximale Karten pro Tag (Standard: 30)`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Lernrichtung:`}),` Standard für Tests (Thai→Deutsch oder Deutsch→Thai)`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Vokabeln-Seite:`}),` Zusätzlicher Tab zum Durchsuchen aller Vokabeln`]}),(0,T.jsxs)(`li`,{children:[(0,T.jsx)(`strong`,{children:`Daten zurücksetzen:`}),` Alle Lernfortschritte löschen`]})]})]})]})]})})]}),h?null:(0,T.jsx)(`nav`,{className:`fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background md:hidden [padding-bottom:env(safe-area-inset-bottom)]`,"aria-label":`Mobile Navigation`,children:(0,T.jsxs)(`div`,{className:`mx-auto grid max-w-3xl grid-cols-5 gap-1 p-1`,children:[(0,T.jsxs)(`button`,{type:`button`,onClick:()=>n(`home`),className:`relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${e===`home`?`bg-primary/10 text-primary`:`text-muted-foreground hover:bg-muted/60`}`,"aria-current":e===`home`?`page`:void 0,children:[(0,T.jsx)(o,{className:`h-4 w-4 ${e===`home`?`text-blue-600 dark:text-blue-400`:`text-muted-foreground`}`}),`Home`]}),(0,T.jsxs)(`button`,{type:`button`,onClick:()=>n(`learn`),className:`relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${e===`learn`?`bg-primary/10 text-primary`:`text-muted-foreground hover:bg-muted/60`}`,"aria-current":e===`learn`?`page`:void 0,children:[(0,T.jsx)(r,{className:`h-4 w-4 ${e===`learn`?`text-blue-600 dark:text-blue-400`:`text-muted-foreground`}`}),`Lernen`]}),(0,T.jsxs)(`button`,{type:`button`,onClick:()=>n(`test`),className:`relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${e===`test`?`bg-primary/10 text-primary`:`text-muted-foreground hover:bg-muted/60`}`,"aria-current":e===`test`?`page`:void 0,children:[(0,T.jsx)(a,{className:`h-4 w-4 ${e===`test`?`text-blue-600 dark:text-blue-400`:`text-muted-foreground`}`}),`Tests`]}),(0,T.jsxs)(`button`,{type:`button`,onClick:()=>n(`games`),className:`relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${e===`games`?`bg-primary/10 text-primary`:`text-muted-foreground hover:bg-muted/60`}`,"aria-current":e===`games`?`page`:void 0,children:[(0,T.jsx)(t,{className:`h-4 w-4 ${e===`games`?`text-blue-600 dark:text-blue-400`:`text-muted-foreground`}`}),`Spiele`]}),(0,T.jsxs)(`div`,{className:`relative`,ref:y,children:[(0,T.jsxs)(`button`,{type:`button`,onClick:()=>v(e=>!e),className:`relative flex min-h-[56px] w-full flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${x?`bg-primary/10 text-primary`:`text-muted-foreground hover:bg-muted/60`}`,"aria-expanded":_,"aria-controls":`mobile-more-menu`,children:[(0,T.jsx)(s,{className:`h-4 w-4 ${x?`text-blue-600 dark:text-blue-400`:`text-muted-foreground`}`}),`Mehr`]}),_?(0,T.jsxs)(`div`,{id:`mobile-more-menu`,className:`absolute bottom-full right-0 mb-2 w-[min(18rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-border bg-background py-2 shadow-lg`,children:[(0,T.jsxs)(`button`,{type:`button`,onClick:()=>n(`exam`),className:`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${e===`exam`?`bg-primary/10 text-primary`:`text-muted-foreground hover:bg-muted/60 hover:text-foreground`}`,children:[(0,T.jsx)(i,{className:`h-4 w-4`}),`Examen`]}),(0,T.jsxs)(`button`,{type:`button`,onClick:()=>n(`settings`),className:`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${e===`settings`?`bg-primary/10 text-primary`:`text-muted-foreground hover:bg-muted/60 hover:text-foreground`}`,children:[(0,T.jsx)(c,{className:`h-4 w-4`}),`Einstellungen`]})]}):null]})]})})]})}(0,ne.createRoot)(document.getElementById(`root`)).render((0,T.jsx)(w.StrictMode,{children:(0,T.jsx)(xn,{})}));export{j as _,Qt as a,ae as b,Kt as c,ue as d,Se as f,A as g,k as h,en as i,X as l,I as m,qt as n,Zt as o,he as p,Xt as r,$t as s,Q as t,Te as u,M as v,E as x,ie as y};