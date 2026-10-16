using ChoDoCu.Application.Features.Payment.DTOs;
using ChoDoCu.Application.Features.Payment.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;
using ChoDoCu.Application.Features.Notification.Interfaces;

namespace ChoDoCu.Application.Features.Payment.Services;

public class ThanhToanService : IThanhToanService
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<MuaDichVuRequest> _validator;
    private readonly IThongBaoService _thongBaoService;

    public ThanhToanService(
        IUnitOfWork uow,
        IValidator<MuaDichVuRequest> validator,
        IThongBaoService thongBaoService)
    {
        _uow = uow;
        _validator = validator;
        _thongBaoService = thongBaoService;
    }


    public async Task<MuaDichVuResponse> MuaDichVuAsync(int idNguoiDung, MuaDichVuRequest request)
    {
        await _validator.ValidateAndThrowAsync(request);

        var dichVu = await _uow.DichVus.GetByIdAsync(request.IdDichVu)
            ?? throw new NotFoundException(nameof(DichVu), request.IdDichVu);
        if (dichVu.TrangThai != "HoatDong")
            throw new DomainException("Dịch vụ hiện không khả dụng.");

        var phuongThuc = await _uow.PhuongThucThanhToans.GetByIdAsync(request.IdPhuongThucTT)
            ?? throw new NotFoundException(nameof(PhuongThucThanhToan), request.IdPhuongThucTT);
        if (phuongThuc.TrangThai != "HoatDong")
            throw new DomainException("Phương thức thanh toán hiện không khả dụng.");

        var thanhToan = new ThanhToan
        {
            MuaDichVu = new MuaDichVu { IdDichVu = dichVu.Id, IdNguoiDung = idNguoiDung, DichVu = dichVu },
            IdPhuongThucTT = phuongThuc.Id,
            TongTien = dichVu.Gia,
            TrangThai = TrangThaiThanhToan.ChoXuLy
        };

        await _uow.ThanhToans.AddAsync(thanhToan);   // thêm cả MuaDichVu, lưu 1 lần = 1 transaction
        await _uow.SaveChangesAsync();

        return new MuaDichVuResponse(thanhToan.IdMuaDichVu, thanhToan.Id, dichVu.TenDichVu,
            thanhToan.TongTien, thanhToan.TrangThai.ToString(), thanhToan.NgayTao);
    }


    public async Task XacNhanAsync(XacNhanThanhToanRequest request)
    {
        var thanhToan = await _uow.ThanhToans.GetByIdAsync(request.IdThanhToan)
            ?? throw new NotFoundException(
                nameof(ThanhToan), request.IdThanhToan);

        if (thanhToan.TrangThai != TrangThaiThanhToan.ChoXuLy)
            throw new DomainException(
                "Phiếu thanh toán này đã được xử lý.");

        // Thanh toán thất bại: cập nhật trạng thái, không gửi thông báo thành công.
        if (!request.ThanhCong)
        {
            thanhToan.TrangThai = TrangThaiThanhToan.ThatBai;
            await _uow.SaveChangesAsync();
            return;
        }

        var muaDichVu = await _uow.MuaDichVus
            .GetKemDichVuAsync(thanhToan.IdMuaDichVu)
            ?? throw new NotFoundException(
                nameof(MuaDichVu), thanhToan.IdMuaDichVu);

        thanhToan.TrangThai = TrangThaiThanhToan.ThanhCong;
        muaDichVu.KichHoat();

        // Lưu trạng thái thanh toán và kích hoạt dịch vụ trước.
        await _uow.SaveChangesAsync();

        // Tạo thông báo cho người đã mua dịch vụ.
        await _thongBaoService.TaoAsync(
            muaDichVu.IdNguoiDung,
            "Thanh toán thành công",
            $"Bạn đã thanh toán thành công dịch vụ {muaDichVu.DichVu.TenDichVu} " +
            $"với số tiền {thanhToan.TongTien:N0} VNĐ.");
    }


}
