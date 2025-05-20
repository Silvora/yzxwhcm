import { ref } from 'vue';

import dataBase from '@/assets/data';

const {global, data} = dataBase;
const {logo_speed, ring_gap, ring_circle, left_ring_speed, ring_circle_color, ring_active_color} = global;

// --- 左侧环状图的暂停状态 ---
let pauseOffset = 0;      // 总暂停时间（毫秒）
let lastPauseStart = null; // 开始暂停的时间戳
let leftTimeStatic = 0;   // 暂停时使用的缓存时间

// 旋转速度（弧度/毫秒）
const ROT_SPEED = logo_speed; // 旋转速度（弧度/毫秒）

// --- 交互状态 ---
let hoverPause = false;        // 鼠标是否悬停在左侧环上
// let selected = {layer: null, index: null, side: null}; // 当前选中的段和位置

export const selected = ref({layer: null, index: null, side: null});

// 左右环状图的数据配置
const leftArr = data[0].subsidiariesList.map(item => item.length);  // 左侧环状图每层的分段数
const rightArr = data[1].subsidiariesList.map(item => item.length); // 右侧环状图每层的分段数
const rightLayers = rightArr.length; // 右侧环状图的层数

// 主绘制函数
export function draw(ctx, img, width, height, time) {
  // 计算左侧环状图的逻辑时间（悬停时暂停）
  const now = performance.now();
  let leftTime;
  if (hoverPause) {
    // 悬停时保持帧时间不变
    if (lastPauseStart === null) lastPauseStart = now;
    leftTime = leftTimeStatic;
  } else {
    if (lastPauseStart !== null) {
      pauseOffset += now - lastPauseStart;
      lastPauseStart = null;
    }
    leftTime = time - pauseOffset;
    leftTimeStatic = leftTime;   // 更新缓存
  }

  const logoW = 50;
  const logoH = 50;
  const margin = logoW / 2;            // 保持logo在画布内
  const duration = 10000;             // 一圈的时间（毫秒）

  const radius = height / 2 - margin;            // 半圆半径
  const straight = width - 2 * (radius + margin); // 上下直线长度
  const perim = 2 * (Math.PI * radius + straight);     // 胶囊周长
  const t = (time % duration) / duration;              // 0-1进度
  const dist = t * perim;

  let x = 0, y = 0, angle = 0;

  if (dist < straight) {                               // 上直线（左→右）
    x = radius + dist + margin;
    y = margin;
    angle = 0;
  } else if (dist < straight + Math.PI * radius) {     // 右半圆（上→下）
    const a = (dist - straight) / radius;              // 0-π
    x = margin + radius + straight + radius * Math.sin(a);
    y = margin + radius - radius * Math.cos(a);
    angle = (a * 180) / Math.PI;
  } else if (dist < straight + Math.PI * radius + straight) { // 下直线（右→左）
    const d = dist - (straight + Math.PI * radius);
    x = margin + radius + straight - d;
    y = height - margin;
    angle = 180;
  } else {                                             // 左半圆（下→上）
    const a = (dist - (2 * straight + Math.PI * radius)) / radius; // 0-π
    x = margin + radius - radius * Math.sin(a);
    y = margin + radius + radius * Math.cos(a);
    angle = 180 + (a * 180) / Math.PI;
  }

  // 清除画布
  ctx.clearRect(0, 0, width, height);
  // 绘制两个环状图
  drawRings(ctx, width, height, time, leftTime);

  // 绘制logo
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(img, -logoW / 2, -logoH / 2, logoW, logoH);
  ctx.restore();
}

// 导出重置函数
export function resetHoverPause(currentTime) {
  hoverPause = false;
  if (lastPauseStart !== null) {
    pauseOffset += currentTime - lastPauseStart; // 累积暂停时间
    lastPauseStart = null;
  }
  leftTimeStatic = currentTime - pauseOffset; // 更新 leftTimeStatic 为当前连续时间
}

