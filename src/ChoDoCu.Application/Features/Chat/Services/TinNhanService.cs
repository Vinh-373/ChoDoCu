using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Chat.DTOs;
using ChoDoCu.Application.Features.Chat.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;
using ChoDoCu.Application.Features.Notification.Interfaces;
namespace ChoDoCu.Application.Features.Chat.Services;

public class TinNhanService : ITinNhanService
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<GuiTinNhanRequest> _validator;
    private readonly IChatNotifier _chatNotifier;
    private readonly IThongBaoService _thongBaoService; 
    public TinNhanService(
        IUnitOfWork uow,
        IValidator<GuiTinNhanRequest> validator,
        IChatNotifier chatNotifier,
        IThongBaoService thongBaoService)
    {
        _uow = uow;
        _validator = validator;
        _chatNotifier = chatNotifier;
        _thongBaoService = thongBaoService;
    }

    public async Task<List<HoiThoaiResponse>> DanhSachHoiThoaiAsync(
        int idNguoiDung)
    {
        var list = await _uow.HoiThois
            .DanhSachTheoNguoiDungAsync(idNguoiDung);

        return list.Select(h =>
        {
            var laNguoiDung1 = h.IdNguoiDung1 == idNguoiDung;
            var nguoiKia = laNguoiDung1
                ? h.NguoiDung2
                : h.NguoiDung1;

            return new HoiThoaiResponse(
                h.Id,
                nguoiKia.Id,
                nguoiKia.HoTen,
                nguoiKia.AnhNguoiDung,
                h.TinNhanCuoi);
        }).ToList();
    }

    public async Task<PagedResult<TinNhanResponse>> DanhSachTinNhanAsync(
        int idNguoiDung,
        int idHoiThoai,
        int page,
        int pageSize)
    {
        var hoiThoai = await _uow.HoiThois.GetByIdAsync(idHoiThoai)
            ?? throw new NotFoundException(
                nameof(HoiThoai),
                idHoiThoai);

        if (hoiThoai.IdNguoiDung1 != idNguoiDung &&
            hoiThoai.IdNguoiDung2 != idNguoiDung)
        {
            throw new ForbiddenException(
                "Bạn không có quyền xem hội thoại này.");
        }

        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var (items, total) = await _uow.TinNhans
            .DanhSachTheoHoiThoaiAsync(idHoiThoai, page, pageSize);

        // Đánh dấu tin nhắn đã xem khi người dùng mở hội thoại.
        await _uow.TinNhans.DanhDauDaXemAsync(
            idHoiThoai,
            idNguoiDung);

        await _uow.SaveChangesAsync();

        var mapped = items.Select(x => new TinNhanResponse(
            x.Id,
            x.IdHoiThoai,
            x.IdNguoiGui,
            x.NoiDung,
            x.DaXem,
            x.NgayTao)).ToList();

        return new PagedResult<TinNhanResponse>(
            mapped,
            total,
            page,
            pageSize);
    }

    public async Task<TinNhanResponse> GuiAsync(
        int idNguoiGui,
        GuiTinNhanRequest request)
    {
        await _validator.ValidateAndThrowAsync(request);

        if (idNguoiGui == request.IdNguoiNhan)
        {
            throw new DomainException(
                "Không thể tự nhắn tin cho chính mình.");
        }

        // Kiểm tra người nhận có tồn tại không.
        _ = await _uow.NguoiDungs.GetByIdAsync(request.IdNguoiNhan)
            ?? throw new NotFoundException(
                nameof(NguoiDung),
                request.IdNguoiNhan);

        // Tìm hội thoại giữa hai người.
        var (nho, lon) = HoiThoai.SapXep(
            idNguoiGui,
            request.IdNguoiNhan);

        var hoiThoai = await _uow.HoiThois
            .TimTheoCapNguoiDungAsync(nho, lon);

        // Chưa có hội thoại thì tạo mới.
        if (hoiThoai is null)
        {
            hoiThoai = new HoiThoai
            {
                IdNguoiDung1 = nho,
                IdNguoiDung2 = lon
            };

            await _uow.HoiThois.AddAsync(hoiThoai);

            // Lưu để lấy ID hội thoại.
            await _uow.SaveChangesAsync();
        }

        // Tạo tin nhắn mới.
        var tinNhan = new TinNhan
        {
            IdHoiThoai = hoiThoai.Id,
            IdNguoiGui = idNguoiGui,
            NoiDung = request.NoiDung.Trim()
        };

        await _uow.TinNhans.AddAsync(tinNhan);

        hoiThoai.TinNhanCuoi = DateTime.Now;

        // Lưu tin nhắn trước khi gửi thông báo.
        await _uow.SaveChangesAsync();

        var response = new TinNhanResponse(
            tinNhan.Id,
            tinNhan.IdHoiThoai,
            tinNhan.IdNguoiGui,
            tinNhan.NoiDung,
            tinNhan.DaXem,
            tinNhan.NgayTao);

        // Xác định người nhận còn lại trong hội thoại.
        var idNguoiNhan = hoiThoai.IdNguoiDung1 == idNguoiGui
            ? hoiThoai.IdNguoiDung2
            : hoiThoai.IdNguoiDung1;



        // Tạo thông báo chưa đọc cho người nhận.
        await _thongBaoService.TaoAsync(
            idNguoiNhan,
            "Bạn có tin nhắn mới",
            request.NoiDung.Trim());
    

    
        // Gửi sự kiện SignalR để frontend nhận tin nhắn realtime.
        await _chatNotifier.GuiTinNhanMoiAsync(
            hoiThoai.Id,
            idNguoiNhan,
            response);

        return response;
    }
}
