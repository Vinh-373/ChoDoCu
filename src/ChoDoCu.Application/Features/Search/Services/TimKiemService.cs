using ChoDoCu.Application.Features.Search.DTOs;
using ChoDoCu.Application.Features.Search.Interfaces;
using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;

namespace ChoDoCu.Application.Features.Search.Services;

public class TimKiemService : ITimKiemService
{
    private readonly IUnitOfWork _uow;
    public TimKiemService(IUnitOfWork uow) => _uow = uow;

    public async Task GhiLaiAsync(int idNguoiDung, string tuKhoa)
    {
        if (string.IsNullOrWhiteSpace(tuKhoa)) return;   // không lưu tìm kiếm rỗng

        await _uow.LichSuTimKiems.AddAsync(new LichSuTimKiem { IdNguoiDung = idNguoiDung, TuKhoa = tuKhoa.Trim() });
        await _uow.SaveChangesAsync();
    }

    public async Task<List<LichSuTimKiemResponse>> LichSuGanNhatAsync(int idNguoiDung, int soLuong = 10)
    {
        var list = await _uow.LichSuTimKiems.LichSuGanNhatAsync(idNguoiDung, soLuong);
        return list.Select(x => new LichSuTimKiemResponse(x.Id, x.TuKhoa, x.NgayTao)).ToList();
    }
}