// 初始化交互事件
export function initInteraction(canvas, redrawCallback) {
  // 鼠标移动事件：检测是否悬停在左侧环上
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const prevHoverPause = hoverPause;
    hoverPause = isInsideLeftRing(x, y, canvas.width, canvas.height);
    // Ensure correct time state when hoverPause changes
    if (hoverPause && lastPauseStart === null) {
      lastPauseStart = performance.now();
    }
    if (!hoverPause && lastPauseStart !== null) {
      pauseOffset += performance.now() - lastPauseStart;
      lastPauseStart = null;
    }
    // Redraw if hover state changed
    if (prevHoverPause !== hoverPause && redrawCallback) {
      redrawCallback(hoverPause ? leftTimeStatic : null);
    }
  });

  // 点击事件：处理环状图的点击
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const prevSelected = JSON.stringify(selected.value); // Store previous state for comparison
    handleClick(x, y, canvas.width, canvas.height, leftTimeStatic);
    // Trigger redraw after click, pass time to ensure correct rendering
    if (redrawCallback && prevSelected !== JSON.stringify(selected.value)) {
      redrawCallback(hoverPause ? leftTimeStatic : null);
    }
  });
}

// 检查点是否在左侧环内
function isInsideLeftRing(px, py, width, height) {
  const cx = width / 4;
  const cy = height / 2;
  const outerR = width / 4 - ring_circle;
  const r = outerR - ring_circle;
  const t = r / 4;
  const innerR = outerR - t * 4 + ring_gap; // Match drawLayers innermost layer

  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.hypot(dx, dy);

  return dist <= outerR && dist >= innerR;
}

// 检查点是否在右侧环内
function isInsideRightRing(px, py, width, height) {
  const cx = width * 3 / 4;
  const cy = height / 2;
  const outerR = width / 4 - ring_circle;
  const r = outerR - ring_circle;
  const t = r / 4;
  const innerR = outerR - t * rightLayers + ring_gap; // Match drawLayers innermost layer

  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.hypot(dx, dy);

  return dist <= outerR && dist >= innerR;
}

