let stopSpritesheet;
let walkSpritesheet;
let jumpSpritesheet;
let pushSpritesheet;
let stopAnimation = [];
let walkAnimation = [];
let jumpAnimation = [];
let pushAnimation = [];

const stopSpriteWidth = 1597;
const stopSpriteHeight = 191;
const stopNumFrames = 18;
let stopFrameWidth;

const walkSpriteWidth = 1019;
const walkSpriteHeight = 195;
const walkNumFrames = 8;
let walkFrameWidth;

const jumpSpriteWidth = 3054;
const jumpSpriteHeight = 214;
const jumpNumFrames = 19;
let jumpFrameWidth;

const pushSpriteWidth = 5051;
const pushSpriteHeight = 191;
const pushNumFrames = 23;
let pushFrameWidth;

let currentAnimation;
let charX, charY;
let speed = 5; // 角色移動速度
let facingDirection = 1; // 1 代表朝右, -1 代表朝左

let isJumping = false;
let jumpFrameIndex = 0;
let velocityY = 0;
const gravity = 0.6; // 重力加速度
const jumpStrength = -15; // 向上跳躍的力道
let originalY;

let isPushing = false;
let pushFrameIndex = 0;

// 預載入圖片資源
function preload() {
  // 載入位於 '1/stop/' 資料夾中的圖片精靈
  stopSpritesheet = loadImage('1/stop/stop.png');
  // 載入位於 '1/walk/' 資料夾中的圖片精靈
  walkSpritesheet = loadImage('1/walk/walk.png');
  // 載入位於 '1/jump/' 資料夾中的圖片精靈
  jumpSpritesheet = loadImage('1/jump/jump.png');
  // 載入位於 '1/push/' 資料夾中的圖片精靈
  pushSpritesheet = loadImage('1/push/push.png');
}

function setup() {
  // 創建一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);

  // --- 處理站立動畫 ---
  stopFrameWidth = stopSpriteWidth / stopNumFrames;
  for (let i = 0; i < stopNumFrames; i++) {
    let x = i * stopFrameWidth;
    let img = stopSpritesheet.get(x, 0, stopFrameWidth, stopSpriteHeight);
    stopAnimation.push(img);
  }

  // --- 處理走路動畫 ---
  walkFrameWidth = walkSpriteWidth / walkNumFrames;
  for (let i = 0; i < walkNumFrames; i++) {
    let x = i * walkFrameWidth;
    let img = walkSpritesheet.get(x, 0, walkFrameWidth, walkSpriteHeight);
    walkAnimation.push(img);
  }

  // --- 處理跳躍動畫 ---
  jumpFrameWidth = jumpSpriteWidth / jumpNumFrames;
  for (let i = 0; i < jumpNumFrames; i++) {
    let x = i * jumpFrameWidth;
    let img = jumpSpritesheet.get(x, 0, jumpFrameWidth, jumpSpriteHeight);
    jumpAnimation.push(img);
  }

  // --- 處理攻擊動畫 ---
  pushFrameWidth = pushSpriteWidth / pushNumFrames;
  for (let i = 0; i < pushNumFrames; i++) {
    let x = i * pushFrameWidth;
    let img = pushSpritesheet.get(x, 0, pushFrameWidth, pushSpriteHeight);
    pushAnimation.push(img);
  }

  // 預設顯示站立動畫
  currentAnimation = stopAnimation;

  // 初始化角色位置在畫布中央
  charX = width / 2;
  charY = height / 2;
  originalY = charY; // 記錄原始地面高度

  // 設定動畫播放速度
  frameRate(30); // 提高幀率讓跳躍更流暢
}

// 當按鍵被按下時觸發一次
function keyPressed() {
  // 優先處理跳躍和攻擊，避免動作衝突
  if (isJumping || isPushing) {
    return; // 如果正在跳躍或攻擊，不觸發新動作
  }
  if (keyCode === UP_ARROW) {
    isJumping = true;
    velocityY = jumpStrength;
    jumpFrameIndex = 0; // 從跳躍動畫的第一幀開始
  } else if (key === ' ') { // 空白鍵的 keyCode 是 32，直接用 ' ' 更直觀
    isPushing = true;
    pushFrameIndex = 0; // 從攻擊動畫的第一幀開始
  }
}

function draw() {
  background('#dee2e6');
  
  // --- 狀態更新 ---
  if (isJumping) {
    // --- 跳躍狀態邏輯 ---
    currentAnimation = jumpAnimation;
    
    // 更新垂直位置
    velocityY += gravity;
    charY += velocityY;

    // 播放跳躍動畫影格 (減慢播放速度)
    if (frameCount % 2 === 0 && jumpFrameIndex < jumpNumFrames - 1) { // 每 2 幀更新一次
      jumpFrameIndex++;
    }

    // 判斷是否落地
    if (charY >= originalY) {
      charY = originalY; // 修正位置到地面
      isJumping = false;
      currentAnimation = stopAnimation;
    }
  } else if (isPushing) {
    // --- 攻擊狀態邏輯 ---
    currentAnimation = pushAnimation;

    // 播放攻擊動畫影格 (減慢播放速度，使其更流暢)
    if (frameCount % 2 === 0 && pushFrameIndex < pushNumFrames - 1) { // 每 2 幀更新一次
      pushFrameIndex++;
    }

    // 動畫播放完畢
    if (pushFrameIndex >= pushNumFrames - 1) {
      isPushing = false;
    }
  } else {
    // --- 非跳躍狀態 (站立/走路) 邏輯 ---
    if (keyIsDown(RIGHT_ARROW)) {
      currentAnimation = walkAnimation;
      charX += speed;
      facingDirection = 1;
    } else if (keyIsDown(LEFT_ARROW)) {
      currentAnimation = walkAnimation;
      charX -= speed;
      facingDirection = -1;
    } else {
      currentAnimation = stopAnimation;
    }
  }

  // 取得當前要顯示的影格
  let frameIndex;
  if (isJumping) {
    frameIndex = jumpFrameIndex;
  } else if (isPushing) {
    frameIndex = pushFrameIndex;
  } else {
    frameIndex = frameCount % currentAnimation.length;
  }
  let currentFrame = currentAnimation[frameIndex];
  
  // --- 繪製角色 ---
  push(); // 儲存當前的繪圖設定
  
  // 將座標原點移動到角色的中心點，方便進行翻轉
  translate(charX, charY);
  // 根據角色面向進行水平翻轉
  scale(facingDirection, 1);

  // 顯示當前影格，並使其置中
  // frameCount 會隨時間遞增，% animation.length 確保影格索引在範圍內循環
  // 因為已經 translate 過，所以繪製在 (-width/2, -height/2) 即可達到置中效果
  image(currentFrame, -currentFrame.width / 2, -currentFrame.height / 2);

  pop(); // 恢復原本的繪圖設定
}
