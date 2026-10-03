namespace ChoDoCu.Application.Features.Category.DTOs;

public record TaoDanhMucRequest(int? IdDanhMucCha, string TenDanhMuc, string? AnhDanhMuc);
public record CapNhatDanhMucRequest(string TenDanhMuc, string? AnhDanhMuc, string TrangThai);

public record DanhMucResponse(
    int Id, int? IdDanhMucCha, string TenDanhMuc, string? AnhDanhMuc, string TrangThai,
    List<DanhMucResponse> DanhMucCons);
