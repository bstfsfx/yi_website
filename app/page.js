import Link from 'next/link';
import Carousel from '@/components/Carousel';
import Reveal from '@/components/Reveal';

export default function HomePage() {
  return (
    <main>
      <section
        className="hero"
        style={{
          background:
            'linear-gradient(90deg,rgba(255,253,248,.98) 0%,rgba(255,253,248,.86) 40%,rgba(255,253,248,.10) 68%),url("/media/p2.jpeg") center 45%/cover',
        }}
      >
        <div className="container hero-copy">
          <div className="kicker">天台邑旅店．小琉球住宿</div>
          <h1>
            在小琉球，
            <br />
            找一個剛剛好的落腳處
          </h1>
          <p>位在南福村的旅途據點，步行即可抵達落日亭、厚石群礁與烏鬼洞；屋頂能遠眺海景與夕陽，烤肉與海鮮小吃都在附近。</p>
          <div className="ctas">
            <Link className="btn primary" href="/#cta">
              聯絡我們 →
            </Link>
          </div>
        </div>
      </section>

      <section className="carousel-section">
        <div className="container">
          <Carousel />
        </div>
      </section>

      <div className="container highlights">
        <div>
          <span className="icon" style={{ margin: '0 auto 6px' }}>
            ⌖
          </span>
          <b>步行可達海景景點</b>
          <small>落日亭 300m・烏鬼洞 500m</small>
        </div>
        <div>
          <span className="icon" style={{ margin: '0 auto 6px' }}>
            ☀
          </span>
          <b>屋頂海景與夕陽</b>
          <small>不用排行程也能放鬆</small>
        </div>
        <div>
          <span className="icon" style={{ margin: '0 auto 6px' }}>
            ☷
          </span>
          <b>團體包楝</b>
        </div>
      </div>

      <section id="group" className="group-section">
        <div className="container">
          <span className="kicker">包棟住宿・主力推薦</span>
          <h2 className="section-title">整棟包下，與親友獨享整座天台邑</h2>
          <p className="section-lead">適合家庭聚會、朋友出遊與公司團體。專屬空間不受打擾，人數彈性，歡迎包棟洽詢。</p>
          <div className="group-grid">
            <Reveal as="article" className="card group-card" delay={0}>
              <h3>組合 A</h3>
              <p className="group-rooms">4人房 × 2間　＋　2人房 × 2間</p>
              <p className="group-calc">基本 8 + 4 = <b>12 人</b></p>
              <small>兩間 2 人房各可再加 1 名 120 公分以下兒童，最多 <b>14 人</b></small>
            </Reveal>
            <Reveal as="article" className="card group-card" delay={240}>
              <h3>組合 B</h3>
              <p className="group-rooms">4人房 × 2間　＋　2人房 × 3間</p>
              <p className="group-calc">基本 8 + 6 = <b>14 人</b></p>
              <small>其中兩間 2 人房各可再加 1 名 120 公分以下兒童，最多 <b>16 人</b></small>
            </Reveal>
          </div>
          <div className="ctas">
            <a className="btn primary" href="/#cta">
              洽詢包棟 →
            </a>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="container intro">
          <div>
            <h2 className="section-title">一下船，靠近海岸的住宿開始</h2>
            <p className="section-lead">天台邑旅店位在小琉球南福村，方便抵達南部海岸的熱門景點，也歡迎包棟洽詢。出發前，先透過我們的住宿資訊了解房型與入住方式。</p>
            <ul className="intro-list">
              <Reveal as="li" delay={0}>步行 300 公尺抵達 落日亭</Reveal>
              <Reveal as="li" delay={240}>步行 400 公尺抵達 厚石群礁</Reveal>
              <Reveal as="li" delay={480}>步行 500 公尺抵達 烏鬼洞</Reveal>
              <Reveal as="li" delay={720}>步行 600 公尺抵達 神秘沙灘</Reveal>
              <Reveal as="li" delay={960}>屋頂可遠眺海景、夕陽與星空</Reveal>
            </ul>
            <div className="ctas">
              <Link className="btn primary" href="/#cta">
                聯絡我們 →
              </Link>
            </div>
          </div>
          <div>
            <img src="/media/61297c99-145c-4d42-a07c-b133ad182a95.jpeg" alt="天台邑旅店" style={{ borderRadius: 18, boxShadow: 'var(--shadow)' }} className="w-full" />
          </div>
        </div>
      </section>

      <section id="photos" className="photos">
        <div className="container">
          <h2 className="section-title">房間實況及附近風景</h2>
          <p className="section-lead">從房間到公共空間的真實照片，讓你在訂房前更能想像這趟旅程。</p>
          <div className="photo-grid">
            <div className="cell wide">
              <img src="/media/8272af6c-c04e-44e0-ad7c-49127f141208.jpeg" alt="天台邑旅店實景" />
            </div>
            <div className="cell">
              <img src="/media/6bac4e8c-891d-4756-b3d0-65865bbccfda.jpeg" alt="天台邑旅店實景" />
            </div>
            <div className="cell">
              <img src="/media/15c285cf-ae5d-45c2-8633-c590ec45bf95.jpeg" alt="天台邑旅店實景" />
            </div>
            <div className="cell">
              <img src="/media/c37edb47-8823-4a49-a6d9-e6f709366fd2.jpeg" alt="天台邑旅店實景" />
            </div>
            <div className="cell">
              <img src="/media/p2.jpeg" alt="天台邑旅店實景" />
            </div>
            <div className="cell wide">
              <img src="/media/f6f4f89d-b8a3-4e68-a4c2-87920ee3faa7.jpeg" alt="天台邑旅店實景" />
            </div>
            <div className="cell">
              <img src="/media/a45d258f-027f-41dc-b654-ff55117a0d44.jpeg" alt="天台邑旅店實景" />
            </div>
          </div>
        </div>
      </section>

      <section id="tour" className="tour-section">
        <div className="container">
          <h2 className="section-title">旅店實景影片</h2>
          <p className="section-lead">實際走一趟天台邑，感受房間與公共空間的氛圍。</p>
          <div className="video-wrap">
            <video controls preload="metadata" poster="/media/p2.jpeg">
              <source src="/media/hotel-tour.mp4" type="video/mp4" />
              你的瀏覽器不支援影片播放。
            </video>
          </div>
        </div>
      </section>

      <section id="features">
        <div className="container">
          <h2 className="section-title">為什麼選擇天台邑</h2>
          <div className="features">
            <article className="card">
              <span className="icon">⌖</span>
              <h3>位置方便</h3>
              <p>步行即可通往落日亭、厚石群礁、烏鬼洞等著名景點，玩水與淺灘就在附近。</p>
            </article>
            <article className="card">
              <span className="icon">☀</span>
              <h3>屬於天空的風景</h3>
              <p>屋頂可遠眺海景與落日夕陽，距離烤肉、沙灘BAR與海鮮熱炒店都不遠。</p>
            </article>
            <article className="card">
              <span className="icon">☷</span>
              <h3>歡迎</h3>
              <p>中長期停留及包棟洽詢。</p>
            </article>
          </div>
        </div>
      </section>

      <section id="cta" className="final">
        <div className="container final-box">
          <div>
            <h2 className="section-title">請聯絡我們規劃你的小琉球旅程</h2>
            <p>
              <span style={{ marginRight: 10 }}>聯絡我們</span>
              <a className="btn light" href="tel:0938591059">電話</a>　
              <a className="btn light" href="mailto:mav50852001@yahoo.com.tw">E-mail</a>
            </p>
            <p className="qr-label">掃描 QR Code 加入即時通訊</p>
            <div className="qr-row">
              <div>
                <a href="https://line.me/ti/p/8NIfEmPHlH" target="_blank" rel="noopener">
                  <img src="/media/line_qr.png" alt="LINE QR Code" />
                  <small>LINE</small>
                </a>
              </div>
              <div>
                <a href="https://www.facebook.com/share/1BYwW3x1rC/" target="_blank" rel="noopener">
                  <img src="/media/facebook_qr.png" alt="Facebook QR Code" />
                  <small>Facebook</small>
                </a>
              </div>
              <div>
                <img src="/media/wechat_qr.png" alt="WeChat QR Code" />
                <small>微信</small>
              </div>
              <div>
                <a href="https://wa.me/qr/GE36BFLXMFQOM1" target="_blank" rel="noopener">
                  <img src="/media/whatsapp_qr.png" alt="WhatsApp QR Code" />
                  <small>WhatsApp</small>
                </a>
              </div>
            </div>
          </div>
          <div className="card" style={{ color: 'var(--ink)' }}>
            <b>準備好出發了嗎？</b>
            <p>
              使用通訊軟件 與我們聯絡
              <br />
              即時了解房間、價格與預訂狀態。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}