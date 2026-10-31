using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Post.DTOs;
using ChoDoCu.Domain.Enums;

namespace ChoDoCu.Application.Features.Post.Interfaces;

public interface IBaiDangService
{
    Task<BaiDangResponse> TaoAsync(int idNguoiDung, TaoBaiDangRequest request);
    Task<BaiDangResponse> CapNhatAsync(int id, int idNguoiDung, TaoBaiDangRequest request);
    Task AnAsync(int id, int idNguoiDung);
    Task HienAsync(int id, int idNguoiDung);
    Task DaBanAsync(int id, int idNguoiDung);
    Task HuyDangAsync(int id, int idNguoiDung);
    Task XoaAsync(int id, int idNguoiDung);
    Task<BaiDangResponse> GetChiTietAsync(int id, int? idNguoiXem = null, bool laAdmin = false);
    Task<PagedResult<BaiDangResponse>> TimKiemAsync(
        int? idDanhMuc,
        int? idThanhPho,
        int? idPhuongXa,
        string? keyword,
        decimal? giaTu,
        decimal? giaDen,
        string sapXep,
        int page,
        int pageSize);
    Task<PagedResult<BaiDangCuaToiResponse>> DanhSachCuaToiAsync(
        int idNguoiDung,
        TrangThaiBaiDang? trangThai,
        string? keyword,
        int? idDanhMuc,
        string sapXep,
        int page,
        int pageSize);
    Task<PagedResult<BaiDangChoDuyetResponse>> DanhSachChoDuyetAsync(
        string? keyword, int? idDanhMuc, int page, int pageSize);
    Task<ThongKeBaiDangResponse> ThongKeCuaToiAsync(int idNguoiDung);
    Task DayTinAsync(int id, int idNguoiDung);
    Task GiaHanAsync(int id, int idNguoiDung);
    Task DuyetAsync(int id);
    Task TuChoiAsync(int id, string? lyDo);
}
