/* ============================================
   ChirpX – Twitter Clone
   app.js – Saari JavaScript Logic Yahan Hai
   ============================================ */

// ============ CONSTANTS ============
const MAX_CHARS = 280;

// ============ DATA ============
const users = [
  { name: 'عمر احمد',   handle: 'umar_ahmed',   avatar: 'عA', avatarClass: 'blue',   verified: true  },
  { name: 'فاطمہ زہرا', handle: 'fatima_z',     avatar: 'فZ', avatarClass: 'green',  verified: false },
  { name: 'بلال خان',   handle: 'bilal_khan',   avatar: 'بK', avatarClass: 'orange', verified: false },
  { name: 'سارہ رضا',   handle: 'sarah_raza',   avatar: 'سR', avatarClass: 'red',    verified: true  },
  { name: 'علی حسن',    handle: 'ali_hasan',    avatar: 'عH', avatarClass: 'blue',   verified: false },
];

let tweets = [
  {
    id: 1, user: users[0], time: '2 منٹ پہلے',
    text: 'آج #پاکستان میں موسم بہت خوبصورت ہے! ☀️ گھر سے باہر نکلیں اور زندگی کو انجوائے کریں۔ #موسم',
    likes: 142, retweets: 28, comments: 12, liked: false, retweeted: false,
    commentsList: ['بالکل! آج کا دن واقعی لاجواب ہے', 'ہاں بھائی، لاہور میں بھی خوبصورت موسم ہے']
  },
  {
    id: 2, user: users[1], time: '15 منٹ پہلے',
    text: '🧵 #ٹیکنالوجی اور #اردو کا ملاپ بہت ضروری ہے۔ ہمیں اپنی زبان میں ٹیک کانٹینٹ بنانا چاہیے۔ آپ کیا سوچتے ہیں؟',
    likes: 89, retweets: 45, comments: 23, liked: false, retweeted: false,
    commentsList: ['بالکل درست! اردو میں ٹیک تعلیم بہت ضروری ہے']
  },
  {
    id: 3, user: users[2], time: '1 گھنٹہ پہلے',
    text: 'پاکستان کرکٹ ٹیم نے آج شاندار کھیل دکھایا! 🏏 #کرکٹ @babar_azam کی بیٹنگ دیکھ کر دل خوش ہو گیا۔',
    likes: 567, retweets: 234, comments: 89, liked: false, retweeted: false,
    commentsList: ['باقی کے بھی اچھا کھیلیں', 'شاہ مشرف بھی کمال تھے آج!', 'چمپئنز ٹرافی جیتیں گے ان شاءاللہ']
  },
  {
    id: 4, user: users[3], time: '3 گھنٹے پہلے',
    text: 'کبھی کبھی خاموشی میں سکون ملتا ہے۔ زندگی کی بھاگ دوڑ سے تھوڑا وقفہ لینا ضروری ہے۔ 🌿✨',
    likes: 1203, retweets: 456, comments: 167, liked: false, retweeted: false,
    commentsList: ['بہت سچ بات ہے', 'دل کو سکون دینے والی بات']
  },
  {
    id: 5, user: users[4], time: '5 گھنٹے پہلے',
    text: 'نئی website بنا لی! 🚀 @ChirpX پر سب کو خوش آمدید۔ یہ پلیٹ فارم اپنی #اردو آواز کے لیے ہے! #ٹیکنالوجی',
    likes: 78, retweets: 19, comments: 8, liked: false, retweeted: false,
    commentsList: ['واہ! مبارک ہو 🎉', 'بہت اچھا قدم ہے بھائی']
  },
];

let nextId = 6;
let openComments = null;
let toastTimer = null;

// ============ HELPERS ============

