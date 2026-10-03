namespace ChoDoCu.Application.Features.Report.DTOs;

public record TaoBaoCaoRequest(int IdBaiDang, string NoiDung);

public record BaoCaoResponse(
    int Id, int IdBaiDang, string TieuDeBaiDang, int IdNguoiDung, string TenNguoiBaoCao,
    string? NoiDung, DateTime NgayTao, string TrangThai);
