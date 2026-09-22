import Carousel from '@/components/Carousel';

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
            <a className="btn primary" href="/#cta">
              聯絡我們 →
            </a>
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
          <b>多種住宿需求</b>
          <small>旅遊・商務・長住・包棟</small>
        </div>
      </div>

      <section id="about">
        <div className="container intro">
          <div>
            <h2 className="section-title">一下船，靠近海岸的住宿開始</h2>
            <p className="section-lead">天台邑旅店位在小琉球南福村，方便抵達南部海岸的熱門景點，也歡迎包棟洽詢。出發前，先透過我們的住宿資訊了解房型與入住方式。</p>
            <ul className="intro-list">
              <li>步行 300 公尺抵達 落日亭</li>
              <li>步行 400 公尺抵達 厚石群礁</li>
              <li>步行 500 公尺抵達 烏鬼洞</li>
              <li>步行 600 公尺抵達 神秘沙灘</li>
              <li>屋頂可遠眺海景、夕陽與星空</li>
            </ul>
            <div className="ctas">
              <a className="btn primary" href="/#cta">
                聯絡我們 →
              </a>
            </div>
          </div>
          <div>
            <img src="/media/61297c99-145c-4d42-a07c-b133ad182a95.jpeg" alt="天台邑旅店" style={{ borderRadius: 18, boxShadow: 'var(--shadow)' }} className="w-full" />
          </div>
        </div>
      </section>

      <section id="photos" className="photos">
        <div className="container">
          <h2 className="section-title">實際入住的風景</h2>
          <p className="section-lead">從房間到公共空間的真實照片，讓你在訂房前更能想像這趟旅程。</p>
          <div className="photo-grid">
            <img className="wide" src="/media/8272af6c-c04e-44e0-ad7c-49127f141208.jpeg" alt="天台邑旅店實景" />
            <img src="/media/6bac4e8c-891d-4756-b3d0-65865bbccfda.jpeg" alt="天台邑旅店實景" />
            <img src="/media/15c285cf-ae5d-45c2-8633-c590ec45bf95.jpeg" alt="天台邑旅店實景" />
            <img src="/media/c37edb47-8823-4a49-a6d9-e6f709366fd2.jpeg" alt="天台邑旅店實景" />
            <img src="/media/p2.jpeg" alt="天台邑旅店實景" />
            <img className="wide" src="/media/f6f4f89d-b8a3-4e68-a4c2-87920ee3faa7.jpeg" alt="天台邑旅店實景" />
            <img src="/media/a45d258f-027f-41dc-b654-ff55117a0d44.jpeg" alt="天台邑旅店實景" />
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
              <h3>彈性的住宿選擇</h3>
              <p>短期旅遊、商務出差、遠距工作或中長期停留皆可，也歡迎包棟洽詢。</p>
            </article>
          </div>
          <div className="ctas">
            <a className="btn primary" href="/#cta">
              聯絡我們 →
            </a>
          </div>
        </div>
      </section>

      <section id="cta" className="final">
        <div className="container final-box">
          <div>
            <h2 className="section-title">諳聯絡我們規劃你的小琉球旅程</h2>
            <p>Tel: 0938591059 E-mail: mav50852001@yahoo.com.tw</p>
            <p className="qr-label">掃描 QR Code 加入即時通訊</p>
            <div className="qr-row">
              <div>
                <img src="/media/whatsapp_qr.png" alt="WhatsApp QR Code" />
                <small>WhatsApp</small>
              </div>
              <div>
                <img src="/media/line_qr.png" alt="LINE QR Code" />
                <small>LINE</small>
              </div>
              <div>
                <img src="/media/wechat_qr.png" alt="WeChat QR Code" />
                <small>微信</small>
              </div>
              <div>
                <img src="/media/facebook_qr.png" alt="Facebook QR Code" />
                <small>Facebook</small>
              </div>
            </div>
          </div>
          <div className="card" style={{ color: 'var(--ink)' }}>
            <b>準備好出發了嗎？</b>
            <p>
              直接聯繫我們
              <br />
              聊聊住宿、交通與行程安排。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}