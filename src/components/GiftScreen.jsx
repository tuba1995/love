import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import FloatingHearts from "./FloatingHearts";
import {
  SITE,
  SONG,
  GALLERY_IMAGE,
  LOVE_NOTES,
  DATE_PIECES,
  FUN_TEXTS,
  FUN_GIFS,
  GIFT_BOX_GIF,
  QUEST_COMPLETE_GIF,
  TELEGRAM,
} from "../data/config";

const SPARKLES = [
  { top: "-30%", left: "-40%", size: 14, delay: 0 },
  { top: "-35%", right: "-40%", size: 12, delay: 0.6 },
  { top: "50%", left: "-55%", size: 11, delay: 1.1 },
];

const BURST_RAYS = Array.from({ length: 12 }, (_, i) => i * 30);

// Con thỏ mang chức năng "cổng thần bí" — cứ mỗi 80 giây sẽ đổi sang icon
// tiếp theo trong danh sách này (hết vòng thì quay lại từ đầu), để người
// chơi không thể học thuộc icon mà đoán trước.
const GATE_EMOJI_SET = ["🐰", "🦉", "🐿️", "🦔", "🐢"];

// Hộp bẫy nguy hiểm — cứ mỗi 3 phút tự đổi sang icon tiếp theo trong danh
// sách này. Bấm vào là mất chìa khoá đã tìm được (về lại 0/1) và con rắn
// giữ chìa khoá cũng đổi sang hình dạng khác luôn, xem action "danger".
const DANGER_EMOJI_SET = ["⚠️", "💀", "🧨"];

// Bộ icon gốc — con thỏ cố tình không được đánh dấu gì đặc biệt giữa các
// icon khác, vì mục đích của trò chơi là để người dùng tự tìm ra nó.
const ICONS = [
  { id: "rabbit", emoji: "🐰", action: "navigate" },
  { id: "heart-music", emoji: "💖", action: "music" },
  { id: "heart-photo", emoji: "💕", action: "image" },
  { id: "dog", emoji: "🐶", action: "letter", note: 0 },
  { id: "butterfly", emoji: "🦋", action: "letter", note: 1 },
  // 4 con thú dễ thương, x2 số tiền trong hũ heo mỗi khi bấm trúng — nếu
  // hũ đang trống thì tặng thẳng 100.000đ luôn cho đỡ tủi thân.
  { id: "fox", emoji: "🦊", action: "double" },
  { id: "otter", emoji: "🦦", action: "double" },
  { id: "chick", emoji: "🐥", action: "double" },
  { id: "duck", emoji: "🦆", action: "double" },
  // hộp quà bí ẩn — 1 vòng quay may rủi, xem MYSTERY_BOX_OUTCOMES
  { id: "mystery-box", emoji: "❓", action: "mystery" },
  // icon gợi ý — hên xui giữa 1 mẹo chơi, cho/lấy bớt tiền hũ heo, hoặc
  // chẳng có gì cả, xem HINT_OUTCOMES
  { id: "hint", emoji: "💡", action: "hint" },
  // 2 icon giữ 2 con số ghép thành "ngày của chúng ta"
  { id: "our-day-1", emoji: "💘", action: "ourday", value: "14" },
  { id: "our-day-2", emoji: "🌹", action: "ourday", value: "02" },
  // hộp bẫy nguy hiểm — xem DANGER_EMOJI_SET
  { id: "danger-box", emoji: "⚠️", action: "danger" },
  // { id: "clover", emoji: "🍀", action: "letter", note: 2 },
  // { id: "moon", emoji: "🌙", action: "letter", note: 3 },
  // 15 icon nữa — con vật, đồ ăn và bánh, nhiều màu sắc và hài hước. Mỗi
  // icon là một lần "hên xui": phần lớn hiện ra một câu nói vui ngẫu nhiên,
  // một số ít sẽ chơi một đoạn hoạt cảnh dễ thương thay vào đó.
  // { id: "cat", emoji: "🐱", action: "fun", kind: "text", idx: 0 },
  // { id: "hamster", emoji: "🐹", action: "fun", kind: "text", idx: 1 },
  // { id: "panda", emoji: "🐼", action: "fun", kind: "gif", idx: 0 },
  // { id: "koala", emoji: "🐨", action: "fun", kind: "text", idx: 2 },
  // { id: "fox", emoji: "🦊", action: "fun", kind: "text", idx: 3 },
  // { id: "octopus", emoji: "🐙", action: "fun", kind: "gif", idx: 1 },
  // { id: "penguin", emoji: "🐧", action: "fun", kind: "text", idx: 4 },
  // { id: "pizza", emoji: "🍕", action: "fun", kind: "text", idx: 5 },
  // { id: "burger", emoji: "🍔", action: "fun", kind: "gif", idx: 2 },
  // { id: "fries", emoji: "🍟", action: "fun", kind: "text", idx: 6 },
  // { id: "sushi", emoji: "🍣", action: "fun", kind: "text", idx: 7 },
  // { id: "donut", emoji: "🍩", action: "fun", kind: "gif", idx: 3 },
  // { id: "cookie", emoji: "🍪", action: "fun", kind: "text", idx: 8 },
  // { id: "cake", emoji: "🎂", action: "fun", kind: "text", idx: 9 },
  // { id: "cupcake", emoji: "🧁", action: "fun", kind: "gif", idx: 4 },
];

// Đường di chuyển lang thang của 1 icon: gồm nhiều điểm dừng nghỉ (được giữ
// cách xa nhau nhờ mảng `points` — mảng này tích luỹ toạ độ của mọi icon
// trong cùng 1 đợt sinh ra, để không icon nào bị dồn cục vào 1 góc), lần
// lượt đi tới từng điểm với thời gian NGHỈ ngẫu nhiên riêng giữa các lần di
// chuyển — hướng đi, nhịp điệu, thời gian nghỉ đều ngẫu nhiên (điểm này có
// thể đứng yên 3s, điểm khác 5s...). Dùng nhiều hơn 2 điểm dừng giúp cả
// vòng lặp mất vài phút mới lặp lại, thay vì cứ nảy qua nảy lại giữa 2 toạ
// độ cố định mãi mãi. Dùng đơn vị vw/vh để tính theo kích thước màn hình
// thực tế, không phải kích thước đo được của khung DOM.
function makeWaypoint(points, minDist, stopCount = 5) {
  const placePoint = () => {
    let candidate;
    let guard = 0;
    do {
      candidate = { x: 6 + Math.random() * 80, y: 10 + Math.random() * 74 };
      guard++;
    } while (
      guard < 200 &&
      points.some(
        (p) => Math.hypot(p.x - candidate.x, p.y - candidate.y) < minDist,
      )
    );
    points.push(candidate);
    return candidate;
  };

  const stops = Array.from({ length: stopCount }, placePoint);

  // dừng nghỉ tại mỗi điểm, rồi di chuyển sang điểm tiếp theo, cuối cùng
  // quay vòng lại điểm đầu tiên để vòng lặp tiếp diễn mượt mà
  const values = [];
  const durations = [];
  stops.forEach((stop) => {
    values.push(stop, stop); // giữ nguyên vị trí tại điểm dừng này
    durations.push(2 + Math.random() * 4); // thời gian nghỉ
    durations.push(2.5 + Math.random() * 2); // thời gian di chuyển sang điểm tiếp theo
  });
  values.push(stops[0]); // quay lại điểm đầu tiên, khép kín vòng lặp

  const total = durations.reduce((sum, d) => sum + d, 0);
  let acc = 0;
  const times = [0, ...durations.map((d) => (acc += d) / total)];

  return {
    x: values.map((v) => `${v.x.toFixed(1)}vw`),
    y: values.map((v) => `${v.y.toFixed(1)}vh`),
    duration: total,
    delay: -Math.random() * total,
    times,
  };
}