/** Hashtags aur mentions ko colorful banata hai */
function formatText(text) {
  return text
    .replace(/#(\S+)/g, '<span class="hashtag">#$1</span>')
    .replace(/@(\S+)/g, '<span class="mention">@$1</span>');
}

/** Agar number 1000+ ho toh K mein dikhata hai */
function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

// ============ RENDER ============

/** Saare tweets HTML mein render karta hai */
function renderTweets(list) {
  const feed = document.getElementById('tweetFeed');
  feed.innerHTML = '';
  list.forEach(t => {
    const wrapper = document.createElement('div');
    wrapper.id = 'tweet-' + t.id;
    wrapper.innerHTML = tweetHTML(t);
    feed.appendChild(wrapper);
  });
}

/** Ek tweet ka pura HTML banata hai */
function tweetHTML(t) {
  return `
    <div class="tweet-card" onclick="toggleComments(${t.id}, event)">
      <div class="avatar sm ${t.user.avatarClass}">${t.user.avatar}</div>
      <div class="tweet-body">
        <div class="tweet-header">
          <span class="tweet-name">${t.user.name}</span>
          ${t.user.verified ? '<span class="verified">✦</span>' : ''}
          <span class="tweet-handle">@${t.user.handle}</span>
          <span class="tweet-time">${t.time}</span>
        </div>
        <div class="tweet-text">${formatText(t.text)}</div>
        <div class="tweet-actions" onclick="event.stopPropagation()">
          <div class="tweet-action" onclick="toggleComments(${t.id}, event)">
            <span>💬</span> ${formatCount(t.comments)}
          </div>
          <div class="tweet-action ${t.retweeted ? 'retweeted' : ''}" id="rt-${t.id}" onclick="toggleRetweet(${t.id})">
            <span>🔁</span> ${formatCount(t.retweets)}
          </div>
          <div class="tweet-action ${t.liked ? 'liked' : ''}" id="like-${t.id}" onclick="toggleLike(${t.id})">
            <span>${t.liked ? '❤️' : '🤍'}</span> ${formatCount(t.likes)}
          </div>
          <div class="tweet-action" onclick="showToast('🔗 Link کاپی ہو گیا!')">
            <span>↗️</span>
          </div>
        </div>
      </div>
    </div>

    <div class="comments-section ${openComments === t.id ? 'open' : ''}" id="comments-${t.id}">
      <div class="comment-form">
        <div class="avatar sm online" style="flex-shrink:0">آپ</div>
        <input
          class="comment-input"
          placeholder="جواب دیں..."
          id="commentInput-${t.id}"
          onkeydown="if(event.key==='Enter') addComment(${t.id})"
        >
        <button class="comment-submit" onclick="addComment(${t.id})">جواب</button>
      </div>
      <div id="commentsList-${t.id}">
        ${t.commentsList.map(c => commentHTML(c)).join('')}
      </div>
    </div>
  `;
}

/** Ek comment ka HTML banata hai */
function commentHTML(text) {
  return `
    <div class="comment-item">
      <div class="avatar sm" style="background:linear-gradient(135deg,var(--accent),var(--accent2));flex-shrink:0">آپ</div>
      <div class="comment-content">
        <div class="comment-author">آپ</div>
        <div class="comment-text">${text}</div>
      </div>
    </div>
  `;
}

// ============ TWEET ACTIONS ============

/** Like / Unlike toggle */
function toggleLike(id) {
  const t = tweets.find(x => x.id === id);
  if (!t) return;
  t.liked = !t.liked;
  t.likes += t.liked ? 1 : -1;

  const el = document.getElementById('like-' + id);
  if (el) {
    el.className = 'tweet-action ' + (t.liked ? 'liked' : '');
    el.innerHTML = `<span>${t.liked ? '❤️' : '🤍'}</span> ${formatCount(t.likes)}`;
    if (t.liked) showToast('❤️ Chirp پسند آیا!');
  }
}

/** Retweet / Un-retweet toggle */
function toggleRetweet(id) {
  const t = tweets.find(x => x.id === id);
  if (!t) return;
  t.retweeted = !t.retweeted;
  t.retweets += t.retweeted ? 1 : -1;

  const el = document.getElementById('rt-' + id);
  if (el) {
    el.className = 'tweet-action ' + (t.retweeted ? 'retweeted' : '');
    el.innerHTML = `<span>🔁</span> ${formatCount(t.retweets)}`;
    if (t.retweeted) showToast('🔁 Chirp ری چرپ ہو گیا!');
  }
}

/** Comments section open/close karta hai */
function toggleComments(id, e) {
  e.stopPropagation();
  openComments = openComments === id ? null : id;
  renderTweets(tweets);

  if (openComments) {
    setTimeout(() => {
      const input = document.getElementById('commentInput-' + id);
      if (input) input.focus();
    }, 100);
  }
}

/** Naya comment add karta hai */
function addComment(id) {
  const input = document.getElementById('commentInput-' + id);
  const text = input.value.trim();
  if (!text) return;

  const t = tweets.find(x => x.id === id);
  if (!t) return;

  t.commentsList.push(text);
  t.comments++;
  input.value = '';

  const list = document.getElementById('commentsList-' + id);
  if (list) {
    const div = document.createElement('div');
    div.innerHTML = commentHTML(text);
    list.appendChild(div.firstElementChild);
  }

  showToast('✓ جواب شامل ہو گیا!');
}

// ============ POST NEW TWEET ============

/** Naya tweet post karta hai */
function postTweet(textareaId, fromModal = false) {
  const ta = document.getElementById(textareaId);
  const text = ta.value.trim();

  if (!text) {
    showToast('⚠️ کچھ لکھیں پہلے!');
    return;
  }
  if (text.length > MAX_CHARS) {
    showToast('⚠️ حد سے زیادہ لمبا!');
    return;
  }

  const newTweet = {
    id: nextId++,
    user: {
      name: 'آپ کا نام',
      handle: 'aap_ka_handle',
      avatar: 'آپ',
      avatarClass: '',
      verified: false
    },
    time: 'ابھی',
    text: text,
    likes: 0, retweets: 0, comments: 0,
    liked: false, retweeted: false,
    commentsList: []
  };

  tweets.unshift(newTweet);
  ta.value = '';

  // Character counter reset
  const countId = textareaId === 'mainCompose' ? 'mainCount' : 'modalCount';
  const countEl = document.getElementById(countId);
  if (countEl) {
    countEl.textContent = MAX_CHARS;
    countEl.className = 'char-count';
  }

  if (fromModal) closeModal();

  renderTweets(tweets);
  document.getElementById('feed').scrollTo({ top: 0, behavior: 'smooth' });
  showToast('✦ آپ کا Chirp شائع ہو گیا!');
}

// ============ CHARACTER COUNTER ============

/** Textarea mein likhne par remaining characters dikhata hai */
function updateCharCount(ta, countId) {
  const remaining = MAX_CHARS - ta.value.length;
  const el = document.getElementById(countId);
  if (!el) return;
  el.textContent = remaining;
  el.className = 'char-count' +
    (remaining < 0 ? ' error' : remaining < 20 ? ' warning' : '');
}

// ============ FOLLOW ============

/** Follow / Unfollow toggle */
function toggleFollow(btn) {
  const isFollowing = btn.classList.contains('following');
  btn.classList.toggle('following');
  btn.textContent = isFollowing ? 'Follow' : 'Following ✓';
  showToast(isFollowing ? '✓ Unfollow ہو گیا' : '✓ Follow ہو گیا!');
}

// ============ SEARCH & TRENDS ============

/** Trending hashtag par click karne par filter karta hai */
function searchTrend(tag) {
  const searchInput = document.querySelector('.search-input');
  if (searchInput) searchInput.value = tag;

  const clean = tag.replace('#', '');
  const filtered = tweets.filter(t => t.text.includes(clean));

  if (filtered.length) {
    renderTweets(filtered);
    showToast('🔍 ' + tag + ' کے نتائج دکھا رہے ہیں...');
  } else {
    showToast('😕 کوئی Chirp نہیں ملا');
  }
}

/** Search box mein typing par live filter */
function filterTrends(val) {
  if (!val) {
    renderTweets(tweets);
    return;
  }
  const q = val.toLowerCase();
  const filtered = tweets.filter(t =>
    t.text.toLowerCase().includes(q) ||
    t.user.name.includes(val) ||
    t.user.handle.includes(q)
  );
  renderTweets(filtered);
}

// ============ FEED TABS ============

/** Feed tabs switch karta hai (For You / Following / Trending) */
function switchFeedTab(tab, el) {
  document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  if (tab === 'following') {
    renderTweets(tweets.filter((_, i) => i % 2 === 0));
    showToast('👥 Following feed لوڈ ہو گیا');
  } else if (tab === 'trending') {
    renderTweets([...tweets].sort((a, b) => b.likes - a.likes));
    showToast('📈 Trending Chirps دکھا رہے ہیں');
  } else {
    renderTweets(tweets);
  }
}

/** Sidebar nav items switch karta hai */
function switchTab() {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// ============ MODAL ============

/** Compose modal kholata hai */
function openModal() {
  document.getElementById('composeModal').classList.add('open');
  setTimeout(() => {
    const ta = document.getElementById('modalCompose');
    if (ta) ta.focus();
  }, 200);
}

/** Compose modal band karta hai */
function closeModal() {
  document.getElementById('composeModal').classList.remove('open');
}

/** Background par click karne par modal band */
function closeModalOnBg(e) {
  if (e.target === document.getElementById('composeModal')) closeModal();
}

// ============ TOAST ============

/** Bottom mein chhota notification dikhata hai */
function showToast(msg) {
  const toastEl  = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toastEl || !toastMsg) return;

  toastMsg.textContent = msg;
  toastEl.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', e => {
  // Escape → modal band karo
  if (e.key === 'Escape') closeModal();

  // N → naya chirp likhne ka shortcut (input field mein na ho)
  if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    openModal();
  }
});

// ============ INIT ============
// Pehli baar tweets render karo
renderTweets(tweets);
