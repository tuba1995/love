# Hướng dẫn chơi — Màn tìm mảnh ghép (GiftScreen)

> Tài liệu nội bộ (dev), không phải nội dung hiển thị trong app. Dùng để nhớ lại cơ chế game và tra "đáp án" khi cần test.

## 1. Mục tiêu

Người chơi cần thu thập đủ 3 thứ để mở khoá màn tiếp theo:

- 🧩 **3 mảnh ghép** (mảnh ghép số 1, số 2, mảnh ghép thần bí số 3)
- 🗝️ **1 chìa khoá vàng**
- 🌀 **1 lần mở cổng thần bí**

Tiến độ hiện liên tục ở khung góc phải trên màn hình: `🧩 x/3` `🗝️ x/1` `🌀 x/1`. Đủ cả 3 → tự động bắn pháo hoa, mọi icon bay về xếp hình trái tim, rồi hiện dialog "Hoàn thành nhiệm vụ" kèm nút **Đi tiếp**.

## 2. Mật khẩu màn Login được tính thế nào

```
password = [đáp án câu đố Ngựa] + [số mảnh ghép Hoa — lần bấm gần nhất] + [số mảnh ghép Tim — lần bấm gần nhất]
```

⚠️ Mảnh ghép Hoa và Tim **random lại số mỗi lần bấm vào con thật** — chỉ số ở **lần bấm gần nhất** mới được dùng để tính mật khẩu. Nếu bấm lại mảnh đã có sau khi random ra số khác, mật khẩu sẽ đổi theo. Icon ☁️ (chỉ hiện tạm 10s sau khi trúng kết quả "Trí não tuổi già" của quả bom 💣) cho xem lại số ở lần bấm gần nhất của cả 2 mảnh.

### Đáp án hiện tại (spoiler)

| Mảnh ghép | Giá trị |
|---|---|
| Số 1 — câu đố Ngựa (cố định) | `18` |
| Số 2 — Hoa (random 1 trong 2 số) | `10` hoặc `04` |
| Thần bí số 3 — Tim (random 1 trong 3 số) | `95`, `26` hoặc `01` |

Chỉnh sửa tại `src/data/config.js` → `DATE_PIECES`.

## 3. 4 cụm icon nguỵ trang giữ mảnh ghép / chìa khoá

Đây là phần quan trọng nhất. Mỗi cụm có **nhiều bản sao giống hệt nhau** trôi nổi khắp màn hình — chỉ **1 bản duy nhất** trong mỗi cụm là "con thật" giữ mảnh ghép/chìa khoá, các bản còn lại là mồi/bẫy. Cả cụm đổi lốt (hình dạng) đồng loạt theo chu kỳ để không thể học thuộc "hình nào an toàn".

### 🐮 Cụm Ngựa — Mảnh ghép số 1
Đổi lốt mỗi phút: 🐮 → 🦏 → 🐗 → 🦌 → 🐐

| Bản trong cụm | Bấm trúng thì |
|---|---|
| Con thật (1 bản, giữ 1 id cố định để hệ thống nhận ra, nhưng vẫn trôi nổi ngẫu nhiên như icon khác) | Nhận **Mảnh ghép số 1** — chỉ hiện câu đố, không hiện số |
| Con "cho ăn" | Cộng ngẫu nhiên 1.000–20.000đ vào hũ heo |
| Con "sinh sản" | KHÔNG cho tiền ngay — chỉ đẻ thêm 1 bản sao mới trên màn hình; phải tìm và bấm vào bản sao đó mới được cho ăn |

### 🌼 Cụm Hoa — Mảnh ghép số 2
Đổi lốt mỗi phút: 🌼 → 🦃 → 🐫 → 💐 → 🌾

| Bản trong cụm | Bấm trúng thì |
|---|---|
| Con thật | Nhận **Mảnh ghép số 2**, số random lại mỗi lần bấm (2 ứng viên, ~50/50) |
| Con combo | Cộng/trừ tiền ngẫu nhiên ngay lập tức, **và** đẻ thêm 1 bản sao "50/50 cộng hoặc trừ tiền" |

### 🧡 Cụm Tim — Mảnh ghép thần bí số 3
Đổi lốt mỗi phút: 🧡 → 🦁 → 🐶 → 🐓 → 🐉

