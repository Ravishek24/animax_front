import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LanguageCode = 'en-hi' | 'pa';

type Translations = Record<string, string>;

const enHi: Translations = {
  appName: 'पशुपालन मंच',
  profile: 'प्रोफाइल',
  logout: 'लॉगआउट',
  logoutConfirmTitle: 'लॉगआउट',
  logoutConfirmMessage: 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
  cancel: 'रद्द करें',
  logoutAction: 'लॉगआउट',
  animalSupplies: 'पशु आपूर्ति',
  marketplacePill: 'पशु दवा और आहार खरीदें',
  ourVideos: 'हमारी वीडियो',
  processTitle: 'समझें हर प्रक्रिया, आसान तरीके से!',
  statsJourneyTitle: 'Animax पर आपका सफर',
  statAnimalsListed: 'पशु ऐप पर डाले',
  statCallsMade: 'आपने कॉल किए',
  statMonthsConnected: 'ऐनिमल से जुड़े',
  incompleteProfile: 'अधूरी प्रोफाइल',
  yourProfile: 'आपकी प्रोफाइल',
  incomplete: 'अधूरी',
  isWord: 'है',
  completeProfileEarn: 'प्रोफाइल पूरा करें और',
  coinsWord: 'कॉइन्स पाएँ',
  completeNow: 'अभी पूरी करें',
  wallet: 'वॉलेट',
  viewWallet: 'वॉलेट देखें',
  animalsOfSuffix: 'जी के पशु',
  customerSupport: 'ग्राहक सेवा',
  freeListingTitle: 'FREE में पशु दर्ज करें',
  freeListingSubtitle: 'बिना किसी पेमेंट के, पशु आसानी से बेचें',
  whatToSell: 'क्या बेचना है?',
  cow: 'गाय',
  buffalo: 'भैंस',
  otherAnimals: 'अन्य पशु',
  buyAnimals: 'पशु ख़रीदे »',
  sellAnimals: 'पशु बेचे »',
  // Buy Animals screen
  nearbyAnimals: 'आस पास के पशु',
  callTitle: 'कॉल करें',
  callPrompt: '{name} को कॉल करना चाहते हैं?',
  callAction: 'कॉल करें',
  errorTitle: 'त्रुटि',
  errorLoadAnimals: 'पशु लोड करने में समस्या हुई है।',
  loadingAnimals: 'पशु लोड हो रहे हैं...',
  noAnimals: 'कोई पशु उपलब्ध नहीं है',
  retry: 'दोबारा कोशिश करें',
  loadingMoreAnimals: 'अधिक पशु लोड हो रहे हैं...',
  premiumAnimal: 'प्राइम पशु',
  approxWord: 'लगभग',
  // Marketplace
  marketplace: 'मार्केटप्लेस',
  feedAndMeds: 'पशु आहार और दवाइयां',
  searchPlaceholder: 'आहार, दवाइयां, सप्लीमेंट्स खोजें...',
  categoriesAllProducts: 'सभी श्रेणियां',
  categoriesFeed: 'आहार',
  categoriesMedicine: 'दवाइयां',
  categoriesSupplements: 'सप्लीमेंट्स',
  categoriesEquipment: 'उपकरण',
  categoriesCare: 'ਪशु देखभाल',
  outOfStock: 'स्टॉक में नहीं',
  addToCart: 'कार्ट में जोड़ें',
  addingToCart: 'जोड़ा जा रहा है...',
  loginRequired: 'लॉगिन आवश्यक',
  loginToAddToCart: 'कार्ट में जोड़ने के लिए कृपया लॉगिन करें',
  addedToCart: 'कार्ट में जोड़ा गया',
  addedToCartMsg: '{product} आपके कार्ट में जोड़ दिया गया है।',
  continueShopping: 'खरीदारी जारी रखें',
  viewCart: 'कार्ट देखें',
  // Category names in Buy Animals
  categoryAll: 'सभी',
  categoryCow: 'गाय',
  categoryBuffalo: 'भैंस',
  categoryOther: 'अन्य',
  // Sell Animal (subset)
  place: 'जगह',
  locationShownToBuyers: 'खरीदारों को आपका पशु इस जगह दिखेगा',
  change: 'बदलें',
  registerUpload: 'दर्ज (upload) करें',
  freeUploadInfo: 'हर 30 दिन में 1 पशु फ्री में दर्ज कर पायंगे',
  needHelp: 'मदद चाहिए?',
  chatWithUs: 'हमसे बात करें',
  sellAnimalTitle: 'पशु बेचें',
  myAnimals: 'मेरे पशु',
  whichAnimal: 'कौन सा पशु',
  selectAnimal: 'पशु चुने',
  breedLabel: 'ब्यात',
  selectBreed: 'ब्यात चुने',
  currentMilkPerDay: 'अभी का दूध (प्रति-दिन)',
  todayTwoTimesMilk: 'आज का 2 समय का कुल दूध',
  litersUnit: 'लीटर',
  milkCapacityPerDay: 'दूध की क्षमता (प्रति-दिन)',
  maxMilkEver: 'सबसे ज्यादा आज तक का कितना दूध दिया',
  continueBtn: 'जारी रखें',
  priceRate: 'रेट (₹)',
  correctRateMoreCalls: 'सही रेट डालें, उससे ज्यादा ग्राहक कॉल करते हैं',
  rupees: 'रुपए',
  moreInfo: 'और जानकारी डालें',
  negotiation: 'मोल भाव',
  negotiationSubtitle: 'पशु के रेट पे खरीदार से मोल भाव',
  negotiationDesc: 'मोल भाव करने से ज्यादा खरीदार के कॉल आते हैं',
  addPhotoAtLeastOne: 'फोटो डालें (कम से कम एक)',
  goodPhotosSellFaster: 'अच्छी फोटो डालने पर जल्दी बिकती है',
  videoSellFaster: 'वीडियो डालने पर पशु जल्दी बिकता है',
  selectVideo: 'वीडियो चुनें',
  selectPhotoUdder: 'धन का फोटो चुनें',
  selectPhotoSide: 'साइड फोटो चुनें',
  selectPhoto: 'फोटो चुनें',
  allowPhotoPermission: 'फोटो डालने के लिए अनुमति दें',
};

