// ⚙️ SỬA THÔNG TIN CỦA BẠN Ở ĐÂY
// Toàn bộ nội dung cá nhân hoá của web nằm trong file này.

export const SITE = {
  // Tên 2 người — đổi thành tên thật nhé
  boyName: "Anh",
  girlName: "Em",

  // Mật khẩu dự phòng cho màn Login — CHỈ dùng nếu vào thẳng màn Login mà
  // chưa có mật khẩu nào được tính (trường hợp gần như không xảy ra trong
  // luồng chơi bình thường). Bình thường mật khẩu 6 số của màn Login được
  // GiftScreen tự tính = mảnh ghép 1 (đáp án câu đố ngựa) + mảnh ghép 2
  // (flower) + mảnh ghép thần bí số 3 (heart) ở lần bấm gần nhất của người
  // chơi, xem DATE_PIECES bên dưới và hàm handleQuestContinue trong
  // GiftScreen.jsx.
  password: "18042026",

  // Ngày bắt đầu yêu (hiển thị ở phần cuối)
  startDateLabel: "18 / 04 / 2026",

  // Tiêu đề chính Dành Tặng Người Anh Yêu "một hành trình nhỏ, đầy ắp yêu thương",
  title: "Một hành trình nhỏ, đầy ắp yêu thương",
  subtitle: "vv",
};

// Bài hát phát khi bấm icon 💖 trong hộp quà.
// File nhạc/video nằm trong /public (mp3 hoặc mp4 đều được — thẻ <audio>
// vẫn phát được phần âm thanh của file mp4 bình thường).
export const SONG = {
  title: "EM muốn cùng anh",
  url: "/xinh.mp4",
};

// Ảnh kỷ niệm hiện ra khi bấm icon 💕 trong hộp quà.
// Đặt ảnh vào thư mục /public rồi sửa url bên dưới (ví dụ '/couple.jpg').
export const GALLERY_IMAGE = "/em1.jpg";

// Ảnh GIF hộp quà hiển thị ở màn hình mở đầu. Muốn đổi hộp quà khác thì chỉ
// cần thay link này (nếu lỗi/mất mạng thì app tự hiện icon 🎁 thay thế).
export const GIFT_BOX_GIF =
  "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3V1Z2Q5b2IzaXpnN2NxMWNpbG1pM3l2N3pnd3lmOXBiNHd2bGY1cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/c9CDhz3YCfo2HbhLXs/giphy.gif";

// Ảnh GIF hiện trong dialog chúc mừng khi hoàn thành đủ 3 nhiệm vụ trong
// hộp quà (nếu lỗi/mất mạng thì app tự hiện icon 🎆 thay thế).
export const QUEST_COMPLETE_GIF =
  "https://media.giphy.com/media/SHcflRDy8kNXPoG69U/giphy.gif";

// Ảnh GIF hiện trong dialog khi tìm thấy cổng thần bí 🌀 (nếu lỗi/mất mạng
// thì app tự hiện icon 🌀 thay thế). Để trống thì luôn hiện icon thay thế.
export const GATE_GIF = "https://media.giphy.com/media/atLkXCLfT1dza/giphy.gif";

// Ảnh GIF hiện trong dialog "bẫy nhạc" — icon 1 lần duy nhất, bấm vào tự
// phát nhạc nền + cho heo ăn 30k (nếu lỗi/mất mạng thì app tự hiện icon 🎶
// thay thế).
export const MUSIC_TRAP_GIF =
  "https://media1.tenor.com/m/cF4XC0Afge8AAAAd/nick-wilde-zootopia-2.gif";

// Ảnh GIF cánh cụt chạy, hiện thân cho nhân vật chính trong màn hành trình
// con đường (RoadJourneyScreen/PenguinFigure) — thay cho hình vẽ SVG cũ.
export const PENGUIN_RUN_GIF =
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnY3c2piNjNtdHduYjhwYXFmYjdxZmc2emwxOTR6ejZmc25rbWFzbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ljfGd2E14Ff7uoGEZi/giphy.gif";

// Ảnh GIF hiện trong màn hành trình con đường (RoadJourneyScreen) lúc cánh
// cụt đang nạp năng lượng ở chặng 2 — đổi theo % đã nạp: dưới 50% hiện GIF
// "đói" này, từ 50% trở lên đổi sang FEED_HIGH_GIF bên dưới.
export const FEED_LOW_GIF =
  "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXlzeGs0bXh6enVodWxueXQzMGtxNXd1dGN0d2g5OWtveHBmdmNoYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TUmWjN0waMDqB5KWqu/giphy.gif";

// Ảnh GIF hiện khi đã nạp từ 50% năng lượng trở lên, xem FEED_LOW_GIF ở trên.
export const FEED_HIGH_GIF =
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXlyNWN0amFtdm1yc2Rhd3R1MjlyNmEyc2g1dmwzd3h1ZzhvbGxjeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xvc8R0LCww4Ar4EWH9/giphy.gif";