- Chỉ có **1 bản duy nhất** (kiểu tung đồng xu): mỗi lần bấm 50% ra mảnh ghép (chỉ tính lần đầu tiên), 50% cho heo ăn tiền ngẫu nhiên.
- Nếu đã có mảnh ghép này rồi, bấm tiếp vào nó **không hên xui nữa** — luôn hiện lại mảnh ghép, chỉ random số mới.
- ⚠️ **Có hàng giả**: 1 icon dùng chung hình dạng và nhịp đổi lốt y hệt cụm Tim thật, nhưng bấm vào chỉ hiện số `05` giả, không tính vào tiến độ, không có tác dụng gì. Không phân biệt được bằng mắt — chỉ biết "thật" khi số 🧩 ở góc phải trên tăng lên sau khi bấm.

### 🐣 Cụm Rắn — Chìa khoá vàng 🗝️
Đổi lốt riêng, mỗi 20 giây: 🐣 → 🐊 → 🦖

- Chỉ có 1 bản (tung đồng xu 50/50 như cụm Tim): trúng thì nhận chìa khoá (chỉ tính lần đầu), trật thì cho ăn tiền.
- Bấm vào là biến mất tạm 4 giây (né bấm liên tục ăn may).
- ⚠️ Có thể **mất lại chìa khoá** sau khi đã tìm được — xem "Hộp bẫy nguy hiểm 🚨" ở mục 5.

## 4. 🌀 Cổng thần bí — 2 cách tìm

**Cách 1 — Con hamster 🐹:**
1. Chỉ xuất hiện **sau 1 phút** kể từ lúc bắt đầu chơi (không có ngay từ đầu).
2. Đổi lốt mỗi 20 giây: 🐹 → 🦝 → 🦡 → 🐿️ → 🐌 — đứng lẫn trong đám icon thường, không có gì đặc biệt để nhận ra.
3. Bấm vào: **50%** kích hoạt cổng thành công → sinh ra 1 item **tạm thời** (dùng chung bộ icon trên), trôi nổi trên màn hình và **chỉ tồn tại đúng 25 giây**. Phải tìm và bấm trúng ĐÚNG item này trong 25s mới thực sự tính là tìm thấy cổng (`🌀 1/1`). Hết 25s chưa bấm trúng thì phải quay lại tìm con hamster thử lại.
4. **50%** còn lại là trật → con hamster biến mất 10 giây rồi loé lại bằng icon khác trong bộ.

**Cách 2 — Hộp quà bí ẩn 🎲:** 3% mỗi lần bấm ra thẳng "Cổng thần bí đã mở" luôn (nếu chưa có), bỏ qua hẳn bước chờ 25 giây.

## 5. 🎲 Hộp quà bí ẩn — vòng quay may rủi

Icon 🎲 cố định (không đổi lốt). Mỗi lần bấm là 1 lượt quay:

- **4%** ra "Chìa khoá vàng" luôn (nếu chưa có)
- **3%** ra "Cổng thần bí đã mở" luôn (nếu chưa có)
- **7%** ra "Linh vật may mắn" (chỉ vui mắt, không tác dụng gì)
- Phần còn lại chia theo trọng số cho: 1 trong 5 "nhiệm vụ ngoài đời" (được tặng đồ uống / làm video ca nhạc / làm món ăn / được mua đồ dưới 200k / mua cafe muối cho người yêu), cộng hoặc trừ tiền hũ heo ngẫu nhiên, 1 mẹo chơi, hoặc rỗng không có gì (2 kiểu rỗng, trọng số cao nhất trong vòng quay).

## 6. Icon phụ khác (không liên quan mảnh ghép/chìa khoá/cổng)

