"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Language = 'en' | 'si';

interface Translations {
  [key: string]: {
    en: string;
    si: string;
  };
}

export const translations: Translations = {
  "Dashboard": { en: "Dashboard", si: "මුල් පිටුව" },
  "Livestock": { en: "Livestock", si: "සතුන්" },
  "Add Animal": { en: "Add Animal", si: "සතෙකු එක් කරන්න" },
  "Log Vitals": { en: "Log Vitals", si: "සෞඛ්‍ය දත්ත" },
  "Analytics": { en: "Analytics", si: "විශ්ලේෂණ" },
  "Settings": { en: "Settings", si: "සැකසුම්" },
  "Records": { en: "Records", si: "වාර්තා" },
  "Register Animal": { en: "Register Animal", si: "සතෙකු ලියාපදිංචි කරන්න" },
  "dashboardTitle": { en: "Dashboard Overview", si: "ප්රධාන පුවරුව" },
  "dashboardSubtitle": { en: "Real-time herd status and production metrics.", si: "තත්ය කාලීන සත්ව තත්ත්වය සහ නිෂ්පාදන දත්ත." },
  "activeHerd": { en: "Active Herd", si: "ක්රියාකාරී සතුන්" },
  "totalRegistered": { en: "Total registered entities", si: "ලියාපදිංචි කළ මුළු සතුන් ගණන" },
  "dailyYield": { en: "Daily Yield (Liters/Kg)", si: "දෛනික අස්වැන්න (ලීටර්/කි.ග්රෑ)" },
  "liveCalc": { en: "Live local calculation", si: "සජීවී දේශීය ගණනය කිරීමකි" },
  "systemHealth": { en: "System Health", si: "පද්ධතියේ තත්ත්වය" },
  "pendingSync": { en: "Records pending sync", si: "සමමුහුර්ත කිරීමට ඇති දත්ත" },
  "activeAlerts": { en: "Active Alerts", si: "ක්රියාකාරී දැනුම්දීම්" },
  "immediateAttention": { en: "Units requiring immediate attention", si: "ක්ෂණික අවධානය අවශ්ය සතුන්" },
  "livestockTitle": { en: "Livestock Registry", si: "සත්ව ලියාපදිංචිය" },
  "livestockSubtitle": { en: "Manage and monitor your herd. Search by tag, species, or breed.", si: "ඔබේ සතුන් කළමනාකරණය සහ අධීක්ෂණය කරන්න." },
  "searchPlaceholder": { en: "Search by Tag ID, Species, or Breed...", si: "ටැග් අංකය හෝ වර්ගය අනුව සොයන්න..." },
  "tagId": { en: "TAG ID", si: "ටැග් අංකය" },
  "speciesLabel": { en: "Species", si: "වර්ගය" },
  "breedLabel": { en: "Breed", si: "අභිජනනය" },
  "dob": { en: "Date of Birth", si: "උපන් දිනය" },
  "herdStatus": { en: "Herd Status", si: "තත්ත්වය" },
  "synced": { en: "Synced", si: "සමමුහුර්තයි" },
  "pendingSyncStatus": { en: "Pending Sync", si: "සමමුහුර්ත වෙමින්" },
  "registerAnimalTitle": { en: "Register Animal", si: "සතෙකු ලියාපදිංචි කරන්න" },
  "registerAnimalSubtitle": { en: "Enter details to add a new entity to the active herd.", si: "නව සතෙකු එක් කිරීමට විස්තර ඇතුළත් කරන්න." },
  "identificationDetails": { en: "Identification & Details", si: "හඳුනාගැනීම සහ විස්තර" },
  "selectSpecies": { en: "Select Species", si: "වර්ගය තෝරන්න" },
  "animalPhoto": { en: "Animal Photo", si: "සතාගේ ඡායාරූපය" },
  "compressingPhoto": { en: "Compressing photo...", si: "ඡායාරූපය සම්පීඩනය වෙමින්..." },
  "photoReady": { en: "Photo compressed & ready", si: "ඡායාරූපය සූදානම්" },
  "clickToChange": { en: "Click to change photo", si: "වෙනස් කිරීමට ක්ලික් කරන්න" },
  "tapToUpload": { en: "Tap here to take or upload a photo", si: "ඡායාරූපයක් ගැනීමට හෝ උඩුගත කිරීමට මෙහි තට්ටු කරන්න" },
  "autoCompressed": { en: "Automatically compressed to JPG (under 1MB)", si: "ස්වයංක්‍රීයව JPG බවට සම්පීඩනය වේ (1MB ට අඩු)" },
  "cancel": { en: "Cancel", si: "අවලංගු කරන්න" },
  "saving": { en: "Saving...", si: "සුරකිමින්..." },
  "newLogEntry": { en: "New Log Entry", si: "නව දත්ත ඇතුළත් කිරීම" },
  "logVitalsDesc": { en: "Record daily health and production metrics.", si: "දෛනික සෞඛ්‍ය සහ නිෂ්පාදන දත්ත වාර්තා කරන්න." },
  "entityIdLabel": { en: "Entity ID / Tag Number", si: "ටැග් අංකය" },
  "selectAnimal": { en: "Select an Animal", si: "සතෙකු තෝරන්න" },
  "bodyTemp": { en: "Body Temperature (°C)", si: "ශරීර උෂ්ණත්වය (°C)" },
  "feedIntake": { en: "Feed Intake (kg)", si: "ආහාර පරිභෝජනය (kg)" },
  "behavioralObs": { en: "Behavioral Observations", si: "හැසිරීම් නිරීක්ෂණ" },
  "obsPlaceholder": { en: "Note any lethargy, abnormal gait, or off-feed behavior...", si: "කිසියම් අසාමාන්‍ය හැසිරීමක් මෙහි සටහන් කරන්න..." },
  "submitLog": { en: "Submit Log", si: "දත්ත ඇතුළත් කරන්න" },
  "logging": { en: "Logging...", si: "ඇතුළත් කරමින්..." },
  "recentEntries": { en: "Recent Entries", si: "මෑත කාලීන දත්ත" },
  "noVitals": { en: "No vitals logged yet.", si: "තවමත් දත්ත ඇතුළත් කර නොමැත." },
  "logDailyVitals": { en: "Log Daily Vitals & Yield", si: "දෛනික සෞඛ්‍ය සහ අස්වැන්න වාර්තා කරන්න" },
  "animalTagEntity": { en: "Animal Tag / Entity", si: "සතාගේ ටැග් අංකය" },
  "tempOptional": { en: "Temperature (°C) - Optional", si: "උෂ්ණත්වය (°C) - විකල්ප" },
  "weightOptional": { en: "Weight (kg) - Optional", si: "බර (kg) - විකල්ප" },
  "feedOptional": { en: "Feed Intake (kg) - Optional", si: "ආහාර පරිභෝජනය (kg) - විකල්ප" },
  "yieldOptional": { en: "Yield Amount (Liters/Kg) - Optional", si: "අස්වැන්න (ලීටර්/කි.ග්‍රෑ) - විකල්ප" },
  "saveVitals": { en: "Save Vitals", si: "දත්ත සුරකින්න" },
  "highFeverWarning": { en: "⚠️ High Fever Detected - Monitor animal closely.", si: "⚠️ අධික උණ - සතා පිළිබඳව දැඩි අවධානයෙන් සිටින්න." },
  "analyticsTitle": { en: "Herd Analytics", si: "රංචු විශ්ලේෂණ" },
  "analyticsSubtitle": { en: "Real-time local insights", si: "තත්‍ය කාලීන දේශීය තොරතුරු" },
  "weeklyPerformance": { en: "Weekly Performance", si: "සතිපතා ක්‍රියාකාරිත්වය" },
  "totalYield7Days": { en: "Total Yield (7 Days)", si: "මුළු අස්වැන්න (දින 7)" },
  "totalFeedConsumed": { en: "Total Feed Consumed", si: "පරිභෝජනය කළ මුළු ආහාර" },
  "activeMonitoredHerd": { en: "Active Monitored Herd", si: "අධීක්ෂණය කරන ක්‍රියාකාරී සතුන්" },
  "head": { en: "Head", si: "සතුන්" },
  "settingsTitle": { en: "Profile & Settings", si: "පැතිකඩ සහ සැකසුම්" },
  "settingsSubtitle": { en: "Manage account preferences and offline synchronization.", si: "ගිණුමේ සැකසුම් සහ නොබැඳි සමමුහුර්තකරණය කළමනාකරණය කරන්න." },
  "syncStatusQueue": { en: "Sync Status & Queue", si: "සමමුහුර්ත තත්ත්වය සහ පෝලිම" },
  "syncDesc": { en: "Monitor network connectivity and manage cached actions.", si: "ජාල සම්බන්ධතාවය නිරීක්ෂණය කර හැඹිලි කළ ක්‍රියා කළමනාකරණය කරන්න." },
  "offlineModeActive": { en: "Offline Mode Active", si: "නොබැඳි මාදිලිය සක්‍රීයයි" },
  "dataCached": { en: "Data is safely cached locally.", si: "දත්ත ආරක්ෂිතව දේශීයව හැඹිලි කර ඇත." },
  "forceSync": { en: "Force Sync", si: "බලහත්කාරයෙන් සමමුහුර්ත කරන්න" },
  "pendingCachedActions": { en: "Pending Cached Actions", si: "පොරොත්තු හැඹිලි ක්‍රියා" },
  "accountDetails": { en: "Account Details", si: "ගිණුමේ විස්තර" },
  "operatorName": { en: "Operator Name", si: "ක්‍රියාකරුගේ නම" },
  "clearanceLevel": { en: "Clearance Level", si: "අවසර මට්ටම" },
  "terminalId": { en: "Terminal ID", si: "ටර්මිනල් අංකය" },
  "copy": { en: "Copy", si: "පිටපත් කරන්න" },
  "systemThresholds": { en: "System Thresholds", si: "පද්ධති සීමාවන්" },
  "forceOfflineMode": { en: "Force Offline Mode", si: "නොබැඳි මාදිලිය බල කරන්න" },
  "forceOfflineDesc": { en: "Store data locally even when connection is restored.", si: "සම්බන්ධතාවය යථා තත්ත්වයට පත් වුවද දත්ත දේශීයව ගබඩා කරන්න." },
  "criticalAlertsOnly": { en: "Critical Alerts Only", si: "අත්‍යවශ්‍ය දැනුම්දීම් පමණි" },
  "criticalAlertsDesc": { en: "Mute non-essential notifications in the field.", si: "ක්ෂේත්‍රයේදී අත්‍යවශ්‍ය නොවන දැනුම්දීම් නිහඬ කරන්න." },
  "Health Tracker": { en: "Health Tracker", si: "සෞඛ්‍ය ලුහුඬ" },
  "healthTrackerTitle": { en: "Vaccination & Deworming Tracker", si: "එන්නත් සහ පණු නාශ ලුහුඬ" },
  "healthTrackerSubtitle": { en: "Monitor treatment schedules and overdue alerts for your herd.", si: "ඔබේ රංචුවේ ප්‍රතිකාර කාලසටහන් සහ දැනුම්දීම් නිරීක්ෂණය කරන්න." },
  "logTreatment": { en: "Log Treatment", si: "ප්‍රතිකාරය සටහන් කරන්න" },
  "actionRequired": { en: "Action Required", si: "ක්‍රියාමාර්ගය අවශ්‍යයි" },
  "overdueAlerts": { en: "Overdue & Alerts", si: "කල් ඉකුත් වූ සහ අනතුරු ඇඟවීම්" },
  "upcomingSchedule": { en: "Upcoming Schedule", si: "ඉදිරි කාලසටහන" },
  "noOverdue": { en: "No overdue treatments. Herd is on schedule.", si: "කල් ඉකුත් වූ ප්‍රතිකාර නොමැත. රංචුව කාලසටහනෙහි ඇත." },
  "noUpcoming": { en: "No upcoming treatments scheduled.", si: "ඉදිරියේ ප්‍රතිකාර කාලසටහනගත කර නොමැත." },
  "dueDate": { en: "Due", si: "දිනය" },
  "animalId": { en: "Animal ID", si: "සතාගේ අංකය" },
  "treatmentType": { en: "Type", si: "වර්ගය" },
  "vaccine": { en: "Vaccine", si: "එන්නත" },
  "deworming": { en: "Deworming", si: "පණු නාශ" },
  "statusOverdue": { en: "Overdue", si: "කල් ඉකුත්" },
  "statusPending": { en: "Pending", si: "පොරොත්තු" },
  "statusCompleted": { en: "Completed", si: "සම්පූර්ණ" },

  // ── Expenses Module ──────────────────────────────────────────────
  "Expenses": { en: "Expenses", si: "වියදම්" },
  "expensesTitle": { en: "Expenses & Income", si: "වියදම් සහ ආදායම" },
  "expensesSubtitle": { en: "Expense and income management", si: "වියදම් සහ ආදායම් කළමනාකරණය" },
  "addIncome": { en: "Add Income", si: "ආදායම එකතු කරන්න" },
  "addExpense": { en: "Add Expense", si: "වියදම එකතු කරන්න" },
  "totalExpenses": { en: "Total Expenses", si: "මුළු වියදම" },
  "totalIncome": { en: "Total Income", si: "මුළු ආදායම" },
  "netBalance": { en: "Net Balance", si: "ශේෂය" },
  "recentExpenses": { en: "Recent Expenses", si: "මෑත කාලීන වියදම්" },
  "viewAll": { en: "View All →", si: "සියල්ල බලන්න →" },
  "financialAlerts": { en: "Financial Alerts", si: "මූල්‍ය අනතුරු ඇඟවීම්" },
  "noAlerts": { en: "No pending alerts. You are on track!", si: "අනතුරු ඇඟවීම් නොමැත. ඔබ හරි මාර්ගයේ!" },
  "budgetExceeded": { en: "Budget Exceeded", si: "අයවැය ඉක්මවා ඇත" },
  "nearBudgetLimit": { en: "Near Budget Limit", si: "අයවැය සීමාවට ළංව ඇත" },
  "unpaidInvoices": { en: "Unpaid Invoices", si: "නොගෙවූ ඉන්වොයිස්" },
  "upcomingExpenses": { en: "Upcoming Expenses", si: "ඉදිරි වියදම්" },
  "nextMonthForecast": { en: "Next Month Forecast", si: "ඊළඟ මාසය සඳහා අනාවැකිය" },
  "projectedIncome": { en: "Projected Income", si: "අනාවැකි ආදායම" },
  "projectedExpenses": { en: "Projected Expenses", si: "අනාවැකි වියදම්" },
  "estimatedProfit": { en: "Estimated Profit", si: "ඇස්තමේන්තු ලාභය" },
  "noForecastData": { en: "Not enough historical data to generate a forecast.", si: "අනාවැකියක් ජනනය කිරීමට ප්‍රමාණවත් දත්ත නොමැත." },
  "costPerLitre": { en: "Cost Per Litre (This Month)", si: "ලීටරයකට පිරිවැය (මෙම මාසය)" },
  "noMilkProduction": { en: "No milk production recorded this month.", si: "මෙම මාසයේ කිරි නිෂ්පාදනයක් සටහන් නැත." },
  "vsLastMonth": { en: "vs last month", si: "පසුගිය මාසයට සාපේක්ෂව" },
  "noChange": { en: "No change vs last month", si: "පසුගිය මාසයට වෙනසක් නැත" },
  "highestCostAnimals": { en: "Highest Cost Animals", si: "වැඩිම වියදම් සහිත සතුන්" },
  "noAnimalExpenses": { en: "No expenses tagged to specific animals yet.", si: "තවම කිසිදු සතෙකුට සම්බන්ධ වියදම් නොමැත." },
  "quickLinks": { en: "Quick Links", si: "ඉක්මන් සබැඳි" },
  "financialReports": { en: "Financial Reports", si: "මූල්‍ය වාර්තා" },
  "budgetTracker": { en: "Budget Tracker", si: "අයවැය කළමනාකරණය" },
  "suppliersVendors": { en: "Suppliers & Vendors", si: "සැපයුම්කරුවන්" },
  "recurringExpenses": { en: "Recurring Expenses", si: "පුනරාවර්තන වියදම්" },
  "formAmount": { en: "Amount * Rs.", si: "මුදල * Rs." },
  "formExpenseTitle": { en: "Expense Title *", si: "විස්තරය *" },
  "formCategory": { en: "Category *", si: "වර්ගය *" },
  "formDate": { en: "Date", si: "දිනය" },
  "formPaymentMethod": { en: "Payment Method", si: "ගෙවූ ආකාරය" },
  "formPaymentStatus": { en: "Payment Status", si: "ගෙවීම් තත්ත්වය" },
  "formSupplier": { en: "Supplier", si: "සැපයුම්කරු" },
  "formInvoiceNumber": { en: "Invoice Number", si: "බිල්පත් අංකය" },
  "formNotes": { en: "Notes", si: "සටහන්" },
  "formIncomeSource": { en: "Income Source *", si: "ආදායම් මාර්ගය *" },
  "tableDate": { en: "Date", si: "දිනය" },
  "tableCategory": { en: "Category", si: "වර්ගය" },
  "tableDescription": { en: "Description", si: "විස්තරය" },
  "tableSource": { en: "Source", si: "මාර්ගය" },
  "tableNotes": { en: "Notes", si: "සටහන්" },
  "tableAmount": { en: "Amount", si: "මුදල" },
  "tableActions": { en: "Actions", si: "ක්‍රියා" },
  "tableStatus": { en: "Status & Method", si: "තත්ත්වය" },
  "chartIncomeVsExpenses": { en: "Income vs Expenses", si: "ආදායම් සහ වියදම්" },
  "chartIncome": { en: "Income", si: "ආදායම" },
  "chartExpenses": { en: "Expenses", si: "වියදම" },
  "payCash": { en: "Cash", si: "මුදල්" },
  "payBank": { en: "Bank Transfer", si: "බැංකු" },
  "payCard": { en: "Card", si: "කාඩ්පත්" },
  "payCredit": { en: "Credit", si: "ණයට" },
  "statusPendingPay": { en: "Pending", si: "ගෙවිය යුතු" },
  "livestockCattle": { en: "Cattle", si: "ගව" },
  "livestockChicken": { en: "Chicken", si: "කුකුළු" },
  "livestockPig": { en: "Pig", si: "ඌරු" }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('agriherd_language') as Language;
    if (storedLang && (storedLang === 'en' || storedLang === 'si')) {
      setLanguage(storedLang);
      document.documentElement.lang = storedLang;
    } else {
      document.documentElement.lang = 'en';
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const newLang = prev === 'en' ? 'si' : 'en';
      localStorage.setItem('agriherd_language', newLang);
      document.documentElement.lang = newLang;
      return newLang;
    });
  }, []);

  const t = useCallback((key: string) => {
    if (!translations[key]) return key;
    return translations[key][language] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
