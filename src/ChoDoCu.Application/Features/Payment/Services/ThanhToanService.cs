using ChoDoCu.Application.Features.Payment.DTOs;
using ChoDoCu.Application.Features.Payment.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;

namespace ChoDoCu.Application.Features.Payment.Services;

public class ThanhToanService : IThanhToanService
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<MuaDichVuRequest> _validator;
    private readonly IReadOnlyList<IPaymentGateway> _gateways;

    public ThanhToanService(
        IUnitOfWork uow,
        IValidator<MuaDichVuRequest> validator,
        IEnumerable<IPaymentGateway> gateways)
    {
        _uow = uow;
        _validator = validator;
        _gateways = gateways.ToList();
    }

    public async Task<List<PhuongThucThanhToanResponse>> LayPhuongThucThanhToanAsync()
    {
        var danhSach = await _uow.PhuongThucThanhToans.LayDanhSachHoatDongAsync();

        return danhSach
            .Select(x => new PhuongThucThanhToanResponse(
                x.Id,
                x.TenPhuongThuc,
                x.MoTa))
            .ToList();
    }

    public async Task<MuaDichVuResponse> MuaDichVuAsync(
        int idNguoiDung,
        MuaDichVuRequest request,
        string ipAddress)
    {
        // Kiểm tra đầu vào, dịch vụ, phương thức thanh toán và chọn gateway đã đăng ký.
        await _validator.ValidateAndThrowAsync(request);

        var dichVu = await _uow.DichVus.GetByIdAsync(request.IdDichVu)
            ?? throw new NotFoundException(nameof(DichVu), request.IdDichVu);
        if (dichVu.TrangThai != "HoatDong")
            throw new DomainException("Dịch vụ hiện không khả dụng.");
        if (dichVu.Gia <= 0 || decimal.Truncate(dichVu.Gia) != dichVu.Gia)
            throw new DomainException("Giá dịch vụ phải là số nguyên dương theo đơn vị VND.");

        var phuongThuc = await _uow.PhuongThucThanhToans.GetByIdAsync(request.IdPhuongThucTT)
            ?? throw new NotFoundException(nameof(PhuongThucThanhToan), request.IdPhuongThucTT);
        if (phuongThuc.TrangThai != "HoatDong")
            throw new DomainException("Phương thức thanh toán hiện không khả dụng.");

        var gateway = _gateways.FirstOrDefault(x =>
            string.Equals(x.TenPhuongThuc, phuongThuc.TenPhuongThuc, StringComparison.OrdinalIgnoreCase))
            ?? throw new DomainException("Phương thức thanh toán này chưa được tích hợp.");

        // Tạo giao dịch chờ xử lý gắn với người dùng và gói dịch vụ đã chọn.
        var thanhToan = new ThanhToan
        {
            MuaDichVu = new MuaDichVu
            {
                IdDichVu = dichVu.Id,
                IdNguoiDung = idNguoiDung,
                DichVu = dichVu
            },
            IdPhuongThucTT = phuongThuc.Id,
            MaGiaoDichNgoai = $"CDC-{Guid.NewGuid():N}",
            TongTien = dichVu.Gia,
            TrangThai = TrangThaiThanhToan.ChoXuLy
        };

        // Lưu giao dịch trước khi gọi cổng để IPN đến sớm vẫn tìm thấy mã giao dịch trong DB.
        await _uow.ThanhToans.AddAsync(thanhToan);
        await _uow.SaveChangesAsync();

        var urlThanhToan = await gateway.TaoUrlThanhToanAsync(
            new TaoLienKetThanhToanRequest(
                thanhToan.Id,
                thanhToan.MaGiaoDichNgoai!,
                thanhToan.TongTien,
                $"Thanh toan goi dich vu {dichVu.TenDichVu}",
                ipAddress));

        return new MuaDichVuResponse(
            thanhToan.IdMuaDichVu,
            thanhToan.Id,
            thanhToan.MaGiaoDichNgoai!,
            dichVu.TenDichVu,
            thanhToan.TongTien,
            thanhToan.TrangThai.ToString(),
            urlThanhToan,
            thanhToan.NgayTao);
    }

    public async Task<List<LichSuMuaDichVuResponse>> LichSuMuaDichVuAsync(int idNguoiDung)
    {
        // Chỉ truy vấn các lần mua thuộc người dùng hiện tại rồi ánh xạ sang DTO lịch sử.
        var purchases = await _uow.MuaDichVus.LichSuTheoNguoiDungAsync(idNguoiDung);

        return purchases.Select(x => new LichSuMuaDichVuResponse(
            x.Id,
            x.IdDichVu,
            x.DichVu.TenDichVu,
            x.DichVu.Gia,
            x.DichVu.ThoiGianDichVu,
            x.NgayMua,
            x.NgayHetHan,
            x.TrangThai.ToString(),
            x.ThanhToans
                .OrderByDescending(t => t.NgayTao)
                .Select(t => new ThanhToanLichSuResponse(
                    t.Id,
                    t.TongTien,
                    t.TrangThai.ToString(),
                    t.MaGiaoDichCongTT,
                    t.NgayTao,
                    t.NgayThanhToan))
                .ToList()))
            .ToList();
    }

    public async Task<ThanhToanTrangThaiResponse> TrangThaiAsync(int idNguoiDung, int idThanhToan)
    {
        // Truy vấn có ràng buộc chủ sở hữu để người dùng không xem giao dịch của người khác.
        var thanhToan = await _uow.ThanhToans.GetCuaNguoiDungAsync(idThanhToan, idNguoiDung)
            ?? throw new NotFoundException(nameof(ThanhToan), idThanhToan);

        return new ThanhToanTrangThaiResponse(
            thanhToan.Id,
            thanhToan.TrangThai.ToString(),
            thanhToan.TongTien,
            thanhToan.NgayTao,
            thanhToan.NgayThanhToan);
    }

    public async Task XuLyCallbackAsync(string tenNhaCungCap, IReadOnlyDictionary<string, string> thamSo)
    {
        // Xác định gateway và xác thực callback trước khi dùng dữ liệu để tìm giao dịch nội bộ.
        var gateway = _gateways.FirstOrDefault(x =>
            string.Equals(x.TenPhuongThuc, tenNhaCungCap, StringComparison.OrdinalIgnoreCase))
            ?? throw new DomainException("Cổng thanh toán không được hỗ trợ.");

        var ketQua = gateway.XacThucCallback(thamSo);
        var thanhToan = await _uow.ThanhToans.GetKemMuaDichVuTheoMaNgoaiAsync(ketQua.MaGiaoDich)
            ?? throw new NotFoundException(nameof(ThanhToan), ketQua.MaGiaoDich);

        // Đối chiếu cổng và số tiền với giao dịch đã lưu để ngăn callback sai đơn/sai giá trị.
        if (!string.Equals(
                thanhToan.PhuongThucTT.TenPhuongThuc,
                gateway.TenPhuongThuc,
                StringComparison.OrdinalIgnoreCase))
            throw new DomainException("Phương thức thanh toán không khớp giao dịch.");

        if (thanhToan.TongTien != ketQua.SoTien)
            throw new DomainException("Số tiền thanh toán không khớp.");

        // Gateway có thể gửi lại IPN; giao dịch đã kết thúc không bị ghi đè lần nữa.
        if (thanhToan.TrangThai != TrangThaiThanhToan.ChoXuLy)
            return;

        thanhToan.MaGiaoDichCongTT = ketQua.MaGiaoDichCongTT;
        thanhToan.MaPhanHoiCongTT = ketQua.MaPhanHoiCongTT;

        // Ghi nhận callback thất bại và lưu kết quả để lịch sử thanh toán phản ánh đúng trạng thái.
        if (!ketQua.ThanhCong)
        {
            thanhToan.TrangThai = TrangThaiThanhToan.ThatBai;
            thanhToan.MuaDichVu.TrangThai = TrangThaiThanhToan.ThatBai;
            await _uow.SaveChangesAsync();
            return;
        }

        // Giao dịch thành công: ghi thời điểm, kích hoạt gói dịch vụ và lưu cùng một lần.
        thanhToan.TrangThai = TrangThaiThanhToan.ThanhCong;
        thanhToan.NgayThanhToan = ketQua.NgayThanhToan ?? DateTime.Now;
        thanhToan.MuaDichVu.KichHoat();
        await _uow.SaveChangesAsync();
    }
}
