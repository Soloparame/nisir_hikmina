export type Locale = "am" | "en";

/** Widen literal strings so en/am share one context type (fixes Netlify build). */
type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenStrings<U>[]
    : T extends object
      ? { readonly [K in keyof T]: WidenStrings<T[K]> }
      : T;

const translationsSource = {
  am: {
    meta: {
      title: "ንስር ሕክምና — የታመነ የጤና መድረክ",
      description:
        "በብቁ የጤና ባለሙያዎች የሕክምና ምክክር ያስይዙ። በአካል፣ በድምጽ ወይም በቪዲዮ።",
    },
    nav: {
      home: "መነሻ",
      about: "ስለ እኛ",
      doctors: "ዶክተሮች",
      bookAppointment: "ቀጠሮ",
      bookNow: "ቀጠሮ ይያዙ",
    },
    brand: {
      name: "ንስር ሕክምና",
      tagline: "የታመነ የጤና አገልግሎት",
    },
    hero: {
      badge: "24/7 የጤና አገልግሎት",
      title: "ከፍተኛ ደረጃ ያላቸው ዶክተሮች።",
      titleAccent: "በእጅዎ ጫፍ ላይ።",
      subtitle:
        "ንስር ሕክምና ከከፍተኛ የጤና ባለሙያዎች ጋር ያገናኝዎታል። ዶክተርዎን ይምረጡ — ከዚያ በቀላሉ ቀጠሮ ያስይዙ።",
      cta: "ቀጠሮ ይያዙ",
      trust: "ከ 2,400+ ታካሚዎች 4.9/5",
      review:
        "« እስካሁን ያለኝ ምርጥ የሕክምና ተሞክሮ። ንስር ሕክምናን በጣም እመክራለሁ! »",
      reviewAuthor: "— ሳራ መ.",
      doctorAlt: "ዶክተር አስራት ወልደየስ",
      tributeName: "አስራት ወልደየስ",
      tributeNameLatin: "Asrat Woldeyes",
      tributeDates: "ግንቦት ፲፪ ፣ ፲፱፻፳ — ግንቦት ፮ ፣ ፲፱፻፺፱",
      tributeBio:
        "የኢትዮጵያ ቀዶ ሕክምና ባለሙያ፣ በአዲስ አበባ ዩኒቨርሲቲ የሕክምና መምህር፣ እና የሁሉም አማራ ሕዝብ ድርጅት (AAPO) መስራችና መሪ ነበሩ። በደርግ እና በኢሕአዴግ ተደጋጋሚ ጊዜያት በእስር ተደረጉ።",
      tributeQuote:
        "በተራ ተራ የኢትዮጵያ በጣም የተከበረ ቀዶ ሕክምና ባለሙያ፣ ሐኪም እና የዩኒቨርሲቲ ዲን ነበሩ።",
      tributeQuoteSource: "— The Guardian",
    },
    trust: {
      label: "የታመኑበት፦",
    },
    howItWorks: {
      title: "ንስር ሕክምና እንዴት ይሠራል",
      subtitle: "በ 3 ቀላል ደረጃዎች የሚፈልጉትን እንክብካቤ ያግኙ",
      step1Title: "1. ዶክተር ይምረጡ",
      step1Desc:
        "የሚፈልጉትን ስፔሻሊቲ ያለውን ዶክተር ይመርጡ። ፎቶ፣ ልምድ እና ሙያውን ይመልከቱ።",
      step2Title: "2. መረጃዎን ይሙሉ",
      step2Desc:
        "ስም፣ ስልክ፣ ቴሌግራም እና አድራሻዎን በቀላሉ ይሙሉ። ለኢትዮጵያውያን ቀላል ቅጽ ነው።",
      step3Title: "3. ዶክተርዎን ይገናኙ",
      step3Desc:
        "በቪዲዮ፣ በድምጽ ወይም በአካል ምክክር ያድርጉ። ምርመራ እና ማዘዣ ወዲያውኑ ይቀበላሉ።",
    },
    services: {
      title: "ምን እናከም",
      subtitle: "ከዕለታዊ እንክብካቤ እስከ ሥር የሰደደ ሁኔታዎች — ሁሉንም እናሸፍናለን",
      cardiology: "ካርዲዮሎጂ",
      cardiologyDesc: "የልብ እና የደም ስር ሕክምና",
      neurology: "ኒውሮሎጂ",
      neurologyDesc: "የአንጎል እና የነርቭ ስርዓት",
      orthopedics: "ኦርቶፔዲክስ",
      orthopedicsDesc: "አጥንት እና ጡንቻ",
      pediatrics: "ፔዲያትሪክስ",
      pediatricsDesc: "የልጆች ጤና",
      primaryCare: "ዋና እንክብካቤ",
      primaryCareDesc: "ዕለታዊ ጤና እና ምርመራ",
      dermatology: "የቆዳ ሕክምና",
      dermatologyDesc: "ቆዳ፣ ፀጉር እና ጥፍር",
    },
    value: {
      boxTitle: "ጥራት ያለው እንክብካቤ። የተረጋገጠ።",
      boxDesc: "ጥብቅ ምርመራ ሂደታችን ጥሩ ዶክተሮችን ብቻ እንዲያዩዎ ያረጋግጣል።",
      yearsCount: "7+",
      yearsLabel: "የአገልግሎት ዓመታት\nትምህርት",
      readMoreAbout: "ስለ እኛ ይበልጡ",
      title: "እርስዎን በመጀመሪያ የሚያስብ ጤና አገልግሎት",
      doctors: "ከ 5% ላይ ዶክተሮች",
      doctorsDesc: "ዶክተሮቻችን በጣም ብቁ እና በሙያ የተረጋገጡ ናቸው።",
      affordable: "ተመጣጣኝ እና ግልጽ",
      affordableDesc: "ኢንሹራንስ ካለም ሆነ ከሌለም ግልጽ ዋጋ፣ ተጨማሪ ክፍያ የለም።",
      anywhere: "ከማንኛውም ቦታ እንክብካቤ",
      anywhereDesc: "የሕክምና መዝገቦችዎን ይድረሱ እና ከማንኛውም መሣሪያ ምክክር ያድርጉ።",
      cta: "ዛሬ ይጀምሩ",
    },
    footer: {
      tagline: "በኢትዮጵያ እና በውጭ ከፍተኛ የጤና አገልግሎቶችን እናቀርባለን።",
      company: "ኩባንያ",
      about: "ስለ እኛ",
      careers: "ስራዎች",
      contact: "ያግኙን",
      services: "አገልግሎቶች",
      serviceCategories: [
        {
          title: "1. ዋና እንክብካቤ እና አጠቃላይ ሕክምና",
          items: [
            "አጠቃላይ ሕክምና / የቤተሰብ ሕክምና",
            "የውስጥ ሕክምና (የአዋቂ እንክብካቤ)",
            "የአረጅት ሕክምና",
            "መከላከያ ጤና እና ደህንነት",
          ],
        },
        {
          title: "2. የራስ ማረት ጤና",
          items: [
            "ጋይነኮሎጂ እና ኦብስትትሪክስ",
            "የጾታ እና የራስ ማረት ጤና",
            "ዩሮሎጂ (የሽንት እና የወንድ ጤና)",
          ],
        },
        { title: "3. ፔዲያትሪክስ (የልጆች ጤና)", items: [] },
        { title: "4. ኒውሮሎጂ (የአንጎል እና የነርቭ እንክብካቤ)", items: [] },
        { title: "5. ልብ", items: [] },
        { title: "6. ሄማቶሎጂ", items: [] },
        { title: "7. ፑልሞኖሎጂ", items: [] },
        {
          title: "8. ማቆየት እና ሜታቦሊክ ጤና",
          items: ["ጋስትሮኢንተሮሎጂ እና ሄፓቶሎጂ"],
        },
        { title: "9. ኔፍሮሎጂ (የኩላይት እንክብካቤ)", items: [] },
        { title: "10. ኢንዶክሪኖሎጂ (የስኳር እና ሆርሞን)", items: [] },
        { title: "11. ምግብ እና ዲያቴቲክስ", items: [] },
        { title: "12. ሩሜቶሎጂ", items: [] },
        { title: "13. ኦንኮሎጂ", items: [] },
        { title: "14. ኦፍታልሞሎጂ", items: [] },
        { title: "15. ENT (ጆሮ፣ አፍንጫ እና ጉሮሮ)", items: [] },
        { title: "16. የጥርስ እና የአፍ ጤና", items: [] },
        { title: "17. የቆዳ ሕክምና", items: [] },
        {
          title: "18. ቀዶ ሕክምና እና የላቀ ቀዶ ሕክምና ምክክር",
          items: [],
        },
        {
          title: "19. ምርመራ እና ምስል (ራዲዮሎጂ)",
          items: [],
        },
        { title: "20. ፓሊያቲቭ እንክብካቤ", items: [] },
        { title: "21. ፊዚዮቴራፒ እና ማሻሻያ", items: [] },
      ],
      legal: "ሕጋዊ",
      privacy:
        "የግላዊነት ፖሊሲ — ከመጀመሪያ እስከ መጨረሻ ምስጠራ፣ ግላዊነትዎ የተጠበቀ እና ሚስጥራዊ፣ የጤና መረጃ ለሶስተኛ ወገን አይጋራም።",
      terms:
        "የአገልግሎት ውሎች — ግላዊነትዎ የተጠበቀ፣ ሚስጥራዊ እና ለሶስተኛ ወገን አይጋራም።",
      rights: "ሁሉም መብቶች የተጠበቁ ናቸው።",
    },
    about: {
      badge: "ስለ ንስር ሕክምና",
      title: "ጤናን ለሁሉም ተደራሽ እናደርጋለን",
      lead:
        "ንስር ሕክምና ታካሚዎችን ከብቁ የጤና ባለሙያዎች ጋር በቀላሉ የሚያገናኝ ዘመናዊ የቴሌሕክምና መድረክ ነው። በአካል፣ በድምጽ ወይም በቪዲዮ ምክክር ያስይዙ።",
      missionTitle: "ተልዕኮአችን",
      missionP1:
        "በኢትዮጵያ እና በውጭ የሚኖሩ ታካሚዎች ከፍተኛ ጥራት ያለው የሕክምና ምክክር እንዲያገኙ እንሠራለን። ዶክተር መምረጥ፣ ቀጠሮ መያዝ እና መረጃ መሙላት በአንድ ቦታ ቀላል ነው።",
      missionP2:
        "ቡድናችን ታካሚዎችን በእያንዳንዱ ደረጃ ይሰማል — ከቀጠሮ ጥያቄ እስከ ምክክር ድረስ ግልጽ እና ግብረ መልስ ያለው አገልግሎት እንሰጣለን።",
      visionTitle: "ራዕያችን",
      visionText:
        "በአገር አቀፍ ደረጃ የታመነ የጤና መድረክ መሆን — ለቤተሰቦች ቀላል፣ ግልጽ እና አስተማማኝ የጤና ጉዞ።",
      pillarsTitle: "ዋና እሴቶቻችን",
      pillarsSub: "እነዚህ መርሆች በእያንዳንዱ ቀጠሮ እና ምክክር ውስጥ ይገለጻሉ",
      pillar1Title: "ጥራት እና ግብረ መልስ",
      pillar1Desc:
        "በጥብቅ የሚመረጡ ዶክተሮች እና ግልጽ የቀጠሮ ሂደት።",
      pillar2Title: "ተደራሽነት",
      pillar2Desc:
        "ከማንኛውም ቦታ ቀጠሮ — በቴሌግራም፣ ስልክ ወይም ቪዲዮ።",
      pillar3Title: "ታካሚ በመረጃ",
      pillar3Desc:
        "የታካሚ መረጃ ደህንነት እና ከቀጠሮ እስከ ምክክር ግልጽ ግንኙነት።",
      whyTitle: "ለምን ንስር ሕክምና?",
      whyItems: [
        "በብቁ ዶክተሮች በስፔሻሊቲ ይፈልጉ እና ይምረጡ",
        "ቀላል የቀጠሮ ቅጽ — አማርኛ እና እንግሊዝኛ",
        "በአካል፣ በድምጽ ወይም በቪዲዮ ምክክር",
        "ፈጣን ምላሽ ከሕክምና ቡድናችን",
        "ሚስጥራዊነት — በአለም አቀፍ የተቀበሉ የግላዊነት እና የሚስጥር ጥበቃ ደረጃዎች",
      ],
      ctaTitle: "ዶክተርዎን ይምረጡ እና ቀጠሮ ይያዙ",
      ctaSub: "ዛሬ ጀምሩ — በጥቂት ደቂቃዎች ውስጥ ጥያቄዎን ያስገቡ።",
      storyKicker: "ስለ እኛ",
      storyTitle: "ስለ",
      storyTitleAccent: "እኛ",
      storyHeading: "የእኛ",
      storyHeadingAccent: "ታሪክ",
      storyIntro:
        "ንስር ሕክምና ታካሊያን ከብቁ የጤና ባለሙያዎች ጋር በቀላሉ የሚያገናኝ ዘመናዊ መድረክ ነው።",
      storyTimeline1:
        "በኢትዮጵያ እና በውጭ የሚኖሩ ታካሚዎች ለእነሱ የሚስማማውን ስፔሻሊቲ ይመርጣሉ፣ ቀጠሮ ያስይዛሉ፣ ከዚያም በቀላሉ ቅጽ ዝርዝር መረጃ ይሙላሉ።",
      storyTimeline2:
        "ቡድናችን ከቀጠሮ ጥያቄ እስከ ምክክር ድረስ ግልጽ ግንኙነት ይይዛል — ግብረ መልስ ያለው እና ታካሚ-መጀመሪያ አገልግሎት።",
      storyStep2Title: "እንዴት እንሠራለን",
      visionCardTitle: "ራዕያችን",
    },
    book: {
      chooseDoctorTitle: "ዶክተርዎን ይምረጡ",
      filterTitle: "ማጣሪያ",
      searchPlaceholder: "ስፔሻሊቲ ይፈልጉ...",
      allCategories: "ሁሉ",
      clearFilters: "ማጣሪያ አጽዳ",
      noMatch: "በዚህ ማጣሪያ ምንም ዶክተር አልተገኘም።",
      showFilters: "ማጣሪያ አሳይ",
      hideFilters: "ማጣሪያ ደብቅ",
      backHome: "← ወደ መነሻ ተመለስ",
      chooseDoctorSub: "ለእርስዎ የሚስማማውን ባለሙያ ዶክተር ይምረጡ፣ ከዚያ ዝርዝር መረጃዎን ይሙሉ",
      yearsExp: "ዓመት ልምድ",
      continueBtn: "ወደ ቀጠሮ ቅጽ →",
      changeDoctor: "← ዶክተር ለመቀየር",
      noDoctors: "አሁን ምንም ዶክተር አልተመዘገበም። እባክዎ ቆይተው ይሞክሩ።",
      loadingDoctors: "ዶክተሮችን በመጫን ላይ...",
      stepDoctor: "ዶክተር",
      stepDetails: "መረጃ",
      title: "ቀጠሮ ይያዙ",
      subtitle: "ዝርዝሮችዎን ይሙሉ እና ለማረጋገጥ እናገኝዎታለን",
      fullName: "ሙሉ ስም",
      phone: "ስልክ ቁጥር",
      disease: "በሽታ / ሁኔታ",
      telegram: "የቴሌግራም ስም",
      country: "ሀገር",
      state: "ክልል / ግዛት",
      city: "ከተማ / አድራሻ",
      consultType: "የምክክር አይነት",
      doctor: "ዶክተር",
      selectCountry: "— ሀገር ይምረጡ —",
      selectState: "— ክልል / ግዛት ይምረጡ —",
      selectCity: "— ከተማ ይምረጡ —",
      cityPlaceholder: "ከተማዎን ይፃፉ",
      submit: "የቀጠሮ ጥያቄ ያስገቡ",
      namePlaceholder: "ስም",
      phonePlaceholder: "+251 9XX XXX XXXX",
      diseasePlaceholder: "በሽታዎን ወይም ምልክቶችዎን ይግለጹ",
      telegramPlaceholder: "@username",
      inPerson: "በአካል",
      audioCall: "የድምጽ ጥሪ",
      videoCall: "የቪዲዮ ጥሪ",
      errors: {
        name: "ሙሉ ስም ያስፈልጋል",
        phone: "ስልክ ቁጥር ያስፈልጋል",
        disease: "በሽታዎን ይግለጹ",
        telegram: "የቴሌግራም ስም ያስፈልጋል",
        country: "ሀገር ይምረጡ",
        state: "ክልል / ግዛት ይምረጡ",
        city: "ከተማዎን ይምረጡ ወይም ይፃፉ",
        consult: "የምክክር አይነት ይምረጡ",
        generic: "ጥያቄው አልተሳካም። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።",
      },
    },
    success: {
      pageTitle: "ቀጠሮ ቀርቧል ✓",
      icon: "✅",
      title: "ጥያቄዎን ተቀብለናል!",
      message:
        "ንስር ሕክምናን ስለተመረጡ እናመሰግናለን። የሕክምና ቡድናችን በቅርቡ በቴሌግራም ወይም በስልክ ቀጠሮዎን ለማረጋገጥ ያገኝዎታል።",
      summary: "የቀጠሮ ማጠቃለያ",
      name: "ስም",
      condition: "በሽታ",
      phone: "ስልክ",
      telegram: "ቴሌግራም",
      location: "አድራሻ",
      doctor: "ዶክተር",
      consultType: "የምክክር አይነት",
      joinTelegram: "✈️ የቴሌግራም ቻናላችንን ይቀላቀሉ",
      backHome: "← ወደ መነሻ ተመለስ",
      footer: "ንስር ሕክምና · በሁሉም ሀገሮች አገልግሎት",
      loading: "በመጫን ላይ...",
    },
    lang: {
      switchTo: "English",
      current: "አማርኛ",
    },
  },
  en: {
    meta: {
      title: "Nisir Hikimina — Ethiopia's Trusted Health Platform",
      description:
        "Book medical consultations with qualified professionals. In person, audio call, or video call.",
    },
    nav: {
      home: "Home",
      about: "About",
      doctors: "Doctors",
      bookAppointment: "Book",
      bookNow: "Book Now",
    },
    brand: {
      name: "Nisir Hikimina",
      tagline: "Trusted Health Care",
    },
    hero: {
      badge: "24/7 Healthcare Access",
      title: "World-class doctors.",
      titleAccent: "At your fingertips.",
      subtitle:
        "Nisir Hikimina connects you with top-tier medical professionals. Book an in-person visit or a virtual consultation from the comfort of your home.",
      cta: "Book an Appointment",
      trust: "4.9/5 from 2,400+ patients",
      review:
        '"The best medical experience I\'ve ever had. Highly recommend Nisir Hikimina!"',
      reviewAuthor: "— Sarah M.",
      doctorAlt: "Dr. Asrat Woldeyes",
      tributeName: "Asrat Woldeyes",
      tributeNameLatin: "አስራት ወልደየስ",
      tributeDates: "June 20, 1928 – May 14, 1999",
      tributeBio:
        "Ethiopian surgeon, professor of medicine at Addis Ababa University, and founder and leader of the All-Amhara People's Organization (AAPO). He was jailed by the Derg and later by the Ethiopian People's Revolutionary Democratic Front (EPRDF).",
      tributeQuote:
        "successively Ethiopia's most distinguished surgeon, physician and university dean.",
      tributeQuoteSource: "— The Guardian",
    },
    trust: {
      label: "Trusted By:",
    },
    howItWorks: {
      title: "How Nisir Hikimina works",
      subtitle: "Get the care you need in 3 simple steps",
      step1Title: "1. Choose your doctor",
      step1Desc:
        "Pick a specialist that fits your needs. View their photo, experience, and field.",
      step2Title: "2. Fill in your details",
      step2Desc:
        "Enter your name, phone, Telegram, and location in a simple form.",
      step3Title: "3. Meet your doctor",
      step3Desc:
        "Consult via video, audio, or in person. Get diagnosis and prescription quickly.",
    },
    services: {
      title: "What we treat",
      subtitle:
        "From everyday care to chronic conditions, we've got you covered.",
      cardiology: "Cardiology",
      cardiologyDesc: "Heart & vascular care",
      neurology: "Neurology",
      neurologyDesc: "Brain & nervous system",
      orthopedics: "Orthopedics",
      orthopedicsDesc: "Bones & joints",
      pediatrics: "Pediatrics",
      pediatricsDesc: "Child healthcare",
      primaryCare: "Primary Care",
      primaryCareDesc: "Everyday health & checkups",
      dermatology: "Dermatology",
      dermatologyDesc: "Skin, hair & nail care",
    },
    value: {
      boxTitle: "Quality Care. Guaranteed.",
      boxDesc:
        "Our rigorous vetting process ensures you only see the best doctors.",
      yearsCount: "7+",
      yearsLabel: "Years of Service\nExcellence",
      readMoreAbout: "Read more about us",
      title: "Healthcare that puts you first",
      doctors: "Top 5% of doctors",
      doctorsDesc:
        "Our physicians are highly experienced and board-certified.",
      affordable: "Affordable & transparent",
      affordableDesc:
        "Clear pricing with no hidden fees, with or without insurance.",
      anywhere: "Care from anywhere",
      anywhereDesc:
        "Access your medical records and consult from any device.",
      cta: "Get Started Today",
    },
    footer: {
      tagline:
        "Providing exceptional healthcare services across Ethiopia and beyond.",
      company: "Company",
      about: "About Us",
      careers: "Careers",
      contact: "Contact",
      services: "Services",
      serviceCategories: [
        {
          title: "1. Primary Care & General Medicine",
          items: [
            "General Medicine / Family Medicine",
            "Internal Medicine (Adult Care)",
            "Geriatric Medicine (Elderly Care)",
            "Preventative Health & Wellness",
          ],
        },
        {
          title: "2. Reproductive Health",
          items: [
            "Gynecology & Obstetrics",
            "Sexual & Reproductive Health",
            "Urology (Urinary & Men's Health)",
          ],
        },
        { title: "3. Pediatrics (Children's Health)", items: [] },
        { title: "4. Neurology (Brain & Nerve Care)", items: [] },
        { title: "5. Heart", items: [] },
        { title: "6. Hematology", items: [] },
        { title: "7. Pulmonology", items: [] },
        {
          title: "8. Digestion & Metabolic Health",
          items: [
            "Gastroenterology & Hepatology (Digestive & Liver Care)",
          ],
        },
        { title: "9. Nephrology (Kidney Care)", items: [] },
        { title: "10. Endocrinology (Diabetes & Hormones)", items: [] },
        { title: "11. Nutrition & Dietetics", items: [] },
        { title: "12. Rheumatology (Joint & Autoimmune)", items: [] },
        { title: "13. Oncology (Cancer Care)", items: [] },
        { title: "14. Ophthalmology (Eye Care)", items: [] },
        { title: "15. ENT (Ear, Nose & Throat)", items: [] },
        { title: "16. Dentistry & Oral Health", items: [] },
        { title: "17. Dermatology (Skin, Hair & Nails)", items: [] },
        {
          title:
            "18. Surgery & Advanced surgical sub specialists Consultations",
          items: [],
        },
        {
          title: "19. Diagnostics, Imaging (Radiology — Imaging Review & Second Opinions)",
          items: [],
        },
        { title: "20. Palliative Care & Symptom Management", items: [] },
        {
          title:
            "21. Physical Medicine & Rehabilitation (physiotherapy)",
          items: [],
        },
      ],
      legal: "Legal",
      privacy:
        "Privacy Policy — End-to-end encryption. Your privacy is kept confidential and health data is never shared with third parties.",
      terms:
        "Terms of Service — Your privacy is kept confidential. No health data is shared with third parties.",
      rights: "All rights reserved.",
    },
    about: {
      badge: "About Nisir Hikimina",
      title: "Making quality healthcare accessible",
      lead:
        "Nisir Hikimina is a modern telehealth platform that connects patients with qualified specialists. Book in-person, audio, or video consultations in a few simple steps.",
      missionTitle: "Our mission",
      missionP1:
        "We help patients in Ethiopia and abroad access trusted medical consultations without unnecessary complexity. Choosing a doctor, booking, and sharing your details happens in one clear flow.",
      missionP2:
        "Our team focuses on responsive, human care — from appointment requests through to your consultation.",
      visionTitle: "Our vision",
      visionText:
        "To become a nationally trusted health platform — simple, transparent, and dependable for every family.",
      pillarsTitle: "What we stand for",
      pillarsSub: "These principles guide every appointment and consultation",
      pillar1Title: "Quality & trust",
      pillar1Desc:
        "Carefully selected doctors and a transparent booking process.",
      pillar2Title: "Accessibility",
      pillar2Desc:
        "Care from anywhere — via Telegram, phone, or video.",
      pillar3Title: "Patient-first",
      pillar3Desc:
        "Clear communication and respect for your information at every step.",
      whyTitle: "Why Nisir Hikimina?",
      whyItems: [
        "Browse and choose doctors by specialty",
        "Simple booking form in Amharic and English",
        "In-person, audio, or video consultations",
        "Fast follow-up from our medical team",
        "Confidentiality — care delivered under internationally accepted privacy and confidentiality standards",
      ],
      ctaTitle: "Choose your doctor and book today",
      ctaSub: "Get started in just a few minutes.",
      storyKicker: "About us",
      storyTitle: "ABOUT",
      storyTitleAccent: "US",
      storyHeading: "Our",
      storyHeadingAccent: "Story",
      storyIntro:
        "Nisir Hikimina is a modern platform that connects patients with qualified specialists across many medical fields.",
      storyTimeline1:
        "Patients in Ethiopia and abroad choose the right specialty, book an appointment, and share details through one simple form.",
      storyTimeline2:
        "Our team stays in touch from request to consultation — responsive, clear, and patient-first at every step.",
      storyStep2Title: "How we work",
      visionCardTitle: "Our vision",
    },
    book: {
      backHome: "← Back to Home",
      chooseDoctorTitle: "Choose Your Doctor",
      filterTitle: "Filters",
      searchPlaceholder: "Search specialties...",
      allCategories: "All",
      clearFilters: "Clear filters",
      noMatch: "No doctors match this filter.",
      showFilters: "Show filters",
      hideFilters: "Hide filters",
      chooseDoctorSub: "Select a specialist, then fill in your booking details",
      yearsExp: "years experience",
      continueBtn: "Continue to Form →",
      changeDoctor: "← Change doctor",
      noDoctors: "No doctors available yet. Please check back soon.",
      loadingDoctors: "Loading doctors...",
      stepDoctor: "Doctor",
      stepDetails: "Details",
      title: "Book an Appointment",
      subtitle: "Fill in your details and we'll reach out to confirm",
      fullName: "Full Name",
      phone: "Phone Number",
      disease: "Disease / Condition",
      telegram: "Telegram Username",
      country: "Country",
      state: "State / Region",
      city: "City / Address",
      consultType: "Consultation Type",
      doctor: "Doctor",
      selectCountry: "— Select country —",
      selectState: "— Select state / region —",
      selectCity: "— Select city —",
      cityPlaceholder: "Enter your city",
      submit: "Submit Appointment Request",
      namePlaceholder: "Name",
      phonePlaceholder: "+1 XXX XXX XXXX",
      diseasePlaceholder: "Describe your condition or symptoms",
      telegramPlaceholder: "@yourusername",
      inPerson: "In Person",
      audioCall: "Audio Call",
      videoCall: "Video Call",
      errors: {
        name: "Full name is required",
        phone: "Phone number is required",
        disease: "Please describe your condition",
        telegram: "Telegram username is required",
        country: "Please select your country",
        state: "Please select your state or region",
        city: "Please select or enter your city",
        consult: "Please choose a consultation type",
        generic: "Something went wrong. Please try again in a moment.",
      },
    },
    success: {
      pageTitle: "Appointment Submitted ✓",
      icon: "✅",
      title: "We've Received Your Request!",
      message:
        "Thank you for trusting Nisir Hikimina. Our medical team will contact you shortly via Telegram or phone number to confirm your appointment details.",
      summary: "Booking Summary",
      name: "Name",
      condition: "Condition",
      phone: "Phone",
      telegram: "Telegram",
      location: "Location",
      doctor: "Doctor",
      consultType: "Consult Type",
      joinTelegram: "✈️ Join Our Telegram Channel",
      backHome: "← Back to Home",
      footer: "Nisir Hikimina · Serving worldwide",
      loading: "Loading...",
    },
    lang: {
      switchTo: "አማርኛ",
      current: "English",
    },
  },
} as const;

export type TranslationKeys = WidenStrings<
  (typeof translationsSource)["am"]
>;

export const translations: Record<Locale, TranslationKeys> = {
  am: translationsSource.am,
  en: translationsSource.en,
};
