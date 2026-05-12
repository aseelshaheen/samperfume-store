import React from 'react';

export default function ReturnsPolicy() {
  return (
    <div style={{
      maxWidth: '800px', 
      margin: '6rem auto', 
      padding: '0 2rem', 
      direction: 'rtl', 
      fontFamily: 'Tajawal, sans-serif',
      lineHeight: '1.8',
      color: '#333'
    }}>
      <style>{`
        .policy-header { text-align: center; margin-bottom: 4rem; }
        .policy-header h1 { font-family: 'Amiri', serif; font-size: 2.5rem; color: #452829; }
        .policy-header div { width: 50px; height: 2px; background: #9d8461; margin: 1rem auto; }
        
        .policy-section { margin-bottom: 2.5rem; }
        .policy-section h3 { color: #452829; font-size: 1.2rem; margin-bottom: 1rem; border-right: 3px solid #9d8461; padding-right: 15px; }
        .policy-section p { color: #666; font-size: 0.95rem; }
        
        .important-note { background: #fdfaf7; border: 1px solid #f0ebe5; padding: 1.5rem; border-radius: 4px; margin-top: 2rem; }
      `}</style>

      <div className="policy-header">
        <h1>سياسة الاستبدال والاسترجاع</h1>
        <div></div>
        <p>نحن في SamPerfume نهتم برضاكم التام عن مشترياتكم</p>
      </div>

      <div className="policy-section">
        <h3>1. الفترة الزمنية</h3>
        <p>يمكنكم تقديم طلب الاستبدال أو الاسترجاع خلال 3 أيام فقط من تاريخ استلام الطلب، بشرط أن يكون المنتج بحالته الأصلية.</p>
      </div>

      <div className="policy-section">
        <h3>2. شروط الاسترجاع</h3>
        <p> تماشياً مع طبيعة المنتجات (عطور)، يشترط أن يكون المنتج في تغليفه الأصلي (السلوفان) ولم يتم فتحه أو استخدامه نهائياً.</p>
      </div>

      <div className="policy-section">
        <h3>3. العطور المفتوحة</h3>
        <p>نعتذر عن استرجاع أو استبدال أي عطر تم نزع غلافه الأصلي أو رشه، إلا في حال وجود خلل مصنعي واضح  .</p>
      </div>

      <div className="policy-section">
        <h3>4. رسوم التوصيل</h3>
        <p>في حال كان الاسترجاع بسبب رغبة العميل (دون وجود عيب في المنتج)، يتحمل العميل رسوم التوصيل كاملة. أما في حال وصول منتج خاطئ أو تالف، نتحمل نحن كافة التكاليف.</p>
      </div>

      <div className="important-note">
        <strong>ملاحظة هامة:</strong> عينات العطور (Samples) والتقسيمات الصغيرة غير قابلة للاسترجاع أو الاستبدال نهائياً لضمان الجودة والسلامة الصحية.
      </div>
    </div>
  );
}