| Icon | Tác dụng |
|---|---|
| 🔦 | Gợi ý may rủi: có thể hiện gợi ý cố định (nhắc về cơ chế cụm Tim), cho ăn, bị trừ tiền, hoặc 1 câu vui ngẫu nhiên |
| 🕰️ | Luôn nhắc cố định: "cổng thần bí chỉ tồn tại 25 giây" |
| 🔍 | Luôn nhắc cố định: nên tìm hết từng cụm icon một trước khi qua cụm khác |
| 💣 | Bom đen — quay 3 kết quả (~33% mỗi loại): hiện icon ☁️ log lại số 2 mảnh ghép gần nhất (10s) / **mất hết mảnh ghép đã có** (chỉ xảy ra nếu đang giữ ≥1 mảnh) / vô hại |
| 🧨 (đổi lốt ⏰🌪️🎆🌋, mỗi 15s) | Bom nhân bản hẹn giờ — bấm kích hoạt đếm ngược 60 giây; hết giờ mà chưa gỡ thì **mọi item mồi/tiền/mảnh giả đang có trên màn hình nhân đôi số lượng** (không đụng tới mảnh ghép/chìa khoá thật) |
| 🪚 (đổi lốt ❤️🔨🗜️🚒🔩) | Dụng cụ gỡ bom — chỉ hiện khi bom đang đếm ngược; bấm có 50% gỡ thành công (huỷ đếm ngược) |
| 🚨 (đổi lốt ☠️🕷️, mỗi 20s) | Hộp bẫy nguy hiểm — **chưa có chìa khoá**: vô hại, chỉ cho ăn tiền. **Đã có chìa khoá**: 50% né được, 50% dính bẫy → **mất luôn chìa khoá** vừa tìm, phải tìm lại từ đầu |
| 🎷 (đổi lốt 🎺🦉, mỗi 25s) | Bẫy nhạc — dùng được **đúng 1 lần** trong cả ván, bấm là tự bật nhạc nền + cộng thẳng 30.000đ, biến mất vĩnh viễn sau đó |
| 🎹 | Mở nghe 1 bài nhạc kỷ niệm |
| 💞 | Xem 1 tấm ảnh kỷ niệm |
| 🐱 | Luôn mở 1 lá thư tình cố định (lá thư số 1) |
| 🐝 | Luôn mở 1 lá thư tình cố định (lá thư số 2) |
| 🐼 🐨 🐣(gà con) 🦢 | Luôn cho heo ăn ngẫu nhiên 1.000–30.000đ mỗi lần bấm, không mất đi sau khi bấm |
| 💝 🌷 | Giữ 2 nửa "ngày kỷ niệm của hai đứa" — bấm đủ cả 2 icon (không cần đúng thứ tự) có hiệu ứng hoa tim nhỏ mừng, chỉ là easter egg, không liên quan đến mật khẩu hay 3 nhiệm vụ chính |

## 7. Hũ heo 🐷 & tiền rời

- Tiền rời (🧧💰🧿🔔🎊, đổi lốt mỗi 2 phút) là nhóm icon riêng, tách biệt hoàn toàn khỏi 4 cụm mảnh ghép: bấm vào 50/50 cộng/trừ tiền; mỗi lần ra dương lại tự sinh thêm 1 đồng mới trên màn hình (tối đa 30 đồng cùng lúc, không giới hạn số lần bấm).
- Bấm **chuột phải** vào icon hũ heo (góc phải trên) → cộng thẳng 1 khoản tiền ngẫu nhiên (easter egg nhỏ, chú thích ngay trên nút).
- Số dư hũ heo chỉ mang tính vui/thống kê (xem lại qua nút 📊), không ảnh hưởng gì đến việc mở khoá 3 nhiệm vụ chính hay mật khẩu.

## 8. Sau khi hoàn thành đủ 3 nhiệm vụ

1. Dialog "Hoàn thành nhiệm vụ" hiện ra kèm nút **Đi tiếp**.
2. Bấm **Đi tiếp**: hệ thống tính mật khẩu 6 số (mục 2), gửi thống kê ván chơi qua Telegram nếu đã cấu hình `TELEGRAM.botToken`/`chatId` trong `config.js`, rồi chuyển sang màn Login.
3. Màn Login yêu cầu nhập đúng mật khẩu 6 số vừa tính — sai tối đa 3 lần sẽ bị "tự huỷ", xoá tiến trình và quay lại từ đầu màn tìm mảnh ghép.

## 9. Vị trí chỉnh sửa liên quan trong code

- `src/data/config.js` → `DATE_PIECES`: câu đố + đáp án của 3 mảnh ghép.
- `src/components/GiftScreen.jsx`:
  - `ICONS` — danh sách icon phụ tĩnh (thư, ảnh, nhạc, hộp bí ẩn, bẫy...).
  - `CREATURE_GROUPS` / `CREATURE_DISGUISE_SETS` — 4 cụm giữ mảnh ghép/chìa khoá + bộ icon nguỵ trang của từng cụm.
  - `KEY_CHANCE` / `GATE_CHANCE` / `MASCOT_CHANCE` — tỉ lệ tuyệt đối của hộp quà bí ẩn.
  - `MYSTERY_BOX_OUTCOMES` / `BOMB_OUTCOMES` / `HINT_OUTCOMES` — các bảng trọng số may rủi.
  - `GATE_WINDOW_SECONDS` — thời gian tồn tại của cổng thần bí sau khi kích hoạt (hiện tại 25s).
