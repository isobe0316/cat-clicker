import './style.css'

// ゲームの状態（データ）
let gameState = {
  niboshi: 0,
  clickPower: 1,
  autoClickPower: 0,
  items: {
    toy: { name: "猫じゃらし", cost: 15, count: 0, power: 1, type: 'click' },
    friend: { name: "野良猫", cost: 50, count: 0, power: 1, type: 'auto' },
    house: { name: "ダンボールハウス", cost: 200, count: 0, power: 5, type: 'auto' }
  }
};

// HTMLの要素を取得
const niboshiElem = document.getElementById('niboshi-count');
const mainCatBtn = document.getElementById('main-cat');
const shopElem = document.getElementById('shop-items');
const gardenElem = document.getElementById('cats-garden');

// ロード機能：以前のデータを読み込む
function loadGame() {
  const savedData = localStorage.getItem('catClickerSave');
  if (savedData) {
    gameState = JSON.parse(savedData);
  }
  updateDisplay();
  renderShop();
  renderGarden();
}

// セーブ機能：データをブラウザに保存する
function saveGame() {
  localStorage.setItem('catClickerSave', JSON.stringify(gameState));
}

// 画面表示を更新する
function updateDisplay() {
  niboshiElem.textContent = Math.floor(gameState.niboshi);
  checkShopAvailability();
}

// メインの猫をクリックしたとき
mainCatBtn.addEventListener('click', () => {
  gameState.niboshi += gameState.clickPower;
  
  // ちょっとしたアニメーション
  mainCatBtn.style.transform = 'scale(0.95)';
  setTimeout(() => mainCatBtn.style.transform = 'scale(1)', 50);
  
  updateDisplay();
  saveGame();
});

// ショップを描画する
function renderShop() {
  shopElem.innerHTML = '';
  for (const key in gameState.items) {
    const item = gameState.items[key];
    const btn = document.createElement('div');
    btn.className = 'shop-item';
    btn.innerHTML = `
      <div>
        <strong>${item.name}</strong> (所持: ${item.count})<br>
        <small>${item.type === 'click' ? 'クリック力' : '自動収集'} +${item.power}</small>
      </div>
      <div>🐟 ${item.cost}</div>
    `;
    
    btn.onclick = () => buyItem(key);
    shopElem.appendChild(btn);
  }
}

// アイテムを買えるかチェックしてボタンの色を変える
function checkShopAvailability() {
  const buttons = shopElem.children;
  let index = 0;
  for (const key in gameState.items) {
    const item = gameState.items[key];
    if (gameState.niboshi >= item.cost) {
      buttons[index].classList.remove('disabled');
    } else {
      buttons[index].classList.add('disabled');
    }
    index++;
  }
}

// アイテム購入処理
function buyItem(key) {
  const item = gameState.items[key];
  if (gameState.niboshi >= item.cost) {
    gameState.niboshi -= item.cost;
    item.count++;
    item.cost = Math.floor(item.cost * 1.5); // 価格が少し上がる
    
    if (item.type === 'click') {
      gameState.clickPower += item.power;
    } else {
      gameState.autoClickPower += item.power;
      addCatToGarden(); // 庭に猫を追加
    }
    
    updateDisplay();
    renderShop();
    saveGame();
  }
}

// 庭に猫（絵文字）を追加する
function addCatToGarden() {
  const cats = ['🐈', '🐈‍⬛', '🐅', '🐆'];
  const randomCat = cats[Math.floor(Math.random() * cats.length)];
  const span = document.createElement('span');
  span.textContent = randomCat;
  gardenElem.appendChild(span);
}

// 庭の再描画（ロード時用）
function renderGarden() {
  gardenElem.innerHTML = '';
  // 持っている「野良猫」などの数だけループして表示
  const totalAutoCats = gameState.items.friend.count + gameState.items.house.count; // 簡易計算
  for(let i=0; i<totalAutoCats; i++) {
    addCatToGarden();
  }
}

// 自動収集ループ（1秒ごとに実行）
setInterval(() => {
  if (gameState.autoClickPower > 0) {
    gameState.niboshi += gameState.autoClickPower;
    updateDisplay();
    saveGame();
  }
}, 1000);

// ゲーム開始
loadGame();
