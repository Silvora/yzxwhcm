export function draw(ctx, img, width, height, time) {
  const logoW = 60;
  const logoH = 60;
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
  // bgColor  
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(img, -logoW / 2, -logoH / 2, logoW, logoH);
  ctx.restore();
}