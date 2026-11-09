# API bài đăng (base /api, JWT Bearer). Tên trường chính xác: src/ChoDoCu.Application/Features/Post/DTOs/BaiDangDtos.cs
Lỗi: JSON {status, message, errors}. 400 validate: errors theo trường. 401 chưa đăng nhập. 403 không có quyền (có thể thân rỗng). 404 không thấy. Xử lý theo mã, hiện message tiếng Việt.
trangThai (chuỗi): ChoDuyet, DaDuyet, BiTuChoi, DaAn, DaBan. Ảnh là đường dẫn tương đối "/uploads/x.png".

GET /danh-muc → cây [{id, idDanhMucCha, tenDanhMuc, anhDanhMuc, danhMucCons[]}]
GET /danh-muc/{id}/thuoc-tinh → [{id, tenThuocTinh, kieuDuLieu("LuaChon"|"So"), batBuoc, danhSachLuaChon:[{giaTri, ten, idGiaTriCha}], thuTu, idThuocTinhCha}]
  Thuộc tính có idThuocTinhCha: chỉ hiện lựa chọn có idGiaTriCha == giaTri đã chọn của thuộc tính cha (Dòng xe theo Hãng xe). Giá trị gửi lên luôn là chuỗi giaTri.
POST /bai-dang/tep (multipart, field "file") → {duongDan}. Ảnh jpg/png/webp ≤5MB, video mp4 ≤50MB; tối đa 20 ảnh + 1 video/bài.
Tài khoản mới được miễn phí 3 lượt đăng và 0 lượt đẩy (theo cấu hình `BaiDang`). Thanh toán gói thành công cộng thêm lượt đăng/lượt đẩy theo dịch vụ mua; các lượt này không hết hạn theo thời hạn gói.
POST /bai-dang và PUT /bai-dang/{id}, body: {idDanhMuc, tieuDe?(≤70, trống thì tự sinh), moTa(bắt buộc ≤1500), gia, coThuongLuong, giaChotNhanh, idThanhPho, idPhuongXa, diaChiChiTiet, soDienThoaiLienHe, choPhepChat, danhSachHinhAnh:[{duongDan, laVideo, laAnhBia}], thuocTinhs:[{idThuocTinh, giaTri}]}
  POST → 201 chi tiết bài (id, maTin). Hết lượt đăng → 400. PUT: đổi tiêu đề/giá/danh mục/thuộc tính/ảnh → bài về ChoDuyet; sửa tin BiTuChoi để chuyển về ChoDuyet tốn 1 lượt đăng; các trạng thái ChoDuyet, DaDuyet, DaAn không bị trừ lượt khi sửa. Chỉ đổi mô tả/địa chỉ/liên hệ giữ trạng thái; bài DaBan → 400.
GET /bai-dang/cua-toi?trangThai&keyword&idDanhMuc&sapXep(moiNhat|cuNhat|giaTang|giaGiam|xemNhieu)&page&pageSize(≤50) → {items:[{id, anhBia, tieuDe, giaTien, tenDanhMuc, maTin, ngayDang, khuVuc, luotXem, luotLuu, trangThai, lyDoTuChoi, ngayHetHan, daHetHan}], totalCount, page, pageSize, totalPages}
GET /bai-dang/cua-toi/thong-ke → {theoTrangThai:[{trangThai, soLuong}], tongSo}
GET /bai-dang/{id} → chi tiết (DaDuyet công khai; trạng thái khác chỉ chủ bài/admin, còn lại 404). Response chi tiết có thêm `idDanhMuc`, `idThanhPho`, `idPhuongXa` và `thuocTinhsDeSua:[{idThuocTinh, giaTri}]` để điền form chỉnh sửa; `thuocTinhs` tiếp tục chứa tên hiển thị.
Chủ bài, trả 204: PUT /bai-dang/{id}/an (chỉ DaDuyet) | /hien (chỉ DaAn) | /da-ban (DaDuyet/DaAn) | /huy-dang (chỉ ChoDuyet); DELETE /bai-dang/{id} (xóa mềm); POST /bai-dang/{id}/day-tin (tốn 1 lượt đẩy, chỉ DaDuyet chưa hết hạn); POST /bai-dang/{id}/gia-han (tốn 1 lượt đăng, +30 ngày)
Admin (quyền BaiDang.Duyet):
  GET /bai-dang/cho-duyet?keyword&idDanhMuc&page&pageSize → {items:[{id, maTin, tieuDe, giaTien, anhBia, tenDanhMuc, nguoiDang:{id,ten}, ngayDang, khuVuc}], totalCount, page, pageSize, totalPages}; endpoint này chỉ trả bài ChoDuyet.
  GET /bai-dang/quan-tri?trangThai&keyword&idDanhMuc&page&pageSize → tất cả trạng thái, trừ bài xóa mềm; lọc keyword trong tiêu đề, mã tin, tên và số điện thoại người đăng. Khi lọc ChoDuyet sắp xếp cũ nhất trước, các trường hợp khác mới nhất trước. Response: {items:[{id, maTin, tieuDe, giaTien, coThuongLuong, anhBia, tenDanhMuc, nguoiDang:{id,ten,soDienThoai}, ngayDang, khuVuc, trangThai, lyDoTuChoi}], totalCount, page, pageSize, totalPages}.
  GET /bai-dang/quan-tri/thong-ke → {tongSo, choDuyet, daDuyet, biTuChoi, daAn, daBan, moiHomNay}; moiHomNay là số bài đăng từ 0h hôm nay.
  PUT /bai-dang/{id}/duyet; PUT /bai-dang/{id}/tu-choi body {lyDo} (bắt buộc)
Tìm kiếm công khai: GET /bai-dang?keyword&idDanhMuc&idThanhPho&idPhuongXa&giaTu&giaDen&sapXep(uuTien|moiNhat|giaTang|giaGiam|xemNhieu)&page&pageSize
  `uuTien`: tin của người đăng có gói dịch vụ ThanhCong và NgayHetHan > hiện tại lên trước; tiếp theo NgayDayTin (nếu null dùng NgayDang) giảm dần, rồi id giảm dần. Các kiểu sắp xếp khác giữ tiêu chí chính, sau đó NgayDang và id giảm dần.
  Mỗi phần tử có `anhBia` (ảnh bìa không phải video, nếu thiếu thì ảnh không phải video đầu tiên, sau đó ảnh sản phẩm), `ngayDayTin` (có thể null) và `laTinUuTien` (có gói dịch vụ còn hiệu lực).