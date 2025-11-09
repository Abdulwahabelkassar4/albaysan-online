import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ar: {
    translation: {
      brandName: "البيلسان أونلاين",
      tagline:
        "بدأنا عام 2019 أونلاين، وفي 2024 فتحنا متجرنا على أرض الواقع. تصاميمنا شرعية ومميزة من مشاغلنا الخاصة.",
      mission: "أن نكون سبباً في احتشام نساء المسلمين ونشر اللباس الشرعي وتحسين صورته",
      deliveryNote: "توصيل لكل محافظات الأردن وفلسطين وبعض محافظات سوريا",
      nav: {
        home: "الرئيسية",
        shop: "المتجر",
        collections: "المجموعات",
        about: "عن البيلسان",
        contact: "تواصل معنا",
        delivery: "خدمة التوصيل",
        reservation: "حجز القطع",
        admin: "لوحة التحكم",
      },
      heroCTA: "تسوقي الآن",
      heroSecondaryCTA: "احجزي موعداً",
      contact: {
        address: "الأردن – إربد – شارع الجامعة – مقابل كازية المناصير – المحل مخصص للنساء فقط",
        hours: "10 صباحاً – 8 مساءً",
        phone: "0798522935",
      },
      stats: {
        products: "المنتجات",
        orders: "طلبات التوصيل",
        reservations: "الحجوزات",
      },
      forms: {
        name: "الاسم الكامل",
        phone: "رقم الهاتف",
        address: "العنوان",
        item: "القطعة / تفاصيل الطلب",
        pickupDate: "اليوم المناسب للاستلام",
        submit: "إرسال",
        success: "تم استلام طلبك، سنقوم بالتواصل عبر واتساب للتأكيد",
      },
    },
  },
  en: {
    translation: {
      home_brandName: "Albaysan Online",
      home_tagline:
        "We began our journey online in 2019, and in 2024 we proudly opened our physical boutique. Every design reflects modesty, elegance, and craftsmanship — created with care in our own workshops.",
      home_primaryCTA: "Shop Now",
      home_secondaryCTA: "Book Your Visit",
      home_deliveryNote: "We offer delivery across Jordan, Palestine, and select cities in Syria.",
      shop_title: "The Boutique",
      shop_intro:
        "Explore exclusive Albaysan designs crafted with devotion and attention to detail. Enjoy the option to reserve your order and receive it within two days.",
      shop_filters_heading: "Categories",
      shop_filters_all: "All Categories",
      shop_filters_collections: "All Collections",
      search_placeholder: "Search for a design...",
      collections_title: "Our Collections",
      collections_description: "Browse our seasonal collections designed for every elegant and modest look.",
      summer_collection: "Summer Collection",
      autumn_collection: "Autumn Collection",
      winter_collection: "Winter Collection",
      spring_collection: "Spring Collection",
      about_title: "About Albaysan Online",
      about_intro:
        "Since our digital launch in 2019, we have aimed to be the trusted destination for women seeking elegant and modest wear. In 2024, we expanded by opening our physical boutique in Irbid to offer a more personal shopping experience.",
      why_albaysan_title: "Why Albaysan?",
      why_albaysan_text:
        "Exclusive designs you won’t find elsewhere. Our in-house workshops ensure quality and compliance with modest standards. Every piece reflects a refined interior vision — graceful, dignified, and timeless.",
      services_title: "Our Services",
      services_text:
        "Delivery to all cities across Jordan, Palestine, and select Syrian regions. Flexible reservation system with pickup within two days. Direct WhatsApp support and an all-female customer service team.",
      philosophy_note:
        "We believe that modesty and elegance go hand in hand — every Albaysan piece is designed to celebrate your confidence with grace.",
      contact_title: "Contact Us",
      contact_mission:
        "To support women in embracing modest fashion, spread authentic designs, and promote the beauty of dignified attire.",
      contact_address:
        "Jordan – Irbid – University Street – Opposite Manaseer Gas Station – Women-Only Boutique",
      contact_hours: "Open daily from 10:00 AM to 8:00 PM",
      contact_phone: "+962 798 522 935",
      contact_button_facebook: "Facebook",
      contact_button_instagram: "Instagram",
      delivery_title: "Delivery",
      delivery_note: "We provide delivery services across Jordan, Palestine, and select cities in Syria.",
      delivery_form_name: "Full Name",
      delivery_form_phone: "Phone Number",
      delivery_form_address: "Address",
      delivery_form_submit: "Submit Request",
      delivery_form_success:
        "Your order request has been received. We’ll confirm it with you shortly via WhatsApp.",
      reservation_title: "Reservation",
      reservation_form_name: "Full Name",
      reservation_form_phone: "Phone Number",
      reservation_form_pickupDate: "Preferred Pickup Date",
      reservation_form_submit: "Submit Reservation",
      reservation_form_success:
        "Your reservation has been received. We’ll confirm it shortly via WhatsApp.",
      brandName: "Albaylsan Online",
      tagline:
        "We launched online in 2019, and in 2024 we opened our physical boutique. Our designs are modest, unique, and crafted in our own workshops.",
      mission:
        "To support Muslim women in dressing modestly, spread authentic attire, and elevate its image.",
      deliveryNote: "Delivery available across Jordan, Palestine, and select cities in Syria.",
      nav: {
        home: "Home",
        shop: "Shop",
        collections: "Collections",
        about: "About",
        contact: "Contact",
        delivery: "Delivery",
        reservation: "Reservation",
        admin: "Admin",
      },
      heroCTA: "Shop Now",
      heroSecondaryCTA: "Book a Visit",
      contact: {
        address: "Jordan – Irbid – University Street – Opposite Manaseer Gas Station – Women-only boutique",
        hours: "10 AM – 8 PM",
        phone: "+962 798 522 935",
      },
      stats: {
        products: "Products",
        orders: "Delivery Orders",
        reservations: "Reservations",
      },
      forms: {
        name: "Full Name",
        phone: "Phone Number",
        address: "Address",
        item: "Item / Order details",
        pickupDate: "Preferred pickup date",
        submit: "Submit",
        success: "Your request has been received. We will confirm via WhatsApp shortly.",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ar",
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