function randomWaypoints(count) {
  // Thu hẹp khoảng cách tối thiểu khi số lượng icon tăng lên, để 25 icon
  // vẫn tìm được chỗ đứng mà không bị treo khi tìm kiếm (10 icon ≈ cách
  // nhau 18, 25 icon ≈ cách nhau 9).
  const minDist = Math.max(9, 180 / count);
  const points = [];
  return Array.from({ length: count }, () => makeWaypoint(points, minDist));
}

// Mỗi "con vật" giữ mảnh ghép/chìa khoá di chuyển lang thang dưới dạng
// nhiều bản sao giống hệt nhau — mọi bản sao đều dùng chung icon của cả
// nhóm, nên nhìn bề ngoài không thể phân biệt bản nào là thật. Có 3 kiểu
// bố cục:
//   "triple" (🐴): con thật / 1 con luôn cho heo ăn (random 1.000–20.000đ)
//     / 1 con chỉ chuyên sinh sản — mỗi bản nó đẻ ra, khi bấm vào cũng sẽ
//     cho heo ăn 1 khoản random.
//   "double" (🌸): con thật / 1 con combo — vừa cho heo ăn 1 khoản
//     random, vừa đẻ thêm 1 bản sao; bản sao đó là may rủi 50/50, cộng
//     hoặc trừ 1 khoản random.
//   "coinflip" (❤️🐍): chỉ có đúng 1 con, không có gì fix cứng cả — mỗi
//     lần bấm vào tung xúc xắc 50/50 ngay lúc đó: hoặc nhận mảnh ghép/chìa
//     khoá (chỉ tính lần đầu), hoặc cho heo ăn 1 khoản random.
const CREATURE_GROUPS = {
  horse: {
    emoji: "🐴",
    type: "piece",
    value: DATE_PIECES.horse,
    pattern: "triple",
  },
  flower: {
    emoji: "🌸",
    type: "piece",
    value: DATE_PIECES.flower,
    pattern: "double",
  },
  heart: {
    emoji: "❤️",
    type: "piece",
    value: DATE_PIECES.heart,
    pattern: "coinflip",
  },
  snake: { emoji: "🐍", type: "key", pattern: "coinflip" },
};
// Cứ mỗi phút, ngựa/hoa/tim (kể cả mọi bản sao của chúng đang có trên màn
// hình) sẽ đồng loạt đổi sang icon tiếp theo trong bộ 5 icon riêng của
// mình, hết vòng thì quay lại từ đầu — cùng ý tưởng xoay vòng đổi lốt như
// con thỏ cổng và tiền rơi. Con rắn có bộ đổi lốt riêng (3 icon), tự xoay
// mỗi 20 giây, và còn bị đổi ngay lập tức nếu "bẫy nguy hiểm" kích hoạt
// (xem action "danger"), như một hình phạt kèm theo việc mất chìa khoá.
// Đây thuần là thay đổi về mặt hình ảnh: giúp người chơi không thể học
// thuộc "🐴 = bỏ qua được" rồi ngừng để ý sớm.
const CREATURE_DISGUISE_SETS = {
  horse: ["🐴", "🐉", "🦄", "🦓", "🐫"],
  flower: ["🌸", "🐓", "🌻", "🌺", "🌷"],
  heart: ["❤️", "🐯", "💛", "💚", "💙"],
  snake: ["🐍", "🦎", "🐊"],
};
function getGroupEmoji(groupKey, index) {
  const set = CREATURE_DISGUISE_SETS[groupKey];
  if (!set) return CREATURE_GROUPS[groupKey].emoji;
  return set[index % set.length];
}
const MAX_ITEMS_PER_GROUP = 12;
let guessSeq = 0;
function makeGroupItem(groupKey, role, points) {
  guessSeq += 1;
  // con thật (thắng) luôn giữ 1 id cố định để hệ thống theo dõi tiến độ
  // thu thập mảnh ghép nhận ra nó, bất kể có bao nhiêu bản sao xuất hiện
  // rồi biến mất
  const id = role === "win" ? `${groupKey}-win` : `${groupKey}-${guessSeq}`;
  return { id, group: groupKey, role, ...makeWaypoint(points, 14) };
}
function initialGroupItems(points) {
  const items = [];
  for (const [key, g] of Object.entries(CREATURE_GROUPS)) {
    if (g.pattern === "coinflip") {
      items.push(makeGroupItem(key, "coinflip", points));
      continue;
    }
    items.push(makeGroupItem(key, "win", points));
    if (g.pattern === "triple") {
      items.push(makeGroupItem(key, "feedFixed", points));
      items.push(makeGroupItem(key, "growFeedRandom", points));
    } else {
      items.push(makeGroupItem(key, "comboFeedAndGrow", points));
    }
  }
  return items;
}
// chọn ngẫu nhiên 1 số tiền làm tròn nghìn trong khoảng [min, max]
function randomAmount(min, max) {
  return Math.round((min + Math.random() * (max - min)) / 1000) * 1000;
}
// mọi biến động tiền bạc trong game — dù là cho heo ăn hay được giảm bớt —
// đều dùng chung khoảng random 1.000–20.000đ này
function randomMoneyAmount() {
  return randomAmount(1000, 20000);
}

// Các đồng tiền "hình phạt" rời rạc — một nhóm nhỏ vãi thêm trên màn hình,
// tách biệt hoàn toàn với 4 nhóm con vật ở trên, nên hình dáng không bao
// giờ tiết lộ đây là cho ăn (+) hay được giảm (-) — và vì mỗi lần bấm đều
// random lại kết quả, nên bấm trúng cùng 1 đồng 2 lần cũng không chắc ăn.
// Chúng không bao giờ biến mất sau khi bấm; mỗi lần ra kết quả (+) sẽ tự
// sinh thêm 1 đồng nữa lên màn hình. Cứ mỗi 2 phút, mọi đồng tiền trên màn
// hình sẽ đổi sang icon tiếp theo trong bộ này (hết vòng quay lại từ đầu),
// giống hệt cơ chế của con thỏ cổng.
const COIN_EMOJI_SET = ["🎁", "💎", "🧧", "🎀", "🎈"];
const MAX_PIGGY_ITEMS = 30;
function rollPiggyOutcome() {
  return Math.random() < 0.5 ? randomMoneyAmount() : -randomMoneyAmount();
}
// tâm trạng của hũ heo thay đổi theo số tiền đang có: rỗng thì khóc, có
// chút tiền thì vui, đầy ắp (từ 100.000đ) thì vui quá trời — mỗi tâm trạng
// là 1 GIF riêng, có emoji dự phòng nếu GIF lỗi/mất mạng
function getPiggyMood(amount) {
  if (amount <= 0) {
    return {
      gif: "https://media.giphy.com/media/QgTKZkZ2BEdwIYgp9X/giphy.gif",
      fallback: "😭",
      text: "text-slate-500",
    };
  }
  if (amount >= 100000) {
    return {
      gif: "https://media.giphy.com/media/xgz6byfmkMzU3ylDtu/giphy.gif",
      fallback: "🐖",
      text: "text-amber-600",
    };
  }
  return {
    gif: "https://media.giphy.com/media/i9mLTysJpGYX7vJ5Wc/giphy.gif",
    fallback: "🐷",
    text: "text-rose-600",
  };
}
let piggySeq = 0;
function makePiggyItem(points) {
  piggySeq += 1;
  return {
    id: `piggy-${piggySeq}`,
    ...makeWaypoint(points, 12),
  };
}