// 处理点击事件
function handleClick(px, py, width, height, time) {
  // 检查点击位置
  const isLeft = isInsideLeftRing(px, py, width, height);
  const isRight = isInsideRightRing(px, py, width, height);
  
  // 处理左侧环的点击
  if (isLeft) {
    const cx = width / 4;
    const cy = height / 2;
    const outerR = width / 4 - ring_circle;
    const r = outerR - ring_circle;
    const t = r / 4; // Match drawLayers: t = r / 4
    const l = Array.from({ length: 4 }, (_, idx) => outerR - t * idx);

    // 计算极坐标
    const dx = px - cx;
    const dy = py - cy;
    const dist = Math.hypot(dx, dy);
    const ang = (Math.atan2(dy, dx) + 2 * Math.PI) % (2 * Math.PI);

    // 确定点击的层
    for (let layer = 0; layer < leftArr.length; layer++) {
      const outer = l[layer];
      const inner = l[layer] - t + ring_gap; // Match drawLayers innerRadius
      if (dist <= outer && dist >= inner) {
        const segCnt = leftArr[layer];
        const flag = data[0].clockwise[layer]; // Use clockwise flag from data
        const rot = flag !== null ? (time * left_ring_speed * (flag ? 1 : -1)) % (2 * Math.PI) : 0;
        const adjAng = (ang - rot + 2 * Math.PI) % (2 * Math.PI);
        const gapAngle = Math.PI / 10; // Match drawLayers gapAngle
        const segIdx = Math.floor((adjAng + gapAngle / 2) / (2 * Math.PI / segCnt));
        
        // 修正索引以防止越界
        const finalSegIdx = segIdx >= segCnt ? segCnt - 1 : segIdx;
        
        // 设置选中状态
        selected.value = {layer, index: finalSegIdx, side: 'left'};
        // console.log(`Selected: Left Ring, Layer ${layer}, Segment ${finalSegIdx}, Angle ${adjAng}, Distance ${dist}, Outer ${outer}, Inner ${inner}`);
        return;
      }
    }
  }
  // 处理右侧环的点击
  else if (isRight) {
    const cx = width * 3 / 4;
    const cy = height / 2;
    const outerR = width / 4 - ring_circle;
    const r = outerR - ring_circle;
    const t = r / 4; // Match drawLayers: t = r / 4
    const l = Array.from({ length: rightLayers }, (_, idx) => {
      if (idx === 0) {
        return outerR - (idx * t);
      } else {
        return outerR - (idx + 1) * t;
      }
    });

    // 计算极坐标
    const dx = px - cx;
    const dy = py - cy;
    const dist = Math.hypot(dx, dy);
    const ang = (Math.atan2(dy, dx) + 2 * Math.PI) % (2 * Math.PI);

    // 确定点击的层
    for (let layer = 0; layer < rightLayers; layer++) {
      const outer = l[layer];
      const inner = l[layer] - t + ring_gap; // Match drawLayers innerRadius
      if (dist <= outer && dist >= inner) {
        const segCnt = rightArr[layer];
        const rot = 0; // Right ring is static
        const adjAng = (ang - rot + 2 * Math.PI) % (2 * Math.PI);
        const gapAngle = Math.PI / 10; // Match drawLayers gapAngle
        const segIdx = Math.floor((adjAng + gapAngle / 2) / (2 * Math.PI / segCnt));
        
        // 修正索引以防止越界
        const finalSegIdx = segIdx >= segCnt ? segCnt - 1 : segIdx;
        
        // 设置选中状态
        selected.value = {layer, index: finalSegIdx, side: 'right'};
        // console.log(`Selected: Right Ring, Layer ${layer}, Segment ${finalSegIdx}, Angle ${adjAng}, Distance ${dist}, Outer ${outer}, Inner ${inner}`);
        return;
      }
    }
  }
  
  // 点击在环外，清除选中状态
  selected.value = {layer: null, index: null, side: null};
  // console.log('Clicked outside rings, selection cleared');
}

