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
  GATE_GIF,
  MUSIC_TRAP_GIF,
  TELEGRAM,
} from "../data/config";

const SPARKLES = [
  { top: "-30%", left: "-40%", size: 14, delay: 0 },
  { top: "-35%", right: "-40%", size: 12, delay: 0.6 },
  { top: "50%", left: "-55%", size: 11, delay: 1.1 },
];

const BURST_RAYS = Array.from({ length: 12 }, (_, i) => i * 30);

// Thời gian sống (giây) của item cổng thần bí thật sau khi kích hoạt thành
// công — hết chừng này giây mà chưa bấm trúng thì cổng biến mất, phải tìm
// lại con hamster để thử vận may lần nữa.
const GATE_WINDOW_SECONDS = 25;

// Con hamster mang chức năng "cổng thần bí" — cứ mỗi 20 giây sẽ đổi sang icon
// tiếp theo trong danh sách này (hết vòng thì quay lại từ đầu), để người
// chơi không thể học thuộc icon mà đoán trước.
const GATE_EMOJI_SET = ["🐹", "🦝", "🦡", "🐿️", "🐌"];

// Hộp bẫy nguy hiểm — cứ mỗi 20 giây tự đổi sang icon tiếp theo trong danh
// sách này. Bấm vào là mất chìa khoá đã tìm được (về lại 0/1) và con rắn
// giữ chìa khoá cũng đổi sang hình dạng khác luôn, xem action "danger".
const DANGER_EMOJI_SET = ["🚨", "☠️", "🕷️"];

// Bẫy nhạc — cứ mỗi 25 giây tự đổi sang icon tiếp theo trong danh sách này.
// Chỉ dùng được ĐÚNG 1 LẦN: bấm vào là tự phát nhạc nền + cho heo ăn 30k
// luôn, không hỏi han gì cả, rồi biến mất vĩnh viễn khỏi màn hình.
const MUSIC_TRAP_EMOJI_SET = ["🎷", "🎺", "🦉"];

// Bom nhân bản hẹn giờ — cứ mỗi 15 giây tự đổi sang icon tiếp theo (KHI
// CHƯA kích hoạt đếm ngược, ẩn đi luôn khi đang đếm ngược). Bấm vào bắt đầu
// đếm ngược 1 phút — hết giờ mà chưa gỡ được thì mọi item hiện có trên màn
// hình sẽ nhân đôi số lượng, xem triggerBombExplode. Không dùng 💣 trong bộ
// này nữa để không bị nhầm với quả bom thật (id "bomb") ở dưới.
const BOMB_CLONE_EMOJI_SET = ["🧨", "⏰", "🌪️", "🎆", "🌋"];

// Dụng cụ gỡ bom — chỉ xuất hiện trong lúc bom đang đếm ngược. Bấm vào 50/50
// gỡ được hay không, dù kết quả gì cũng biến mất tạm 3s rồi loé lại bằng 1
// icon khác trong bộ này.
const DEFUSE_EMOJI_SET = ["❤️", "🔨", "🗜️", "🚒", "🔩"];

// nội dung dialog cho từng giai đoạn của bom nhân bản — xem modal type "bomb-clone"
const BOMB_CLONE_MODAL_CONTENT = {
  start: {
    emoji: "💣",
    title: "Bom nhân bản đã kích hoạt!",
    text: "Đúng 1 phút nữa nếu không gỡ được, mọi item trên màn hình sẽ nhân đôi số lượng luôn đó — nhanh tìm kéo ✂️ mà gỡ đi!",
  },
  explode: {
    emoji: "💥",
    title: "Bùm! Mọi thứ nhân đôi rồi",
    text: "Hết giờ rồi! Bom nổ tung, mọi item trên màn hình vừa nhân đôi số lượng luôn 💥",
  },
  success: {
    emoji: "✂️",
    title: "Gỡ bom thành công",
    text: "Gỡ bom thành công! Quả bom vừa bị vô hiệu hoá rồi, huyền thoại đó 🎉",
  },
  fail: {
    emoji: "😅",
    title: "Gỡ bom thất bại",
    text: "Gỡ bom thất bại rồi, bom vẫn đang đếm ngược, thử lại xem 😅",
  },
};