// Hộp quà bí ẩn ❓ — 1 vòng quay may rủi mỗi lần bấm, trọng số không cần
// cộng đúng 100 (chỉ là tỉ lệ tương đối với nhau). "Chìa khoá vàng" tự
// động bị loại khỏi vòng quay một khi đã tìm được rồi. Số tiền cộng/trừ
// hũ heo đều random 1.000–50.000đ, không còn cố định.
const MYSTERY_BOX_OUTCOMES = [
  { weight: 25, type: "drink", text: "Bạn được tặng 1 đồ uống tuỳ thích 🥤" },
  { weight: 20, type: "video", text: "Bạn làm 1 video ca nhạc tặng ny mình nhá 🎬" },
  { weight: 25, type: "food", text: "Bạn làm một món ăn mà người yêu bạn order 🍳" },
  { weight: 15, type: "item", text: "Bạn được mua 1 món đồ bạn thích dưới 200k 🛍️" },
  { weight: 25, type: "coffee", text: "Mua cho người yêu 1 cốc cafe muối ☕🧂" },
  { weight: 15, type: "relief" }, // text random, xem handleIconClick
  { weight: 15, type: "feed" }, // text random, xem handleIconClick
  { weight: 50, type: "empty", text: "Không có gì đâu, rỗng tếch 😆" },
  { weight: 55, type: "empty", text: "Không có gì đâu, rỗng tếch 😅" },
  { weight: 60, type: "empty", text: "Không có gì đâu, rỗng tếch 🤷" },
  { weight: 10, type: "key", text: "Chìa khoá vàng! ✨" },
  { weight: 5, type: "x3", text: "X3 hũ heo! 🐷💰" },
  { weight: 5, type: "div3", text: "Chia 3 hũ heo! 🐷➗" },
];
// 5 kiểu quà "nhiệm vụ ngoài đời" cần đếm dồn lại để tổng kết/gửi mail
const MYSTERY_TASK_LABELS = {
  drink: "Được tặng 1 đồ uống tuỳ thích",
  video: "Làm 1 video ca nhạc tặng ny",
  food: "Làm 1 món ăn người yêu order",
  item: "Được mua 1 món đồ thích <200k",
  coffee: "Mua cho người yêu 1 cốc cafe muối",
};
function pickMysteryBoxOutcome(keyAlreadyFound) {
  const pool = MYSTERY_BOX_OUTCOMES.filter(
    (o) => o.type !== "key" || !keyAlreadyFound,
  );
  const total = pool.reduce((sum, o) => sum + o.weight, 0);
  let roll = Math.random() * total;
  for (const o of pool) {
    if (roll < o.weight) return o;
    roll -= o.weight;
  }
  return pool[pool.length - 1];
}

// Báo qua Telegram ngay khi người chơi hoàn thành cả 3 nhiệm vụ (mảnh
// ghép + chìa khoá + cổng thần bí) — im lặng bỏ qua nếu chưa cấu hình
// TELEGRAM.botToken/chatId trong config.js, hoặc nếu lỗi mạng.
async function sendTelegramSummary({ piggyMoney, mysteryStats }) {
  if (!TELEGRAM.botToken || !TELEGRAM.chatId) return;
  const lines = [
    "🎉 Người chơi vừa hoàn thành hết nhiệm vụ trong hộp quà!",
    `🐷 Hũ heo: ${piggyMoney.toLocaleString("vi-VN")}đ`,
    ...Object.entries(MYSTERY_TASK_LABELS).map(
      ([key, label]) => `• ${label}: ${mysteryStats[key]} lần`,
    ),
  ];
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM.chatId, text: lines.join("\n") }),
      },
    );
  } catch {
    // mất mạng hay Telegram lỗi cũng kệ, không ảnh hưởng trải nghiệm người chơi
  }
}

// icon 💡 gợi ý — hên xui 4 kiểu, trọng số chỉ tương đối với nhau
const HINT_TEXT =
  "Trong 3 mảnh ghép, có 1 mảnh mà khi bấm vào sẽ 50% hiện ra nội dung thật, 50% là bị cúng cho heo — đừng bỏ lỡ, cứ tìm đúng icon đó rồi bấm lại lần nữa xem vận may của bạn thế nào nhé! 🔍";
const HINT_OUTCOMES = [
  { weight: 30, type: "hint" },
  { weight: 30, type: "feed" },
  { weight: 30, type: "relief" },
  { weight: 50, type: "empty" },
];
function pickHintOutcome() {
  const total = HINT_OUTCOMES.reduce((sum, o) => sum + o.weight, 0);
  let roll = Math.random() * total;
  for (const o of HINT_OUTCOMES) {
    if (roll < o.weight) return o;
    roll -= o.weight;
  }
  return HINT_OUTCOMES[HINT_OUTCOMES.length - 1];
}

function burstHearts() {
  const defaults = { startVelocity: 28, spread: 360, ticks: 80, zIndex: 60 };

  const heartShape = confetti.shapeFromText({ text: "💖", scalar: 2.4 });
  const heartShape2 = confetti.shapeFromText({ text: "💕", scalar: 2.2 });
  const sparkle = confetti.shapeFromText({ text: "✨", scalar: 2 });

  confetti({
    ...defaults,
    particleCount: 40,
    origin: { x: 0.5, y: 0.45 },
    shapes: [heartShape, heartShape2, sparkle],
    scalar: 1,
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 30,
      origin: { x: 0.5, y: 0.45 },
      shapes: [heartShape, sparkle],
      scalar: 1,
    });
  }, 200);
}

// Pháo hoa ăn mừng khi hoàn thành hết nhiệm vụ — 2 khẩu pháo bắn liên tục
// từ 2 góc dưới màn hình trong 3 giây, thỉnh thoảng có 1 chùm nổ to bất
// ngờ ở trên, cộng thêm burstHearts() cho trọn vẹn.
function fireCelebrationFireworks() {
  const colors = ["#fb7185", "#e879f9", "#fbbf24", "#ffffff", "#c026d3"];
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 65,
      startVelocity: 45,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 70,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 65,
      startVelocity: 45,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 70,
    });
    if (Math.random() < 0.25) {
      confetti({
        particleCount: 40,
        spread: 100,
        startVelocity: 55,
        origin: { x: 0.2 + Math.random() * 0.6, y: Math.random() * 0.4 },
        colors,
        zIndex: 70,
      });
    }
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  burstHearts();
}

// toạ độ (vw/vh) cho `count` điểm nằm đều trên 1 đường trái tim, dùng
// công thức trái tim tham số x=16sin³t, y=13cost−5cos2t−2cos3t−cos4t —
// trừ hy vì trục y màn hình đi xuống, ngược với công thức toán học
function heartPoints(count) {
  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * Math.PI * 2;
    const hx = 16 * Math.sin(t) ** 3;
    const hy =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    return {
      x: `${(50 + hx * 1.6).toFixed(1)}vw`,
      y: `${(50 - hy * 1.5).toFixed(1)}vh`,
    };
  });
}

