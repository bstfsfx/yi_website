import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="container footer-inner" style={{ display: 'flex', justifyContent: 'space-between', gap: 20, fontSize: 13 }}>
        <div>⌂ 天台邑旅店　TIANTAIYI HOTEL</div>
        <div>
          <Link href="/sales">住宿方案</Link>　<Link href="/sales#faq">常見問題</Link>　
          <Link href="/sales#contact">聯絡我們</Link>　<Link href="/booking">線上訂房</Link>
        </div>
      </div>
    </footer>
  );
}