// Ảnh GIF hiện trong thẻ chúc mừng khi cánh cụt chạy về tới đích ở màn hành
// trình con đường (RoadJourneyScreen).
export const PENGUIN_ARRIVED_GIF =
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2Z2eWs2MjVndGVpdzcxZHg0aWxtOG9hMnozYWQ5b2FndHB4eHR4MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/k8HzeOhBwK2FBEZJph/giphy.gif";

// Ảnh GIF thay cho icon 🏠 đánh dấu điểm xuất phát trên con đường ở
// RoadJourneyScreen.
export const ROAD_START_GIF =
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmQ5dHVsY3RkcTNkNzBzbGpsNHlmOGMwOTJtZGN4bXdoNW4zMHM1aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VbWMhNsm4FlVbn72Fw/giphy.gif";

// Ảnh GIF thay cho icon 🎉 đánh dấu điểm đích trên con đường ở
// RoadJourneyScreen.
export const ROAD_FINISH_GIF = "https://media.giphy.com/media/ZZNBRy31kdbIKyit3N/giphy.gif";

// Ảnh GIF thay cho icon 🍽️ đánh dấu quán ăn (điểm nạp năng lượng ở chặng 2)
// trên con đường ở RoadJourneyScreen.
export const ROAD_RESTAURANT_GIF =
  "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmYyajFnbDdkM2VlZWFhcXQ2NjZ5bjVncGZldjBmN2wwNXc5b2lvZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/N0AwQeMf2FteWn9aHK/giphy.gif";

// Báo qua Telegram cho BẠN khi người chơi tìm đủ 3 mảnh ghép + chìa khoá +
// cổng thần bí trong hộp quà — kèm theo hũ heo đang bao nhiêu tiền và mấy
// phần quà "hên xui" đã trúng mấy lần. Để trống thì app không gửi gì cả.
//
// Lưu ý: đây vẫn là site tĩnh (không có backend), nên giá trị bên dưới rốt
// cuộc vẫn nằm trong file JS build ra — ai mở DevTools trên trang đã deploy
// đều xem được, chứ không "giấu" được. Nếu lo bị lộ/spam thì thu hồi token
// qua @BotFather rồi tạo bot mới.
export const TELEGRAM = {
  botToken: "8960445085:AAFGADjCvbTzoFucuCu_xShqvLxmrf0SKvk",
  chatId: "973326869",
};

// Trang "Coming Soon" hiện ra sau khi người chơi hoàn thành hết nhiệm vụ
// trong hộp quà (3 mảnh ghép + chìa khoá + cổng thần bí) và bấm "Đi tiếp".
// targetDate là mốc đếm ngược — sửa lại cho đúng ngày bạn muốn.
export const COMING_SOON = {
  targetDate: "2026-10-16T00:00:00",
  title: "Điều Bất Ngờ Đang Đến...",
  subtitle: "Hãy chờ đợi nhé 💕",
};

// 3 mảnh ghép bí mật, hiện ra khi tìm thấy icon 🐴🌸❤️ trong hộp quà — đánh số
// thứ tự 1/2/3 (ngựa/hoa/tim) để người chơi biết cách ghép đúng thứ tự dù tìm
// thấy không theo thứ tự đó.
// Lưu ý: mỗi icon (ngựa/hoa/tim) đều xuất hiện dưới dạng nhiều icon giống hệt
// nhau, chỉ 1 con thật sự giữ mảnh ghép — đoán sai có thể khiến nó nhân bản thêm.
//
// - horse (mảnh ghép số 1): KHÔNG hiện số cho người chơi thấy, chỉ hiện câu
//   đố `question`; đáp án đúng luôn cố định là `answer` (giữ bí mật).
// - flower (mảnh ghép số 2) và heart (mảnh ghép thần bí số 3): mỗi lần người
//   chơi bấm vào mảnh ghép THẬT (kể cả bấm lại nhiều lần) đều ngẫu nhiên lại
//   1 trong các số bên dưới — chia đều tỉ lệ theo số lượng ứng viên (flower
//   2 số nên 50/50, heart 3 số nên ~33% mỗi số) — số ở LẦN BẤM GẦN NHẤT mới
//   là số dùng làm mật khẩu (xem icon ☁️ trong bảng nhiệm vụ để xem lại số
//   gần nhất).
export const DATE_PIECES = {
  horse: {
    question:
      "Khi chị 8 tuổi, em mới bằng một nửa tuổi của chị. Vậy đến khi chị 22 tuổi, em sẽ bao nhiêu tuổi?",
    answer: "18",
  },
  flower: ["10", "04"],
  heart: ["95", "26", "01"],
};

