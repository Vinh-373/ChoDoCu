using ChoDoCu.Application.Common.Models;
using ChoDoCu.Application.Features.Post.DTOs;

namespace ChoDoCu.Application.Features.Post.Interfaces;

public interface IBaiDangService
{
    Task<BaiDangResponse> TaoAsync(int idNguoiDung, TaoBaiDangRequest request);
Task<BaiDangResponse> GetChiTietAsync(int id, int? idNguoiXem = null, bool laAdmin = false);    Task<PagedResult<BaiDangResponse>> TimKiemAsync(int? idDanhMuc, int? idThanhPho, string? tuKhoa, int page, int pageSize);
    Task DuyetAsync(int id);
    Task TuChoiAsync(int id);
}