// Dùng thay thế khi chưa cấu hình GIF thật (hoặc GIF load lỗi) — một đoạn
// hoạt cảnh nhỏ dựng hoàn toàn từ 1 emoji và vài tia lấp lánh, để bất ngờ
// "ảnh động dễ thương" luôn hoạt động ngay cả khi chưa cấu hình gì.
function CuteAnimatedScene({ emoji }) {
  return (
    <div className="relative h-36 flex items-center justify-center">
      <motion.div
        animate={{ rotate: [-10, 10, -10], scale: [1, 1.15, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        className="text-7xl"
      >
        {emoji}
      </motion.div>
      {["✨", "💫", "⭐"].map((s, i) => (
        <motion.span
          key={s}
          className="absolute text-xl select-none"
          style={{
            top: `${15 + i * 28}%`,
            [i % 2 === 0 ? "left" : "right"]: "12%",
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.7, 1.2, 0.7],
            rotate: [0, 25, 0],
          }}
          transition={{
            duration: 1.6 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        >
          {s}
        </motion.span>
      ))}
    </div>
  );
}

export default function GiftScreen({ onOpen, onQuestComplete }) {
  const [opened, setOpened] = useState(false);
  const [gifError, setGifError] = useState(false);
  const [modal, setModal] = useState(null); // { type: loại modal đang mở, ... }
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [funGifError, setFunGifError] = useState(false);
  const [questGifError, setQuestGifError] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicPurchased, setMusicPurchased] = useState(false);
  const [brokenPiggyGifs, setBrokenPiggyGifs] = useState(() => new Set());
  const [collected, setCollected] = useState(() => new Set());
  const [ourDayFound, setOurDayFound] = useState(() => new Set());
  const [keyFound, setKeyFound] = useState(false);
  const [gateFound, setGateFound] = useState(false);
  const [piggyMoney, setPiggyMoney] = useState(0);
  const [mysteryStats, setMysteryStats] = useState(() => ({
    drink: 0,
    video: 0,
    food: 0,
    item: 0,
    coffee: 0,
  }));
  const [questNotified, setQuestNotified] = useState(false);
  // true trong lúc mọi item đang bay về xếp thành hình trái tim
  const [celebrating, setCelebrating] = useState(false);
  // icon bắt đầu random mỗi lần tải lại trang, không chỉ đổi sau 1 khoảng
  // thời gian
  const [creatureIconIndex, setCreatureIconIndex] = useState(() =>
    Math.floor(Math.random() * 5),
  );
  const [coinIconIndex, setCoinIconIndex] = useState(() =>
    Math.floor(Math.random() * COIN_EMOJI_SET.length),
  );
  const [gateIconIndex, setGateIconIndex] = useState(() =>
    Math.floor(Math.random() * GATE_EMOJI_SET.length),
  );
  const [dangerIconIndex, setDangerIconIndex] = useState(() =>
    Math.floor(Math.random() * DANGER_EMOJI_SET.length),
  );
  // hình dạng con rắn — tự xoay mỗi 20 giây, và cũng bị đổi ngay lập tức
  // nếu bẫy nguy hiểm kích hoạt (random luôn khi tải lại trang)
  const [snakeIconIndex, setSnakeIconIndex] = useState(() =>
    Math.floor(Math.random() * CREATURE_DISGUISE_SETS.snake.length),
  );
  const [guesses, setGuesses] = useState(() => {
    const points = [];
    return initialGroupItems(points);
  });
  const [piggyItems, setPiggyItems] = useState(() => {
    const points = [];
    return [makePiggyItem(points), makePiggyItem(points)];
  });

  const paths = useMemo(() => randomWaypoints(ICONS.length), []);

  // trong lúc ăn mừng, mỗi item (icon thường + guesses + tiền rời) được
  // gán 1 điểm trên đường trái tim, theo đúng thứ tự render bên dưới
  const heartTargets = celebrating
    ? heartPoints(ICONS.length + guesses.length + piggyItems.length)
    : null;

  // ngựa/hoa/tim đổi sang icon tiếp theo trong bộ 5 icon nguỵ trang của
  // mình mỗi phút, hết vòng quay lại từ đầu
  useEffect(() => {
    if (!opened) return;
    const intervalId = setInterval(() => {
      setCreatureIconIndex((i) => (i + 1) % 5);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [opened]);

  // con rắn tự đổi sang icon tiếp theo trong bộ 3 icon nguỵ trang mỗi 20
  // giây — độc lập với việc bị bẫy nguy hiểm ép đổi ngay lập tức
  useEffect(() => {
    if (!opened) return;
    const intervalId = setInterval(() => {
      setSnakeIconIndex(
        (i) => (i + 1) % CREATURE_DISGUISE_SETS.snake.length,
      );
    }, 20000);
    return () => clearInterval(intervalId);
  }, [opened]);

  // tiền rời đổi sang icon tiếp theo trong COIN_EMOJI_SET mỗi 2 phút, hết
  // vòng quay lại từ đầu — độc lập với nhịp đổi icon của nhóm con vật ở trên
  useEffect(() => {
    if (!opened) return;
    const intervalId = setInterval(() => {
      setCoinIconIndex((i) => (i + 1) % COIN_EMOJI_SET.length);
    }, 120000);
    return () => clearInterval(intervalId);
  }, [opened]);

  // con thỏ cổng thần bí đổi qua GATE_EMOJI_SET mỗi 80 giây, xoay hết cả 5
  // icon thì quay lại từ đầu
  useEffect(() => {
    if (!opened) return;
    const intervalId = setInterval(() => {
      setGateIconIndex((i) => (i + 1) % GATE_EMOJI_SET.length);
    }, 80000);
    return () => clearInterval(intervalId);
  }, [opened]);

  // hộp bẫy nguy hiểm đổi qua DANGER_EMOJI_SET mỗi 3 phút, xoay hết cả 3
  // icon thì quay lại từ đầu
  useEffect(() => {
    if (!opened) return;
    const intervalId = setInterval(() => {
      setDangerIconIndex((i) => (i + 1) % DANGER_EMOJI_SET.length);
    }, 180000);
    return () => clearInterval(intervalId);
  }, [opened]);

  const piggyMood = getPiggyMood(piggyMoney);

  // luôn giữ giá trị mới nhất của 3 nhiệm vụ, để đọc lại đúng lúc timeout
  // dưới đây thực sự chạy (tránh dùng closure cũ đã lỗi thời)
  const questStateRef = useRef({ collected, keyFound, gateFound });
  useEffect(() => {
    questStateRef.current = { collected, keyFound, gateFound };
  });

  // Bắt đầu chuỗi ăn mừng: mọi item trên màn hình bay về xếp thành 1 hình
  // trái tim (~1.8s), xếp xong mới bắn pháo hoa, rồi mới hiện dialog chúc
  // mừng (kèm nút "Đi tiếp") sau đó thêm ~0.8s nữa — để pháo hoa kịp "nổ"
  // trên màn hình chứ không bị nền tối của dialog che mất ngay lập tức.
  // Chỉ gọi hàm này từ closeModal, tức là NGAY SAU KHI người chơi tự tay
  // tắt dialog "tìm thấy..." của thứ cuối cùng — không tự bắn ngầm ngay
  // lúc điều kiện vừa đủ trong khi dialog đó còn đang mở.
  const startCelebration = () => {
    setQuestNotified(true);
    setCelebrating(true);
    setTimeout(() => {
      fireCelebrationFireworks();
      setTimeout(() => {
        // kiểm tra lại bằng dữ liệu mới nhất trước khi thực sự hiện dialog
        const s = questStateRef.current;
        if (s.collected.size >= 3 && s.keyFound && s.gateFound) {
          setModal({ type: "quest-complete" });
        } else {
          setQuestNotified(false);
          setCelebrating(false);
        }
      }, 800);
    }, 1900);
  };

  const handleQuestContinue = () => {
    sendTelegramSummary({ piggyMoney, mysteryStats });
    setModal(null);
    onQuestComplete?.();
  };

  const addGroupClone = (groupKey, role) => {
    setGuesses((prev) => {
      const countInGroup = prev.filter((g) => g.group === groupKey).length;
      if (countInGroup >= MAX_ITEMS_PER_GROUP) return prev;
      return [...prev, makeGroupItem(groupKey, role, [])];
    });
  };

  const handleBoxClick = () => {
    if (opened) return;
    setOpened(true);
    burstHearts();
  };

  const handleIconClick = (icon) => {
    // đang xếp hình trái tim ăn mừng — khoá hết mọi click để không có gì
    // phá ngang chuỗi hoạt cảnh (pháo hoa/dialog) đang chờ chạy
    if (celebrating) return;
    if (icon.action === "navigate") {
      setGateFound(true);
      setModal({
        type: "letter",
        text: `Đường dẫn để sang trang tiếp ${GATE_EMOJI_SET[gateIconIndex]}`,
      });
      return;
    }
    if (icon.action === "music") {
      setModal({ type: "music" });
      return;
    }
    if (icon.action === "image") {
      setModal({ type: "image" });
      return;
    }
    if (icon.action === "double") {
      if (piggyMoney <= 0) {
        setPiggyMoney(100000);
        setModal({ type: "double-bonus", emoji: icon.emoji });
      } else {
        const amount = piggyMoney * 2;
        setPiggyMoney(amount);
        setModal({ type: "double", emoji: icon.emoji, amount });
      }
      return;
    }
    if (icon.action === "mystery") {
      const outcome = pickMysteryBoxOutcome(keyFound);
      let text = outcome.text;
      if (outcome.type === "key") {
        setKeyFound(true);
      } else if (outcome.type === "relief") {
        const amount = randomAmount(1000, 50000);
        setPiggyMoney((m) => m - amount);
        text = `May quá, được trừ ${amount.toLocaleString("vi-VN")}đ khỏi hũ heo! 🎉`;
      } else if (outcome.type === "feed") {
        const amount = randomAmount(1000, 50000);
        setPiggyMoney((m) => m + amount);
        text = `Xui rồi, phải cộng thêm ${amount.toLocaleString("vi-VN")}đ vào hũ heo 😅`;
      } else if (outcome.type === "x3") {
        setPiggyMoney((m) => m * 3);
      } else if (outcome.type === "div3") {
        setPiggyMoney((m) => Math.round(m / 3));
      } else if (MYSTERY_TASK_LABELS[outcome.type]) {
        setMysteryStats((s) => ({
          ...s,
          [outcome.type]: s[outcome.type] + 1,
        }));
      }
      setModal({ type: "mystery", text });
      return;
    }
    if (icon.action === "hint") {
      const outcome = pickHintOutcome();
      if (outcome.type === "hint") {
        setModal({ type: "hint", text: HINT_TEXT });
      } else if (outcome.type === "feed") {
        const amount = randomAmount(1000, 10000);
        setPiggyMoney((m) => m + amount);
        setModal({ type: "feed", amount });
      } else if (outcome.type === "relief") {
        const amount = randomAmount(1000, 10000);
        setPiggyMoney((m) => m - amount);
        setModal({ type: "relief", amount: -amount });
      } else {
        setModal({
          type: "fun-text",
          emoji: icon.emoji,
          text: FUN_TEXTS[Math.floor(Math.random() * FUN_TEXTS.length)],
        });
      }
      return;
    }
    if (icon.action === "ourday") {
      const next = new Set(ourDayFound);
      next.add(icon.id);
      setOurDayFound(next);
      if (next.size === 2) burstHearts();
      setModal({ type: "ourday", value: icon.value, count: next.size });
      return;
    }
    if (icon.action === "danger") {
      setKeyFound(false);
      // chìa khoá vừa bị lấy lại — nếu trước đó đã được tính là "hoàn
      // thành" (hoặc đang giữa chừng xếp hình trái tim) thì phải bỏ đi,
      // để tìm đủ 3 thứ thật sự mới lại được tính
      setQuestNotified(false);
      setCelebrating(false);
      setSnakeIconIndex((i) => {
        const set = CREATURE_DISGUISE_SETS.snake;
        let next;
        do {
          next = Math.floor(Math.random() * set.length);
        } while (next === i && set.length > 1);
        return next;
      });
      setModal({ type: "danger" });
      return;
    }
    if (icon.action === "piece") {
      const next = new Set(collected);
      next.add(icon.id);
      setCollected(next);
      if (next.size === 3) burstHearts();
      setModal({
        type: "piece",
        emoji: icon.emoji,
        value: icon.value,
        count: next.size,
      });
      return;
    }
    if (icon.action === "fun") {
      setFunGifError(false);
      if (icon.kind === "gif") {
        setModal({
          type: "fun-gif",
          emoji: icon.emoji,
          gif: FUN_GIFS[icon.idx % FUN_GIFS.length],
        });
      } else {
        setModal({
          type: "fun-text",
          emoji: icon.emoji,
          text: FUN_TEXTS[icon.idx % FUN_TEXTS.length],
        });
      }
      return;
    }
    setModal({
      type: "letter",
      text: LOVE_NOTES[icon.note % LOVE_NOTES.length],
    });
  };

  const handleGuessClick = (guess) => {
    if (celebrating) return;
    const group = CREATURE_GROUPS[guess.group];
    const emoji = getGroupEmoji(
      guess.group,
      guess.group === "snake" ? snakeIconIndex : creatureIconIndex,
    );
    switch (guess.role) {
      case "win": {
        if (group.type === "piece") {
          const next = new Set(collected);
          next.add(guess.id);
          setCollected(next);
          if (next.size === 3) burstHearts();
          setModal({
            type: "piece",
            emoji,
            value: group.value,
            count: next.size,
          });
        } else {
          setKeyFound(true);
          setModal({ type: "key" });
        }
        return;
      }
      case "feedFixed": {
        const amount = randomMoneyAmount();
        setPiggyMoney((m) => m + amount);
        setModal({ type: "feed", amount });
        return;
      }
      case "growFeedRandom": {
        // chỉ chuyên sinh sản — bấm vào nó không cho heo ăn trực tiếp, nó
        // chỉ thả thêm 1 bản sao, khi nào tìm thấy và bấm vào bản sao đó
        // thì mới cho heo ăn
        addGroupClone(guess.group, "cloneFeedRandom");
        setModal({ type: "grow", emoji });
        return;
      }
      case "cloneFeedRandom": {
        const amount = randomMoneyAmount();
        setPiggyMoney((m) => m + amount);
        setModal({ type: "feed", amount });
        return;
      }
      case "comboFeedAndGrow": {
        const amount = randomMoneyAmount();
        setPiggyMoney((m) => m + amount);
        addGroupClone(guess.group, "cloneRandomSign");
        setModal({ type: "combo", amount, emoji });
        return;
      }
      case "cloneRandomSign": {
        const sign = Math.random() < 0.5 ? 1 : -1;
        const amount = sign * randomMoneyAmount();
        setPiggyMoney((m) => m + amount);
        setModal({ type: amount > 0 ? "feed" : "relief", amount });
        return;
      }
      case "coinflip": {
        // tung ngay lúc bấm, không phụ thuộc bản sao nào cả — nếu trúng
        // mảnh ghép/chìa khoá mà đã có rồi thì coi như cho heo ăn luôn,
        // để bấm lần nào cũng có tác dụng
        const wonSomething = Math.random() < 0.5;
        const rewardKey = `${guess.group}-piece`;
        if (wonSomething && group.type === "piece" && !collected.has(rewardKey)) {
          const next = new Set(collected);
          next.add(rewardKey);
          setCollected(next);
          if (next.size === 3) burstHearts();
          setModal({
            type: "piece",
            emoji,
            value: group.value,
            count: next.size,
          });
          return;
        }
        if (wonSomething && group.type === "key" && !keyFound) {
          setKeyFound(true);
          setModal({ type: "key" });
          return;
        }
        const amount = randomMoneyAmount();
        setPiggyMoney((m) => m + amount);
        setModal({ type: "feed", amount });
        return;
      }
      default:
        return;
    }
  };

  const handlePiggyItemClick = () => {
    if (celebrating) return;
    const amount = rollPiggyOutcome();
    setPiggyMoney((m) => m + amount);
    setModal({ type: amount > 0 ? "money" : "relief", amount });
    if (amount > 0) {
      setPiggyItems((prev) => {
        if (prev.length >= MAX_PIGGY_ITEMS) return prev;
        return [...prev, makePiggyItem([])];
      });
    }
  };

  const handlePiggyRightClick = (e) => {
    e.preventDefault();
    if (celebrating) return;
    setPiggyMoney((m) => m + randomMoneyAmount());
  };

  const handleMusicClick = () => {
    if (celebrating) return;
    if (musicPlaying) {
      setMusicPlaying(false);
      return;
    }
    // đã mua rồi thì bật lại thoải mái, không hỏi/không tính tiền nữa
    if (musicPurchased) {
      setMusicPlaying(true);
      return;
    }
    setModal({ type: "music-confirm" });
  };

  const handleMusicConfirm = () => {
    setPiggyMoney((m) => m + 20000);
    setMusicPurchased(true);
    setMusicPlaying(true);
    setModal(null);
  };

  const closeModal = () => {
    const wasBonus = modal?.type === "double-bonus";
    setModal(null);
    // đợi hộp thoại đóng xong rồi mới hiện lời cảm ơn, để có cảm giác 2
    // thông báo tách bạch thay vì nhảy cóc nội dung
    if (wasBonus) {
      setTimeout(() => setModal({ type: "thank-you" }), 350);
      return;
    }
    // nếu dialog vừa tắt là dialog "tìm thấy..." của thứ cuối cùng trong 3
    // nhiệm vụ, thì NGAY SAU KHI đóng mới bắt đầu xếp hình trái tim
    if (!questNotified && collected.size >= 3 && keyFound && gateFound) {
      startCelebration();
    }
  };

  return (
    <motion.div
      className="relative w-full min-h-svh flex flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#2b1330] via-[#3a1240] to-[#1a0f1f]"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      {/* ánh sáng mờ ảo nền */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-130 h-130 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      {/* <FloatingHearts count={18} /> */}

      {/* bảng nhiệm vụ + hũ heo — 1 hàng duy nhất góc phải trên cùng, chỉ
          hiện sau khi bắt đầu hành trình tìm kiếm */}
      {opened && (
        <div className="fixed top-3 right-3 z-40 flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-sm px-3 py-2 shadow-lg border border-rose-200 text-xs text-slate-700">
          <button
            type="button"
            onContextMenu={handlePiggyRightClick}
            title="Click phải để trêu heo (đùa thôi, phạt random luôn 😏)"
            className="select-none flex items-center gap-1.5 shrink-0"
          >
            {!brokenPiggyGifs.has(piggyMood.gif) ? (
              <img
                src={piggyMood.gif}
                alt=""
                className="w-11 h-11 rounded-full object-cover"
                onError={() =>
                  setBrokenPiggyGifs((prev) => new Set(prev).add(piggyMood.gif))
                }
              />
            ) : (
              <span className="text-4xl">{piggyMood.fallback}</span>
            )}
            <span
              className={`text-sm font-semibold transition-colors ${piggyMood.text}`}
            >
              {piggyMoney.toLocaleString("vi-VN")}đ
            </span>
          </button>

          <span className="w-px h-8 bg-rose-200 shrink-0" />

          <div className="flex items-center gap-3">
            <span title="Mảnh ghép thần bí">🧩 {collected.size}/3</span>
            <span title="Chìa khoá">🗝️ {keyFound ? 1 : 0}/1</span>
            <span title="Cổng thần bí">🌀 {gateFound ? 1 : 0}/1</span>
          </div>

          <span className="w-px h-8 bg-rose-200 shrink-0" />

          <button
            type="button"
            title="Xem thống kê hộp quà bí ẩn"
            onClick={() => setModal({ type: "stats" })}
            className="shrink-0 text-lg"
          >
            📊
          </button>

          <span className="w-px h-8 bg-rose-200 shrink-0" />

          <button
            type="button"
            title={musicPlaying ? "Tắt nhạc nền" : "Nghe nhạc nền"}
            onClick={handleMusicClick}
            className="shrink-0 text-lg"
          >
            <motion.span
              animate={musicPlaying ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block"
            >
              {musicPlaying ? "🔊" : "🎵"}
            </motion.span>
          </button>
        </div>
      )}

      {musicPlaying && (
        <iframe
          key="bg-music"
          src="https://www.youtube.com/embed/cWA-jJiX7uY?autoplay=1&list=RDcWA-jJiX7uY"
          allow="autoplay"
          className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none"
          title="Nhạc nền"
        />
      )}

      <motion.div
        animate={{ opacity: opened ? 0 : 1, scale: opened ? 0.85 : 1 }}
        transition={{ duration: 0.5, delay: opened ? 0.35 : 0 }}
        className={opened ? "pointer-events-none" : ""}
      >
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 font-script text-rose-200 text-4xl sm:text-5xl mb-2 text-center px-4"
        >
          {SITE.title}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="relative z-10 text-rose-300/70 text-sm tracking-[0.3em] uppercase mb-16 text-center px-4"
        >
          {SITE.subtitle}
        </motion.p>
      </motion.div>

      {/* các icon bung ra và trôi dạt khắp màn hình, kể cả các góc */}
      {opened &&
        ICONS.map((icon, i) => {
          const heart = heartTargets ? heartTargets[i] : null;
          return (
            <motion.div
              key={icon.id}
              className="absolute top-0 left-0 z-30 -ml-4 -mt-4 sm:-ml-5 sm:-mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
            >
              <motion.div
                animate={
                  heart
                    ? { x: heart.x, y: heart.y }
                    : { x: paths[i].x, y: paths[i].y }
                }
                transition={
                  heart
                    ? {
                        duration: 1.2,
                        delay: (i / ICONS.length) * 0.6,
                        ease: "easeOut",
                      }
                    : {
                        duration: paths[i].duration,
                        delay: paths[i].delay,
                        times: paths[i].times,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              >
                <motion.button
                  type="button"
                  aria-label="Mở bất ngờ"
                  onClick={() => handleIconClick(icon)}
                  className="text-3xl sm:text-4xl drop-shadow-lg outline-none block"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                >
                  {icon.id === "rabbit"
                    ? GATE_EMOJI_SET[gateIconIndex]
                    : icon.id === "danger-box"
                      ? DANGER_EMOJI_SET[dangerIconIndex]
                      : icon.emoji}
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}

      {/* các nhóm đoán "con nào là thật" — mỗi mảnh bí mật có nhiều bản
          giống hệt nhau, chỉ 1 bản trong mỗi nhóm thực sự giữ nó */}
      {opened &&
        guesses.map((guess, i) => {
          const heart = heartTargets ? heartTargets[ICONS.length + i] : null;
          return (
            <motion.div
              key={guess.id}
              className="absolute top-0 left-0 z-30 -ml-4 -mt-4 sm:-ml-5 sm:-mt-5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: i < 9 ? 0.2 + i * 0.05 : 0,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
            >
              <motion.div
                animate={
                  heart
                    ? { x: heart.x, y: heart.y }
                    : { x: guess.x, y: guess.y }
                }
                transition={
                  heart
                    ? {
                        duration: 1.2,
                        delay: ((ICONS.length + i) / heartTargets.length) * 0.6,
                        ease: "easeOut",
                      }
                    : {
                        duration: guess.duration,
                        delay: guess.delay,
                        times: guess.times,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              >
                <motion.button
                  type="button"
                  aria-label="Mở bất ngờ"
                  onClick={() => handleGuessClick(guess)}
                  className="text-3xl sm:text-4xl drop-shadow-lg outline-none block"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                >
                  {getGroupEmoji(
                    guess.group,
                    guess.group === "snake" ? snakeIconIndex : creatureIconIndex,
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}

      {/* tiền rời hình phạt — nguỵ trang ngẫu nhiên qua bộ 5 icon, không
          bao giờ biến mất; mỗi lần bấm đều random lại giữa cho heo ăn hoặc
          được giảm bớt */}
      {opened &&
        piggyItems.map((item, i) => {
          const heart = heartTargets
            ? heartTargets[ICONS.length + guesses.length + i]
            : null;
          return (
            <motion.div
              key={item.id}
              className="absolute top-0 left-0 z-30 -ml-4 -mt-4 sm:-ml-5 sm:-mt-5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.4,
                delay: i < 4 ? 0.2 + i * 0.05 : 0,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
            >
              <motion.div
                animate={
                  heart ? { x: heart.x, y: heart.y } : { x: item.x, y: item.y }
                }
                transition={
                  heart
                    ? {
                        duration: 1.2,
                        delay:
                          ((ICONS.length + guesses.length + i) /
                            heartTargets.length) *
                          0.6,
                        ease: "easeOut",
                      }
                    : {
                        duration: item.duration,
                        delay: item.delay,
                        times: item.times,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              >
                <motion.button
                  type="button"
                  aria-label="Mở bất ngờ"
                  onClick={handlePiggyItemClick}
                  className="text-3xl sm:text-4xl drop-shadow-lg outline-none block"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                >
                  {COIN_EMOJI_SET[coinIconIndex]}
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}

      {/* Hộp quà — mờ dần cùng tiêu đề sau khi các icon đã bung ra hết */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: opened ? 0 : 1, scale: opened ? 0.8 : 1 }}
        transition={
          opened
            ? { duration: 0.5, delay: 0.35 }
            : { delay: 0.8, duration: 0.7, ease: "backOut" }
        }
        className={`relative z-20 ${opened ? "pointer-events-none" : ""}`}
      >
        <motion.button
          type="button"
          aria-label="Mở hộp quà"
          onClick={handleBoxClick}
          className="relative outline-none"
          animate={opened ? {} : { y: [0, -10, 0], rotate: [-4, 4, -4] }}
          transition={
            opened ? {} : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
          }
          whileHover={opened ? {} : { scale: 1.06 }}
          whileTap={opened ? {} : { scale: 0.94 }}
        >
          <div className="relative w-44 h-44 sm:w-52 sm:h-52">
            {/* ánh sáng mờ phía sau khung */}
            <div className="absolute inset-2 rounded-full bg-amber-200/25 blur-2xl" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-rose-400/30 rounded-full blur-xl" />

            {/* các tia sáng bùng ra ngay khi hộp quà mở */}
            {opened && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {BURST_RAYS.map((deg, i) => (
                  <motion.span
                    key={i}
                    className="absolute w-1 h-14 sm:h-16 rounded-full bg-linear-to-t from-amber-300/0 via-amber-200/80 to-amber-100/0"
                    style={{ rotate: `${deg}deg`, transformOrigin: "50% 100%" }}
                    initial={{ scaleY: 0, opacity: 0.9 }}
                    animate={{ scaleY: 1.8, opacity: 0 }}
                    transition={{
                      duration: 0.7,
                      ease: "easeOut",
                      delay: i * 0.02,
                    }}
                  />
                ))}
              </div>
            )}

            {!gifError ? (
              <img
                src={GIFT_BOX_GIF}
                alt="Hộp quà"
                className="relative w-full h-full object-cover rounded-full ring-4 ring-amber-100/50 shadow-xl"
                onError={() => setGifError(true)}
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center text-[100px] sm:text-[120px] drop-shadow-xl">
                💝
              </div>
            )}

            {!opened && (
              <>
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-amber-200/60 z-20"
                  animate={{ scale: [1, 1.4, 1.7], opacity: [0.6, 0.25, 0] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                {SPARKLES.map((s, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-amber-200 select-none z-20"
                    style={{
                      top: s.top,
                      left: s.left,
                      right: s.right,
                      fontSize: s.size,
                    }}
                    animate={{
                      opacity: [0.2, 1, 0.2],
                      scale: [0.7, 1.15, 0.7],
                      rotate: [0, 20, 0],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: s.delay,
                    }}
                  >
                    ✨
                  </motion.span>
                ))}
              </>
            )}
          </div>
        </motion.button>
      </motion.div>

      {!opened && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="relative z-10 mt-10 text-rose-100/90 text-lg animate-bounce"
        >
          👉 Ấn vào hộp quà nè 👈
        </motion.p>
      )}
      {/* modal cho nhạc / ảnh / thư tình / mảnh ghép ngày yêu */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={modal.type === "quest-complete" ? undefined : closeModal}
          >
            <motion.div
              className="relative w-full max-w-sm rounded-3xl bg-linear-to-b from-white to-rose-50 p-6 text-center shadow-2xl"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {modal.type !== "quest-complete" && (
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Đóng"
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-500 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              )}

              {modal.type === "quest-complete" && (
                <div>
                  {!questGifError ? (
                    <img
                      src={QUEST_COMPLETE_GIF}
                      alt="Chúc mừng"
                      className="w-28 h-28 mx-auto mb-3 rounded-2xl object-cover shadow-md"
                      onError={() => setQuestGifError(true)}
                    />
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-5xl mb-3"
                    >
                      🎆
                    </motion.div>
                  )}
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Chúc mừng!
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed mb-6">
                    Em iu giỏi quá 🥰 Cảm ơn vì đã kiên trì khám phá đến tận
                    cùng, hẹn gặp lại trong những thử thách tiếp theo!
                  </p>
                  <button
                    type="button"
                    onClick={handleQuestContinue}
                    className="px-6 py-2.5 rounded-full bg-linear-to-r from-rose-400 to-fuchsia-500 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all"
                  >
                    Đi tiếp →
                  </button>
                </div>
              )}

              {modal.type === "letter" && (
                <div>
                  <div className="text-4xl mb-3">💌</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Thư tình nho nhỏ
                  </p>
                  <p className="text-slate-700 leading-relaxed">{modal.text}</p>
                </div>
              )}

              {modal.type === "piece" && (
                <div>
                  <div className="text-4xl mb-2">{modal.emoji}</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Mảnh ghép bí mật
                  </p>
                  <p className="font-script text-6xl text-fuchsia-700 mb-4">
                    {modal.value}
                  </p>
                  {modal.count < 3 ? (
                    <p className="text-sm text-slate-600">
                      Bạn đã tìm được {modal.count}/3 mảnh ghép rồi đó, tìm nốt
                      những mảnh còn lại nhé!
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Bạn đã tìm đủ 3 mảnh ghép rồi! Ghép lại xem nào... đó
                      chính là ngày mình chính thức yêu nhau đấy 💕
                    </p>
                  )}
                </div>
              )}

              {modal.type === "ourday" && (
                <div>
                  <div className="text-4xl mb-2">💘</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Ngày của chúng ta
                  </p>
                  <p className="font-script text-6xl text-fuchsia-700 mb-4">
                    {modal.value}
                  </p>
                  {modal.count < 2 ? (
                    <p className="text-sm text-slate-600">Tung hoả mù</p>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Bạn đã tìm đủ 2 con số rồi! Ghép lại xem nào... 14/02 —
                      ngày của chúng ta 💕
                    </p>
                  )}
                </div>
              )}

              {modal.type === "danger" && (
                <div>
                  <div className="text-4xl mb-2">💀</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Cảnh báo nguy hiểm!
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    Bạn vừa kích hoạt bẫy! Chìa khoá đã tìm được bay mất tiêu
                    rồi, phải tìm lại từ đầu thôi 😱 (mà giờ nó cũng đổi hình
                    dạng khác luôn đó...)
                  </p>
                </div>
              )}

              {modal.type === "key" && (
                <div>
                  <div className="text-4xl mb-2">🗝️</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Tìm thấy chìa khoá
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    Bạn vừa nhặt được một chiếc chìa khoá bí ẩn. Không biết
                    nó mở được gì nhỉ...
                  </p>
                </div>
              )}

              {modal.type === "feed" && (
                <div>
                  <div className="text-4xl mb-2">🐷</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Xui rồi
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    Bạn vừa cho heo ăn mất {modal.amount.toLocaleString("vi-VN")}
                    đ rồi 😅
                  </p>
                </div>
              )}

              {modal.type === "grow" && (
                <div>
                  <div className="text-4xl mb-2">{modal.emoji}</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Có gì đó vừa xuất hiện
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    Một {modal.emoji} bí ẩn khác vừa xuất hiện đâu đó trên màn
                    hình...
                  </p>
                </div>
              )}

              {modal.type === "combo" && (
                <div>
                  <div className="text-4xl mb-2">{modal.emoji}</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Xui rồi
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    Bạn vừa cho heo ăn mất {modal.amount.toLocaleString("vi-VN")}
                    đ rồi 😅
                  </p>
                </div>
              )}

              {modal.type === "money" && (
                <div>
                  <div className="text-4xl mb-2">🐷</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Xui rồi
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    Bên trong là +{modal.amount.toLocaleString("vi-VN")}đ cho
                    heo ăn thêm 😩
                  </p>
                </div>
              )}

              {modal.type === "relief" && (
                <div>
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    May quá
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    Bên trong là {modal.amount.toLocaleString("vi-VN")}đ, lấy
                    bớt được ra khỏi hũ heo rồi! 🐷
                  </p>
                </div>
              )}

              {modal.type === "double" && (
                <div>
                  <div className="text-4xl mb-2">{modal.emoji}</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Nhân đôi thần kỳ
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    {modal.emoji} vừa nhân đôi hũ heo! Giờ có{" "}
                    {modal.amount.toLocaleString("vi-VN")}đ rồi 🎉
                  </p>
                </div>
              )}

              {modal.type === "double-bonus" && (
                <div>
                  <div className="text-4xl mb-2">{modal.emoji}</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Hũ heo trống trơn
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    {modal.emoji} thương tình tặng thẳng 100.000đ để hũ heo đỡ
                    tủi thân!
                  </p>
                </div>
              )}

              {modal.type === "thank-you" && (
                <div>
                  <div className="text-4xl mb-2">🙏</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Lời cảm ơn
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    Cảm ơn nhà hảo tâm 💕
                  </p>
                </div>
              )}

              {modal.type === "mystery" && (
                <div>
                  <div className="text-4xl mb-2">🎁</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-1">
                    💥 Hộp Quà Bí Ẩn — Giá Trị Cực Khủng 💥
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    Mỗi lần mở sẽ ngẫu nhiên trúng 1 trong rất nhiều phần quà
                    hấp dẫn 🎊
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    {modal.text}
                  </p>
                </div>
              )}

              {modal.type === "hint" && (
                <div>
                  <div className="text-4xl mb-2">💡</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Gợi ý bí mật
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    {modal.text}
                  </p>
                </div>
              )}

              {modal.type === "stats" && (
                <div>
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Thống kê hộp quà bí ẩn
                  </p>
                  <div className="rounded-2xl bg-rose-50 px-4 py-3 mb-3 flex items-center justify-between">
                    <span className="text-sm text-slate-600">🐷 Hũ heo</span>
                    <span className="text-sm font-semibold text-rose-600">
                      {piggyMoney.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {Object.entries(MYSTERY_TASK_LABELS).filter(
                    ([key]) => mysteryStats[key] > 0,
                  ).length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Chưa trúng gì cả, thử vận may với hộp quà bí ẩn ❓ xem!
                    </p>
                  ) : (
                    <ul className="text-sm text-slate-700 text-left space-y-2">
                      {Object.entries(MYSTERY_TASK_LABELS)
                        .filter(([key]) => mysteryStats[key] > 0)
                        .map(([key, label]) => (
                          <li
                            key={key}
                            className="flex items-center justify-between gap-3"
                          >
                            <span>{label}</span>
                            <span className="font-semibold text-rose-600 shrink-0">
                              {mysteryStats[key]} lần
                            </span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}

              {modal.type === "music-confirm" && (
                <div>
                  <div className="text-4xl mb-2">🎵</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Nghe nhạc nha?
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed mb-6">
                    Nghe nhạc 1 chút để thư giãn nhá, mất 1 xíu xíu tiền
                    thui. hihi
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-2 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 text-sm font-medium transition-colors"
                    >
                      Thôi
                    </button>
                    <button
                      type="button"
                      onClick={handleMusicConfirm}
                      className="px-5 py-2 rounded-full bg-linear-to-r from-rose-400 to-fuchsia-500 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all"
                    >
                      Đồng ý
                    </button>
                  </div>
                </div>
              )}

              {modal.type === "fun-text" && (
                <div>
                  <motion.div
                    initial={{ rotate: -12, scale: 0.6 }}
                    animate={{ rotate: [-12, 12, -8, 8, 0], scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl mb-3"
                  >
                    {modal.emoji}
                  </motion.div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Hên xui may rủi
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    {modal.text}
                  </p>
                </div>
              )}

              {modal.type === "fun-gif" && (
                <div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Khoảnh khắc hên xui
                  </p>
                  {modal.gif && !funGifError ? (
                    <img
                      src={modal.gif}
                      alt="Ảnh vui"
                      className="w-full rounded-2xl shadow-md"
                      onError={() => setFunGifError(true)}
                    />
                  ) : (
                    <CuteAnimatedScene emoji={modal.emoji} />
                  )}
                </div>
              )}

              {modal.type === "music" && (
                <div>
                  <div className="text-4xl mb-2">🎵</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-2">
                    Nhạc của chúng mình
                  </p>
                  <p className="font-script text-2xl text-fuchsia-700 mb-1">
                    {SONG.title}
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    🕺 Ngồi yên thưởng thức âm nhạc của hai đứa mình nào 😆
                  </p>
                  {!audioError ? (
                    <audio
                      className="w-full"
                      controls
                      autoPlay
                      loop
                      src={SONG.url}
                      onError={() => setAudioError(true)}
                    />
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Thêm file nhạc vào thư mục{" "}
                      <code className="text-rose-500">public/</code> (ví dụ{" "}
                      <code className="text-rose-500">song.mp3</code>) rồi cập
                      nhật <code className="text-rose-500">SONG.url</code> trong{" "}
                      <code className="text-rose-500">config.js</code> nhé 🎶
                    </p>
                  )}
                </div>
              )}

              {modal.type === "image" && (
                <div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-1">
                    📸 Góc kỷ niệm của hai đứa
                  </p>
                  <p className="text-sm text-slate-500 mb-3">
                    Nhìn hoài không chán đâu 🥰
                  </p>
                  {!imageError ? (
                    <img
                      src={GALLERY_IMAGE}
                      alt="Ảnh kỷ niệm"
                      className="w-full rounded-2xl shadow-md"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="rounded-2xl bg-rose-100 p-8 flex flex-col items-center gap-3">
                      <span className="text-5xl">🖼️</span>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Thêm ảnh của vào thư mục{" "}
                        <code className="text-rose-500">public/</code> rồi cập
                        nhật{" "}
                        <code className="text-rose-500">GALLERY_IMAGE</code>{" "}
                        trong <code className="text-rose-500">config.js</code>{" "}
                        nhé!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
