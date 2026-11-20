/* ============================================================================
   QUESTIONAIRE — language-packs.js

   High-frequency starter decks for every vocabulary language in the
   catalogue, with plain-English pronunciation guides (the Duolingo-style
   respelling, not IPA) so a beginner can say the word out loud on day one.

   Shape:
     PACKS[languageKey] = { code: "es-ES", groups: [["Theme", [[target, english, pronunciation], ...]], ...] }

   `forSubject(subject)` resolves a subject to its deck with the same
   longest-key-first matching that `subject-banks.js` uses, so `ancient-greek`
   wins over `greek` and `mandarin` wins over `chinese`.

   English Language is grammar, not vocabulary, and deliberately has no deck.
   ========================================================================== */

(function () {
  "use strict";

  const PACKS = {
    spanish: {
      code: "es-ES",
      groups: [
        ["Greetings", [
          ["hola", "hello", "OH-lah"],
          ["gracias", "thank you", "GRAH-syahs"],
          ["por favor", "please", "por fah-VOR"],
          ["adiós", "goodbye", "ah-DYOHS"],
          ["perdón", "sorry", "per-DOHN"]
        ]],
        ["People", [
          ["amigo", "friend", "ah-MEE-goh"],
          ["madre", "mother", "MAH-dreh"],
          ["padre", "father", "PAH-dreh"],
          ["niño", "child", "NEE-nyoh"]
        ]],
        ["Numbers", [
          ["uno", "one", "OO-noh"],
          ["dos", "two", "dohs"],
          ["tres", "three", "trehs"]
        ]],
        ["Everyday", [
          ["agua", "water", "AH-gwah"],
          ["pan", "bread", "pahn"],
          ["casa", "house", "KAH-sah"],
          ["libro", "book", "LEE-broh"]
        ]],
        ["Verbs", [
          ["comer", "to eat", "koh-MEHR"],
          ["beber", "to drink", "beh-BEHR"],
          ["hablar", "to speak", "ah-BLAHR"],
          ["ir", "to go", "eer"]
        ]]
      ]
    },

    french: {
      code: "fr-FR",
      groups: [
        ["Greetings", [
          ["bonjour", "hello", "bohn-ZHOOR"],
          ["merci", "thank you", "mehr-SEE"],
          ["s'il vous plaît", "please", "seel voo PLEH"],
          ["au revoir", "goodbye", "oh ruh-VWAHR"],
          ["pardon", "sorry", "par-DOHN"]
        ]],
        ["People", [
          ["ami", "friend", "ah-MEE"],
          ["mère", "mother", "mehr"],
          ["père", "father", "pehr"],
          ["enfant", "child", "ahn-FAHN"]
        ]],
        ["Numbers", [
          ["un", "one", "uhn"],
          ["deux", "two", "duh"],
          ["trois", "three", "twah"]
        ]],
        ["Everyday", [
          ["eau", "water", "oh"],
          ["pain", "bread", "pan"],
          ["maison", "house", "meh-ZOHN"],
          ["livre", "book", "LEE-vruh"]
        ]],
        ["Verbs", [
          ["manger", "to eat", "mahn-ZHAY"],
          ["boire", "to drink", "bwahr"],
          ["parler", "to speak", "par-LAY"],
          ["aller", "to go", "ah-LAY"]
        ]]
      ]
    },

    german: {
      code: "de-DE",
      groups: [
        ["Greetings", [
          ["hallo", "hello", "HAH-loh"],
          ["danke", "thank you", "DAHN-kuh"],
          ["bitte", "please", "BIT-tuh"],
          ["auf Wiedersehen", "goodbye", "owf VEE-der-zayn"],
          ["Entschuldigung", "sorry", "ent-SHOOL-dee-goong"]
        ]],
        ["People", [
          ["Freund", "friend", "froint"],
          ["Mutter", "mother", "MOO-ter"],
          ["Vater", "father", "FAH-ter"],
          ["Kind", "child", "kint"]
        ]],
        ["Numbers", [
          ["eins", "one", "eynts"],
          ["zwei", "two", "tsvy"],
          ["drei", "three", "dry"]
        ]],
        ["Everyday", [
          ["Wasser", "water", "VAH-ser"],
          ["Brot", "bread", "broht"],
          ["Haus", "house", "hows"],
          ["Buch", "book", "bookh"]
        ]],
        ["Verbs", [
          ["essen", "to eat", "ES-sen"],
          ["trinken", "to drink", "TRIN-ken"],
          ["sprechen", "to speak", "SHPREH-khen"],
          ["gehen", "to go", "GAY-en"]
        ]]
      ]
    },

    portuguese: {
      code: "pt-PT",
      groups: [
        ["Greetings", [
          ["olá", "hello", "oh-LAH"],
          ["obrigado", "thank you", "oh-bree-GAH-doo"],
          ["por favor", "please", "poor fah-VOR"],
          ["adeus", "goodbye", "ah-DEH-oosh"],
          ["desculpe", "sorry", "desh-KOOL-peh"]
        ]],
        ["People", [
          ["amigo", "friend", "ah-MEE-goo"],
          ["mãe", "mother", "myng"],
          ["pai", "father", "pie"],
          ["criança", "child", "kree-AHN-sah"]
        ]],
        ["Numbers", [
          ["um", "one", "oong"],
          ["dois", "two", "doysh"],
          ["três", "three", "trehs"]
        ]],
        ["Everyday", [
          ["água", "water", "AH-gwah"],
          ["pão", "bread", "powng"],
          ["casa", "house", "KAH-zah"],
          ["livro", "book", "LEE-vroo"]
        ]],
        ["Verbs", [
          ["comer", "to eat", "koh-MEHR"],
          ["beber", "to drink", "beh-BEHR"],
          ["falar", "to speak", "fah-LAHR"],
          ["ir", "to go", "eer"]
        ]]
      ]
    },

    hindi: {
      code: "hi-IN",
      groups: [
        ["Greetings", [
          ["नमस्ते", "hello", "nuh-muh-STAY"],
          ["धन्यवाद", "thank you", "dhun-yuh-VAAD"],
          ["कृपया", "please", "KRIP-yah"],
          ["अलविदा", "goodbye", "ul-vee-DAA"],
          ["माफ़ कीजिए", "sorry", "maaf KEE-jee-yeh"]
        ]],
        ["People", [
          ["दोस्त", "friend", "dost"],
          ["माँ", "mother", "maan"],
          ["पिता", "father", "pee-TAA"],
          ["बच्चा", "child", "BUCH-chaa"]
        ]],
        ["Numbers", [
          ["एक", "one", "ek"],
          ["दो", "two", "do"],
          ["तीन", "three", "teen"]
        ]],
        ["Everyday", [
          ["पानी", "water", "PAA-nee"],
          ["रोटी", "bread", "RO-tee"],
          ["घर", "house", "ghar"],
          ["किताब", "book", "ki-TAAB"]
        ]],
        ["Verbs", [
          ["खाना", "to eat", "KHAA-naa"],
          ["पीना", "to drink", "PEE-naa"],
          ["बोलना", "to speak", "BOL-naa"],
          ["जाना", "to go", "JAA-naa"]
        ]]
      ]
    },

    mandarin: {
      code: "zh-CN",
      groups: [
        ["Greetings", [
          ["你好", "hello", "nee HOW"],
          ["谢谢", "thank you", "shyeh-shyeh"],
          ["请", "please", "ching"],
          ["再见", "goodbye", "dzai-jyen"],
          ["对不起", "sorry", "dway-boo-chee"]
        ]],
        ["People", [
          ["朋友", "friend", "pung-yo"],
          ["妈妈", "mother", "mah-mah"],
          ["爸爸", "father", "bah-bah"],
          ["孩子", "child", "hi-dzuh"]
        ]],
        ["Numbers", [
          ["一", "one", "ee"],
          ["二", "two", "ar"],
          ["三", "three", "sahn"]
        ]],
        ["Everyday", [
          ["水", "water", "shway"],
          ["面包", "bread", "myen-bow"],
          ["房子", "house", "fahng-dzuh"],
          ["书", "book", "shoo"]
        ]],
        ["Verbs", [
          ["吃", "to eat", "chir"],
          ["喝", "to drink", "huh"],
          ["说", "to speak", "shwaw"],
          ["去", "to go", "chü"]
        ]]
      ]
    },

    japanese: {
      code: "ja-JP",
      groups: [
        ["Greetings", [
          ["こんにちは", "hello", "kon-nichi-wa"],
          ["ありがとう", "thank you", "a-ri-ga-tou"],
          ["お願いします", "please", "o-ne-gai-shi-mas"],
          ["さようなら", "goodbye", "sa-yo-na-ra"],
          ["すみません", "sorry", "su-mi-ma-sen"]
        ]],
        ["People", [
          ["友達", "friend", "to-mo-da-chi"],
          ["母", "mother", "ha-ha"],
          ["父", "father", "chi-chi"],
          ["子供", "child", "ko-do-mo"]
        ]],
        ["Numbers", [
          ["一", "one", "ichi"],
          ["二", "two", "ni"],
          ["三", "three", "san"]
        ]],
        ["Everyday", [
          ["水", "water", "mi-zu"],
          ["パン", "bread", "pan"],
          ["家", "house", "ie"],
          ["本", "book", "hon"]
        ]],
        ["Verbs", [
          ["食べる", "to eat", "ta-be-ru"],
          ["飲む", "to drink", "no-mu"],
          ["話す", "to speak", "ha-na-su"],
          ["行く", "to go", "i-ku"]
        ]]
      ]
    },

    arabic: {
      code: "ar-SA",
      groups: [
        ["Greetings", [
          ["مرحبا", "hello", "MAR-ha-ban"],
          ["شكرا", "thank you", "SHUK-ran"],
          ["من فضلك", "please", "min FAD-lik"],
          ["مع السلامة", "goodbye", "ma-as-sa-LA-ma"],
          ["آسف", "sorry", "AA-sif"]
        ]],
        ["People", [
          ["صديق", "friend", "sa-DEEQ"],
          ["أم", "mother", "omm"],
          ["أب", "father", "ab"],
          ["طفل", "child", "TIFL"]
        ]],
        ["Numbers", [
          ["واحد", "one", "WAA-hid"],
          ["اثنان", "two", "ith-NAAN"],
          ["ثلاثة", "three", "tha-LAA-tha"]
        ]],
        ["Everyday", [
          ["ماء", "water", "MAA"],
          ["خبز", "bread", "khubz"],
          ["بيت", "house", "bayt"],
          ["كتاب", "book", "ki-TAAB"]
        ]],
        ["Verbs", [
          ["يأكل", "to eat", "YAA-kul"],
          ["يشرب", "to drink", "YASH-rab"],
          ["يتحدث", "to speak", "ya-ta-HAD-dath"],
          ["يذهب", "to go", "YATH-hab"]
        ]]
      ]
    },

    korean: {
      code: "ko-KR",
      groups: [
        ["Greetings", [
          ["안녕하세요", "hello", "an-nyeong-ha-se-yo"],
          ["감사합니다", "thank you", "gam-sa-ham-ni-da"],
          ["주세요", "please", "ju-se-yo"],
          ["안녕히 가세요", "goodbye", "an-nyeong-hi ga-se-yo"],
          ["죄송합니다", "sorry", "joe-song-ham-ni-da"]
        ]],
        ["People", [
          ["친구", "friend", "chin-gu"],
          ["어머니", "mother", "eo-meo-ni"],
          ["아버지", "father", "a-beo-ji"],
          ["아이", "child", "a-i"]
        ]],
        ["Numbers", [
          ["하나", "one", "ha-na"],
          ["둘", "two", "dul"],
          ["셋", "three", "set"]
        ]],
        ["Everyday", [
          ["물", "water", "mul"],
          ["빵", "bread", "ppang"],
          ["집", "house", "jip"],
          ["책", "book", "chaek"]
        ]],
        ["Verbs", [
          ["먹다", "to eat", "meok-da"],
          ["마시다", "to drink", "ma-si-da"],
          ["말하다", "to speak", "mal-ha-da"],
          ["가다", "to go", "ga-da"]
        ]]
      ]
    },

    russian: {
      code: "ru-RU",
      groups: [
        ["Greetings", [
          ["привет", "hello", "pree-VYET"],
          ["спасибо", "thank you", "spa-SEE-ba"],
          ["пожалуйста", "please", "pa-ZHAL-sta"],
          ["до свидания", "goodbye", "da svee-DA-nee-ya"],
          ["извините", "sorry", "eez-vee-NEE-tye"]
        ]],
        ["People", [
          ["друг", "friend", "drook"],
          ["мама", "mother", "MA-ma"],
          ["папа", "father", "PA-pa"],
          ["ребёнок", "child", "ree-BYO-nok"]
        ]],
        ["Numbers", [
          ["один", "one", "a-DEEN"],
          ["два", "two", "dva"],
          ["три", "three", "tree"]
        ]],
        ["Everyday", [
          ["вода", "water", "va-DA"],
          ["хлеб", "bread", "khlyep"],
          ["дом", "house", "dom"],
          ["книга", "book", "KNEE-ga"]
        ]],
        ["Verbs", [
          ["есть", "to eat", "yest"],
          ["пить", "to drink", "peet"],
          ["говорить", "to speak", "ga-va-REET"],
          ["идти", "to go", "eet-TEE"]
        ]]
      ]
    },

    italian: {
      code: "it-IT",
      groups: [
        ["Greetings", [
          ["ciao", "hello", "chow"],
          ["grazie", "thank you", "GRAH-tsyeh"],
          ["per favore", "please", "per fa-VOH-reh"],
          ["arrivederci", "goodbye", "ar-ree-veh-DEHR-chee"],
          ["scusa", "sorry", "SKOO-zah"]
        ]],
        ["People", [
          ["amico", "friend", "ah-MEE-koh"],
          ["madre", "mother", "MAH-dreh"],
          ["padre", "father", "PAH-dreh"],
          ["bambino", "child", "bahm-BEE-noh"]
        ]],
        ["Numbers", [
          ["uno", "one", "OO-noh"],
          ["due", "two", "DOO-eh"],
          ["tre", "three", "treh"]
        ]],
        ["Everyday", [
          ["acqua", "water", "AH-kwah"],
          ["pane", "bread", "PAH-neh"],
          ["casa", "house", "KAH-zah"],
          ["libro", "book", "LEE-broh"]
        ]],
        ["Verbs", [
          ["mangiare", "to eat", "mahn-JAH-reh"],
          ["bere", "to drink", "BEH-reh"],
          ["parlare", "to speak", "par-LAH-reh"],
          ["andare", "to go", "ahn-DAH-reh"]
        ]]
      ]
    },

    somali: {
      code: "so-SO",
      groups: [
        ["Greetings", [
          ["salaam", "hello", "sa-LAAM"],
          ["mahadsanid", "thank you", "ma-had-SA-nid"],
          ["fadlan", "please", "FAD-lan"],
          ["nabadgelyo", "goodbye", "na-bad-GEL-yo"],
          ["raali noqo", "sorry", "RAH-li NO-ko"]
        ]],
        ["People", [
          ["saaxiib", "friend", "saa-KHEEB"],
          ["hooyo", "mother", "HO-yo"],
          ["aabbe", "father", "AAB-be"],
          ["ilmo", "child", "IL-mo"]
        ]],
        ["Numbers", [
          ["kow", "one", "kow"],
          ["laba", "two", "LA-ba"],
          ["saddex", "three", "SAD-dekh"]
        ]],
        ["Everyday", [
          ["biyo", "water", "BEE-yo"],
          ["rooti", "bread", "ROO-ti"],
          ["guri", "house", "GOO-ri"],
          ["buug", "book", "boog"]
        ]],
        ["Verbs", [
          ["cun", "to eat", "’oon"],
          ["cab", "to drink", "’ab"],
          ["hadal", "to speak", "HA-dal"],
          ["tag", "to go", "tag"]
        ]]
      ]
    },

    vietnamese: {
      code: "vi-VN",
      groups: [
        ["Greetings", [
          ["xin chào", "hello", "sin CHOW"],
          ["cảm ơn", "thank you", "gahm UHN"],
          ["làm ơn", "please", "lahm UHN"],
          ["tạm biệt", "goodbye", "tahm BYEET"],
          ["xin lỗi", "sorry", "sin LOY"]
        ]],
        ["People", [
          ["bạn", "friend", "bahn"],
          ["mẹ", "mother", "meh"],
          ["bố", "father", "boh"],
          ["trẻ em", "child", "treh EM"]
        ]],
        ["Numbers", [
          ["một", "one", "MOHT"],
          ["hai", "two", "hai"],
          ["ba", "three", "bah"]
        ]],
        ["Everyday", [
          ["nước", "water", "NUH-uk"],
          ["bánh mì", "bread", "BAN mee"],
          ["nhà", "house", "nyah"],
          ["sách", "book", "SAHK"]
        ]],
        ["Verbs", [
          ["ăn", "to eat", "AHN"],
          ["uống", "to drink", "OO-uhng"],
          ["nói", "to speak", "NOY"],
          ["đi", "to go", "DEE"]
        ]]
      ]
    },

    turkish: {
      code: "tr-TR",
      groups: [
        ["Greetings", [
          ["merhaba", "hello", "mer-hah-BAH"],
          ["teşekkürler", "thank you", "teh-shek-kewr-LER"],
          ["lütfen", "please", "LEWT-fen"],
          ["hoşça kal", "goodbye", "HOSH-cha kal"],
          ["özür dilerim", "sorry", "oh-ZEWR dee-leh-reem"]
        ]],
        ["People", [
          ["arkadaş", "friend", "ar-kah-DASH"],
          ["anne", "mother", "AHN-neh"],
          ["baba", "father", "bah-BAH"],
          ["çocuk", "child", "cho-JOOK"]
        ]],
        ["Numbers", [
          ["bir", "one", "beer"],
          ["iki", "two", "ee-KEE"],
          ["üç", "three", "ewch"]
        ]],
        ["Everyday", [
          ["su", "water", "soo"],
          ["ekmek", "bread", "ek-MEK"],
          ["ev", "house", "ev"],
          ["kitap", "book", "kee-TAP"]
        ]],
        ["Verbs", [
          ["yemek", "to eat", "yeh-MEK"],
          ["içmek", "to drink", "ich-MEK"],
          ["konuşmak", "to speak", "ko-NOOSH-mak"],
          ["gitmek", "to go", "geet-MEK"]
        ]]
      ]
    },

    swahili: {
      code: "sw-KE",
      groups: [
        ["Greetings", [
          ["habari", "hello", "ha-BA-ri"],
          ["asante", "thank you", "a-SAN-te"],
          ["tafadhali", "please", "ta-fa-DHA-li"],
          ["kwaheri", "goodbye", "kwa-HE-ri"],
          ["samahani", "sorry", "sa-ma-HA-ni"]
        ]],
        ["People", [
          ["rafiki", "friend", "ra-FI-ki"],
          ["mama", "mother", "MA-ma"],
          ["baba", "father", "BA-ba"],
          ["mtoto", "child", "m-TO-to"]
        ]],
        ["Numbers", [
          ["moja", "one", "MO-ja"],
          ["mbili", "two", "m-BI-li"],
          ["tatu", "three", "TA-tu"]
        ]],
        ["Everyday", [
          ["maji", "water", "MA-ji"],
          ["mkate", "bread", "m-KA-te"],
          ["nyumba", "house", "NYUM-ba"],
          ["kitabu", "book", "ki-TA-bu"]
        ]],
        ["Verbs", [
          ["kula", "to eat", "KU-la"],
          ["kunywa", "to drink", "ku-NYWA"],
          ["kusema", "to speak", "ku-SE-ma"],
          ["kwenda", "to go", "KWE-nda"]
        ]]
      ]
    },

    polish: {
      code: "pl-PL",
      groups: [
        ["Greetings", [
          ["cześć", "hello", "cheshch"],
          ["dziękuję", "thank you", "jen-KOO-yeh"],
          ["proszę", "please", "PRO-sheh"],
          ["do widzenia", "goodbye", "do vee-DZEH-nya"],
          ["przepraszam", "sorry", "psheh-PRA-sham"]
        ]],
        ["People", [
          ["przyjaciel", "friend", "pshy-YA-chel"],
          ["matka", "mother", "MAT-ka"],
          ["ojciec", "father", "OY-chets"],
          ["dziecko", "child", "DZHYETS-ko"]
        ]],
        ["Numbers", [
          ["jeden", "one", "YEH-den"],
          ["dwa", "two", "dva"],
          ["trzy", "three", "tshy"]
        ]],
        ["Everyday", [
          ["woda", "water", "VO-da"],
          ["chleb", "bread", "hlep"],
          ["dom", "house", "dom"],
          ["książka", "book", "KSHONZH-ka"]
        ]],
        ["Verbs", [
          ["jeść", "to eat", "yeshch"],
          ["pić", "to drink", "peech"],
          ["mówić", "to speak", "MOO-veech"],
          ["iść", "to go", "eeshch"]
        ]]
      ]
    },

    dutch: {
      code: "nl-NL",
      groups: [
        ["Greetings", [
          ["hallo", "hello", "ha-LOH"],
          ["dank je", "thank you", "dahnk yuh"],
          ["alsjeblieft", "please", "als-yuh-BLEEFT"],
          ["tot ziens", "goodbye", "tot seens"],
          ["sorry", "sorry", "SO-ree"]
        ]],
        ["People", [
          ["vriend", "friend", "vreent"],
          ["moeder", "mother", "MOO-der"],
          ["vader", "father", "VAH-der"],
          ["kind", "child", "kint"]
        ]],
        ["Numbers", [
          ["een", "one", "uhn"],
          ["twee", "two", "tvay"],
          ["drie", "three", "dree"]
        ]],
        ["Everyday", [
          ["water", "water", "VAH-ter"],
          ["brood", "bread", "broht"],
          ["huis", "house", "hows"],
          ["boek", "book", "book"]
        ]],
        ["Verbs", [
          ["eten", "to eat", "AY-ten"],
          ["drinken", "to drink", "DRIN-ken"],
          ["spreken", "to speak", "SPRAY-ken"],
          ["gaan", "to go", "khaan"]
        ]]
      ]
    },

    greek: {
      code: "el-GR",
      groups: [
        ["Greetings", [
          ["γεια σου", "hello", "ya soo"],
          ["ευχαριστώ", "thank you", "ef-kha-ree-STOH"],
          ["παρακαλώ", "please", "pa-ra-ka-LOH"],
          ["αντίο", "goodbye", "an-DEE-oh"],
          ["συγγνώμη", "sorry", "see-GHNO-mee"]
        ]],
        ["People", [
          ["φίλος", "friend", "FEE-los"],
          ["μητέρα", "mother", "mee-TEH-ra"],
          ["πατέρας", "father", "pa-TEH-ras"],
          ["παιδί", "child", "peh-DEE"]
        ]],
        ["Numbers", [
          ["ένα", "one", "EH-na"],
          ["δύο", "two", "DEE-oh"],
          ["τρία", "three", "TREE-a"]
        ]],
        ["Everyday", [
          ["νερό", "water", "neh-ROH"],
          ["ψωμί", "bread", "psoh-MEE"],
          ["σπίτι", "house", "SPEE-tee"],
          ["βιβλίο", "book", "vee-VLEE-oh"]
        ]],
        ["Verbs", [
          ["τρώω", "to eat", "TROH-oh"],
          ["πίνω", "to drink", "PEE-noh"],
          ["μιλάω", "to speak", "mee-LAH-oh"],
          ["πηγαίνω", "to go", "pee-YEH-noh"]
        ]]
      ]
    },

    "ancient-greek": {
      code: "grc",
      groups: [
        ["Greetings", [
          ["χαῖρε", "hello", "KHAI-reh"],
          ["εὐχαριστῶ", "thank you", "ew-kha-ris-TOH"],
          ["παρακαλῶ", "please", "pa-ra-ka-LOH"],
          ["ἔρρωσο", "goodbye", "ER-rho-so"],
          ["συγγνώμην ἔχε", "sorry", "soong-GNOH-mayn EKH-eh"]
        ]],
        ["People", [
          ["φίλος", "friend", "PHEE-los"],
          ["μήτηρ", "mother", "MAY-tayr"],
          ["πατήρ", "father", "pa-TAYR"],
          ["παῖς", "child", "pais"]
        ]],
        ["Numbers", [
          ["εἷς", "one", "hays"],
          ["δύο", "two", "DY-oh"],
          ["τρεῖς", "three", "trays"]
        ]],
        ["Everyday", [
          ["ὕδωρ", "water", "HOO-dohr"],
          ["ἄρτος", "bread", "AR-tos"],
          ["οἶκος", "house", "OY-kos"],
          ["βιβλίον", "book", "bi-BLEE-on"]
        ]],
        ["Verbs", [
          ["ἐσθίω", "to eat", "es-THEE-oh"],
          ["πίνω", "to drink", "PEE-noh"],
          ["λέγω", "to speak", "LEH-goh"],
          ["βαδίζω", "to go", "ba-DEE-zoh"]
        ]]
      ]
    },

    bengali: {
      code: "bn-BD",
      groups: [
        ["Greetings", [
          ["নমস্কার", "hello", "no-mosh-KAR"],
          ["ধন্যবাদ", "thank you", "dhon-no-bad"],
          ["দয়া করে", "please", "DOYA kore"],
          ["বিদায়", "goodbye", "bi-DAI"],
          ["দুঃখিত", "sorry", "DUK-khi-to"]
        ]],
        ["People", [
          ["বন্ধু", "friend", "BON-dhu"],
          ["মা", "mother", "ma"],
          ["বাবা", "father", "BA-ba"],
          ["শিশু", "child", "SHI-shu"]
        ]],
        ["Numbers", [
          ["এক", "one", "ek"],
          ["দুই", "two", "dui"],
          ["তিন", "three", "tin"]
        ]],
        ["Everyday", [
          ["পানি", "water", "PA-ni"],
          ["রুটি", "bread", "RU-ti"],
          ["বাড়ি", "house", "BA-ri"],
          ["বই", "book", "boi"]
        ]],
        ["Verbs", [
          ["খাওয়া", "to eat", "KHA-wa"],
          ["পান করা", "to drink", "pan KO-ra"],
          ["বলা", "to speak", "BO-la"],
          ["যাওয়া", "to go", "JA-wa"]
        ]]
      ]
    },

    urdu: {
      code: "ur-PK",
      groups: [
        ["Greetings", [
          ["سلام", "hello", "sa-LAAM"],
          ["شکریہ", "thank you", "shuk-REE-ya"],
          ["برائے مہربانی", "please", "ba-RAA-e meh-rbaa-NEE"],
          ["خدا حافظ", "goodbye", "khu-DA HAA-fiz"],
          ["معاف کیجیے", "sorry", "maaf KEE-jee-ye"]
        ]],
        ["People", [
          ["دوست", "friend", "dost"],
          ["ماں", "mother", "maan"],
          ["والد", "father", "WAA-lid"],
          ["بچہ", "child", "BUCH-cha"]
        ]],
        ["Numbers", [
          ["ایک", "one", "ek"],
          ["دو", "two", "do"],
          ["تین", "three", "teen"]
        ]],
        ["Everyday", [
          ["پانی", "water", "PAA-nee"],
          ["روٹی", "bread", "RO-tee"],
          ["گھر", "house", "ghar"],
          ["کتاب", "book", "ki-TAAB"]
        ]],
        ["Verbs", [
          ["کھانا", "to eat", "KHAA-na"],
          ["پینا", "to drink", "PEE-na"],
          ["بولنا", "to speak", "BOL-na"],
          ["جانا", "to go", "JAA-na"]
        ]]
      ]
    },

    persian: {
      code: "fa-IR",
      groups: [
        ["Greetings", [
          ["سلام", "hello", "sa-LAAM"],
          ["ممنون", "thank you", "mam-NOON"],
          ["لطفاً", "please", "lot-FAN"],
          ["خداحافظ", "goodbye", "kho-da-HAA-fez"],
          ["ببخشید", "sorry", "be-BAKH-sheed"]
        ]],
        ["People", [
          ["دوست", "friend", "doost"],
          ["مادر", "mother", "MAA-dar"],
          ["پدر", "father", "pe-DAR"],
          ["کودک", "child", "koo-DAK"]
        ]],
        ["Numbers", [
          ["یک", "one", "yek"],
          ["دو", "two", "do"],
          ["سه", "three", "seh"]
        ]],
        ["Everyday", [
          ["آب", "water", "aab"],
          ["نان", "bread", "naan"],
          ["خانه", "house", "khaa-NEH"],
          ["کتاب", "book", "ke-TAAB"]
        ]],
        ["Verbs", [
          ["خوردن", "to eat", "khor-DAN"],
          ["نوشیدن", "to drink", "no-shee-DAN"],
          ["صحبت کردن", "to speak", "soh-BAT kar-DAN"],
          ["رفتن", "to go", "raf-TAN"]
        ]]
      ]
    },

    thai: {
      code: "th-TH",
      groups: [
        ["Greetings", [
          ["สวัสดี", "hello", "sa-wat-DEE"],
          ["ขอบคุณ", "thank you", "khop-KHOON"],
          ["กรุณา", "please", "ga-ru-NAA"],
          ["ลาก่อน", "goodbye", "laa-GON"],
          ["ขอโทษ", "sorry", "kho-TOHT"]
        ]],
        ["People", [
          ["เพื่อน", "friend", "PHUEAN"],
          ["แม่", "mother", "MAE"],
          ["พ่อ", "father", "POR"],
          ["เด็ก", "child", "DEK"]
        ]],
        ["Numbers", [
          ["หนึ่ง", "one", "NEUNG"],
          ["สอง", "two", "SONG"],
          ["สาม", "three", "SAAM"]
        ]],
        ["Everyday", [
          ["น้ำ", "water", "NAM"],
          ["ขนมปัง", "bread", "kha-nom-PANG"],
          ["บ้าน", "house", "BAAN"],
          ["หนังสือ", "book", "nang-SUE"]
        ]],
        ["Verbs", [
          ["กิน", "to eat", "GIN"],
          ["ดื่ม", "to drink", "DEUM"],
          ["พูด", "to speak", "POOT"],
          ["ไป", "to go", "PAI"]
        ]]
      ]
    },

    indonesian: {
      code: "id-ID",
      groups: [
        ["Greetings", [
          ["halo", "hello", "HAH-loh"],
          ["terima kasih", "thank you", "te-ree-ma KA-seeh"],
          ["tolong", "please", "TOH-long"],
          ["selamat tinggal", "goodbye", "seh-la-mat TING-gal"],
          ["maaf", "sorry", "ma-AF"]
        ]],
        ["People", [
          ["teman", "friend", "TEH-man"],
          ["ibu", "mother", "EE-boo"],
          ["ayah", "father", "AH-yah"],
          ["anak", "child", "AH-nak"]
        ]],
        ["Numbers", [
          ["satu", "one", "SAH-too"],
          ["dua", "two", "DOO-ah"],
          ["tiga", "three", "TEE-gah"]
        ]],
        ["Everyday", [
          ["air", "water", "AH-eer"],
          ["roti", "bread", "ROH-tee"],
          ["rumah", "house", "ROO-mah"],
          ["buku", "book", "BOO-koo"]
        ]],
        ["Verbs", [
          ["makan", "to eat", "MAH-kan"],
          ["minum", "to drink", "MEE-noom"],
          ["bicara", "to speak", "bee-CHAH-rah"],
          ["pergi", "to go", "PER-gee"]
        ]]
      ]
    },

    tagalog: {
      code: "fil-PH",
      groups: [
        ["Greetings", [
          ["kumusta", "hello", "koo-moos-TAH"],
          ["salamat", "thank you", "sa-LA-mat"],
          ["pakiusap", "please", "pa-kee-OO-sap"],
          ["paalam", "goodbye", "pa-AH-lam"],
          ["pasensya na", "sorry", "pa-SEN-sha na"]
        ]],
        ["People", [
          ["kaibigan", "friend", "ka-ee-BEE-gan"],
          ["nanay", "mother", "NA-nigh"],
          ["tatay", "father", "TA-tigh"],
          ["bata", "child", "BA-ta"]
        ]],
        ["Numbers", [
          ["isa", "one", "ee-SA"],
          ["dalawa", "two", "da-LA-wa"],
          ["tatlo", "three", "tat-LO"]
        ]],
        ["Everyday", [
          ["tubig", "water", "TOO-big"],
          ["tinapay", "bread", "tee-NA-pigh"],
          ["bahay", "house", "ba-HIGH"],
          ["libro", "book", "LEE-bro"]
        ]],
        ["Verbs", [
          ["kumain", "to eat", "koo-ma-EEN"],
          ["uminom", "to drink", "oo-mee-NOM"],
          ["magsalita", "to speak", "mag-sa-lee-TA"],
          ["pumunta", "to go", "poo-moon-TA"]
        ]]
      ]
    },

    swedish: {
      code: "sv-SE",
      groups: [
        ["Greetings", [
          ["hej", "hello", "hay"],
          ["tack", "thank you", "tahk"],
          ["snälla", "please", "SNEH-la"],
          ["hej då", "goodbye", "hay doh"],
          ["förlåt", "sorry", "fur-LAWT"]
        ]],
        ["People", [
          ["vän", "friend", "ven"],
          ["mamma", "mother", "MAM-ma"],
          ["pappa", "father", "PAP-pa"],
          ["barn", "child", "bahn"]
        ]],
        ["Numbers", [
          ["ett", "one", "et"],
          ["två", "two", "tvaw"],
          ["tre", "three", "treh"]
        ]],
        ["Everyday", [
          ["vatten", "water", "VAT-en"],
          ["bröd", "bread", "brurd"],
          ["hus", "house", "hews"],
          ["bok", "book", "book"]
        ]],
        ["Verbs", [
          ["äta", "to eat", "EH-ta"],
          ["dricka", "to drink", "DRIK-ka"],
          ["tala", "to speak", "TAH-la"],
          ["gå", "to go", "gaw"]
        ]]
      ]
    },

    norwegian: {
      code: "nb-NO",
      groups: [
        ["Greetings", [
          ["hei", "hello", "high"],
          ["takk", "thank you", "tahk"],
          ["vær så snill", "please", "vair soh snil"],
          ["ha det bra", "goodbye", "ha deh brah"],
          ["unnskyld", "sorry", "OON-shilt"]
        ]],
        ["People", [
          ["venn", "friend", "ven"],
          ["mor", "mother", "moor"],
          ["far", "father", "far"],
          ["barn", "child", "barn"]
        ]],
        ["Numbers", [
          ["en", "one", "ehn"],
          ["to", "two", "toh"],
          ["tre", "three", "treh"]
        ]],
        ["Everyday", [
          ["vann", "water", "van"],
          ["brød", "bread", "brurd"],
          ["hus", "house", "hews"],
          ["bok", "book", "book"]
        ]],
        ["Verbs", [
          ["spise", "to eat", "SPEE-seh"],
          ["drikke", "to drink", "DRIK-keh"],
          ["snakke", "to speak", "SNAH-keh"],
          ["gå", "to go", "gaw"]
        ]]
      ]
    },

    danish: {
      code: "da-DK",
      groups: [
        ["Greetings", [
          ["hej", "hello", "high"],
          ["tak", "thank you", "tahk"],
          ["venligst", "please", "VEN-leest"],
          ["farvel", "goodbye", "fa-VEL"],
          ["undskyld", "sorry", "OON-skilt"]
        ]],
        ["People", [
          ["ven", "friend", "ven"],
          ["mor", "mother", "mor"],
          ["far", "father", "far"],
          ["barn", "child", "barn"]
        ]],
        ["Numbers", [
          ["en", "one", "ehn"],
          ["to", "two", "toh"],
          ["tre", "three", "treh"]
        ]],
        ["Everyday", [
          ["vand", "water", "van"],
          ["brød", "bread", "brurth"],
          ["hus", "house", "hoos"],
          ["bog", "book", "boh"]
        ]],
        ["Verbs", [
          ["spise", "to eat", "SPEE-seh"],
          ["drikke", "to drink", "DREE-keh"],
          ["tale", "to speak", "TAH-leh"],
          ["gå", "to go", "goh"]
        ]]
      ]
    },

    finnish: {
      code: "fi-FI",
      groups: [
        ["Greetings", [
          ["hei", "hello", "hay"],
          ["kiitos", "thank you", "KEE-tos"],
          ["ole hyvä", "please", "O-le HEW-va"],
          ["näkemiin", "goodbye", "NA-ke-meen"],
          ["anteeksi", "sorry", "AN-teek-see"]
        ]],
        ["People", [
          ["ystävä", "friend", "US-ta-va"],
          ["äiti", "mother", "AY-tee"],
          ["isä", "father", "EE-sa"],
          ["lapsi", "child", "LAP-see"]
        ]],
        ["Numbers", [
          ["yksi", "one", "UK-see"],
          ["kaksi", "two", "KAK-see"],
          ["kolme", "three", "KOL-meh"]
        ]],
        ["Everyday", [
          ["vesi", "water", "VE-see"],
          ["leipä", "bread", "LAY-pa"],
          ["talo", "house", "TA-lo"],
          ["kirja", "book", "KEER-ya"]
        ]],
        ["Verbs", [
          ["syödä", "to eat", "SUU-da"],
          ["juoda", "to drink", "YOO-da"],
          ["puhua", "to speak", "POO-hoo-a"],
          ["mennä", "to go", "MEN-na"]
        ]]
      ]
    },

    czech: {
      code: "cs-CZ",
      groups: [
        ["Greetings", [
          ["ahoj", "hello", "a-hoy"],
          ["děkuji", "thank you", "DYEH-ku-yi"],
          ["prosím", "please", "PRO-seem"],
          ["na shledanou", "goodbye", "na SKHLE-da-noh"],
          ["promiňte", "sorry", "PRO-min-teh"]
        ]],
        ["People", [
          ["přítel", "friend", "PSHREE-tel"],
          ["matka", "mother", "MAT-ka"],
          ["otec", "father", "O-tets"],
          ["dítě", "child", "DEE-tye"]
        ]],
        ["Numbers", [
          ["jeden", "one", "YEH-den"],
          ["dva", "two", "dva"],
          ["tři", "three", "tshree"]
        ]],
        ["Everyday", [
          ["voda", "water", "VO-da"],
          ["chléb", "bread", "khlehb"],
          ["dům", "house", "doom"],
          ["kniha", "book", "KNEE-ha"]
        ]],
        ["Verbs", [
          ["jíst", "to eat", "yeest"],
          ["pít", "to drink", "peet"],
          ["mluvit", "to speak", "MLOO-vit"],
          ["jít", "to go", "yeet"]
        ]]
      ]
    },

    ukrainian: {
      code: "uk-UA",
      groups: [
        ["Greetings", [
          ["привіт", "hello", "pry-VEET"],
          ["дякую", "thank you", "DYA-koo-yoo"],
          ["будь ласка", "please", "bood LAS-ka"],
          ["до побачення", "goodbye", "do po-BA-chen-nya"],
          ["вибачте", "sorry", "VY-bach-te"]
        ]],
        ["People", [
          ["друг", "friend", "drooh"],
          ["мати", "mother", "MA-ty"],
          ["батько", "father", "BAT-ko"],
          ["дитина", "child", "dy-TY-na"]
        ]],
        ["Numbers", [
          ["один", "one", "o-DEEN"],
          ["два", "two", "dva"],
          ["три", "three", "try"]
        ]],
        ["Everyday", [
          ["вода", "water", "vo-DA"],
          ["хліб", "bread", "khleeb"],
          ["дім", "house", "deem"],
          ["книга", "book", "KNY-ha"]
        ]],
        ["Verbs", [
          ["їсти", "to eat", "YIS-ty"],
          ["пити", "to drink", "PY-ty"],
          ["говорити", "to speak", "ho-vo-RY-ty"],
          ["йти", "to go", "yty"]
        ]]
      ]
    },

    romanian: {
      code: "ro-RO",
      groups: [
        ["Greetings", [
          ["salut", "hello", "sa-LOOT"],
          ["mulțumesc", "thank you", "mool-tsoo-MESK"],
          ["te rog", "please", "teh rohg"],
          ["la revedere", "goodbye", "la reh-veh-DEH-reh"],
          ["scuze", "sorry", "SKOO-zeh"]
        ]],
        ["People", [
          ["prieten", "friend", "pree-EH-ten"],
          ["mamă", "mother", "MAH-muh"],
          ["tată", "father", "TAH-tuh"],
          ["copil", "child", "ko-PEEL"]
        ]],
        ["Numbers", [
          ["un", "one", "oon"],
          ["doi", "two", "doy"],
          ["trei", "three", "tray"]
        ]],
        ["Everyday", [
          ["apă", "water", "AH-puh"],
          ["pâine", "bread", "PUY-neh"],
          ["casă", "house", "KAH-suh"],
          ["carte", "book", "KAR-teh"]
        ]],
        ["Verbs", [
          ["a mânca", "to eat", "a muhn-KAH"],
          ["a bea", "to drink", "a BEA"],
          ["a vorbi", "to speak", "a vor-BEE"],
          ["a merge", "to go", "a MER-jeh"]
        ]]
      ]
    },

    hungarian: {
      code: "hu-HU",
      groups: [
        ["Greetings", [
          ["szia", "hello", "SEE-ya"],
          ["köszönöm", "thank you", "KUR-sur-nurm"],
          ["kérem", "please", "KAY-rem"],
          ["viszlát", "goodbye", "VEE-slaht"],
          ["bocsánat", "sorry", "BO-cha-not"]
        ]],
        ["People", [
          ["barát", "friend", "BO-rat"],
          ["anya", "mother", "O-nyo"],
          ["apa", "father", "O-po"],
          ["gyerek", "child", "DYEH-rek"]
        ]],
        ["Numbers", [
          ["egy", "one", "edj"],
          ["kettő", "two", "KET-tur"],
          ["három", "three", "HAH-rom"]
        ]],
        ["Everyday", [
          ["víz", "water", "veez"],
          ["kenyér", "bread", "KE-nyayr"],
          ["ház", "house", "hahz"],
          ["könyv", "book", "kurnv"]
        ]],
        ["Verbs", [
          ["enni", "to eat", "EN-nee"],
          ["inni", "to drink", "IN-nee"],
          ["beszélni", "to speak", "BE-sayl-nee"],
          ["menni", "to go", "MEN-nee"]
        ]]
      ]
    },

    bulgarian: {
      code: "bg-BG",
      groups: [
        ["Greetings", [
          ["здравей", "hello", "zdra-VEY"],
          ["благодаря", "thank you", "bla-go-da-RYA"],
          ["моля", "please", "MO-lya"],
          ["довиждане", "goodbye", "do-VEEZH-da-ne"],
          ["извинете", "sorry", "iz-vee-NE-te"]
        ]],
        ["People", [
          ["приятел", "friend", "pree-YA-tel"],
          ["майка", "mother", "MAY-ka"],
          ["баща", "father", "bash-TA"],
          ["дете", "child", "de-TE"]
        ]],
        ["Numbers", [
          ["едно", "one", "ed-NO"],
          ["две", "two", "dveh"],
          ["три", "three", "tree"]
        ]],
        ["Everyday", [
          ["вода", "water", "vo-DA"],
          ["хляб", "bread", "hlyab"],
          ["дом", "house", "dom"],
          ["книга", "book", "KNEE-ga"]
        ]],
        ["Verbs", [
          ["ям", "to eat", "yam"],
          ["пия", "to drink", "PEE-ya"],
          ["говоря", "to speak", "go-VO-rya"],
          ["отивам", "to go", "o-TEE-vam"]
        ]]
      ]
    },

    serbian: {
      code: "sr-RS",
      groups: [
        ["Greetings", [
          ["здраво", "hello", "ZDRA-vo"],
          ["хвала", "thank you", "HVA-la"],
          ["молим", "please", "MO-leem"],
          ["довиђења", "goodbye", "do-vee-JEH-nya"],
          ["извините", "sorry", "eez-VEE-nee-teh"]
        ]],
        ["People", [
          ["пријатељ", "friend", "pree-YA-tely"],
          ["мајка", "mother", "MAY-ka"],
          ["отац", "father", "O-tats"],
          ["дете", "child", "DEH-teh"]
        ]],
        ["Numbers", [
          ["један", "one", "YEH-dan"],
          ["два", "two", "dva"],
          ["три", "three", "tree"]
        ]],
        ["Everyday", [
          ["вода", "water", "VO-da"],
          ["хлеб", "bread", "hleb"],
          ["кућа", "house", "KOO-cha"],
          ["књига", "book", "KNYEE-ga"]
        ]],
        ["Verbs", [
          ["јести", "to eat", "YES-tee"],
          ["пити", "to drink", "PEE-tee"],
          ["говорити", "to speak", "go-vo-REE-tee"],
          ["ићи", "to go", "EE-chee"]
        ]]
      ]
    },

    croatian: {
      code: "hr-HR",
      groups: [
        ["Greetings", [
          ["bok", "hello", "bok"],
          ["hvala", "thank you", "HVA-la"],
          ["molim", "please", "MO-leem"],
          ["doviđenja", "goodbye", "do-vee-JEH-nya"],
          ["oprostite", "sorry", "o-PROS-tee-teh"]
        ]],
        ["People", [
          ["prijatelj", "friend", "pree-YA-tely"],
          ["majka", "mother", "MAY-ka"],
          ["otac", "father", "O-tats"],
          ["dijete", "child", "dee-YEH-teh"]
        ]],
        ["Numbers", [
          ["jedan", "one", "YEH-dan"],
          ["dva", "two", "dva"],
          ["tri", "three", "tree"]
        ]],
        ["Everyday", [
          ["voda", "water", "VO-da"],
          ["kruh", "bread", "krooh"],
          ["kuća", "house", "KOO-cha"],
          ["knjiga", "book", "KNYEE-ga"]
        ]],
        ["Verbs", [
          ["jesti", "to eat", "YES-tee"],
          ["piti", "to drink", "PEE-tee"],
          ["govoriti", "to speak", "go-VO-ree-tee"],
          ["ići", "to go", "EE-chee"]
        ]]
      ]
    },

    catalan: {
      code: "ca-ES",
      groups: [
        ["Greetings", [
          ["hola", "hello", "OH-la"],
          ["gràcies", "thank you", "GRAH-syes"],
          ["si us plau", "please", "see oos PLOW"],
          ["adéu", "goodbye", "a-DEH-oo"],
          ["perdó", "sorry", "per-DOH"]
        ]],
        ["People", [
          ["amic", "friend", "a-MEEK"],
          ["mare", "mother", "MAH-reh"],
          ["pare", "father", "PAH-reh"],
          ["nen", "child", "nen"]
        ]],
        ["Numbers", [
          ["un", "one", "oon"],
          ["dos", "two", "dohs"],
          ["tres", "three", "trehs"]
        ]],
        ["Everyday", [
          ["aigua", "water", "AY-gwa"],
          ["pa", "bread", "pah"],
          ["casa", "house", "KAH-zah"],
          ["llibre", "book", "LEE-breh"]
        ]],
        ["Verbs", [
          ["menjar", "to eat", "men-JAH"],
          ["beure", "to drink", "BEH-oo-reh"],
          ["parlar", "to speak", "par-LAH"],
          ["anar", "to go", "a-NAH"]
        ]]
      ]
    },

    amharic: {
      code: "am-ET",
      groups: [
        ["Greetings", [
          ["ሰላም", "hello", "se-LAM"],
          ["አመሰግናለሁ", "thank you", "ah-meh-seg-NA-leh-hoo"],
          ["እባክዎ", "please", "ih-BAK-wo"],
          ["ደህና ሁን", "goodbye", "deh-NA hoon"],
          ["ይቅርታ", "sorry", "yiqir-TA"]
        ]],
        ["People", [
          ["ጓደኛ", "friend", "gwa-DEH-nya"],
          ["እናት", "mother", "ih-NAT"],
          ["አባት", "father", "ah-BAT"],
          ["ልጅ", "child", "lij"]
        ]],
        ["Numbers", [
          ["አንድ", "one", "and"],
          ["ሁለት", "two", "hoo-LET"],
          ["ሶስት", "three", "sost"]
        ]],
        ["Everyday", [
          ["ውሃ", "water", "WEE-ha"],
          ["ዳቦ", "bread", "DA-bo"],
          ["ቤት", "house", "bet"],
          ["መጽሐፍ", "book", "me-tsehaf"]
        ]],
        ["Verbs", [
          ["መብላት", "to eat", "meb-LAT"],
          ["መጠጣት", "to drink", "me-te-TAT"],
          ["መናገር", "to speak", "me-NA-ger"],
          ["መሄድ", "to go", "me-HED"]
        ]]
      ]
    },

    zulu: {
      code: "zu-ZA",
      groups: [
        ["Greetings", [
          ["sawubona", "hello", "sa-woo-BO-na"],
          ["ngiyabonga", "thank you", "ngee-ya-BON-ga"],
          ["ngicela", "please", "ngee-CEH-la"],
          ["sala kahle", "goodbye", "sa-la KAH-leh"],
          ["ngiyaxolisa", "sorry", "ngee-ya-kho-LEE-sa"]
        ]],
        ["People", [
          ["umngane", "friend", "oom-NGA-neh"],
          ["umama", "mother", "oo-MA-ma"],
          ["ubaba", "father", "oo-BA-ba"],
          ["ingane", "child", "een-GA-neh"]
        ]],
        ["Numbers", [
          ["kunye", "one", "koo-NYEH"],
          ["kubili", "two", "koo-BEE-lee"],
          ["kuthathu", "three", "koo-THA-thoo"]
        ]],
        ["Everyday", [
          ["amanzi", "water", "a-MAN-zee"],
          ["isinkwa", "bread", "ee-SEEN-kwa"],
          ["indlu", "house", "EEN-dloo"],
          ["incwadi", "book", "een-CWA-dee"]
        ]],
        ["Verbs", [
          ["ukudla", "to eat", "oo-KOO-dla"],
          ["ukuphuza", "to drink", "oo-koo-POO-za"],
          ["ukukhuluma", "to speak", "oo-koo-koo-LOO-ma"],
          ["ukuhamba", "to go", "oo-koo-HAM-ba"]
        ]]
      ]
    },

    hausa: {
      code: "ha-NG",
      groups: [
        ["Greetings", [
          ["sannu", "hello", "SAN-noo"],
          ["na gode", "thank you", "na GO-deh"],
          ["don Allah", "please", "don AL-la"],
          ["sai anjima", "goodbye", "sigh an-JEE-ma"],
          ["yi hakuri", "sorry", "yee ha-KOO-ree"]
        ]],
        ["People", [
          ["aboki", "friend", "a-BO-kee"],
          ["uwa", "mother", "OO-wa"],
          ["uba", "father", "OO-ba"],
          ["yaro", "child", "YA-ro"]
        ]],
        ["Numbers", [
          ["daya", "one", "DA-ya"],
          ["biyu", "two", "BEE-yoo"],
          ["uku", "three", "OO-koo"]
        ]],
        ["Everyday", [
          ["ruwa", "water", "ROO-wa"],
          ["gurasa", "bread", "goo-RA-sa"],
          ["gida", "house", "GEE-da"],
          ["littafi", "book", "lit-TA-fee"]
        ]],
        ["Verbs", [
          ["ci", "to eat", "chee"],
          ["sha", "to drink", "sha"],
          ["yin magana", "to speak", "yeen ma-GA-na"],
          ["tafi", "to go", "TA-fee"]
        ]]
      ]
    },

    yoruba: {
      code: "yo-NG",
      groups: [
        ["Greetings", [
          ["bawo ni", "hello", "BAH-wo nee"],
          ["ẹ ṣé", "thank you", "eh SHEH"],
          ["jọ̀ọ́", "please", "jaw-AW"],
          ["ó dàbọ̀", "goodbye", "oh DAW-baw"],
          ["má bínú", "sorry", "ma BEE-noo"]
        ]],
        ["People", [
          ["ọ̀rẹ́", "friend", "aw-REH"],
          ["ìyá", "mother", "ee-YAH"],
          ["bàbá", "father", "ba-BAH"],
          ["ọmọ", "child", "AW-maw"]
        ]],
        ["Numbers", [
          ["ọ̀kan", "one", "AW-kan"],
          ["èjì", "two", "EH-jee"],
          ["ẹ̀ta", "three", "EH-ta"]
        ]],
        ["Everyday", [
          ["omi", "water", "OH-mee"],
          ["búrẹ́dì", "bread", "boo-REH-dee"],
          ["ilé", "house", "ee-LEH"],
          ["ìwé", "book", "ee-WEH"]
        ]],
        ["Verbs", [
          ["jẹ", "to eat", "jeh"],
          ["mu", "to drink", "moo"],
          ["sọrọ", "to speak", "saw-raw"],
          ["lọ", "to go", "law"]
        ]]
      ]
    },

    igbo: {
      code: "ig-NG",
      groups: [
        ["Greetings", [
          ["ndewo", "hello", "n-DEH-wo"],
          ["daalụ", "thank you", "DAH-loo"],
          ["biko", "please", "BEE-ko"],
          ["ka ọ dị", "goodbye", "ka aw DEE"],
          ["ndo", "sorry", "n-DOH"]
        ]],
        ["People", [
          ["enyi", "friend", "eh-NYEE"],
          ["nne", "mother", "n-NEH"],
          ["nna", "father", "n-NAH"],
          ["nwa", "child", "n-WAH"]
        ]],
        ["Numbers", [
          ["otu", "one", "OH-too"],
          ["abụọ", "two", "ah-BWAW"],
          ["atọ", "three", "ah-TAW"]
        ]],
        ["Everyday", [
          ["mmiri", "water", "m-MEE-ree"],
          ["achịcha", "bread", "ah-CHEE-cha"],
          ["ụlọ", "house", "OO-law"],
          ["akwụkwọ", "book", "ah-KWOO-kwaw"]
        ]],
        ["Verbs", [
          ["rie", "to eat", "REE-eh"],
          ["ṅụọ", "to drink", "NG-oo-aw"],
          ["kwuo", "to speak", "KWOO-oh"],
          ["gaa", "to go", "GAH-ah"]
        ]]
      ]
    },

    hebrew: {
      code: "he-IL",
      groups: [
        ["Greetings", [
          ["שלום", "hello", "sha-LOM"],
          ["תודה", "thank you", "to-DA"],
          ["בבקשה", "please", "be-va-ka-SHA"],
          ["להתראות", "goodbye", "le-hit-ra-OT"],
          ["סליחה", "sorry", "slee-KHA"]
        ]],
        ["People", [
          ["חבר", "friend", "KHA-ver"],
          ["אמא", "mother", "EE-ma"],
          ["אבא", "father", "AH-ba"],
          ["ילד", "child", "YEH-led"]
        ]],
        ["Numbers", [
          ["אחד", "one", "e-KHAD"],
          ["שתיים", "two", "SHTA-yim"],
          ["שלוש", "three", "sha-LOSH"]
        ]],
        ["Everyday", [
          ["מים", "water", "MA-yim"],
          ["לחם", "bread", "LE-khem"],
          ["בית", "house", "BA-yit"],
          ["ספר", "book", "SE-fer"]
        ]],
        ["Verbs", [
          ["לאכול", "to eat", "le-e-KHOL"],
          ["לשתות", "to drink", "lish-TOT"],
          ["לדבר", "to speak", "le-da-BER"],
          ["ללכת", "to go", "la-LE-khet"]
        ]]
      ]
    },

    latin: {
      code: "la",
      groups: [
        ["Greetings", [
          ["salve", "hello", "SAL-veh"],
          ["gratias tibi", "thank you", "GRAH-tee-as TIH-bee"],
          ["quaeso", "please", "KWEH-soh"],
          ["vale", "goodbye", "WAH-leh"],
          ["ignosce", "sorry", "ig-NOS-keh"]
        ]],
        ["People", [
          ["amicus", "friend", "a-MEE-kus"],
          ["mater", "mother", "MAH-ter"],
          ["pater", "father", "PAH-ter"],
          ["puer", "child", "POO-er"]
        ]],
        ["Numbers", [
          ["unus", "one", "OO-nus"],
          ["duo", "two", "DOO-oh"],
          ["tres", "three", "trehs"]
        ]],
        ["Everyday", [
          ["aqua", "water", "AH-kwa"],
          ["panis", "bread", "PAH-nis"],
          ["domus", "house", "DOH-mus"],
          ["liber", "book", "LEE-ber"]
        ]],
        ["Verbs", [
          ["edere", "to eat", "EH-deh-reh"],
          ["bibere", "to drink", "BIH-beh-reh"],
          ["loqui", "to speak", "LOH-kwee"],
          ["ire", "to go", "EE-reh"]
        ]]
      ]
    },

    afrikaans: {
      code: "af-ZA",
      groups: [
        ["Greetings", [
          ["hallo", "hello", "ha-LOH"],
          ["dankie", "thank you", "DAHN-kee"],
          ["asseblief", "please", "a-seh-BLEEF"],
          ["totsiens", "goodbye", "tot-SEENS"],
          ["jammer", "sorry", "YA-mer"]
        ]],
        ["People", [
          ["vriend", "friend", "vreent"],
          ["ma", "mother", "ma"],
          ["pa", "father", "pa"],
          ["kind", "child", "kint"]
        ]],
        ["Numbers", [
          ["een", "one", "ayhn"],
          ["twee", "two", "tvee"],
          ["drie", "three", "dree"]
        ]],
        ["Everyday", [
          ["water", "water", "VAH-ter"],
          ["brood", "bread", "broht"],
          ["huis", "house", "hays"],
          ["boek", "book", "book"]
        ]],
        ["Verbs", [
          ["eet", "to eat", "eet"],
          ["drink", "to drink", "drink"],
          ["praat", "to speak", "praht"],
          ["gaan", "to go", "khaan"]
        ]]
      ]
    },

    icelandic: {
      code: "is-IS",
      groups: [
        ["Greetings", [
          ["halló", "hello", "hat-LOH"],
          ["takk", "thank you", "tahk"],
          ["vinsamlegast", "please", "VIN-sam-leh-gast"],
          ["bless", "goodbye", "bles"],
          ["fyrirgefðu", "sorry", "fi-rir-GYEV-thoo"]
        ]],
        ["People", [
          ["vinur", "friend", "VEE-nur"],
          ["móðir", "mother", "MOH-thir"],
          ["faðir", "father", "FA-thir"],
          ["barn", "child", "bartn"]
        ]],
        ["Numbers", [
          ["einn", "one", "aytn"],
          ["tveir", "two", "tvayr"],
          ["þrír", "three", "threer"]
        ]],
        ["Everyday", [
          ["vatn", "water", "vahtn"],
          ["brauð", "bread", "brurth"],
          ["hús", "house", "hoos"],
          ["bók", "book", "bohk"]
        ]],
        ["Verbs", [
          ["borða", "to eat", "BOR-tha"],
          ["drekka", "to drink", "DREK-ka"],
          ["tala", "to speak", "TA-la"],
          ["fara", "to go", "FA-ra"]
        ]]
      ]
    }
  };

  /* --------------------------------------------------------------------------
     Lookup
     -------------------------------------------------------------------------- */

  const KEYS = Object.keys(PACKS).sort(function (a, b) { return b.length - a.length; });
  const RESOLVED = {};

  function resolve(subject) {
    if (!subject) return null;
    /* AP world-language courses are exam courses, not beginner decks. */
    if (/^ap-/.test(String(subject.id || ""))) return null;
    const haystack = (String(subject.id || "") + " " + String(subject.title || "")).toLowerCase();
    for (let index = 0; index < KEYS.length; index += 1) {
      if (haystack.indexOf(KEYS[index]) >= 0) return KEYS[index];
    }
    return null;
  }

  function build(key) {
    const words = [];
    PACKS[key].groups.forEach(function (group) {
      group[1].forEach(function (item) {
        words.push({
          target: item[0],
          english: item[1],
          pronunciation: item[2],
          theme: group[0]
        });
      });
    });
    return { key: key, code: PACKS[key].code, groups: PACKS[key].groups, words: words };
  }

  function forSubject(subject) {
    const key = resolve(subject);
    if (!key) return null;
    if (!RESOLVED[key]) RESOLVED[key] = build(key);
    return RESOLVED[key];
  }

  window.QuestionaireLanguagePacks = {
    forSubject: forSubject,
    packs: PACKS
  };
})();
