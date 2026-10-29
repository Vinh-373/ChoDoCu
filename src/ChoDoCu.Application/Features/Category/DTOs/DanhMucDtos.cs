namespace ChoDoCu.Application.Features.Category.DTOs;

public record TaoDanhMucRequest(int? IdDanhMucCha, string TenDanhMuc, string? AnhDanhMuc);
public record CapNhatDanhMucRequest(string TenDanhMuc, string? AnhDanhMuc, string TrangThai);

public record DanhMucResponse(
    int Id, int? IdDanhMucCha, string TenDanhMuc, string? AnhDanhMuc, string TrangThai,
    List<DanhMucResponse> DanhMucCons);

public record ThuocTinhDanhMucResponse(
    int Id,
    string TenThuocTinh,
    string KieuDuLieu,
    bool BatBuoc,
    IReadOnlyList<ThuocTinhLuaChonResponse> DanhSachLuaChon,
    int ThuTu,
    int? IdThuocTinhCha);

public record ThuocTinhLuaChonResponse(string GiaTri, string Ten, int? IdGiaTriCha = null);
