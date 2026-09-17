import Link from 'next/link';

export default function SalesPage() {
  return (
    <main>
      <section
        className="hero hero-sales"
        style={{
          background:
            'linear-gradient(90deg,rgba(255,253,248,.98) 0%,rgba(255,253,248,.88) 38%,rgba(255,253,248,.12) 66%),url("/media/p2.jpeg") center 20%/cover',
        }}
      >
        <div className="container hero-copy">
          <div className="kicker">天台邑旅店</div>
          <h1>
            舒適入住，
            <br />
            輕鬆探索台灣
          </h1>
          <p>短期旅遊、商務出差、遠距工作或中長期停留，先看懂房型、設備、交通與入住資訊，再選擇適合自己的住宿方案。</p>
          <div className="ctas">
            <Link className="btn primary" href="#stay">
              查看住宿方案 →
            </Link>
            <Link className="btn light" href="/booking">
              ◉ 線上查空房
            </Link>
          </div>
        </div>
      </section>

      <div className="container quick">
        <div>
          <span className="icon">▣</span>
          <b>房型資訊</b>
        </div>
        <div>
          <span className="icon">♧</span>
          <b>住宿設備</b>
        </div>
        <div>
          <span className="icon">⌖</span>
          <b>交通位置</b>
        </div>
        <div>
          <span className="icon">☷</span>
          <b>入住須知</b>
        </div>
      </div>

      <section id="about">
        <div className="container pain">
          <div className="photo-card">
            <strong>
              訂房前，
              <br />
              你是不是也會先擔心這些？
            </strong>
          </div>
          <div className="pain-list">
            <div className="pain-item">
              <span className="q">□</span>
              <span>照片看起來很漂亮，但實際房間會不會不一樣？</span>
            </div>
            <div className="pain-item">
              <span className="q">＄</span>
              <span>價格看到了，卻不知道還有哪些住宿條件需要注意？</span>
            </div>
            <div className="pain-item">
              <span className="q">⌖</span>
              <span>第一次到這個地方，不確定交通、停車和附近吃飯方不方便？</span>
            </div>
            <div className="pain-item">
              <span className="q">?</span>
              <span>到了旅店才發現設備跟自己的需求不同，行程也跟著被打亂。</span>
            </div>
            <div className="pain-item">
              <span className="q">…</span>
              <span>有問題想先問清楚，卻找不到容易聯絡的人。</span>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="container">
          <h2 className="section-title">
            先把住宿搞定，
            <br />
            旅程就輕鬆一點
          </h2>
          <p className="section-lead">從房型、設備到交通與入住方式，將旅客訂房前最需要知道的資訊清楚整理。</p>
          <div className="benefit-grid">
            <article className="card">
              <span className="icon">◉</span>
              <h3>看得懂</h3>
              <p>房型、設備與住宿資訊清楚呈現，訂房前先了解。</p>
            </article>
            <article className="card">
              <span className="icon">✓</span>
              <h3>選得對</h3>
              <p>依照旅行、出差、遠距工作或中長期停留需求選擇住宿。</p>
            </article>
            <article className="card">
              <span className="icon">♢</span>
              <h3>住得安心</h3>
              <p>提前了解入住方式、交通與常見問題，降低到店後的不確定感。</p>
            </article>
          </div>
        </div>
      </section>

      <section id="stay">
        <div className="container">
          <h2 className="section-title">找到符合你這趟旅程的住宿方式</h2>
          <p className="section-lead">依照旅行、工作或停留時間，先了解住宿條件，再選擇適合自己的方案。</p>
          <div className="stay-grid">
            <article className="card stay">
              <div className="stay-img" />
              <div className="stay-body">
                <h3>短期住宿</h3>
                <p>適合週末旅行、自由行與短期停留旅客。</p>
              </div>
            </article>
            <article className="card stay">
              <div className="stay-img" />
              <div className="stay-body">
                <h3>商務住宿</h3>
                <p>適合出差期間所需的住宿空間與基本資訊。</p>
              </div>
            </article>
            <article className="card stay">
              <div className="stay-img" />
              <div className="stay-body">
                <h3>遠距工作／長住</h3>
                <p>適合需要較長時間停留的旅客。</p>
              </div>
            </article>
            <article className="card stay">
              <div className="stay-img" />
              <div className="stay-body">
                <h3>旅遊住宿</h3>
                <p>搭配交通、景點與周邊餐飲資訊規劃旅程。</p>
              </div>
            </article>
          </div>
          <div className="ctas">
            <Link className="btn primary" href="/booking">
              查看即時空房與價格 →
            </Link>
          </div>
          <div className="audience">
            <div className="card ok">
              <h3>適合對象</h3>
              <ul>
                <li>國內旅客、來台旅客</li>
                <li>商務人士、遠距工作者</li>
                <li>情侶、小家庭</li>
                <li>中長期住宿需求者</li>
              </ul>
            </div>
            <div className="card no">
              <h3>不適合對象</h3>
              <ul>
                <li>需要大型宴會或特殊活動場地者</li>
                <li>特殊需求未事先確認者</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="info" className="benefits">
        <div className="container">
          <h2 className="section-title">訂房流程</h2>
          <div className="steps">
            <div className="step">
              <span className="num">1</span>
              <b>選擇入住日期</b>
            </div>
            <div className="step">
              <span className="num">2</span>
              <b>查看房型與住宿條件</b>
            </div>
            <div className="step">
              <span className="num">3</span>
              <b>確認交通與入住資訊</b>
            </div>
            <div className="step">
              <span className="num">4</span>
              <b>線上預訂或LINE詢問</b>
            </div>
            <div className="step">
              <span className="num">5</span>
              <b>輕鬆入住</b>
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="trust">
        <div className="container trust-grid">
          <div className="trust-photo" />
          <div>
            <h2 className="section-title">先看看旅客實際看到與體驗的天台邑</h2>
            <p>住宿最重要的不是華麗形容，而是實際入住後的感受。</p>
            <p className="quote">透過真實房間照片、公共空間實拍、旅客評價與住宿資訊，讓你在訂房之前就能多了解一些。</p>
            <div className="benefit-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="card">
                <b>真實房型照片</b>
                <small> 每個房型使用實際拍攝照片。</small>
              </div>
              <div className="card">
                <b>旅客評價</b>
                <small> 整理公開平台的真實評價。</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="container faq">
          <div>
            <h2 className="section-title">常見問題</h2>
            <p className="section-lead">把訂房前最常見的疑問先整理清楚。</p>
          </div>
          <div className="faq-list">
            <details open>
              <summary>Q1｜房間照片是實際房況嗎？</summary>
              <p>頁面建議以旅店實際拍攝的房間與公共空間照片為主。不同房型或配置如有差異，訂房前可先確認。</p>
            </details>
            <details>
              <summary>Q2｜入住和退房時間是幾點？</summary>
              <p>請於訂房前查看當次住宿方案的入住與退房規定；如有特殊需求可先詢問。</p>
            </details>
            <details>
              <summary>Q3｜交通方便嗎？附近有停車位嗎？</summary>
              <p>頁面提供位置與交通資訊。有停車需求時，建議訂房前確認停車方式與規定。</p>
            </details>
            <details>
              <summary>Q4｜可以攜帶寵物嗎？</summary>
              <p>是否可攜帶寵物需依旅店規定與房型條件確認，建議同行前先詢問。</p>
            </details>
            <details>
              <summary>Q5｜如果有特殊住宿需求怎麼辦？</summary>
              <p>可在預訂前提出需求，實際是否能安排依當時房況與旅店規定確認。</p>
            </details>
          </div>
        </div>
      </section>

      <section id="contact" className="final">
        <div className="container final-box">
          <div>
            <h2 className="section-title">
              這趟台灣旅程，
              <br />
              先從找到適合的住宿開始
            </h2>
            <p>不用急著決定。先看看房型、住宿條件與入住資訊，確認符合自己的需求，再決定是否預訂。</p>
            <div className="ctas">
              <Link className="btn light" href="#stay">
                查看住宿方案 →
              </Link>
              <Link className="btn light" href="/booking">
                線上訂房 →
              </Link>
            </div>
          </div>
          <div className="card" style={{ color: 'var(--ink)' }}>
            <b>LINE 私訊可提供</b>
            <p>「你好，我想詢問天台邑旅店住宿。」</p>
            <p>
              入住日期：＿＿
              <br />
              入住人數：＿＿
              <br />
              預計住宿天數：＿＿
              <br />
              房型／需求：＿＿
            </p>
          </div>
        </div>
      </section>

      {/* Mobile sticky action bar (mirrors the original sales.html) */}
      <div className="mobile-bar">
        <Link className="btn primary" href="/booking">
          查看空房
        </Link>
        <Link className="btn light" href="#contact">
          LINE詢問
        </Link>
      </div>
    </main>
  );
}