// Những lời nhắn nhỏ hiện ra khi bấm các icon còn lại (🐶🦋🍀🌙) trong hộp quà.
export const LOVE_NOTES = [
  "Cảm ơn vì đã xuất hiện và làm cuộc sống của anh rực rỡ hơn mỗi ngày 💌",
  "Dù có bao nhiêu chuyện xảy ra, được nắm tay em vẫn luôn là điều làm anh hạnh phúc nhất.",
  "Yêu cả những lúc em cười khờ khạo lẫn những lúc càu nhàu vô lý 🥰",
  "Cảm ơn vì đã kiên nhẫn với anhs uốt thời gian qua, mình cùng cố gắng nhiều hơn nữa nhé.",
  "Mỗi ngày bên em đều là một kỷ niệm mà anh muốn giữ mãi.",
  "Không cần điều gì to tát, chỉ cần có em ở đây là đủ làm anh hạnh phúc rồi.",
  "Cảm ơn vì đã chọn anh, và anh cũng sẽ luôn chọn emm, ở mọi phiên bản của cuộc đời này 💍",
];

// Những câu nói vui hiện ra khi bấm trúng các icon "hên xui" (con vật, món ăn,
// bánh...) trong hộp quà. Thêm/bớt/sửa thoải mái cho hợp "chất" hai đứa.
export const FUN_TEXTS = [
  "Ú oà, không có gì đâu 😆",
  "Vận may chưa tới, thử icon khác xem nhé 🍀",
  "Sang năm lấy chồng/lấy vợ nhé 😏💍",
  "Hôm nay đẹp trai xinh gái nhất nhà 😎",
  "Chúc mừng bạn vừa lãng phí một cú click 🤣",
  "Trúng thưởng... một cái ôm ảo 🤗",
  "Hẹn gặp lại ở icon tiếp theo nha 👋",
  "Tình yêu này bền như con gấu bông 🧸",
  "Cấm cười mà lại cười rồi đó 😂",
  "Đủ duyên đủ số mới bấm trúng dòng này 😌",
];

// Ảnh GIF dễ thương hiện ra khi bấm trúng một số icon "hên xui".
// Đặt file .gif vào thư mục /public rồi thêm đường dẫn vào đây (ví dụ '/fun/cat.gif').
// Để trống hoặc file không tồn tại thì app tự hiện một icon động dễ thương thay thế.
export const FUN_GIFS = [];

// Mỗi bậc thang = 1 tháng yêu nhau. Sửa lại nội dung cho đúng kỷ niệm của bạn.
export const MEMORIES = [
  {
    month: 1,
    title: "Tháng đầu tiên",
    date: "Tháng 1",
    text: 'Ngày đầu tiên mình quen nhau, mọi thứ còn ngại ngùng nhưng đầy háo hức. Cảm ơn vì đã bấm nút "đồng ý" hôm đó.',
    emoji: "🌱",
  },
  {
    month: 2,
    title: "Lần đầu nắm tay",
    date: "Tháng 2",
    text: "Bàn tay run run nhưng lại vừa khít với nhau. Từ đó mình luôn có một người để nắm tay đi qua mọi con đường.",
    emoji: "🤝",
  },
  {
    month: 3,
    title: "Chuyến đi đáng nhớ",
    date: "Tháng 3",
    text: "Chuyến đi chơi đầu tiên của hai đứa, cười muốn xỉu vì những trò lố của nhau. Kỷ niệm này chắc chẳng bao giờ quên.",
    emoji: "🚗",
  },
  {
    month: 4,
    title: "Giận hờn rồi làm hoà",
    date: "Tháng 4",
    text: "Lần đầu giận nhau, tưởng đâu to chuyện lắm, ai ngờ chỉ cần một câu xin lỗi và một cái ôm là hết giận ngay.",
    emoji: "🌧️",
  },
  {
    month: 5,
    title: "Những cuộc gọi đêm khuya",
    date: "Tháng 5",
    text: "Dù bận đến mấy cũng ráng gọi cho nhau mỗi tối. Chỉ cần nghe giọng nói là mọi mệt mỏi đều tan biến.",
    emoji: "📞",
  },
  {
    month: 6,
    title: "6 tháng bên nhau",
    date: "Tháng 6",
    text: "Nửa năm đã trôi qua thật nhanh. Cảm ơn vì đã luôn ở bên, cùng nắm tay đi tiếp thật nhiều chặng đường nữa nhé!",
    emoji: "💍",
  },
];


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
const CREATURE_DISGUISE_SETS = {
  horse: ["🐮", "🦏", "🐗", "🦌", "🐐"],
  flower: ["🌼", "🦃", "🐫", "💐", "🌾"],
  heart: ["🧡", "🦁", "🐶", "🐓", "🐉"],
  snake: ["🐣", "🐊", "🦖"], // chìa khóa
};
const GATE_EMOJI_SET = ["🐹", "🦝", "🦡", "🐿️", "🐌"];