// 绘制环状图
function drawRings(ctx, width, height, globalTime, leftTime) {
  const leftData = data[0];
  const rightData = data[1];
  // 绘制单侧环状图的函数
  function drawLayers(cx, cy, outerR, rotatingFlags, time, isLeft) {
    let ringCircle = ring_circle;  // 中心圆半径
    let len = rotatingFlags.length;
    let gap = ring_gap;         // 层间间隙
    let r = outerR - ringCircle;  // 可用半径
    let t = r / 4;        // 每层宽度

    // 计算每层的半径
    let l;
    if (isLeft) {
      // 左侧：从外向内均匀分布
      l = Array.from({ length: 4 }, (_, idx) => (outerR - t * idx));
    } else {
      // 右侧：从外向内，每层宽度为t
      l = Array.from({ length: len }, (_, idx) => {
        if(idx == 0){
          return outerR - (idx * t);
        }else{
          return (outerR - (idx+1) * t)
        }
      });
    }
    
    const gapAngle = Math.PI / 10; // 段间间隙角度

    // 绘制每一层
    for (let layer = 0; layer < len; layer++) {
      ctx.save();
      // 处理旋转
      const flag = rotatingFlags[layer];
      if (flag !== null) {
        const ang = time * left_ring_speed * (flag ? 1 : -1);
        ctx.translate(cx, cy);
        ctx.rotate(ang);
        ctx.translate(-cx, -cy);
      }

      // 绘制每一段
      const segCnt = isLeft ? leftArr[layer] : rightArr[layer];
      const innerRadius = l[layer] - t + gap;
      const outerRadius = l[layer];
      for (let i = 0; i < segCnt; i++) {
        const startAngle = i * (2 * Math.PI / segCnt) + gapAngle/2;
        const endAngle = (i + 1) * (2 * Math.PI / segCnt) - gapAngle/2;
        
        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
        ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        
        // 修复颜色逻辑
      if (selected.value.side && 
          ((selected.value.side == 'left' && selected.value.layer == layer && selected.value.index == i && isLeft) ||
           (selected.value.side == 'right' && selected.value.layer == layer && selected.value.index == i && !isLeft))) {
        ctx.fillStyle = ring_active_color;
      } else {
        let col = isLeft ? leftData['subsidiariesList'][layer][i]['color'] : rightData['subsidiariesList'][layer][i]['color'];
        ctx.fillStyle = col;
      }
      ctx.fill();

      // 绘制文字 添加弧度
      // 左边leftData['subsidiariesList'][layer][i]['name']
      // 右边rightData['subsidiariesList'][layer][i]['name']


      // 绘制文字
      ctx.save();
      const text = isLeft ? leftData['subsidiariesList'][layer][i]['name'] : rightData['subsidiariesList'][layer][i]['name'];
      if (text) {
        const chars = text.split('');
        const totalAngle = endAngle - startAngle;
        const middleStart = startAngle + totalAngle * 0.25;  // 中间50%起始角度
        const middleEnd = endAngle - totalAngle * 0.25;     // 中间50%结束角度
        const middleAngleRange = middleEnd - middleStart;   // 中间50%的弧度范围
    
        const fontSize = Math.min((outerRadius - innerRadius) * 0.6, 14);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    
        // 计算文本总宽度（近似）
        const textWidth = ctx.measureText(text).width;
        const avgCharWidth = textWidth / chars.length;
        const ellipsisWidth = ctx.measureText("...").width;
    
        // 计算中间50%区域能容纳的文本宽度
        const midRadius = (innerRadius + outerRadius) / 2;
        const midCircumference = 2 * Math.PI * midRadius;
        const availableWidth = (middleAngleRange / (2 * Math.PI)) * midCircumference;
    
        // 判断是否需要显示省略号
        let displayText = text;
        let needEllipsis = false;
    
        if (textWidth > availableWidth) {
            // 计算最多能显示多少个字符（留出...的空间）
            const maxChars = Math.floor((availableWidth - ellipsisWidth) / avgCharWidth);
            if (maxChars > 0) {
                displayText = text.substring(0, maxChars) + "...";
                needEllipsis = true;
            } else {
                displayText = "...";  // 如果连一个字符都放不下，只显示...
            }
        }
    
        // 计算文本角度（居中显示）
        const textAngle = (middleStart + middleEnd) / 2;
        const x = cx + midRadius * Math.cos(textAngle);
        const y = cy + midRadius * Math.sin(textAngle);
    
        // 渲染文本（整体渲染，不拆字符）
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(textAngle + Math.PI / 2);  // 文字沿圆弧方向
        ctx.fillText(displayText, 0, 0);
        ctx.restore();
    }
      ctx.restore();
      }

      ctx.restore();
    }

    // 绘制中心圆
    ctx.fillStyle = ring_circle_color;
    ctx.beginPath();
    ctx.arc(cx, cy, ringCircle, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    // 中心圆写字
    ctx.save();
    ctx.font = `${Math.min(ringCircle * 0.5, 16)}px Arial`; // 字体大小适配中心圆
    ctx.fillStyle = '#ffffff'; // 白色文字以确保对比度
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isLeft ? leftData.company: rightData.company, cx, cy); // 中心点绘制文字
    ctx.restore();
    
  }

  // 绘制左侧环状图：4层，交替旋转
  drawLayers(width / 4, height / 2, width / 4 - ring_circle, leftData.clockwise, leftTime, true);

  // 绘制右侧环状图：动态层数，静止
  drawLayers(width * 3 / 4, height / 2, width / 4 - ring_circle, Array(rightLayers).fill(null), globalTime, false);
}



// 获取selected
