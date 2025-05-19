// --- pause state for left ring ---
let pauseOffset = 0;      // total ms paused so far
let lastPauseStart = null; // timestamp when hover began
let leftTimeStatic = 0;   // cached time used while paused

const ROT_SPEED = 0.0002; // radians per ms (same as in drawLayers)

export function draw(ctx, img, width, height, time) {
  // Compute logical time for left ring (pauses when hovering)
  const now = performance.now();
  let leftTime;
  if (hoverPause) {
    // keep the frame time constant while hovering
    if (lastPauseStart === null) lastPauseStart = now;
    leftTime = leftTimeStatic;
  } else {
    if (lastPauseStart !== null) {
      pauseOffset += now - lastPauseStart;
      lastPauseStart = null;
    }
    leftTime = time - pauseOffset;
    leftTimeStatic = leftTime;   // update cache
  }

  const logoW = 50;
  const logoH = 50;
  const margin = logoW / 2;            // keep logo fully inside canvas
  const duration = 10000;             // one lap in ms

  const radius = height / 2 - margin;            // semicircle radius inside margin
  const straight = width - 2 * (radius + margin); // top/bottom straight length
  const perim = 2 * (Math.PI * radius + straight);     // capsule perimeter
  const t = (time % duration) / duration;              // 0–1 progress
  const dist = t * perim;

  let x = 0, y = 0, angle = 0;

  if (dist < straight) {                               // top straight (left→right)
    x = radius + dist + margin;
    y = margin;
    angle = 0;
  } else if (dist < straight + Math.PI * radius) {     // right semicircle (top→bottom)
    const a = (dist - straight) / radius;              // 0–π
    x = margin + radius + straight + radius * Math.sin(a);
    y = margin + radius - radius * Math.cos(a);
    angle = (a * 180) / Math.PI;
  } else if (dist < straight + Math.PI * radius + straight) { // bottom straight (right→left)
    const d = dist - (straight + Math.PI * radius);
    x = margin + radius + straight - d;
    y = height - margin;
    angle = 180;
  } else {                                             // left semicircle (bottom→top)
    const a = (dist - (2 * straight + Math.PI * radius)) / radius; // 0–π
    x = margin + radius - radius * Math.sin(a);
    y = margin + radius + radius * Math.cos(a);
    angle = 180 + (a * 180) / Math.PI;
  }

  ctx.clearRect(0, 0, width, height);
  // 绘制两个圆环（分段动画）
  drawRings(ctx, width, height, time, leftTime);
 
  // ctx.fillStyle = "#000";
  // ctx.fillRect(width - logoW, height - logoH, logoW, logoH);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(img, -logoW / 2, -logoH / 2, logoW, logoH);
  ctx.restore();
}

// 初始化交互：需要在主程序里调用 initInteraction(canvas)
export function initInteraction(canvas) {
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const prevHover = hoverPause;
    hoverPause = isInsideLeftRing(x, y, canvas.width, canvas.height);
  });
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleClick(x, y, canvas.width, canvas.height, leftTimeStatic);
  });
}

// --- interaction state ---
let hoverPause = false;        // true when mouse over left rings
let selected = {layer: null, index: null}; // track clicked segment

 // 颜色配置
 const colors = [
  ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
  ['#FFB1C1', '#9FD5F3', '#FFE8A1', '#A5E0DF', '#CCB3FF', '#FFCF9F'],
  ['#FFD6E0', '#C7E6F9', '#FFF3D0', '#D2EFEE', '#E5D9FF', '#FFE7CF'],
  ['#FFEBF1', '#E3F2FD', '#FFF9E5', '#E8F7F7', '#F2ECFF', '#FFF3E5'],
  ['#FFF5F8', '#F1F8FE', '#FFFCF0', '#F3FBFA', '#F9F6FF', '#FFF9F0']
];

// clone of default colors that we can mutate
let customColors = colors.map(row => row.slice());

let arr = [6, 3,5, 4]

function isInsideLeftRing(px, py, width, height) {
  const cx = width / 4;
  const cy = height / 2;
  const outerR = width / 4 - 60;

  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.hypot(dx, dy);

  // pause when pointer is inside the full left circle area (outer radius)
  return dist <= outerR;
}

function handleClick(px, py, width, height, time) {
  const cx = width / 4;
  const cy = height / 2;
  const outerR = width / 4 - 60;
  const ringCircle = 60;
  const gap = 20;
  const r = outerR - ringCircle - gap;
  const t = r / 4;
  const l = Array.from({ length: 4 }, (_, idx) => (outerR - t * idx));

  // polar coordinates
  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) + 2 * Math.PI) % (2 * Math.PI);

  // determine which layer
  for (let layer = 0; layer < 4; layer++) {
    const inner = l[layer] - t;
    const outer = l[layer] - gap;
    if (dist >= inner && dist <= outer) {
      const segCnt = arr[layer];
      const flag = [true, false, true, false][layer];
      const rot = (flag !== null) ? (time * ROT_SPEED * (flag ? 1 : -1)) % (2*Math.PI) : 0;
      const adjAng = (ang - rot + 2*Math.PI) % (2*Math.PI);
      const segIdx = Math.floor(adjAng / (2 * Math.PI / segCnt));
      customColors[layer][segIdx] = '#ff0000';
      selected = {layer, index: segIdx};
      return;
    }
  }
  selected = {layer: null, index: null};
}

// 绘制分段环形图：左 4 层、右 4 层 + 1 固定中心红圆
function drawRings(ctx, width, height, globalTime, leftTime) {
  // 中心圆半径

  function drawLayers(cx, cy, outerR, rotatingFlags, time) {
    let ringCircle = 60
    let len = rotatingFlags.length
    // let segCnt = 4
    let gap = 20
    //剩余半径
    let r = outerR - ringCircle - gap
    // 每个分段器宽度
    let t =  r / 4

    let l = Array.from({ length: 4 }, (_, idx) => (outerR - t * idx))

    
     const gapAngle = Math.PI / 10; // 间隙角度
     const speed = ROT_SPEED; // radians per ms

     for (let layer = 0; layer < len; layer++) {
       ctx.save();
       // Determine rotation direction: true => clockwise, false => counter‑clockwise, null => no rotation
       const flag = rotatingFlags[layer];
       if (flag !== null) {
         const ang = time * speed * (flag ? 1 : -1);
         ctx.translate(cx, cy);
         ctx.rotate(ang);
         ctx.translate(-cx, -cy);
       }

      const segCnt = arr[layer];
      const innerRadius = l[layer] - t 
      const outerRadius = l[layer] - gap
      for (let i = 0; i < arr[layer]; i++) {
        const startAngle = i * (2 * Math.PI / segCnt) + gapAngle/2;
        const endAngle = (i + 1) * (2 * Math.PI / segCnt) - gapAngle/2;
        
        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
        ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        
        // 设置颜色并填充
        let col = customColors[layer][i];
        ctx.fillStyle = col;
        ctx.fill();
        
   
      }
      ctx.restore();
     }

    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(cx, cy, ringCircle, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

  }

  // 左侧：4 环 + gap + 红心，交替旋转
  drawLayers(width / 4, height / 2, width / 4 - 60,
             [true, false, true, false], leftTime);

  // 右侧：1 环 + gap + 红心，静止
  drawLayers(width * 3 / 4, height / 2, width / 4 - 60,
             [null], globalTime);
}
