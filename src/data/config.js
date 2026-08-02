// ⚙️ SỬA THÔNG TIN CỦA BẠN Ở ĐÂY
// Toàn bộ nội dung cá nhân hoá của web nằm trong file này.

export const SITE = {
  // Tên 2 người — đổi thành tên thật nhé
  boyName: "Anh",
  girlName: "Em",

  // Mật khẩu để mở khoá màn hình đăng nhập (chỉ gồm số)
  password: "18042026",

  // Ngày bắt đầu yêu (hiển thị ở phần cuối)
  startDateLabel: "18 / 04 / 2026",

  // Tiêu đề chính
  title: "Dành Tặng Người Anh Yêu",
  subtitle: "một hành trình nhỏ, đầy ắp yêu thương",
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

// 3 con số bí mật ghép lại thành ngày yêu nhau, hiện ra khi tìm thấy icon 🐴🌸❤️ trong hộp quà.
// Lưu ý: mỗi icon (ngựa/hoa/tim) đều xuất hiện dưới dạng 3 icon giống hệt nhau,
// chỉ 1 con thật sự giữ con số — đoán sai có thể khiến nó nhân bản thêm.
export const DATE_PIECES = {
  horse: "26",
  flower: "18",
  heart: "04",
};

// Những lời nhắn nhỏ hiện ra khi bấm các icon còn lại (🐶🦋🍀🌙) trong hộp quà.
export const LOVE_NOTES = [
  "Cảm ơn vì đã xuất hiện và làm cuộc sống của anh rực rỡ hơn mỗi ngày 💌",
  "Dù có bao nhiêu chuyện xảy ra, được nắm tay em vẫn luôn là điều làm anh hạnh phúc nhất.",
  "Yêu cả những lúc em cười khờ khạo lẫn những lúc càu nhàu vô lý 🥰",
  "Cảm ơn vì đã kiên nhẫn với anhsuốt thời gian qua, mình cùng cố gắng nhiều hơn nữa nhé.",
  "Mỗi ngày bên em đều là một kỷ niệm mà anhmuốn giữ mãi.",
  "Không cần điều gì to tát, chỉ cần có em ở đây là đủ làm anh/em hạnh phúc rồi.",
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