const pa: Translations = {
  appName: 'ਪਸ਼ੂਪਾਲਨ ਮੰਚ',
  profile: 'ਪ੍ਰੋਫ਼ਾਈਲ',
  logout: 'ਲਾਗਆਊਟ',
  logoutConfirmTitle: 'ਲਾਗਆਊਟ',
  logoutConfirmMessage: 'ਕੀ ਤੁਸੀਂ ਯਕੀਨਨ ਲਾਗਆਊਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
  cancel: 'ਰੱਦ ਕਰੋ',
  logoutAction: 'ਲਾਗਆਊਟ',
  animalSupplies: 'ਪਸ਼ੂ ਸਪਲਾਈ',
  marketplacePill: 'ਪਸ਼ੂ ਦਵਾਈ ਅਤੇ ਆਹਾਰ ਖਰੀਦੋ',
  ourVideos: 'ਸਾਡੀਆਂ ਵੀਡੀਓਜ਼',
  processTitle: 'ਹਰ ਪ੍ਰਕਿਰਿਆ ਨੂੰ ਆਸਾਨੀ ਨਾਲ ਸਮਝੋ!',
  statsJourneyTitle: 'Animax ਤੇ ਤੁਹਾਡਾ ਸਫ਼ਰ',
  statAnimalsListed: 'ਐਪ ’ਤੇ ਪਸ਼ੂ ਜੋੜੇ',
  statCallsMade: 'ਤੁਸੀਂ ਕੀਤੀਆਂ ਕਾਲਾਂ',
  statMonthsConnected: 'ਐਨਿਮਲ ਨਾਲ ਜੁੜੇ',
  incompleteProfile: 'ਅਧੂਰੀ ਪ੍ਰੋਫ਼ਾਈਲ',
  yourProfile: 'ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ',
  incomplete: 'ਅਧੂਰੀ',
  isWord: 'ਹੈ',
  completeProfileEarn: 'ਪ੍ਰੋਫ਼ਾਈਲ ਪੂਰੀ ਕਰੋ ਅਤੇ',
  coinsWord: 'ਕੋਇਨ ਲਵੋ',
  completeNow: 'ਹੁਣੇ ਪੂਰੀ ਕਰੋ',
  wallet: 'ਵਾਲੇਟ',
  viewWallet: 'ਵਾਲੇਟ ਵੇਖੋ',
  animalsOfSuffix: 'ਜੀ ਦੇ ਪਸ਼ੂ',
  customerSupport: 'ਗਾਹਕ ਸੇਵਾ',
  freeListingTitle: 'FREE ਵਿੱਚ ਪਸ਼ੂ ਦਰਜ ਕਰੋ',
  freeListingSubtitle: 'ਬਿਨਾਂ ਕਿਸੇ ਭੁਗਤਾਨ ਦੇ, ਪਸ਼ੂ ਆਸਾਨੀ ਨਾਲ ਵੇਚੋ',
  whatToSell: 'ਕੀ ਵੇਚਣਾ ਹੈ?',
  cow: 'ਗਾਂ',
  buffalo: 'ਭੈੰਸ',
  otherAnimals: 'ਹੋਰ ਪਸ਼ੂ',
  buyAnimals: 'ਪਸ਼ੂ ਖਰੀਦੋ »',
  sellAnimals: 'ਪਸ਼ੂ ਵੇਚੋ »',
  // Buy Animals screen
  nearbyAnimals: 'ਨੇੜਲੇ ਪਸ਼ੂ',
  callTitle: 'ਕਾਲ ਕਰੋ',
  callPrompt: '{name} ਨੂੰ ਕਾਲ ਕਰਨੀ ਹੈ?',
  callAction: 'ਕਾਲ ਕਰੋ',
  errorTitle: 'ਗਲਤੀ',
  errorLoadAnimals: 'ਪਸ਼ੂ ਲੋਡ ਕਰਨ ਵਿੱਚ ਸਮੱਸਿਆ ਆਈ ਹੈ।',
  loadingAnimals: 'ਪਸ਼ੂ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
  noAnimals: 'ਕੋਈ ਪਸ਼ੂ ਉਪਲਬਧ ਨਹੀਂ',
  retry: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
  loadingMoreAnimals: 'ਹੋਰ ਪਸ਼ੂ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
  premiumAnimal: 'ਪ੍ਰਾਈਮ ਪਸ਼ੂ',
  approxWord: 'ਲਗਭਗ',
  // Marketplace
  marketplace: 'ਮਾਰਕੀਟਪਲੇਸ',
  feedAndMeds: 'ਪਸ਼ੂ ਆਹਾਰ ਅਤੇ ਦਵਾਈਆਂ',
  searchPlaceholder: 'ਆਹਾਰ, ਦਵਾਈਆਂ, ਸਪਲੀਮੈਂਟ ਖੋਜੋ...',
  categoriesAllProducts: 'ਸਭ ਕੈਟੇਗਰੀਆਂ',
  categoriesFeed: 'ਆਹਾਰ',
  categoriesMedicine: 'ਦਵਾਈਆਂ',
  categoriesSupplements: 'ਸਪਲੀਮੈਂਟ',
  categoriesEquipment: 'ਉਪਕਰਣ',
  categoriesCare: 'ਪਸ਼ੂ ਦੇਖਭਾਲ',
  outOfStock: 'ਸਟਾਕ ਵਿੱਚ ਨਹੀਂ',
  addToCart: 'ਕਾਰਟ ਵਿੱਚ ਜੋੜੋ',
  addingToCart: 'ਜੋੜਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
  loginRequired: 'ਲਾਗਇਨ ਲੋੜੀਂਦਾ',
  loginToAddToCart: 'ਕਾਰਟ ਵਿੱਚ ਜੋੜਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਲਾਗਇਨ ਕਰੋ',
  addedToCart: 'ਕਾਰਟ ਵਿੱਚ ਜੋੜਿਆ ਗਿਆ',
  addedToCartMsg: '{product} ਤੁਹਾਡੇ ਕਾਰਟ ਵਿੱਚ ਜੋੜ ਦਿੱਤਾ ਗਿਆ ਹੈ।',
  continueShopping: 'ਖਰੀਦਾਰੀ ਜਾਰੀ ਰੱਖੋ',
  viewCart: 'ਕਾਰਟ ਵੇਖੋ',
  // Category names in Buy Animals
  categoryAll: 'ਸਭ',
  categoryCow: 'ਗਾਂ',
  categoryBuffalo: 'ਭੈੰਸ',
  categoryOther: 'ਹੋਰ',
  // Sell Animal (subset)
  place: 'ਸਥਾਨ',
  locationShownToBuyers: 'ਖਰੀਦਾਰਾਂ ਨੂੰ ਤੁਹਾਡਾ ਪਸ਼ੂ ਇਸ ਥਾਂ ਦਿਖੇਗਾ',
  change: 'ਬਦਲੋ',
  registerUpload: 'ਦਰਜ (upload) ਕਰੋ',
  freeUploadInfo: 'ਹਰ 30 ਦਿਨ ਵਿੱਚ 1 ਪਸ਼ੂ ਮੁਫ਼ਤ ਦਰਜ ਕਰ ਸਕੋਗੇ',
  needHelp: 'ਮਦਦ ਚਾਹੀਦੀ?',
  chatWithUs: 'ਸਾਡੇ ਨਾਲ ਗੱਲ ਕਰੋ',
  sellAnimalTitle: 'ਪਸ਼ੂ ਵੇਚੋ',
  myAnimals: 'ਮੇਰੇ ਪਸ਼ੂ',
  whichAnimal: 'ਕਿਹੜਾ ਪਸ਼ੂ',
  selectAnimal: 'ਪਸ਼ੂ ਚੁਣੋ',
  breedLabel: 'ਨਸਲ',
  selectBreed: 'ਨਸਲ ਚੁਣੋ',
  currentMilkPerDay: 'ਅੱਜ ਦਾ ਦੁੱਧ (ਪ੍ਰਤੀ ਦਿਨ)',
  todayTwoTimesMilk: 'ਅੱਜ ਦੇ 2 ਵਾਰ ਦਾ ਕੁੱਲ ਦੁੱਧ',
  litersUnit: 'ਲੀਟਰ',
  milkCapacityPerDay: 'ਦੁੱਧ ਸਮਰੱਥਾ (ਪ੍ਰਤੀ ਦਿਨ)',
  maxMilkEver: 'ਸਭ ਤੋਂ ਵੱਧ ਕਿੰਨਾ ਦੁੱਧ ਦਿੱਤਾ',
  continueBtn: 'ਜਾਰੀ ਰੱਖੋ',
  priceRate: 'ਰੇਟ (₹)',
  correctRateMoreCalls: 'ਸਹੀ ਰੇਟ ਪਾਓ, ਹੋਰ ਗਾਹਕ ਕਾਲਾਂ ਕਰਦੇ ਹਨ',
  rupees: 'ਰੁਪਏ',
  moreInfo: 'ਹੋਰ ਜਾਣਕਾਰੀ ਪਾਓ',
  negotiation: 'ਮੋਲ-ਭਾਅ',
  negotiationSubtitle: 'ਪਸ਼ੂ ਦੇ ਰੇਟ ’ਤੇ ਖਰੀਦਾਰ ਨਾਲ ਮੋਲ-ਭਾਅ',
  negotiationDesc: 'ਮੋਲ-ਭਾਅ ਨਾਲ ਹੋਰ ਗਾਹਕ ਕਾਲ ਕਰਦੇ ਹਨ',
  addPhotoAtLeastOne: 'ਫ਼ੋਟੋ ਪਾਓ (ਘੱਟ ਤੋਂ ਘੱਟ ਇਕ)',
  goodPhotosSellFaster: 'ਵਧੀਆ ਫ਼ੋਟੋ ਨਾਲ ਜਲਦੀ ਵਿਕਰੀ ਹੁੰਦੀ ਹੈ',
  videoSellFaster: 'ਵੀਡੀਓ ਪਾਓ, ਪਸ਼ੂ ਜਲਦੀ ਵਿਕਦਾ ਹੈ',
  selectVideo: 'ਵੀਡੀਓ ਚੁਣੋ',
  selectPhotoUdder: 'ਥਨ ਦੀ ਫ਼ੋਟੋ ਚੁਣੋ',
  selectPhotoSide: 'ਸਾਈਡ ਫ਼ੋਟੋ ਚੁਣੋ',
  selectPhoto: 'ਫ਼ੋਟੋ ਚੁਣੋ',
  allowPhotoPermission: 'ਫ਼ੋਟੋ ਪਾਉਣ ਲਈ ਇਜਾਜ਼ਤ ਦਿਓ',
};

const DICTS: Record<LanguageCode, Translations> = { 'en-hi': enHi, pa };

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en-hi');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('appLanguage');
        if (stored === 'en-hi' || stored === 'pa') {
          setLanguageState(stored);
        }
      } catch {}
    })();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('appLanguage', lang);
    } catch {}
  };

  const t = useMemo(() => {
    const dict = DICTS[language] || enHi;
    return (key: string) => dict[key] ?? key;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};