// Bộ icon gốc — con hamster cố tình không được đánh dấu gì đặc biệt giữa các
// icon khác, vì mục đích của trò chơi là để người dùng tự tìm ra nó.
const ICONS = [
  { id: "rabbit", emoji: "🐹", action: "navigate" },
  { id: "heart-music", emoji: "🎹", action: "music" },
  { id: "heart-photo", emoji: "💞", action: "image" },
  { id: "dog", emoji: "🐱", action: "letter", note: 0 },
  { id: "butterfly", emoji: "🐝", action: "letter", note: 1 },
  // 4 con thú dễ thương, cho heo ăn 1 khoản random 1.000–30.000đ mỗi khi
  // bấm trúng.
  { id: "fox", emoji: "🐼", action: "random-feed" },
  { id: "otter", emoji: "🐨", action: "random-feed" },
  { id: "chick", emoji: "🐣", action: "random-feed" },
  { id: "duck", emoji: "🦢", action: "random-feed" },
  // hộp quà bí ẩn — 1 vòng quay may rủi, xem MYSTERY_BOX_OUTCOMES
  { id: "mystery-box", emoji: "🎲", action: "mystery" },
  // icon gợi ý — hên xui giữa 1 mẹo chơi, cho/lấy bớt tiền hũ heo, hoặc
  // chẳng có gì cả, xem HINT_OUTCOMES
  { id: "hint", emoji: "🔦", action: "hint" },
  // 2 icon giữ 2 con số ghép thành "ngày của chúng ta"
  { id: "our-day-1", emoji: "💝", action: "ourday", value: "14" },
  { id: "our-day-2", emoji: "🌷", action: "ourday", value: "01" },
  // hộp bẫy nguy hiểm — xem DANGER_EMOJI_SET
  { id: "danger-box", emoji: "🚨", action: "danger" },
  // bẫy nhạc — xem MUSIC_TRAP_EMOJI_SET, chỉ dùng được 1 lần
  { id: "music-trap", emoji: "🎷", action: "music-trap" },
  // icon gợi ý riêng, luôn nhắc đúng 1 nội dung cố định: cổng thần bí chỉ
  // tồn tại GATE_WINDOW_SECONDS giây sau khi kích hoạt, không hên xui gì cả
  { id: "gate-tip", emoji: "🕰️", action: "gate-tip" },
  // icon gợi ý riêng khác, luôn nhắc đúng 1 nội dung cố định: nên tập trung
  // tìm hết từng cụm icon một thay vì bấm lung tung khắp màn hình, không
  // hên xui gì cả
  { id: "focus-tip", emoji: "🔍", action: "focus-tip" },
  // quả bom đen — 1 vòng quay may rủi giữa 3 kết quả, xem BOMB_OUTCOMES —
  // icon này giữ nguyên 💣, không đổi
  { id: "bomb", emoji: "💣", action: "bomb" },
  // bom nhân bản hẹn giờ — xem BOMB_CLONE_EMOJI_SET + triggerBombExplode
  { id: "bomb-clone", emoji: "🧨", action: "bomb-clone" },
  // dụng cụ gỡ bom — chỉ hiện khi bom nhân bản đang đếm ngược, xem DEFUSE_EMOJI_SET
  { id: "defuse", emoji: "🪚", action: "defuse" },
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
//   "triple" (🐮): con thật / 1 con luôn cho heo ăn (random 1.000–20.000đ)
//     / 1 con chỉ chuyên sinh sản — mỗi bản nó đẻ ra, khi bấm vào cũng sẽ
//     cho heo ăn 1 khoản random.
//   "double" (🌼): con thật / 1 con combo — vừa cho heo ăn 1 khoản
//     random, vừa đẻ thêm 1 bản sao; bản sao đó là may rủi 50/50, cộng
//     hoặc trừ 1 khoản random.
//   "coinflip" (🧡🦎): chỉ có đúng 1 con, không có gì fix cứng cả — mỗi
//     lần bấm vào tung xúc xắc 50/50 ngay lúc đó: hoặc nhận mảnh ghép/chìa
//     khoá (chỉ tính lần đầu), hoặc cho heo ăn 1 khoản random.
const CREATURE_GROUPS = {
  horse: { emoji: "🐮", type: "piece", pattern: "triple" },
  flower: { emoji: "🌼", type: "piece", pattern: "double" },
  heart: { emoji: "🧡", type: "piece", pattern: "coinflip" },
  snake: { emoji: "🐣", type: "key", pattern: "coinflip" },
};
// Số thứ tự + nhãn của 3 mảnh ghép, hiện trong dialog để người chơi biết
// cách ghép đúng thứ tự vào mật khẩu dù tìm thấy không theo thứ tự.
const PIECE_LABELS = {
  horse: "Mảnh ghép số 1",
  flower: "Mảnh ghép số 2",
  heart: "Mảnh ghép thần bí số 3",
};
// Cứ mỗi phút, ngựa/hoa/tim (kể cả mọi bản sao của chúng đang có trên màn
// hình) sẽ đồng loạt đổi sang icon tiếp theo trong bộ 5 icon riêng của
// mình, hết vòng thì quay lại từ đầu — cùng ý tưởng xoay vòng đổi lốt như
// con hamster cổng và tiền rơi. Con rắn có bộ đổi lốt riêng (3 icon), tự xoay
// mỗi 20 giây, và còn bị đổi ngay lập tức nếu "bẫy nguy hiểm" kích hoạt
// (xem action "danger"), như một hình phạt kèm theo việc mất chìa khoá.
// Đây thuần là thay đổi về mặt hình ảnh: giúp người chơi không thể học
// thuộc "🐮 = bỏ qua được" rồi ngừng để ý sớm.
const CREATURE_DISGUISE_SETS = {
  horse: ["🐮", "🦏", "🐗", "🦌", "🐐"],
  flower: ["🌼", "🦃", "🐫", "💐", "🌾"],
  heart: ["🧡", "🦁", "🐶", "🐓", "🐉"],
  snake: ["🐣", "🐊", "🦖"],
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
// nhân bản 1 item mồi/tiền (KHÔNG bao giờ gọi với role "win"/"coinflip" —
// đó là 2 role giữ mảnh ghép/chìa khoá thật, xem triggerBombExplode) — giữ
// nguyên group/role, chỉ đổi id và toạ độ trôi dạt cho bản sao mới
function cloneGuessItem(guess) {
  guessSeq += 1;
  return {
    ...guess,
    id: `${guess.group}-${guessSeq}`,
    ...makeWaypoint([], 14),
  };
}
// item cổng thần bí 🌀 xuất hiện tạm thời sau khi con hamster kích hoạt thành
// công — cố tình dùng chung bộ icon nguỵ trang GATE_EMOJI_SET và cùng kiểu
// trôi dạt như mọi icon khác, để không nổi bật hơn phần còn lại của màn hình
function makeGateWindowItem() {
  return {
    ...makeWaypoint([], 14),
    emoji: GATE_EMOJI_SET[Math.floor(Math.random() * GATE_EMOJI_SET.length)],
  };
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
// giống hệt cơ chế của con hamster cổng.
const COIN_EMOJI_SET = ["🧧", "💰", "🧿", "🔔", "🎊"];
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

// mảnh ghép "thần bí số 3" GIẢ — nguỵ trang y hệt heart thật (đổi lốt chung
// nhịp với CREATURE_DISGUISE_SETS.heart), bấm vào hiện dialog giống hệt
// mảnh ghép thật với số 05 để đánh lừa, nhưng không có tác dụng gì cả. Nằm
// trong state (không phải mảng ICONS tĩnh) để bom nhân bản hẹn giờ có thể
// nhân đôi số lượng của nó y như các item mồi khác, xem triggerBombExplode.
const MAX_FAKE_PIECE_ITEMS = 12;
let fakePieceSeq = 0;
function makeFakePieceItem(points) {
  fakePieceSeq += 1;
  return {
    id: `fake-piece-${fakePieceSeq}`,
    ...makeWaypoint(points, 14),
  };
}

// "Chìa khoá vàng", "Cổng thần bí" và "Linh vật may mắn" luôn có cơ hội
// tuyệt đối riêng của từng cái mỗi lần bấm (4%, 3% và 7%), tách biệt hẳn
// khỏi hệ trọng số tương đối bên dưới — không phụ thuộc các phần quà khác
// đang nặng/nhẹ ký thế nào. Một khi key/gate đã tìm được rồi thì phần trăm
// dành riêng cho nó tự động dồn lại cho vòng quay bình thường — riêng
// "Linh vật may mắn" không có khái niệm "đã tìm được" nên tỉ lệ 7% luôn cố
// định mãi mãi, xem pickMysteryBoxOutcome.
const KEY_CHANCE = 0.04;
const GATE_CHANCE = 0.03;
const MASCOT_CHANCE = 0.07;

// Hộp quà bí ẩn 🎲 — 1 vòng quay may rủi mỗi lần bấm (trừ "key"/"gate"/
// "mascot" ở trên), trọng số không cần cộng đúng 100 (chỉ là tỉ lệ tương
// đối với nhau). Số tiền cộng/trừ hũ heo đều random 1.000–50.000đ, không
// còn cố định.
const MYSTERY_BOX_OUTCOMES = [
  { weight: 25, type: "drink", text: "Em iu được tặng 1 đồ uống tuỳ thích 🥤" },
  {
    weight: 20,
    type: "video",
    text: "Em iu làm 1 video ca nhạc tặng ny mình nhá 🎬",
  },
  {
    weight: 25,
    type: "food",
    text: "Em iu làm 1 món ăn mà người yêu bạn order 🍳",
  },
  {
    weight: 15,
    type: "item",
    text: "Em iu mua 1 món đồ em thích dưới 200k 🛍️",
  },
  {
    weight: 25,
    type: "coffee",
    text: "Mua cho người yêu 1 cốc cafe muối ☕🧂",
  },
  { weight: 15, type: "relief" }, // text random, xem handleIconClick
  { weight: 15, type: "feed" }, // text random, xem handleIconClick
  { weight: 50, type: "empty", text: "Không có gì đâu, rỗng tếch 😆" },
  { weight: 60, type: "empty", text: "Không có gì đâu, rỗng tếch 🤷" },
  // weight của key/gate/mascot không dùng tới nữa — tỉ lệ của 3 cái này
  // giờ cố định (KEY_CHANCE/GATE_CHANCE/MASCOT_CHANCE), tách riêng khỏi
  // vòng quay trọng số tương đối
  { type: "key", text: "Chìa khoá vàng! ✨" },
  // trúng thẳng cổng thần bí luôn, không cần tìm con hamster/chờ cửa sổ 25s
  { type: "gate", text: "Cổng thần bí đã mở ra ngay tại đây! 🌀" },
  // chỉ mang tính hên xui/trang trí, không có tác dụng gì cả — dòng đầu là
  // tiêu đề, xuống dòng hiện bộ icon linh vật (dùng chung whitespace-pre-line
  // với riêng modal "mystery", xem JSX bên dưới)
  { type: "mascot", text: "Linh vật may mắn\n🦡  🦁 🦖 🦏 🦃" },
  { weight: 10, type: "bonus" }, // cộng random 1.000–30.000đ, text random xem handleIconClick
  // chỉ là gợi ý, không có tác dụng gì khác — nhắc người chơi để ý icon con
  // hamster: bấm vào nó có 50% cơ hội mở cổng thần bí, cổng chỉ tồn tại
  // đúng 25 giây (GATE_WINDOW_SECONDS) rồi biến mất
  {
    weight: 20,
    type: "tip",
    text: "Hãy để ý những icon báo hiệu cổng thần bí xuất hiện — bấm vào có 50% cơ hội mở được cổng thần bí, cổng chỉ tồn tại 25s thôi đó, nhanh tay lên nhé!",
  },
];
// 5 kiểu quà "nhiệm vụ ngoài đời" cần đếm dồn lại để tổng kết/gửi mail
const MYSTERY_TASK_LABELS = {
  drink: "Được tặng 1 đồ uống tuỳ thích",
  video: "Làm 1 video ca nhạc tặng ny",
  food: "Làm 1 món ăn người yêu order",
  item: "Được mua 1 món đồ thích <200k",
  coffee: "Mua cho người yêu 1 cốc cafe muối",
};
function pickMysteryBoxOutcome(keyAlreadyFound, gateAlreadyFound) {
  // 1 lần roll duy nhất trong [0, 1) — cắt sẵn lát KEY_CHANCE, GATE_CHANCE
  // rồi MASCOT_CHANCE đầu tiên (2 cái đầu chỉ tính nếu chưa tìm được, cái
  // "mascot" thì luôn tính vì không có khái niệm "đã tìm được"), phần còn
  // lại mới scale về đúng khoảng [0, tổng trọng số) để chia cho vòng quay
  // tương đối bên dưới, đảm bảo 3 cái này luôn đúng % tuyệt đối riêng của
  // từng cái, không bị các phần quà khác pha loãng.
  const roll = Math.random();
  let boundary = 0;
  if (!keyAlreadyFound) {
    boundary += KEY_CHANCE;
    if (roll < boundary)
      return MYSTERY_BOX_OUTCOMES.find((o) => o.type === "key");
  }
  if (!gateAlreadyFound) {
    boundary += GATE_CHANCE;
    if (roll < boundary)
      return MYSTERY_BOX_OUTCOMES.find((o) => o.type === "gate");
  }
  boundary += MASCOT_CHANCE;
  if (roll < boundary)
    return MYSTERY_BOX_OUTCOMES.find((o) => o.type === "mascot");

  const pool = MYSTERY_BOX_OUTCOMES.filter(
    (o) => o.type !== "key" && o.type !== "gate" && o.type !== "mascot",
  );
  const total = pool.reduce((sum, o) => sum + o.weight, 0);
  let roll2 = ((roll - boundary) / (1 - boundary)) * total;
  for (const o of pool) {
    if (roll2 < o.weight) return o;
    roll2 -= o.weight;
  }
  return pool[pool.length - 1];
}

// định dạng mm:ss (hoặc h:mm:ss nếu vượt quá 1 giờ) cho đồng hồ hiện trên
// màn hình
function formatClock(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
// định dạng "X phút Y giây" bằng tiếng Việt cho dòng thời gian gửi qua Telegram
function formatDurationVi(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h} giờ`);
  if (h > 0 || m > 0) parts.push(`${m} phút`);
  parts.push(`${s} giây`);
  return parts.join(" ");
}

// Báo qua Telegram ngay khi người chơi hoàn thành cả 3 nhiệm vụ (mảnh
// ghép + chìa khoá + cổng thần bí) — im lặng bỏ qua nếu chưa cấu hình
// TELEGRAM.botToken/chatId trong config.js, hoặc nếu lỗi mạng.
async function sendTelegramSummary({
  piggyMoney,
  mysteryStats,
  flowerValue,
  heartValue,
  password,
  durationSeconds,
}) {
  if (!TELEGRAM.botToken || !TELEGRAM.chatId) return;
  const lines = [
    "🎉 Người chơi vừa hoàn thành hết nhiệm vụ trong hộp quà!",
    `⏱️ Thời gian hoàn thành: ${formatDurationVi(durationSeconds)}`,
    `🐷 Hũ heo: ${piggyMoney.toLocaleString("vi-VN")}đ`,
    `${PIECE_LABELS.flower}: ${flowerValue ?? "Chưa tìm thấy"}`,
    `${PIECE_LABELS.heart}: ${heartValue ?? "Chưa tìm thấy"}`,
    `🔑 Mật khẩu màn Login tiếp theo: ${password}`,
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
        body: JSON.stringify({
          chat_id: TELEGRAM.chatId,
          text: lines.join("\n"),
        }),
      },
    );
  } catch {
    // mất mạng hay Telegram lỗi cũng kệ, không ảnh hưởng trải nghiệm người chơi
  }
}

// icon 🔦 gợi ý — hên xui 4 kiểu, trọng số chỉ tương đối với nhau
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

// icon 💣 quả bom đen — hên xui 3 kiểu, trọng số chỉ tương đối với nhau.
// "explode" (mất hết mảnh ghép) chỉ có mặt trong vòng quay nếu người chơi
// đang thực sự giữ ít nhất 1 mảnh ghép, không thì mất hết cũng chẳng có ý
// nghĩa gì.
const BOMB_OUTCOMES = [
  { weight: 34, type: "memory" },
  { weight: 33, type: "explode" },
  { weight: 33, type: "gentle" },
];
function pickBombOutcome(hasPieces) {
  const pool = BOMB_OUTCOMES.filter((o) => o.type !== "explode" || hasPieces);
  const total = pool.reduce((sum, o) => sum + o.weight, 0);
  let roll = Math.random() * total;
  for (const o of pool) {
    if (roll < o.weight) return o;
    roll -= o.weight;
  }
  return pool[pool.length - 1];
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

// Hiệu ứng nổ khi bom nhân bản hết giờ — 1 chùm nổ to giữa màn hình kèm
// rung nhẹ, dùng tông màu lửa/khói thay vì màu tim hồng như burstHearts()
function burstBombExplosion() {
  const boomShape = confetti.shapeFromText({ text: "💥", scalar: 2.6 });
  const fireShape = confetti.shapeFromText({ text: "🔥", scalar: 2.2 });
  const skullShape = confetti.shapeFromText({ text: "💀", scalar: 2 });
  const colors = ["#ff4500", "#ff8c00", "#ffd700", "#1a1a1a"];

  confetti({
    particleCount: 60,
    spread: 360,
    startVelocity: 35,
    ticks: 90,
    zIndex: 60,
    origin: { x: 0.5, y: 0.5 },
    shapes: [boomShape, fireShape],
    colors,
    scalar: 1,
  });

  setTimeout(() => {
    confetti({
      particleCount: 35,
      spread: 360,
      startVelocity: 25,
      ticks: 80,
      zIndex: 60,
      origin: { x: 0.5, y: 0.5 },
      shapes: [fireShape, skullShape],
      colors,
      scalar: 1,
    });
  }, 180);
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
  // Đồng hồ tính giờ — bắt đầu tính ngay từ lúc người chơi vào màn này, dừng
  // hẳn (chốt số giây, xem finalElapsedSeconds) đúng lúc hoàn thành đủ 3
  // nhiệm vụ, để biết người chơi mất bao lâu mới tìm hết mảnh ghép + chìa
  // khoá + cổng thần bí, gửi kèm qua Telegram lúc "Đi tiếp".
  const startTimeRef = useRef(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalElapsedSeconds, setFinalElapsedSeconds] = useState(null);
  useEffect(() => {
    if (finalElapsedSeconds !== null) return;
    const intervalId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [finalElapsedSeconds]);

  const [opened, setOpened] = useState(false);
  const [gifError, setGifError] = useState(false);
  const [modal, setModal] = useState(null); // { type: loại modal đang mở, ... }
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [funGifError, setFunGifError] = useState(false);
  const [questGifError, setQuestGifError] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicPurchased, setMusicPurchased] = useState(false);
  // true khi nhạc nền YouTube bị tạm dừng để nhường chỗ cho dialog 💖,
  // để biết lúc đóng dialog đó có cần bật nhạc nền chạy tiếp không
  const [resumeYoutubeAfterModal, setResumeYoutubeAfterModal] = useState(false);
  const [brokenPiggyGifs, setBrokenPiggyGifs] = useState(() => new Set());
  const [collected, setCollected] = useState(() => new Set());
  // flower/heart: mỗi lần bấm vào mảnh ghép THẬT sẽ random lại giữa các số
  // ứng viên (xem DATE_PIECES, tỉ lệ chia đều theo số lượng ứng viên) — số
  // ở lần bấm GẦN NHẤT mới là số hiện ra và cũng là số dùng làm mật khẩu,
  // bấm lại là đổi số khác ngay. horse không có state tương tự vì nó không
  // hiện số, chỉ hiện câu đố (đáp án cố định).
  const [flowerValue, setFlowerValue] = useState(null);
  const [heartValue, setHeartValue] = useState(null);
  // icon ☁️ log mảnh ghép KHÔNG hiện mặc định — chỉ loé ra 5s sau khi bấm
  // trúng kết quả "Trí não tuổi già" của quả bom 💣 (xem BOMB_OUTCOMES)
  const [cloudVisible, setCloudVisible] = useState(false);
  const cloudTimeoutRef = useRef(null);
  useEffect(() => () => clearTimeout(cloudTimeoutRef.current), []);
  // random lại số của 1 mảnh ghép (flower/heart), lưu vào state để icon ☁️
  // log lại được số ở lần bấm gần nhất, đồng thời trả về giá trị đó luôn để
  // dùng ngay cho modal (tránh đọc state cũ do setState là bất đồng bộ)
  const rerollPieceValue = (groupKey) => {
    const candidates = DATE_PIECES[groupKey];
    const value = candidates[Math.floor(Math.random() * candidates.length)];
    if (groupKey === "flower") setFlowerValue(value);
    else if (groupKey === "heart") setHeartValue(value);
    return value;
  };
  const [ourDayFound, setOurDayFound] = useState(() => new Set());
  const [keyFound, setKeyFound] = useState(false);
  const [gateFound, setGateFound] = useState(false);
  const [gateGifError, setGateGifError] = useState(false);
  // con hamster cổng thần bí KHÔNG xuất hiện ngay — đợi đúng 1 phút sau khi mở
  // hộp quà mới loé ra (icon random trong GATE_EMOJI_SET, vẫn tự đổi lốt mỗi
  // 20s như cũ). Bấm vào nó chỉ có 50% kích hoạt được cổng thần bí thật —
  // trúng thì 1 item riêng xuất hiện đâu đó trên màn hình trong GATE_WINDOW_SECONDS
  // giây, bấm trúng NÓ mới thực sự tính là tìm thấy cổng thần bí.
  const [gateIconVisible, setGateIconVisible] = useState(false);
  const [gateWindowActive, setGateWindowActive] = useState(false);
  const [gateWindowItem, setGateWindowItem] = useState(null);
  // đồng hồ đếm ngược xinh xinh hiển thị lúc cổng đang mở, tính bằng giây —
  // gateWindowTimeoutRef mới là cái thực sự đóng cổng sau đúng
  // GATE_WINDOW_SECONDS giây, độc lập với việc UI có re-render đúng nhịp
  // giây hay không (giống cơ chế đồng hồ bom nhân bản)
  const [gateWindowRemaining, setGateWindowRemaining] = useState(0);
  const gateWindowTimeoutRef = useRef(null);
  const gateWindowIntervalRef = useRef(null);
  useEffect(
    () => () => {
      clearTimeout(gateWindowTimeoutRef.current);
      clearInterval(gateWindowIntervalRef.current);
    },
    [],
  );
  // trật 50% thì con hamster biến mất luôn, không đứng yên cho bấm liên tục —
  // sau đúng 10s mới loé lại, đổi sang 1 icon khác trong GATE_EMOJI_SET
  const gateCooldownTimeoutRef = useRef(null);
  useEffect(() => () => clearTimeout(gateCooldownTimeoutRef.current), []);
  // rắn giữ chìa khoá — bấm vào là biến mất tạm thời, 4s sau mới hiện lại,
  // né bấm liên tục farm chìa khoá/tiền hũ heo
  const [snakeVisible, setSnakeVisible] = useState(true);
  const snakeCooldownTimeoutRef = useRef(null);
  useEffect(() => () => clearTimeout(snakeCooldownTimeoutRef.current), []);
  // bom nhân bản hẹn giờ — bombTimerRemaining tính bằng giây, chỉ dùng để
  // hiện đồng hồ đếm ngược; bombTimeoutRef mới là cái thực sự kích hoạt nổ
  // sau đúng 1 phút, độc lập với việc UI có re-render đúng nhịp giây hay không
  const [bombCloneIconIndex, setBombCloneIconIndex] = useState(() =>
    Math.floor(Math.random() * BOMB_CLONE_EMOJI_SET.length),
  );
  const [bombTimerActive, setBombTimerActive] = useState(false);
  const [bombTimerRemaining, setBombTimerRemaining] = useState(0);
  // rung màn hình ngắn (dùng chung class .animate-shake với lúc nhập sai
  // mật khẩu ở màn Login) đúng lúc bom nổ, tự tắt sau 450ms
  const [bombShaking, setBombShaking] = useState(false);
  const bombTimeoutRef = useRef(null);
  const bombIntervalRef = useRef(null);
  const bombShakeTimeoutRef = useRef(null);
  useEffect(
    () => () => {
      clearTimeout(bombTimeoutRef.current);
      clearInterval(bombIntervalRef.current);
      clearTimeout(bombShakeTimeoutRef.current);
    },
    [],
  );
  // dụng cụ gỡ bom — chỉ hiện khi bombTimerActive, và tự ẩn/loé lại icon khác
  // mỗi lần bấm (dù gỡ được hay không) giống cơ chế con hamster/con rắn
  const [defuseIconIndex, setDefuseIconIndex] = useState(() =>
    Math.floor(Math.random() * DEFUSE_EMOJI_SET.length),
  );
  const [defuseIconVisible, setDefuseIconVisible] = useState(true);
  const defuseCooldownTimeoutRef = useRef(null);
  useEffect(() => () => clearTimeout(defuseCooldownTimeoutRef.current), []);
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
  const [musicTrapIconIndex, setMusicTrapIconIndex] = useState(() =>
    Math.floor(Math.random() * MUSIC_TRAP_EMOJI_SET.length),
  );
  // bẫy nhạc chỉ dùng được 1 lần — bấm xong là biến mất vĩnh viễn
  const [musicTrapTriggered, setMusicTrapTriggered] = useState(false);
  const [musicTrapGifError, setMusicTrapGifError] = useState(false);
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
  const [fakePieceItems, setFakePieceItems] = useState(() => {
    const points = [];
    return [makeFakePieceItem(points)];
  });

  const paths = useMemo(() => randomWaypoints(ICONS.length), []);

  // trong lúc ăn mừng, mỗi item (icon thường + guesses + tiền rời + mảnh
  // ghép giả) được gán 1 điểm trên đường trái tim, theo đúng thứ tự render
  // bên dưới
  const heartTargets = celebrating
    ? heartPoints(
        ICONS.length +
          guesses.length +
          piggyItems.length +
          fakePieceItems.length,
      )
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
      setSnakeIconIndex((i) => (i + 1) % CREATURE_DISGUISE_SETS.snake.length);
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

  // con hamster cổng thần bí đổi qua GATE_EMOJI_SET mỗi 20 giây, xoay hết cả 5
  // icon thì quay lại từ đầu
  useEffect(() => {
    if (!opened) return;
    const intervalId = setInterval(() => {
      setGateIconIndex((i) => (i + 1) % GATE_EMOJI_SET.length);
    }, 20000);
    return () => clearInterval(intervalId);
  }, [opened]);

  // con hamster cổng thần bí chỉ loé ra sau đúng 1 phút kể từ lúc mở hộp quà,
  // không có ngay từ đầu
  useEffect(() => {
    if (!opened) return;
    const timeoutId = setTimeout(() => setGateIconVisible(true), 60000);
    return () => clearTimeout(timeoutId);
  }, [opened]);

  // hộp bẫy nguy hiểm đổi qua DANGER_EMOJI_SET mỗi 20 giây, xoay hết cả 3
  // icon thì quay lại từ đầu
  useEffect(() => {
    if (!opened) return;
    const intervalId = setInterval(() => {
      setDangerIconIndex((i) => (i + 1) % DANGER_EMOJI_SET.length);
    }, 20000);
    return () => clearInterval(intervalId);
  }, [opened]);

  // bẫy nhạc đổi qua MUSIC_TRAP_EMOJI_SET mỗi 25 giây — tự dừng luôn khi đã
  // bấm trúng (biến mất vĩnh viễn, không cần đổi icon nữa)
  useEffect(() => {
    if (!opened || musicTrapTriggered) return;
    const intervalId = setInterval(() => {
      setMusicTrapIconIndex((i) => (i + 1) % MUSIC_TRAP_EMOJI_SET.length);
    }, 25000);
    return () => clearInterval(intervalId);
  }, [opened, musicTrapTriggered]);

  // bom nhân bản đổi qua BOMB_CLONE_EMOJI_SET mỗi 15 giây — chỉ khi CHƯA
  // kích hoạt đếm ngược (đang đếm ngược thì icon này ẩn hẳn, xem render)
  useEffect(() => {
    if (!opened || bombTimerActive) return;
    const intervalId = setInterval(() => {
      setBombCloneIconIndex((i) => (i + 1) % BOMB_CLONE_EMOJI_SET.length);
    }, 15000);
    return () => clearInterval(intervalId);
  }, [opened, bombTimerActive]);

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
    // chốt số giây NGAY tại thời điểm hoàn thành đủ 3 nhiệm vụ — không tính
    // thêm thời gian xem pháo hoa/dialog chúc mừng sau đó
    setFinalElapsedSeconds(
      Math.floor((Date.now() - startTimeRef.current) / 1000),
    );
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
    // Mật khẩu màn Login tiếp theo = mảnh ghép 1 (câu đố ngựa, cố định) +
    // mảnh ghép 2 (flower) + mảnh ghép thần bí số 3 (heart) ở LẦN BẤM GẦN
    // NHẤT của người chơi — luôn có giá trị vì phải đủ 3/3 mảnh mới đi tới
    // được bước này.
    const password = `${DATE_PIECES.horse.answer}${flowerValue ?? ""}${heartValue ?? ""}`;
    sendTelegramSummary({
      piggyMoney,
      mysteryStats,
      flowerValue,
      heartValue,
      password,
      durationSeconds: finalElapsedSeconds ?? elapsedSeconds,
    });
    setModal(null);
    onQuestComplete?.(password);
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

  // vài icon trong ICONS tự đổi lốt qua 1 bộ emoji xoay vòng riêng thay vì
  // dùng emoji cố định khai báo sẵn — gom hết vào 1 chỗ cho gọn thay vì lặp
  // lại ternary lồng nhau ngay trong JSX
  const getIconEmoji = (icon) => {
    switch (icon.id) {
      case "rabbit":
        return GATE_EMOJI_SET[gateIconIndex];
      case "danger-box":
        return DANGER_EMOJI_SET[dangerIconIndex];
      case "music-trap":
        return MUSIC_TRAP_EMOJI_SET[musicTrapIconIndex];
      case "bomb-clone":
        return BOMB_CLONE_EMOJI_SET[bombCloneIconIndex];
      case "defuse":
        return DEFUSE_EMOJI_SET[defuseIconIndex];
      default:
        return icon.emoji;
    }
  };

  // con hamster cổng thần bí biến mất tạm thời rồi loé lại bằng 1 icon KHÁC
  // trong bộ nguỵ trang — dùng chung cho cả 2 trường hợp bấm trúng (5s, để
  // né spam bấm liên tục tạo nhiều cổng cùng lúc) lẫn bấm trật (10s)
  const hideGateIconFor = (ms) => {
    setGateIconVisible(false);
    clearTimeout(gateCooldownTimeoutRef.current);
    gateCooldownTimeoutRef.current = setTimeout(() => {
      setGateIconIndex((i) => {
        let next;
        do {
          next = Math.floor(Math.random() * GATE_EMOJI_SET.length);
        } while (next === i && GATE_EMOJI_SET.length > 1);
        return next;
      });
      setGateIconVisible(true);
    }, ms);
  };

  // rắn giữ chìa khoá — bấm vào (dù trúng hay trật) đều tạm biến mất, 4s
  // sau mới hiện lại, né bấm liên tục farm
  const hideSnakeFor = (ms) => {
    setSnakeVisible(false);
    clearTimeout(snakeCooldownTimeoutRef.current);
    snakeCooldownTimeoutRef.current = setTimeout(
      () => setSnakeVisible(true),
      ms,
    );
  };

  const handleIconClick = (icon) => {
    // đang xếp hình trái tim ăn mừng — khoá hết mọi click để không có gì
    // phá ngang chuỗi hoạt cảnh (pháo hoa/dialog) đang chờ chạy
    if (celebrating) return;
    if (icon.action === "navigate") {
      if (gateFound) {
        setModal({
          type: "fun-text",
          emoji: GATE_EMOJI_SET[gateIconIndex],
          text: "Cổng thần bí cũng có thể xuất hiện ở icon xúc xắc, thử vận may nhá 😄",
        });
        return;
      }
      // chỉ 50% là kích hoạt được cổng thần bí thật — trật thì con hamster biến
      // mất luôn (không đứng yên cho bấm liên tục ăn may), đúng 10s sau mới
      // loé lại bằng 1 icon khác trong bộ nguỵ trang
      if (Math.random() >= 0.5) {
        hideGateIconFor(10000);
        setModal({
          type: "fun-text",
          emoji: GATE_EMOJI_SET[gateIconIndex],
          text: "Không phải, không có gì hãy thử lại vận may 🍀",
        });
        return;
      }
      // kích hoạt thành công — con hamster cũng biến mất 5s (né bấm liên tục
      // tạo chồng nhiều cổng cùng lúc), sinh 1 item riêng trôi dạt trên màn
      // hình giống hệt các icon khác (không nổi bật), chỉ tồn tại
      // GATE_WINDOW_SECONDS giây, bấm trúng NÓ mới thực sự tính là tìm thấy cổng
      hideGateIconFor(5000);
      setGateWindowItem(makeGateWindowItem());
      setGateWindowActive(true);
      setGateWindowRemaining(GATE_WINDOW_SECONDS);
      clearInterval(gateWindowIntervalRef.current);
      gateWindowIntervalRef.current = setInterval(() => {
        setGateWindowRemaining((s) => Math.max(0, s - 1));
      }, 1000);
      clearTimeout(gateWindowTimeoutRef.current);
      gateWindowTimeoutRef.current = setTimeout(() => {
        setGateWindowActive(false);
        clearInterval(gateWindowIntervalRef.current);
      }, GATE_WINDOW_SECONDS * 1000);
      setModal({
        type: "gate-hint",
        text: `Cổng thần bí đã xuất hiện, chỉ tồn tại ${GATE_WINDOW_SECONDS}s thôi, nhanh tay tìm nó nhé!`,
      });
      return;
    }
    if (icon.action === "music") {
      // tạm tắt nhạc nền YouTube để khỏi đè lên nhạc trong dialog này
      if (musicPlaying) {
        setMusicPlaying(false);
        setResumeYoutubeAfterModal(true);
      }
      setModal({ type: "music" });
      return;
    }
    if (icon.action === "image") {
      setModal({ type: "image" });
      return;
    }
    if (icon.action === "random-feed") {
      const amount = randomAmount(1000, 30000);
      setPiggyMoney((m) => m + amount);
      setModal({ type: "feed", amount });
      return;
    }
    if (icon.action === "mystery") {
      const outcome = pickMysteryBoxOutcome(keyFound, gateFound);
      let text = outcome.text;
      if (outcome.type === "key") {
        setKeyFound(true);
      } else if (outcome.type === "gate") {
        setGateFound(true);
      } else if (outcome.type === "relief") {
        const amount = randomAmount(1000, 50000);
        setPiggyMoney((m) => m - amount);
        text = `May quá, được trừ ${amount.toLocaleString("vi-VN")}đ khỏi hũ heo! 🎉`;
      } else if (outcome.type === "feed") {
        const amount = randomAmount(1000, 50000);
        setPiggyMoney((m) => m + amount);
        text = `Xui rồi, phải cộng thêm ${amount.toLocaleString("vi-VN")}đ vào hũ heo 😅`;
      } else if (outcome.type === "bonus") {
        const amount = randomAmount(1000, 30000);
        setPiggyMoney((m) => m + amount);
        text = `May quá, được cộng thêm ${amount.toLocaleString("vi-VN")}đ vào hũ heo! 🎉`;
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
    if (icon.action === "gate-tip") {
      setModal({
        type: "hint",
        text: `Cổng thần bí chỉ tồn tại ${GATE_WINDOW_SECONDS}s, nhanh tay tìm được nó nhé!`,
      });
      return;
    }
    if (icon.action === "focus-tip") {
      setModal({
        type: "hint",
        text: "Hãy tập trung để ý và nên tìm hết từng cụm icon một trước khi chuyển sang cụm khác nhé!",
      });
      return;
    }
    if (icon.action === "bomb") {
      const outcome = pickBombOutcome(collected.size > 0);
      setModal({ type: "bomb", outcome: outcome.type });
      return;
    }
    if (icon.action === "bomb-clone") {
      // đã có 1 quả đang đếm ngược rồi — bấm thêm không tạo quả thứ 2
      if (bombTimerActive) {
        setModal({
          type: "fun-text",
          emoji: BOMB_CLONE_EMOJI_SET[bombCloneIconIndex],
          text: "Bom đang đếm ngược rồi, không cần bấm nữa đâu 😅",
        });
        return;
      }
      setBombTimerActive(true);
      setBombTimerRemaining(60);
      setDefuseIconVisible(true);
      setDefuseIconIndex(Math.floor(Math.random() * DEFUSE_EMOJI_SET.length));
      clearInterval(bombIntervalRef.current);
      bombIntervalRef.current = setInterval(() => {
        setBombTimerRemaining((s) => Math.max(0, s - 1));
      }, 1000);
      clearTimeout(bombTimeoutRef.current);
      bombTimeoutRef.current = setTimeout(triggerBombExplode, 60 * 1000);
      setModal({ type: "bomb-clone", kind: "start" });
      return;
    }
    if (icon.action === "defuse") {
      // phòng trường hợp bom vừa nổ/vừa được gỡ đúng lúc này (hiếm khi xảy
      // ra vì icon này đã ẩn theo bombTimerActive, nhưng vẫn chốt lại cho chắc)
      if (!bombTimerActive) return;
      setDefuseIconVisible(false);
      clearTimeout(defuseCooldownTimeoutRef.current);
      defuseCooldownTimeoutRef.current = setTimeout(() => {
        setDefuseIconIndex((i) => {
          let next;
          do {
            next = Math.floor(Math.random() * DEFUSE_EMOJI_SET.length);
          } while (next === i && DEFUSE_EMOJI_SET.length > 1);
          return next;
        });
        setDefuseIconVisible(true);
      }, 3000);
      if (Math.random() < 0.5) {
        setBombTimerActive(false);
        clearTimeout(bombTimeoutRef.current);
        clearInterval(bombIntervalRef.current);
        setModal({ type: "bomb-clone", kind: "success" });
      } else {
        setModal({ type: "bomb-clone", kind: "fail" });
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
      // chưa có chìa khoá thì chẳng có gì để mất — coi như 1 icon hên xui
      // bình thường, cho heo ăn để bấm vẫn có tác dụng, giống các trường
      // hợp "đã có rồi" khác trong game
      if (!keyFound) {
        const amount = randomMoneyAmount();
        setPiggyMoney((m) => m + amount);
        setModal({ type: "feed", amount });
        return;
      }
      // đã có chìa khoá rồi thì mới có 50% tỉ lệ dính bẫy và mất nó
      if (Math.random() >= 0.5) {
        setModal({
          type: "fun-text",
          emoji: icon.emoji,
          text: "Hú vía, né được bẫy! 😅",
        });
        return;
      }
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
    if (icon.action === "music-trap") {
      // dùng 1 lần duy nhất — bấm là tự phát nhạc nền + cho heo ăn 30k luôn,
      // không hỏi han gì cả, coi như đã "mua" nhạc rồi nên bật/tắt sau này
      // thoải mái không bị hỏi lại
      setMusicTrapTriggered(true);
      setPiggyMoney((m) => m + 30000);
      setMusicPurchased(true);
      setMusicPlaying(true);
      setModal({ type: "music-trap" });
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
          // horse không có số (chỉ hiện câu đố) — flower thì mỗi lần bấm vào
          // con thật đều random lại số, lấy đúng lần bấm gần nhất
          const value =
            guess.group === "horse" ? undefined : rerollPieceValue(guess.group);
          setModal({
            type: "piece",
            emoji,
            group: guess.group,
            value,
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
        // rắn giữ chìa khoá — bấm là biến mất tạm 4s, bất kể kết quả gì
        if (guess.group === "snake") hideSnakeFor(4000);
        const rewardKey = `${guess.group}-piece`;
        // đã tìm ra mảnh ghép này rồi (biết chắc đây là con thật) thì bấm lại
        // luôn hiện lại mảnh ghép, không hên xui nữa — chỉ random lại SỐ mới
        // mỗi lần bấm, lấy đúng lần bấm gần nhất
        if (group.type === "piece" && collected.has(rewardKey)) {
          setModal({
            type: "piece",
            emoji,
            group: guess.group,
            value: rerollPieceValue(guess.group),
            count: collected.size,
          });
          return;
        }
        // tung ngay lúc bấm, không phụ thuộc bản sao nào cả — nếu trúng
        // mảnh ghép/chìa khoá mà đã có rồi thì coi như cho heo ăn luôn,
        // để bấm lần nào cũng có tác dụng
        const wonSomething = Math.random() < 0.5;
        if (
          wonSomething &&
          group.type === "piece" &&
          !collected.has(rewardKey)
        ) {
          const next = new Set(collected);
          next.add(rewardKey);
          setCollected(next);
          if (next.size === 3) burstHearts();
          setModal({
            type: "piece",
            emoji,
            group: guess.group,
            value: rerollPieceValue(guess.group),
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

  // item tạm thời do "navigate" (con hamster cổng thần bí) kích hoạt ra — bấm
  // trúng nó trong đúng GATE_WINDOW_SECONDS giây mới thực sự tính là tìm thấy cổng
  const handleGateWindowClick = () => {
    if (celebrating) return;
    setGateFound(true);
    clearTimeout(gateWindowTimeoutRef.current);
    clearInterval(gateWindowIntervalRef.current);
    setGateWindowActive(false);
    setModal({ type: "gate-found" });
  };

  // hết 1 phút mà chưa gỡ được bom nhân bản — nhân đôi số lượng mọi item
  // mồi/trang trí đang có trên màn hình: item mồi trong guesses, tiền rời
  // (piggyItems) và mảnh ghép giả (fakePieceItems); có tôn trọng các trần
  // MAX_ITEMS_PER_GROUP/MAX_PIGGY_ITEMS/MAX_FAKE_PIECE_ITEMS sẵn có để
  // tránh phình quá đà. Bấm lại bom nhân bản sau khi nổ vẫn hoạt động bình
  // thường — nếu lại không gỡ kịp thì sẽ nhân đôi tiếp trên số lượng HIỆN
  // CÓ (đã nhân đôi từ lần trước), không giới hạn số lần, chỉ bị chặn bởi
  // các trần ở trên.
  const triggerBombExplode = () => {
    setBombTimerActive(false);
    clearInterval(bombIntervalRef.current);
    setDefuseIconVisible(false);
    setGuesses((prev) => {
      const counts = {};
      prev.forEach((g) => {
        counts[g.group] = (counts[g.group] || 0) + 1;
      });
      const additions = [];
      prev.forEach((g) => {
        // KHÔNG nhân bản item nhiệm vụ thật (mảnh ghép/chìa khoá) — role
        // "win" và "coinflip" là 2 role giữ mảnh ghép/chìa khoá thật của
        // từng nhóm, chỉ nhân bản mấy item mồi/tiền (feedFixed,
        // growFeedRandom, cloneFeedRandom, comboFeedAndGrow, cloneRandomSign)
        if (g.role === "win" || g.role === "coinflip") return;
        if (counts[g.group] >= MAX_ITEMS_PER_GROUP) return;
        additions.push(cloneGuessItem(g));
        counts[g.group] += 1;
      });
      return [...prev, ...additions];
    });
    setPiggyItems((prev) => {
      const room = Math.max(0, MAX_PIGGY_ITEMS - prev.length);
      const toAdd = Math.min(prev.length, room);
      return [
        ...prev,
        ...Array.from({ length: toAdd }, () => makePiggyItem([])),
      ];
    });
    setFakePieceItems((prev) => {
      const room = Math.max(0, MAX_FAKE_PIECE_ITEMS - prev.length);
      const toAdd = Math.min(prev.length, room);
      return [
        ...prev,
        ...Array.from({ length: toAdd }, () => makeFakePieceItem([])),
      ];
    });
    burstBombExplosion();
    setBombShaking(true);
    clearTimeout(bombShakeTimeoutRef.current);
    bombShakeTimeoutRef.current = setTimeout(() => setBombShaking(false), 450);
    setModal({ type: "bomb-clone", kind: "explode" });
  };

  // hiện dialog giống hệt mảnh ghép thần bí số 3 (heart) thật, số 05 cố
  // định để đánh lừa — KHÔNG cộng vào collected, không ảnh hưởng gì cả
  const handleFakePieceClick = () => {
    if (celebrating) return;
    setModal({
      type: "piece",
      emoji: getGroupEmoji("heart", creatureIconIndex),
      group: "heart",
      value: "05",
      count: collected.size,
    });
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
      setResumeYoutubeAfterModal(false);
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
    const wasMusicModal = modal?.type === "music";
    const wasBombMemory = modal?.type === "bomb" && modal.outcome === "memory";
    const wasBombExplode =
      modal?.type === "bomb" && modal.outcome === "explode";
    setModal(null);
    // đóng dialog nhạc 💖 rồi thì cho nhạc nền YouTube (nếu đang tạm dừng
    // vì dialog này) chạy tiếp
    if (wasMusicModal && resumeYoutubeAfterModal) {
      setResumeYoutubeAfterModal(false);
      setMusicPlaying(true);
    }
    // "Trí não tuổi già" — đóng dialog thì icon ☁️ mới loé ra, tự ẩn lại sau
    // đúng 5s (bấm trúng nhiều lần liên tiếp thì tính lại 5s từ lần cuối)
    if (wasBombMemory) {
      setCloudVisible(true);
      clearTimeout(cloudTimeoutRef.current);
      cloudTimeoutRef.current = setTimeout(() => setCloudVisible(false), 5000);
    }
    // "Nổ tung" — mất hết mảnh ghép đã tìm được, reset luôn số flower/heart vì
    // giờ không còn giữ mảnh nào để mà "biết" số nữa. Return sớm ở đây để
    // không dùng `collected` (biến đọc từ closure, chưa cập nhật kịp do
    // setState bất đồng bộ) đi kiểm tra điều kiện ăn mừng bên dưới — tránh
    // pháo hoa/dialog chúc mừng bắn nhầm ngay lúc vừa mất sạch mảnh ghép.
    if (wasBombExplode) {
      setCollected(new Set());
      setFlowerValue(null);
      setHeartValue(null);
      setQuestNotified(false);
      setCelebrating(false);
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
      className={`relative w-full min-h-svh flex flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#2b1330] via-[#3a1240] to-[#1a0f1f] ${bombShaking ? "animate-shake" : ""}`}
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

          <span
            title="Thời gian bắt đầu"
            className="font-semibold tabular-nums shrink-0"
          >
            🕒 {formatClock(finalElapsedSeconds ?? elapsedSeconds)}
          </span>

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

          {/* icon ☁️ log mảnh ghép — KHÔNG hiện mặc định, chỉ loé ra 5s sau
              khi bấm trúng "Trí não tuổi già" từ quả bom 💣 (xem closeModal) */}
          {cloudVisible && (
            <>
              <span className="w-px h-8 bg-rose-200 shrink-0" />
              <button
                type="button"
                title="Xem log số mảnh ghép ở lần bấm gần nhất"
                onClick={() => setModal({ type: "cloud-log" })}
                className="shrink-0 text-lg"
              >
                ☁️
              </button>
            </>
          )}

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

      {/* đồng hồ đếm ngược bom nhân bản — nổi bật ngay giữa màn hình, không
          giấu trong bảng nhiệm vụ, để không ai lỡ quên đang có bom đang chạy */}
      <AnimatePresence>
        {bombTimerActive && (
          <motion.div
            className="fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-2xl bg-black/70 backdrop-blur-sm px-4 py-2 shadow-lg border border-red-400/60"
            initial={{ opacity: 0, y: -16, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, -8, 8, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              💣
            </motion.span>
            <span className="text-red-400 font-bold text-xl tabular-nums tracking-wider">
              {Math.floor(bombTimerRemaining / 60)}:
              {String(bombTimerRemaining % 60).padStart(2, "0")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* đồng hồ đếm ngược xinh xinh của cổng thần bí — hiện ở góc trái
          trên trong lúc item cổng thật đang trôi dạt trên màn hình, để
          người chơi biết còn bao nhiêu giây trước khi nó biến mất */}
      <AnimatePresence>
        {gateWindowActive && (
          <motion.div
            className="fixed top-3 left-3 z-40 flex items-center gap-2 rounded-2xl bg-linear-to-r from-fuchsia-500/90 to-rose-400/90 backdrop-blur-sm px-4 py-2 shadow-lg border border-white/50"
            initial={{ opacity: 0, y: -16, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            >
              🌀
            </motion.span>
            <span className="text-white font-bold text-xl tabular-nums tracking-wider">
              {gateWindowRemaining}s
            </span>
          </motion.div>
        )}
      </AnimatePresence>

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
          // con hamster cổng thần bí chưa tới lượt loé ra (chưa đủ 1 phút)
          if (icon.id === "rabbit" && !gateIconVisible) return null;
          // bẫy nhạc đã dùng rồi — biến mất vĩnh viễn
          if (icon.id === "music-trap" && musicTrapTriggered) return null;
          // bom nhân bản đang đếm ngược — ẩn để không bấm tạo quả thứ 2
          if (icon.id === "bomb-clone" && bombTimerActive) return null;
          // dụng cụ gỡ bom chỉ hiện khi có bom đang đếm ngược VÀ chưa trong lúc
          // ẩn tạm 3s sau lần bấm gần nhất
          if (icon.id === "defuse" && !(bombTimerActive && defuseIconVisible))
            return null;
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
                  {getIconEmoji(icon)}
                </motion.button>
              </motion.div>
            </motion.div>
          );
        })}

      {/* item cổng thần bí tạm thời — chỉ tồn tại GATE_WINDOW_SECONDS giây, trôi dạt và random
          toạ độ y hệt icon thường (xem makeGateWindowItem), cố tình không
          làm nổi bật để hoà lẫn vào đám icon còn lại trên màn hình */}
      {opened && gateWindowActive && gateWindowItem && (
        <motion.div
          className="absolute top-0 left-0 z-30 -ml-4 -mt-4 sm:-ml-5 sm:-mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            animate={{ x: gateWindowItem.x, y: gateWindowItem.y }}
            transition={{
              duration: gateWindowItem.duration,
              delay: gateWindowItem.delay,
              times: gateWindowItem.times,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.button
              type="button"
              aria-label="Mở bất ngờ"
              onClick={handleGateWindowClick}
              className="text-3xl sm:text-4xl drop-shadow-lg outline-none block"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
            >
              {gateWindowItem.emoji}
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* các nhóm đoán "con nào là thật" — mỗi mảnh bí mật có nhiều bản
          giống hệt nhau, chỉ 1 bản trong mỗi nhóm thực sự giữ nó */}
      {opened &&
        guesses.map((guess, i) => {
          // rắn đang trong 4s "biến mất" sau lần bấm gần nhất
          if (guess.group === "snake" && !snakeVisible) return null;
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
                    guess.group === "snake"
                      ? snakeIconIndex
                      : creatureIconIndex,
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

      {/* mảnh ghép "thần bí số 3" GIẢ — nguỵ trang y hệt heart thật, bấm vào
          hiện dialog giống hệt mảnh ghép thật với số 05 để đánh lừa, không
          có tác dụng gì cả. Bom nhân bản hẹn giờ có thể nhân đôi số lượng
          của nhóm này, xem triggerBombExplode. */}
      {opened &&
        fakePieceItems.map((item, i) => {
          const offset = ICONS.length + guesses.length + piggyItems.length + i;
          const heart = heartTargets ? heartTargets[offset] : null;
          return (
            <motion.div
              key={item.id}
              className="absolute top-0 left-0 z-30 -ml-4 -mt-4 sm:-ml-5 sm:-mt-5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
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
                        delay: (offset / heartTargets.length) * 0.6,
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
                  onClick={handleFakePieceClick}
                  className="text-3xl sm:text-4xl drop-shadow-lg outline-none block"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                >
                  {getGroupEmoji("heart", creatureIconIndex)}
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
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-1">
                    Mảnh ghép bí mật
                  </p>
                  <p className="text-fuchsia-500 text-xs font-semibold mb-3">
                    {PIECE_LABELS[modal.group]}
                  </p>
                  {modal.group === "horse" ? (
                    <p className="text-slate-700 text-base font-medium leading-relaxed mb-4">
                      {DATE_PIECES.horse.question}
                    </p>
                  ) : (
                    <p className="font-script text-6xl text-fuchsia-700 mb-4">
                      {modal.value}
                    </p>
                  )}
                  {modal.count < 3 ? (
                    <p className="text-sm text-slate-600">
                      Bạn đã tìm được {modal.count}/3 mảnh ghép rồi đó, tìm nốt
                      những mảnh còn lại nhé!
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Bạn đã tìm đủ 3 mảnh ghép rồi! 💕
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
                      Thật thật giả giả 💕
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
                    Bạn vừa nhặt được một chiếc chìa khoá bí ẩn. Không biết nó
                    mở được gì nhỉ...
                  </p>
                </div>
              )}

              {modal.type === "gate-hint" && (
                <div>
                  <div className="text-4xl mb-2">🌀</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Cổng thần bí xuất hiện!
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    {modal.text}
                  </p>
                </div>
              )}

              {modal.type === "gate-found" && (
                <div>
                  {GATE_GIF && !gateGifError ? (
                    <img
                      src={GATE_GIF}
                      alt="Cổng thần bí"
                      className="w-28 h-28 mx-auto mb-3 rounded-2xl object-cover shadow-md"
                      onError={() => setGateGifError(true)}
                    />
                  ) : (
                    <div className="text-6xl mb-3">🌀</div>
                  )}
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Tìm thấy cổng thần bí
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    Chính xác rồi! Bạn vừa mở được cổng thần bí 🌀
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
                    Bạn vừa cho heo ăn mất{" "}
                    {modal.amount.toLocaleString("vi-VN")}đ rồi 😅
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
                    Bạn vừa cho heo ăn mất{" "}
                    {modal.amount.toLocaleString("vi-VN")}đ rồi 😅
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
                  <p className="text-slate-700 text-lg font-medium leading-relaxed whitespace-pre-line">
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

              {modal.type === "bomb" && (
                <div>
                  <div className="text-4xl mb-2">
                    {modal.outcome === "memory"
                      ? "🧠"
                      : modal.outcome === "explode"
                        ? "💥"
                        : "😇"}
                  </div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    {modal.outcome === "memory"
                      ? "Trí não tuổi già"
                      : modal.outcome === "explode"
                        ? "Nổ tung"
                        : "Boom hiền lành"}
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    {modal.outcome === "memory"
                      ? "Một item nhỏ đã xuất hiện trên màn hình sẽ giúp bạn nhớ lại được những ký ức cũ. Nhanh tay lẹ mắt nhé, nó chỉ tồn tại trong 5s thôi — đừng bỏ lỡ cơ hội này!"
                      : modal.outcome === "explode"
                        ? "Xin chúc mừng bạn, bạn đã mất toàn bộ mảnh ghép rồi 💥"
                        : "Boom hiền lành không chỉ mang lại vận xui mà nó còn mang những giá trị đặc biệt, thử vận may nhá 😇"}
                  </p>
                </div>
              )}

              {modal.type === "bomb-clone" && (
                <div>
                  <div className="text-4xl mb-2">
                    {BOMB_CLONE_MODAL_CONTENT[modal.kind].emoji}
                  </div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    {BOMB_CLONE_MODAL_CONTENT[modal.kind].title}
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    {BOMB_CLONE_MODAL_CONTENT[modal.kind].text}
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

              {modal.type === "cloud-log" && (
                <div>
                  <div className="text-4xl mb-2">☁️</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Log số mảnh ghép
                  </p>
                  <ul className="text-sm text-slate-700 text-left space-y-2 mb-3">
                    <li className="flex items-center justify-between gap-3">
                      <span>{PIECE_LABELS.flower}</span>
                      <span className="font-semibold text-rose-600 shrink-0">
                        {flowerValue ?? "Chưa tìm thấy"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between gap-3">
                      <span>{PIECE_LABELS.heart}</span>
                      <span className="font-semibold text-rose-600 shrink-0">
                        {heartValue ?? "Chưa tìm thấy"}
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {modal.type === "music-confirm" && (
                <div>
                  <div className="text-4xl mb-2">🎵</div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Nghe nhạc nha?
                  </p>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed mb-6">
                    Nghe nhạc 1 chút để thư giãn nhá, mất 1 xíu xíu tiền thui.
                    hihi
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

              {modal.type === "music-trap" && (
                <div>
                  <p className="text-rose-500 text-xs tracking-widest uppercase mb-3">
                    Bẫy nhạc 🎶
                  </p>
                  {!musicTrapGifError ? (
                    <img
                      src={MUSIC_TRAP_GIF}
                      alt="Lêu lêu"
                      className="w-full rounded-2xl shadow-md mb-3"
                      onError={() => setMusicTrapGifError(true)}
                    />
                  ) : (
                    <div className="text-6xl mb-3">🎶</div>
                  )}
                  <p className="text-slate-700 text-lg font-medium leading-relaxed">
                    Lêu lêu vẫn phải mất tiền nghe nhạc
                  </p>
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
