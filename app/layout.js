import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '天台邑旅店｜小琉球住宿．海景與夕陽的鄰居',
  description:
    '天台邑旅店位在小琉球南福村，步行可達落日亭、厚石群礁與烏鬼洞。短期旅遊、商務出差、遠距工作或中長期停留皆可，也歡迎包棟洽詢。',
  openGraph: {
    title: '天台邑旅店｜小琉球住宿',
    description: '小琉球南福村的旅途據點，步行即可抵達落日亭、厚石群礁與烏鬼洞。',
    images: ['/media/p2.jpeg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}