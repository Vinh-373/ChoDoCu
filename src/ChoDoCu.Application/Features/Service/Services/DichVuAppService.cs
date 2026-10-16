using ChoDoCu.Application.Features.Service.DTOs;
using ChoDoCu.Application.Features.Service.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;

namespace ChoDoCu.Application.Features.Service.Services;

// Đặt tên "DichVuAppService" (không phải DichVuService) để tránh trùng tên với entity DichVu khi using namespace.
public class DichVuAppService : IDichVuService
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<TaoDichVuRequest> _taoValidator;
    private readonly IValidator<CapNhatDichVuRequest> _capNhatValidator;

    public DichVuAppService(
        IUnitOfWork uow,
        IValidator<TaoDichVuRequest> taoValidator,
        IValidator<CapNhatDichVuRequest> capNhatValidator)
    {
        _uow = uow;
        _taoValidator = taoValidator;
        _capNhatValidator = capNhatValidator;
    }

    // Lấy danh sách các gói dịch vụ đang hoạt động
    public async Task<List<DichVuResponse>> DanhSachAsync()
    {
        var list = await _uow.DichVus.DanhSachDangHoatDongAsync();
        return list.Select(ToResponse).ToList();
    }

    // Lấy danh sách các gói dịch vụ cho quản trị viên (Admin)
    public async Task<List<DichVuResponse>> DanhSachQuanTriAsync()
    {
        var list = await _uow.DichVus.DanhSachQuanTriAsync();
        return list.Select(ToResponse).ToList();
    }

    // Tạo mới một gói dịch vụ
    public async Task<DichVuResponse> TaoAsync(TaoDichVuRequest request)
    {
        await _taoValidator.ValidateAndThrowAsync(request);

        var dichVu = new DichVu
        {
            TenDichVu = request.TenDichVu.Trim(),
            Gia = request.Gia,
            ThoiGianDichVu = request.ThoiGianDichVu,
            LuotDay = request.LuotDay,
            LuotDang = request.LuotDang,
            TrangThai = "HoatDong"
        };

        await _uow.DichVus.AddAsync(dichVu);
        await _uow.SaveChangesAsync();
        return ToResponse(dichVu);
    }

    // Cập nhật thông tin gói dịch vụ
    // Cập nhật toàn bộ thông tin của gói dịch vụ, không chỉ cập nhật một số trường.
    public async Task<DichVuResponse> CapNhatAsync(int id, CapNhatDichVuRequest request)
    {
        await _capNhatValidator.ValidateAndThrowAsync(request);

        var dichVu = await _uow.DichVus.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(DichVu), id);

        dichVu.TenDichVu = request.TenDichVu.Trim();
        dichVu.Gia = request.Gia;
        dichVu.ThoiGianDichVu = request.ThoiGianDichVu;
        dichVu.LuotDay = request.LuotDay;
        dichVu.LuotDang = request.LuotDang;

        await _uow.SaveChangesAsync();
        return ToResponse(dichVu);
    }

    // Ngừng bán một gói dịch vụ (thay đổi trạng thái thành "NgungHoatDong")
    public async Task XoaAsync(int id)
    {
        var dichVu = await _uow.DichVus.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(DichVu), id);

        dichVu.TrangThai = "NgungHoatDong";
        await _uow.SaveChangesAsync();
    }

    // Chuyển đổi entity DichVu thành DTO DichVuResponse
    private static DichVuResponse ToResponse(DichVu x) => new(
        x.Id, x.TenDichVu, x.Gia, x.ThoiGianDichVu,
        x.LuotDay, x.LuotDang, x.NgayTao, x.TrangThai);
}
