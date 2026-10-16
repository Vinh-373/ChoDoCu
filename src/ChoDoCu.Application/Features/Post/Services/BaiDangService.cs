using ChoDoCu.Application.Common.Mappings;
using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Post.DTOs;
using ChoDoCu.Application.Features.Post.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Enums;
using ChoDoCu.Domain.Exceptions;
using ChoDoCu.Domain.Interfaces;
using FluentValidation;
using ChoDoCu.Application.Common.Interfaces;
using ChoDoCu.Application.Features.Notification.DTOs;

namespace ChoDoCu.Application.Features.Post.Services;

public class BaiDangService : IBaiDangService
{
    private readonly IUnitOfWork _uow;
    private readonly IValidator<TaoBaiDangRequest> _validator;
    private readonly IThongBaoNotifier _thongBaoNotifier;
 
    public BaiDangService(
        IUnitOfWork uow,
        IValidator<TaoBaiDangRequest> validator,
        IThongBaoNotifier thongBaoNotifier)
    {
        _uow = uow;
        _validator = validator;
        _thongBaoNotifier = thongBaoNotifier;
    }

    public async Task<BaiDangResponse> TaoAsync(int idNguoiDung, TaoBaiDangRequest request)
    {
        await _validator.ValidateAndThrowAsync(request);

        var nguoiDung = await _uow.NguoiDungs.GetByIdAsync(idNguoiDung)
            ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

        _ = await _uow.DanhMucs.GetByIdAsync(request.IdDanhMuc)
            ?? throw new NotFoundException(nameof(DanhMuc), request.IdDanhMuc);
        _ = await _uow.ThanhPhos.GetByIdAsync(request.IdThanhPho)
            ?? throw new NotFoundException(nameof(ThanhPho), request.IdThanhPho);

        if (request.IdPhuongXa is int idPx)
        {
            var px = await _uow.PhuongXas.GetByIdAsync(idPx)
                ?? throw new NotFoundException(nameof(PhuongXa), idPx);
            if (px.IdThanhPho != request.IdThanhPho)
                throw new DomainException("Phường/xã không thuộc thành phố đã chọn.");
        }

        // TODO: kiểm tra / trừ LuotDang theo gói dịch vụ của người dùng

        var sanPham = new SanPham
        {
            IdDanhMuc = request.IdDanhMuc,
            IdHang = request.IdHang,
            IdDongSanPham = request.IdDongSanPham,
            IdDongCuThe = request.IdDongCuThe,
            TenSanPham = request.TenSanPham.Trim(),
            GiaTien = request.GiaTien,
            MoTa = request.MoTa
        };

        var baiDang = new BaiDang
        {
            IdNguoiDung = nguoiDung.Id,
            SanPham = sanPham,
            IdDanhMuc = request.IdDanhMuc,
            IdThanhPho = request.IdThanhPho,
            IdPhuongXa = request.IdPhuongXa,
            TieuDe = request.TieuDe.Trim(),
            NoiDung = request.NoiDung,
            DiaChi = request.DiaChi,
            DiaChiChiTiet = request.DiaChiChiTiet,
            NgayDang = DateTime.Now,
            TrangThai = TrangThaiBaiDang.ChoDuyet,
            AnhSanPhams = request.UrlAnhs.Select(u => new AnhSanPham { Url = u }).ToList()
        };

        await _uow.BaiDangs.AddAsync(baiDang);
        await _uow.SaveChangesAsync();

        var chiTiet = await _uow.BaiDangs.GetChiTietAsync(baiDang.Id);
        return chiTiet!.ToResponse();
    }

    public async Task<BaiDangResponse> GetChiTietAsync(int id, int? idNguoiXem = null, bool laAdmin = false)
    {
        var baiDang = await _uow.BaiDangs.GetChiTietAsync(id)
            ?? throw new NotFoundException(nameof(BaiDang), id);

        // Bài chưa duyệt / bị từ chối chỉ chủ bài hoặc Admin được xem
        if (baiDang.TrangThai != TrangThaiBaiDang.DaDuyet && !laAdmin && baiDang.IdNguoiDung != idNguoiXem)
            throw new NotFoundException(nameof(BaiDang), id);

        return baiDang.ToResponse();
    }

    public async Task<PagedResult<BaiDangResponse>> TimKiemAsync(
        int? idDanhMuc, int? idThanhPho, string? tuKhoa, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var (items, total) = await _uow.BaiDangs.TimKiemAsync(idDanhMuc, idThanhPho, tuKhoa, page, pageSize);
        return new PagedResult<BaiDangResponse>(items.Select(x => x.ToResponse()).ToList(), total, page, pageSize);
    }


public async Task DuyetAsync(int id)
{
    var baiDang = await _uow.BaiDangs.GetByIdAsync(id)
        ?? throw new NotFoundException(nameof(BaiDang), id);

    baiDang.Duyet();

    var thongBao = new ThongBao
    {
        IdNguoiDung = baiDang.IdNguoiDung,
        TieuDe = "Bài đăng đã được duyệt",
        NoiDung = baiDang.TieuDe
    };

    await _uow.ThongBaos.AddAsync(thongBao);

    // Lưu trạng thái bài đăng và thông báo vào database
    await _uow.SaveChangesAsync();

    // Gửi thông báo realtime cho chủ bài đăng
    var response = new ThongBaoResponse(
        thongBao.Id,
        thongBao.TieuDe,
        thongBao.NoiDung,
        thongBao.NgayTao,
        thongBao.TrangThai
    );

    await _thongBaoNotifier.GuiThongBaoMoiAsync(
        baiDang.IdNguoiDung,
        response
    );
}

public async Task TuChoiAsync(int id)
{
    var baiDang = await _uow.BaiDangs.GetByIdAsync(id)
        ?? throw new NotFoundException(nameof(BaiDang), id);

    baiDang.TuChoi();

    var thongBao = new ThongBao
    {
        IdNguoiDung = baiDang.IdNguoiDung,
        TieuDe = "Bài đăng bị từ chối",
        NoiDung = baiDang.TieuDe
    };

    await _uow.ThongBaos.AddAsync(thongBao);

    // Lưu trạng thái bài đăng và thông báo vào database
    await _uow.SaveChangesAsync();

    // Gửi thông báo realtime cho chủ bài đăng
    var response = new ThongBaoResponse(
        thongBao.Id,
        thongBao.TieuDe,
        thongBao.NoiDung,
        thongBao.NgayTao,
        thongBao.TrangThai
    );

    await _thongBaoNotifier.GuiThongBaoMoiAsync(
        baiDang.IdNguoiDung,
        response
    );
}

}