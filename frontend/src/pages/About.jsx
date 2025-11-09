const About = () => {
  return (
    <section className="relative overflow-hidden py-20">
      <div
        className="absolute inset-0 bg-[url('/assets/background-floral.png')] bg-no-repeat bg-left-top bg-contain opacity-0 pointer-events-none animate-floralFade"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-6">
        <section className="glass-card space-y-6 p-10 text-white">
          <h1 className="text-3xl font-bold">عن البيلسان أونلاين</h1>
          <p className="text-sm text-white/70">
            منذ انطلاقنا كعلامة رقمية في عام 2019 وضعنا هدفًا واضحًا: أن نكون الوجهة الموثوقة للمرأة التي تبحث عن لباس شرعي أنيق ومحتشم. وفي عام 2024 افتتحنا معرضنا الأرضي في إربد لنقدم تجربة تسوق أكثر قربًا وخصوصية بعيدًا عن صخب المعارض المختلطة.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">لماذا البيلسان؟</h2>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>• تصاميم حصرية لا تُباع في أي سوق آخر.</li>
                <li>• مشاغل خاصة لمراقبة الجودة والالتزام بالتفاصيل الشرعية.</li>
                <li>• موديلات داخلية تحافظ على الحياء وتبرز المظهر اللائق.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">الخدمات</h2>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>• توصيل لجميع محافظات الأردن وفلسطين وبعض محافظات سوريا.</li>
                <li>• إمكانية حجز القطعة لمدة يومين مع استلام مرن نهارًا أو ليلًا.</li>
                <li>• دعم مباشر عبر واتساب وفريق خدمة عملاء نسائي بالكامل.</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-white/70">
            نؤمن أن الاحتشام لا يعني التنازل عن أناقة التفاصيل، لذلك تأتي كل قطعة تحمل بصمة البيلسان المميزة وتُخاط بعناية لتعيش معك أكثر من موسم.
          </p>
        </section>
      </div>
    </section>
  );
};

export default About;
