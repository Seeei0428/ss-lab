/* =========================================
   S's Lab - script.js
========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- ハンバーガーメニュー ---------- */
  const hamburger = document.getElementById('hamburger');
  const gnav = document.getElementById('gnav');
  const gnavLinks = gnav ? gnav.querySelectorAll('a') : [];

  function openMenu() {
    hamburger.classList.add('is-open');
    gnav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'メニューを閉じる');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    hamburger.classList.remove('is-open');
    gnav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
    document.body.classList.remove('menu-open');
  }

  if (hamburger && gnav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });

    // メニュー内のリンクをタップしたら閉じる
    gnavLinks.forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });
  }

  /* ---------- スムーズスクロール（ヘッダー高さ分オフセット） ---------- */
  const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#' || targetId.length <= 1) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const rect = target.getBoundingClientRect();
      const offsetTop = window.pageYOffset + rect.top - headerHeight + 1;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    });
  });

  /* ---------- スクロール連動アニメーション ---------- */

  // アニメーション対象の定義
  // [セレクタ, アニメーションクラス, ディレイクラス(任意)]
  const animTargets = [
    // セクション帯タイトル
    ['.section-hero__title', 'section-hero__title'],

    // About
    ['.about__intro', 'fade-in'],
    ['.profile__img', 'scale-in'],
    ['.profile__list', 'fade-in', 'fade-in-d2'],
    ['.history', 'fade-in'],
    ['.history__item', 'fade-in'],
    ['.history__arrow', 'history__arrow'],

    // Works
    ['.works__card', 'fade-in'],

    // Contact
    ['.contact__lead', 'fade-in'],
    ['.form__row', 'fade-in'],
  ];

  const allTargets = [];

  animTargets.forEach(([selector, animClass, delayClass]) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      // アニメーションクラスが要素自身の既存クラスでなければ追加
      if (!el.classList.contains(animClass)) {
        el.classList.add(animClass);
      }
      // ディレイクラス（指定があれば）
      if (delayClass) {
        el.classList.add(delayClass);
      }
      // form__row と history__item は順番にカスケード
      if (selector === '.form__row' || selector === '.history__item') {
        const d = Math.min(index, 4);
        el.classList.add(`fade-in-d${d + 1}`);
      }
      allTargets.push(el);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    allTargets.forEach(el => observer.observe(el));
  } else {
    allTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- お問い合わせフォームのバリデーション ---------- */
  const form = document.getElementById('contactForm');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const message = form.querySelector('#message');

      let hasError = false;
      const errors = [];

      // 氏名
      if (!name.value.trim()) {
        hasError = true;
        errors.push('氏名を入力してください。');
        markError(name);
      } else {
        clearError(name);
      }

      // メールアドレス
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) {
        hasError = true;
        errors.push('メールアドレスを入力してください。');
        markError(email);
      } else if (!emailPattern.test(email.value.trim())) {
        hasError = true;
        errors.push('メールアドレスの形式が正しくありません。');
        markError(email);
      } else {
        clearError(email);
      }

      // お問い合わせ内容
      if (!message.value.trim()) {
        hasError = true;
        errors.push('お問い合わせ内容を入力してください。');
        markError(message);
      } else {
        clearError(message);
      }

      if (hasError) {
        alert(errors.join('\n'));
        return;
      }

      // Formspree へ送信
      const submitBtn = form.querySelector('.btn--submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '送信中...';
      submitBtn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) {
          alert('お問い合わせを送信しました。\nありがとうございました。');
          form.reset();
        } else {
          return response.json().then(data => {
            const msg = (data.errors || []).map(e => e.message).join(', ');
            alert('送信に失敗しました。\n' + (msg || 'しばらく経ってから再度お試しください。'));
          });
        }
      })
      .catch(() => {
        alert('送信に失敗しました。\nネットワーク接続を確認してください。');
      })
      .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
    });
  }

  function markError(el) {
    el.style.borderColor = '#e50012';
  }

  function clearError(el) {
    el.style.borderColor = '';
  }

});
