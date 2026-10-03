using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Chat.DTOs;
using ChoDoCu.Application.Features.Chat.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;

namespace ChoDoCu.Application.Features.Chat.Services;

public class TinNhanService : ITinNhanService
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<GuiTinNhanRequest> _validator;

    public TinNhanService(IUnitOfWork uow, IValidator<GuiTinNhanRequest> validator)
    {
        _uow = uow;
        _validator = validator;
    }

    public async Task<List<HoiThoaiResponse>> DanhSachHoiThoaiAsync(int idNguoiDung)
    {
        var list = await _uow.HoiThois.DanhSachTheoNguoiDungAsync(idNguoiDung);

        return list.Select(h =>
        {
            var laNguoiDung1 = h.IdNguoiDung1 == idNguoiDung;
            var nguoiKia = laNguoiDung1 ? h.NguoiDung2 : h.NguoiDung1;
            return new HoiThoaiResponse(h.Id, nguoiKia.Id, nguoiKia.HoTen, nguoiKia.AnhNguoiDung, h.TinNhanCuoi);
        }).ToList();
    }

    public async Task<PagedResult<TinNhanResponse>> DanhSachTinNhanAsync(
        int idNguoiDung, int idHoiThoai, int page, int pageSize)
    {
        var hoiThoai = await _uow.HoiThois.GetByIdAsync(idHoiThoai)
            ?? throw new NotFoundException(nameof(HoiThoai), idHoiThoai);

        if (hoiThoai.IdNguoiDung1 != idNguoiDung && hoiThoai.IdNguoiDung2 != idNguoiDung)
            throw new DomainException("Bạn không có quyền xem hội thoại này.");

        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var (items, total) = await _uow.TinNhans.DanhSachTheoHoiThoaiAsync(idHoiThoai, page, pageSize);
        await _uow.TinNhans.DanhDauDaXemAsync(idHoiThoai, idNguoiDung);   // đánh dấu đã xem khi mở hội thoại
        await _uow.SaveChangesAsync();

        var mapped = items.Select(x => new TinNhanResponse(x.Id, x.IdHoiThoai, x.IdNguoiGui, x.NoiDung, x.DaXem, x.NgayTao)).ToList();
        return new PagedResult<TinNhanResponse>(mapped, total, page, pageSize);
    }

    public async Task<TinNhanResponse> GuiAsync(int idNguoiGui, GuiTinNhanRequest request)
    {
        await _validator.ValidateAndThrowAsync(request);

        if (idNguoiGui == request.IdNguoiNhan)
            throw new DomainException("Không thể tự nhắn tin cho chính mình.");

        _ = await _uow.NguoiDungs.GetByIdAsync(request.IdNguoiNhan)
            ?? throw new NotFoundException(nameof(NguoiDung), request.IdNguoiNhan);

        var (nho, lon) = HoiThoai.SapXep(idNguoiGui, request.IdNguoiNhan);
        var hoiThoai = await _uow.HoiThois.TimTheoCapNguoiDungAsync(nho, lon);

        if (hoiThoai is null)
        {
            hoiThoai = new HoiThoai { IdNguoiDung1 = nho, IdNguoiDung2 = lon };
            await _uow.HoiThois.AddAsync(hoiThoai);
            await _uow.SaveChangesAsync();   // cần Id trước khi gắn tin nhắn
        }

        var tinNhan = new TinNhan
        {
            IdHoiThoai = hoiThoai.Id,
            IdNguoiGui = idNguoiGui,
            NoiDung = request.NoiDung.Trim()
        };
        await _uow.TinNhans.AddAsync(tinNhan);

        hoiThoai.TinNhanCuoi = DateTime.Now;
        await _uow.SaveChangesAsync();

        return new TinNhanResponse(tinNhan.Id, tinNhan.IdHoiThoai, tinNhan.IdNguoiGui, tinNhan.NoiDung, tinNhan.DaXem, tinNhan.NgayTao);
    }
}
