using ChoDoCu.Domain.Entities;
using ChoDoCu.Domain.Interfaces;
using ChoDoCu.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChoDoCu.Infrastructure.Repositories;

public class TinNhanRepository : Repository<TinNhan>, ITinNhanRepository
{
    public TinNhanRepository(ApplicationDbContext context) : base(context) { }

    public async Task<(IReadOnlyList<TinNhan> Items, int TotalCount)> DanhSachTheoHoiThoaiAsync(
        int idHoiThoai, int page, int pageSize)
    {
        var query = _dbSet.AsNoTracking().Where(x => x.IdHoiThoai == idHoiThoai);

        var total = await query.CountAsync();
        // Lấy tin mới nhất trước để phân trang kiểu "cuộn lên xem tin cũ hơn", rồi đảo lại theo thời gian tăng dần để hiển thị
        var items = await query
            .OrderByDescending(x => x.NgayTao)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();
        items.Reverse();

        return (items, total);
    }

    public async Task DanhDauDaXemAsync(int idHoiThoai, int idNguoiNhan)
    {
        // idNguoiNhan = người đang xem, nên chỉ đánh dấu tin của NGƯỜI KIA gửi
        await _dbSet
            .Where(x => x.IdHoiThoai == idHoiThoai && x.IdNguoiGui != idNguoiNhan && !x.DaXem)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.DaXem, true));
    }
}
