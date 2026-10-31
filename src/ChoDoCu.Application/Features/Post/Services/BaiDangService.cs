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
    private const int SoNgayHienThi = 30;

    private readonly IUnitOfWork _uow;
    private readonly IValidator<TaoBaiDangRequest> _validator;
    private readonly IValidator<TuChoiBaiDangRequest> _tuChoiValidator;
    private readonly IThongBaoNotifier _thongBaoNotifier;
 
    public BaiDangService(
        IUnitOfWork uow,
        IValidator<TaoBaiDangRequest> validator,
        IValidator<TuChoiBaiDangRequest> tuChoiValidator,
        IThongBaoNotifier thongBaoNotifier)
    {
        _uow = uow;
        _validator = validator;
        _tuChoiValidator = tuChoiValidator;
        _thongBaoNotifier = thongBaoNotifier;
    }

    public async Task<BaiDangResponse> TaoAsync(int idNguoiDung, TaoBaiDangRequest request)
    {
        var input = await ChuanBiDuLieuAsync(request);
        var nguoiDung = await _uow.NguoiDungs.GetByIdAsync(idNguoiDung)
            ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

        var sanPham = new SanPham
        {
            IdDanhMuc = request.IdDanhMuc,
            IdHang = input.Hang?.Id,
            IdDongSanPham = input.DongSanPham?.Id,
            TenSanPham = input.TieuDe,
            GiaTien = request.Gia,
            MoTa = string.Empty,
            SanPhamThuocTinhs = input.GiaTriTheoThuocTinh.Select(x => new SanPhamThuocTinh
            {
                IdThuocTinh = x.Key,
                GiaTri = x.Value
            }).ToList()
        };

        var baiDang = new BaiDang
        {
            IdNguoiDung = nguoiDung.Id,
            SanPham = sanPham,
            IdDanhMuc = request.IdDanhMuc,
            IdThanhPho = request.IdThanhPho,
            IdPhuongXa = request.IdPhuongXa,
            TieuDe = input.TieuDe,
            NoiDung = request.MoTa.Trim(),
            MoTa = string.Empty,
            Gia = request.Gia,
            CoThuongLuong = request.CoThuongLuong,
            GiaChotNhanh = request.GiaChotNhanh,
            QuanHuyen = input.PhuongXa?.TenPhuongXa ?? input.ThanhPho.TenThanhPho,
            DiaChi = string.Join(", ", new[]
                { input.DiaChiChiTiet, input.PhuongXa?.TenPhuongXa, input.ThanhPho.TenThanhPho }
                .Where(x => !string.IsNullOrWhiteSpace(x))),
            DiaChiChiTiet = input.DiaChiChiTiet,
            SoDienThoaiLienHe = string.IsNullOrWhiteSpace(request.SoDienThoaiLienHe)
                ? nguoiDung.SoDienThoai ?? string.Empty
                : request.SoDienThoaiLienHe.Trim(),
            ChoPhepChat = request.ChoPhepChat,
            NgayDang = DateTime.Now,
            TrangThai = TrangThaiBaiDang.ChoDuyet,
            HinhAnhBaiDangs = request.DanhSachHinhAnh.Select((hinhAnh, thuTu) => new HinhAnhBaiDang
            {
                DuongDan = hinhAnh.DuongDan,
                LaVideo = hinhAnh.LaVideo,
                LaAnhBia = hinhAnh.LaAnhBia,
                ThuTu = thuTu
            }).ToList()
        };

        await _uow.ExecuteInTransactionAsync(async () =>
        {
            if (!await _uow.NguoiDungs.TryTruLuotDangAsync(idNguoiDung))
                throw new DomainException("Bạn đã hết lượt đăng tin. Vui lòng mua gói dịch vụ.");

            await _uow.BaiDangs.AddWithGeneratedMaTinAsync(baiDang);
            return true;
        });

        return await GetChiTietAsync(baiDang.Id, idNguoiDung);
    }

    public async Task<BaiDangResponse> CapNhatAsync(
        int id,
        int idNguoiDung,
        TaoBaiDangRequest request)
    {
        await _uow.ExecuteInTransactionAsync(async () =>
        {
            var baiDang = await GetBaiDangCuaNguoiDungAsync(id, idNguoiDung);
            if (baiDang.TrangThai == TrangThaiBaiDang.DaBan)
                throw new DomainException("Không thể sửa tin đã bán.");

            var input = await ChuanBiDuLieuAsync(request);
            var nguoiDung = await _uow.NguoiDungs.GetByIdAsync(idNguoiDung)
                ?? throw new NotFoundException(nameof(NguoiDung), idNguoiDung);
            var coThayDoiCanDuyetLai =
                !string.Equals(baiDang.TieuDe, input.TieuDe, StringComparison.Ordinal)
                || baiDang.Gia != request.Gia
                || baiDang.IdDanhMuc != request.IdDanhMuc
                || ThuocTinhsDaThayDoi(baiDang, input.GiaTriTheoThuocTinh)
                || HinhAnhsDaThayDoi(baiDang, request.DanhSachHinhAnh);

            baiDang.TieuDe = input.TieuDe;
            baiDang.NoiDung = request.MoTa.Trim();
            baiDang.Gia = request.Gia;
            baiDang.CoThuongLuong = request.CoThuongLuong;
            baiDang.GiaChotNhanh = request.GiaChotNhanh;
            baiDang.IdDanhMuc = request.IdDanhMuc;
            baiDang.IdThanhPho = request.IdThanhPho;
            baiDang.IdPhuongXa = request.IdPhuongXa;
            baiDang.QuanHuyen = input.PhuongXa?.TenPhuongXa ?? input.ThanhPho.TenThanhPho;
            baiDang.DiaChiChiTiet = input.DiaChiChiTiet;
            baiDang.DiaChi = string.Join(", ", new[]
                { input.DiaChiChiTiet, input.PhuongXa?.TenPhuongXa, input.ThanhPho.TenThanhPho }
                .Where(x => !string.IsNullOrWhiteSpace(x)));
            baiDang.SoDienThoaiLienHe = string.IsNullOrWhiteSpace(request.SoDienThoaiLienHe)
                ? nguoiDung.SoDienThoai ?? string.Empty
                : request.SoDienThoaiLienHe.Trim();
            baiDang.ChoPhepChat = request.ChoPhepChat;
            baiDang.NgayCapNhat = DateTime.Now;

            baiDang.SanPham.IdDanhMuc = request.IdDanhMuc;
            baiDang.SanPham.IdHang = input.Hang?.Id;
            baiDang.SanPham.IdDongSanPham = input.DongSanPham?.Id;
            baiDang.SanPham.TenSanPham = input.TieuDe;
            baiDang.SanPham.GiaTien = request.Gia;

            CapNhatThuocTinhs(baiDang.SanPham, input.GiaTriTheoThuocTinh);
            CapNhatHinhAnhs(baiDang, request.DanhSachHinhAnh);

            if (coThayDoiCanDuyetLai)
            {
                baiDang.TrangThai = TrangThaiBaiDang.ChoDuyet;
                baiDang.LyDoTuChoi = null;
            }

            await _uow.SaveChangesAsync();
            return true;
        });

        return await GetChiTietAsync(id, idNguoiDung);
    }

    public Task AnAsync(int id, int idNguoiDung) =>
        CapNhatTrangThaiAsync(
            id,
            idNguoiDung,
            baiDang => baiDang.TrangThai == TrangThaiBaiDang.DaDuyet,
            TrangThaiBaiDang.DaAn,
            "Chỉ ẩn được tin đang hiển thị.");

    public Task HienAsync(int id, int idNguoiDung) =>
        CapNhatTrangThaiAsync(
            id,
            idNguoiDung,
            baiDang => baiDang.TrangThai == TrangThaiBaiDang.DaAn,
            TrangThaiBaiDang.DaDuyet,
            "Chỉ hiện được tin đang ẩn.");

    public Task DaBanAsync(int id, int idNguoiDung) =>
        CapNhatTrangThaiAsync(
            id,
            idNguoiDung,
            baiDang => baiDang.TrangThai is TrangThaiBaiDang.DaDuyet or TrangThaiBaiDang.DaAn,
            TrangThaiBaiDang.DaBan,
            "Chỉ đánh dấu đã bán được tin đang hiển thị hoặc đang ẩn.");

    public Task HuyDangAsync(int id, int idNguoiDung) =>
        XoaCuaNguoiDungAsync(id, idNguoiDung, chiChoHuyTinChoDuyet: true);

    public Task XoaAsync(int id, int idNguoiDung) =>
        XoaCuaNguoiDungAsync(id, idNguoiDung, chiChoHuyTinChoDuyet: false);

    private async Task<BaiDangInput> ChuanBiDuLieuAsync(TaoBaiDangRequest request)
    {
        await _validator.ValidateAndThrowAsync(request);

        _ = await _uow.DanhMucs.GetByIdAsync(request.IdDanhMuc)
            ?? throw new NotFoundException(nameof(DanhMuc), request.IdDanhMuc);
        var thanhPho = await _uow.ThanhPhos.GetByIdAsync(request.IdThanhPho)
            ?? throw new NotFoundException(nameof(ThanhPho), request.IdThanhPho);

        var thuocTinhsDanhMuc = await _uow.DanhMucs.GetThuocTinhDanhMucAsync(request.IdDanhMuc);
        var thuocTinhTheoId = thuocTinhsDanhMuc.ToDictionary(x => x.Id);
        var giaTriTheoThuocTinh = request.ThuocTinhs.ToDictionary(
            x => x.IdThuocTinh,
            x => x.GiaTri.Trim());

        if (giaTriTheoThuocTinh.Keys.Any(id => !thuocTinhTheoId.ContainsKey(id)))
            throw new DomainException("Thuộc tính gửi lên không thuộc danh mục đã chọn.");

        if (thuocTinhsDanhMuc.Any(x => x.BatBuoc
                && (!giaTriTheoThuocTinh.TryGetValue(x.Id, out var value) || string.IsNullOrWhiteSpace(value))))
        {
            throw new DomainException("Vui lòng nhập đầy đủ các thuộc tính bắt buộc của danh mục.");
        }

        var thuocTinhHang = thuocTinhsDanhMuc.FirstOrDefault(x =>
            string.Equals(x.TenThuocTinh, "Hãng xe", StringComparison.OrdinalIgnoreCase));
        var thuocTinhDong = thuocTinhsDanhMuc.FirstOrDefault(x =>
            string.Equals(x.TenThuocTinh, "Dòng xe", StringComparison.OrdinalIgnoreCase)
            || (thuocTinhHang is not null && x.IdThuocTinhCha == thuocTinhHang.Id));

        Hang? hang = null;
        if (thuocTinhHang is not null && giaTriTheoThuocTinh.TryGetValue(thuocTinhHang.Id, out var giaTriHang))
        {
            if (!int.TryParse(giaTriHang, out var idHang))
                throw new DomainException("Giá trị hãng xe không hợp lệ.");

            hang = (await _uow.DanhMucs.GetHangsDanhMucAsync(request.IdDanhMuc))
                .FirstOrDefault(x => x.Id == idHang)
                ?? throw new DomainException("Hãng xe không thuộc danh mục đã chọn.");
        }

        DongSanPham? dongSanPham = null;
        if (thuocTinhDong is not null && giaTriTheoThuocTinh.TryGetValue(thuocTinhDong.Id, out var giaTriDong))
        {
            if (hang is null)
                throw new DomainException("Cần chọn hãng xe trước khi chọn dòng xe.");
            if (!int.TryParse(giaTriDong, out var idDongSanPham))
                throw new DomainException("Giá trị dòng xe không hợp lệ.");

            dongSanPham = (await _uow.DanhMucs.GetDongSanPhamsDanhMucAsync(request.IdDanhMuc, hang.Id))
                .FirstOrDefault(x => x.Id == idDongSanPham)
                ?? throw new DomainException("Dòng xe không thuộc hãng xe đã chọn.");
        }

        foreach (var (idThuocTinh, giaTri) in giaTriTheoThuocTinh)
        {
            var thuocTinh = thuocTinhTheoId[idThuocTinh];
            if (thuocTinh.Id == thuocTinhHang?.Id || thuocTinh.Id == thuocTinhDong?.Id)
                continue;

            if (thuocTinh.DanhSachGiaTriLuaChon.Count > 0
                && !thuocTinh.DanhSachGiaTriLuaChon.Contains(giaTri, StringComparer.OrdinalIgnoreCase))
            {
                throw new DomainException($"Giá trị của thuộc tính \"{thuocTinh.TenThuocTinh}\" không nằm trong danh sách lựa chọn.");
            }
        }

        var tieuDe = request.TieuDe?.Trim();
        if (string.IsNullOrWhiteSpace(tieuDe))
        {
            var thuocTinhNam = thuocTinhsDanhMuc.FirstOrDefault(x =>
                string.Equals(x.TenThuocTinh, "Năm sản xuất", StringComparison.OrdinalIgnoreCase));
            if (hang is null || dongSanPham is null || thuocTinhNam is null
                || !giaTriTheoThuocTinh.TryGetValue(thuocTinhNam.Id, out var namSanXuat))
            {
                throw new DomainException("Cần có thuộc tính hãng xe, dòng xe và năm sản xuất để tự tạo tiêu đề.");
            }

            tieuDe = $"{hang.TenHang} {dongSanPham.TenDongSanPham} {namSanXuat}".Trim();
            if (tieuDe.Length > 70)
                throw new DomainException("Tiêu đề tự tạo vượt quá 70 ký tự.");
        }

        PhuongXa? phuongXa = null;
        if (request.IdPhuongXa is int idPx)
        {
            phuongXa = await _uow.PhuongXas.GetByIdAsync(idPx)
                ?? throw new NotFoundException(nameof(PhuongXa), idPx);
            if (phuongXa.IdThanhPho != request.IdThanhPho)
                throw new DomainException("Phường/xã không thuộc thành phố đã chọn.");
        }

        return new BaiDangInput(
            thanhPho,
            phuongXa,
            hang,
            dongSanPham,
            tieuDe,
            request.DiaChiChiTiet?.Trim() ?? string.Empty,
            giaTriTheoThuocTinh);
    }

    private async Task<BaiDang> GetBaiDangCuaNguoiDungAsync(int id, int idNguoiDung)
    {
        var baiDang = await _uow.BaiDangs.GetChiTietAsync(id)
            ?? throw new NotFoundException(nameof(BaiDang), id);
        if (baiDang.IdNguoiDung != idNguoiDung)
            throw new ForbiddenException("Bạn không có quyền thao tác với tin đăng này.");
        return baiDang;
    }

    private async Task CapNhatTrangThaiAsync(
        int id,
        int idNguoiDung,
        Func<BaiDang, bool> dieuKien,
        TrangThaiBaiDang trangThaiMoi,
        string thongBaoLoi)
    {
        await _uow.ExecuteInTransactionAsync(async () =>
        {
            var baiDang = await GetBaiDangCuaNguoiDungAsync(id, idNguoiDung);
            if (!dieuKien(baiDang))
                throw new DomainException(thongBaoLoi);

            baiDang.TrangThai = trangThaiMoi;
            baiDang.NgayCapNhat = DateTime.Now;
            await _uow.SaveChangesAsync();
            return true;
        });
    }

    private async Task XoaCuaNguoiDungAsync(
        int id,
        int idNguoiDung,
        bool chiChoHuyTinChoDuyet)
    {
        await _uow.ExecuteInTransactionAsync(async () =>
        {
            var baiDang = await GetBaiDangCuaNguoiDungAsync(id, idNguoiDung);
            if (chiChoHuyTinChoDuyet && baiDang.TrangThai != TrangThaiBaiDang.ChoDuyet)
                throw new DomainException("Chỉ hủy đăng được tin đang chờ duyệt.");

            if (chiChoHuyTinChoDuyet && await _uow.NguoiDungs.CongLuotDangAsync(idNguoiDung) != 1)
                throw new NotFoundException(nameof(NguoiDung), idNguoiDung);

            baiDang.DaXoa = true;
            baiDang.NgayXoa = DateTime.Now;
            await _uow.SaveChangesAsync();
            return true;
        });
    }

    private static bool ThuocTinhsDaThayDoi(
        BaiDang baiDang,
        IReadOnlyDictionary<int, string> thuocTinhsMoi)
    {
        var thuocTinhsCu = baiDang.SanPham.SanPhamThuocTinhs
            .ToDictionary(x => x.IdThuocTinh, x => x.GiaTri);
        return thuocTinhsCu.Count != thuocTinhsMoi.Count
            || thuocTinhsCu.Any(x => !thuocTinhsMoi.TryGetValue(x.Key, out var value)
                || !string.Equals(x.Value, value, StringComparison.Ordinal));
    }

    private static bool HinhAnhsDaThayDoi(
        BaiDang baiDang,
        IReadOnlyList<TaoBaiDangHinhAnhRequest> hinhAnhsMoi)
    {
        var hinhAnhsCu = baiDang.HinhAnhBaiDangs.OrderBy(x => x.ThuTu).ToList();
        return baiDang.AnhSanPhams.Count > 0
            || hinhAnhsCu.Count != hinhAnhsMoi.Count
            || hinhAnhsCu.Where((old, index) =>
                !string.Equals(old.DuongDan, hinhAnhsMoi[index].DuongDan, StringComparison.Ordinal)
                || old.LaVideo != hinhAnhsMoi[index].LaVideo
                || old.LaAnhBia != hinhAnhsMoi[index].LaAnhBia).Any();
    }

    private static void CapNhatThuocTinhs(
        SanPham sanPham,
        IReadOnlyDictionary<int, string> thuocTinhsMoi)
    {
        var thuocTinhsCu = sanPham.SanPhamThuocTinhs.ToDictionary(x => x.IdThuocTinh);
        foreach (var thuocTinhCu in sanPham.SanPhamThuocTinhs.ToList())
        {
            if (thuocTinhsMoi.TryGetValue(thuocTinhCu.IdThuocTinh, out var giaTriMoi))
                thuocTinhCu.GiaTri = giaTriMoi;
            else
                sanPham.SanPhamThuocTinhs.Remove(thuocTinhCu);
        }

        foreach (var (idThuocTinh, giaTri) in thuocTinhsMoi)
        {
            if (!thuocTinhsCu.ContainsKey(idThuocTinh))
            {
                sanPham.SanPhamThuocTinhs.Add(new SanPhamThuocTinh
                {
                    IdSanPham = sanPham.Id,
                    IdThuocTinh = idThuocTinh,
                    GiaTri = giaTri
                });
            }
        }
    }

    private static void CapNhatHinhAnhs(
        BaiDang baiDang,
        IReadOnlyList<TaoBaiDangHinhAnhRequest> hinhAnhsMoi)
    {
        foreach (var anhSanPham in baiDang.AnhSanPhams.ToList())
            baiDang.AnhSanPhams.Remove(anhSanPham);

        var hinhAnhsCu = baiDang.HinhAnhBaiDangs.OrderBy(x => x.ThuTu).ToList();
        for (var index = 0; index < Math.Min(hinhAnhsCu.Count, hinhAnhsMoi.Count); index++)
        {
            hinhAnhsCu[index].DuongDan = hinhAnhsMoi[index].DuongDan;
            hinhAnhsCu[index].LaVideo = hinhAnhsMoi[index].LaVideo;
            hinhAnhsCu[index].LaAnhBia = hinhAnhsMoi[index].LaAnhBia;
            hinhAnhsCu[index].ThuTu = index;
        }

        foreach (var hinhAnhCu in hinhAnhsCu.Skip(hinhAnhsMoi.Count))
            baiDang.HinhAnhBaiDangs.Remove(hinhAnhCu);

        for (var index = hinhAnhsCu.Count; index < hinhAnhsMoi.Count; index++)
        {
            baiDang.HinhAnhBaiDangs.Add(new HinhAnhBaiDang
            {
                IdBaiDang = baiDang.Id,
                DuongDan = hinhAnhsMoi[index].DuongDan,
                LaVideo = hinhAnhsMoi[index].LaVideo,
                LaAnhBia = hinhAnhsMoi[index].LaAnhBia,
                ThuTu = index
            });
        }
    }

    private sealed record BaiDangInput(
        ThanhPho ThanhPho,
        PhuongXa? PhuongXa,
        Hang? Hang,
        DongSanPham? DongSanPham,
        string TieuDe,
        string DiaChiChiTiet,
        IReadOnlyDictionary<int, string> GiaTriTheoThuocTinh);

    public async Task<BaiDangResponse> GetChiTietAsync(int id, int? idNguoiXem = null, bool laAdmin = false)
    {
        var baiDang = await _uow.BaiDangs.GetChiTietProjectionAsync(id, b => new BaiDangChiTietProjection(
            b.Id,
            b.MaTin,
            b.TieuDe,
            b.NoiDung,
            b.SanPham.TenSanPham,
            b.SanPham.GiaTien,
            b.DiaChi,
            b.DiaChiChiTiet,
            b.NgayDang,
            b.TrangThai.ToString(),
            b.IdNguoiDung,
            b.NguoiDung.HoTen,
            b.NguoiDung.AnhNguoiDung,
            b.DanhMuc.TenDanhMuc,
            b.ThanhPho.TenThanhPho,
            b.DanhMuc.DanhMucCha == null
                ? b.DanhMuc.TenDanhMuc
                : b.DanhMuc.DanhMucCha.TenDanhMuc + " > " + b.DanhMuc.TenDanhMuc,
            b.PhuongXa == null
                ? b.ThanhPho.TenThanhPho
                : b.PhuongXa.TenPhuongXa + ", " + b.ThanhPho.TenThanhPho,
            b.SoDienThoaiLienHe,
            b.CoThuongLuong,
            b.GiaChotNhanh,
            b.ChoPhepChat,
            b.LyDoTuChoi,
            b.LuotXem,
            b.YeuThichs.Count))
            ?? throw new NotFoundException(nameof(BaiDang), id);

        // Bài chưa duyệt / bị từ chối chỉ chủ bài hoặc Admin được xem
        if (baiDang.TrangThai != TrangThaiBaiDang.DaDuyet.ToString()
            && !laAdmin && baiDang.IdNguoiDung != idNguoiXem)
            throw new NotFoundException(nameof(BaiDang), id);

        var hinhAnhs = await _uow.BaiDangs.GetHinhAnhChiTietAsync(id);
        var anhSanPhams = await _uow.BaiDangs.GetAnhSanPhamChiTietAsync(id);
        var anhs = hinhAnhs.Select(h => h.DuongDan)
            .Concat(anhSanPhams.Select(a => a.Url))
            .ToList();
        var anhBia = hinhAnhs.FirstOrDefault(h => h.LaAnhBia)?.DuongDan
            ?? hinhAnhs.FirstOrDefault()?.DuongDan
            ?? anhSanPhams.FirstOrDefault()?.Url;
        var thuocTinhs = await _uow.BaiDangs.GetThuocTinhChiTietAsync(
            id,
            t => new BaiDangThuocTinhProjection(
                t.ThuocTinh.TenThuocTinh,
                t.GiaTri,
                t.ThuocTinh.DanhSachGiaTriLuaChon));

        if (idNguoiXem != baiDang.IdNguoiDung)
            await _uow.BaiDangs.TangLuotXemAsync(id);

        return new BaiDangResponse(
            baiDang.Id,
            baiDang.MaTin,
            baiDang.TieuDe,
            baiDang.NoiDung,
            baiDang.TenSanPham,
            baiDang.GiaTien,
            baiDang.DiaChi,
            baiDang.DiaChiChiTiet,
            baiDang.NgayDang,
            baiDang.TrangThai,
            baiDang.IdNguoiDung,
            baiDang.TenNguoiDang,
            baiDang.TenDanhMuc,
            baiDang.TenThanhPho,
            anhs,
            anhBia,
            baiDang.TenDanhMucDayDu,
            baiDang.KhuVuc,
            baiDang.SoDienThoaiLienHe,
            baiDang.CoThuongLuong,
            baiDang.GiaChotNhanh,
            baiDang.ChoPhepChat,
            baiDang.LyDoTuChoi,
            baiDang.LuotXem + (idNguoiXem == baiDang.IdNguoiDung ? 0 : 1),
            baiDang.LuotLuu,
            0,
            new NguoiBanResponse(baiDang.IdNguoiDung, baiDang.TenNguoiDang, baiDang.AnhNguoiDang),
            thuocTinhs.Select(t => new BaiDangThuocTinhResponse(
                t.TenThuocTinh,
                t.DanhSachGiaTriLuaChon.FirstOrDefault(value =>
                    string.Equals(value, t.GiaTri, StringComparison.OrdinalIgnoreCase))
                    ?? t.GiaTri ?? string.Empty)).ToList());
    }

    public async Task<PagedResult<BaiDangResponse>> TimKiemAsync(
        int? idDanhMuc,
        int? idThanhPho,
        int? idPhuongXa,
        string? keyword,
        decimal? giaTu,
        decimal? giaDen,
        string sapXep,
        int page,
        int pageSize)
    {
        if (giaTu.HasValue && giaDen.HasValue && giaTu.Value > giaDen.Value)
            throw new DomainException("Giá từ không được lớn hơn giá đến.");

        var sapXepHopLe = sapXep switch
        {
            "uuTien" or "moiNhat" or "giaTang" or "giaGiam" or "xemNhieu" => sapXep,
            _ => throw new DomainException("Kiểu sắp xếp không hợp lệ.")
        };
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var (items, total) = await _uow.BaiDangs.TimKiemAsync(
            idDanhMuc,
            idThanhPho,
            idPhuongXa,
            keyword,
            giaTu,
            giaDen,
            sapXepHopLe,
            page,
            pageSize);
        return new PagedResult<BaiDangResponse>(items.Select(x => x.ToResponse()).ToList(), total, page, pageSize);
    }

    public async Task<PagedResult<BaiDangCuaToiResponse>> DanhSachCuaToiAsync(
        int idNguoiDung,
        TrangThaiBaiDang? trangThai,
        string? keyword,
        int? idDanhMuc,
        string sapXep,
        int page,
        int pageSize)
    {
        var sapXepHopLe = sapXep switch
        {
            "moiNhat" or "cuNhat" or "giaTang" or "giaGiam" or "xemNhieu" => sapXep,
            _ => throw new DomainException("Kiểu sắp xếp không hợp lệ.")
        };
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var now = DateTime.Now;

        var (items, total) = await _uow.BaiDangs.DanhSachCuaToiAsync(
            idNguoiDung,
            trangThai,
            keyword,
            idDanhMuc,
            sapXepHopLe,
            page,
            pageSize,
            b => new BaiDangCuaToiResponse(
                b.Id,
                b.HinhAnhBaiDangs.Where(h => h.LaAnhBia).OrderBy(h => h.ThuTu)
                    .Select(h => h.DuongDan).FirstOrDefault()
                    ?? b.HinhAnhBaiDangs.OrderBy(h => h.ThuTu).Select(h => h.DuongDan).FirstOrDefault()
                    ?? b.AnhSanPhams.Select(a => a.Url).FirstOrDefault(),
                b.TieuDe,
                b.Gia,
                b.DanhMuc.DanhMucCha == null
                    ? b.DanhMuc.TenDanhMuc
                    : b.DanhMuc.DanhMucCha.TenDanhMuc + " > " + b.DanhMuc.TenDanhMuc,
                b.MaTin,
                b.NgayDang,
                b.PhuongXa == null
                    ? b.ThanhPho.TenThanhPho
                    : b.PhuongXa.TenPhuongXa + ", " + b.ThanhPho.TenThanhPho,
                b.LuotXem,
                b.YeuThichs.Count,
                b.TrangThai.ToString(),
                b.LyDoTuChoi,
                b.NgayHetHan,
                b.NgayHetHan.HasValue && b.NgayHetHan.Value <= now));

        return new PagedResult<BaiDangCuaToiResponse>(items, total, page, pageSize);
    }

    public async Task<PagedResult<BaiDangChoDuyetResponse>> DanhSachChoDuyetAsync(
        string? keyword,
        int? idDanhMuc,
        int page,
        int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var (items, total) = await _uow.BaiDangs.DanhSachChoDuyetAsync(
            keyword,
            idDanhMuc,
            page,
            pageSize,
            b => new BaiDangChoDuyetResponse(
                b.Id,
                b.MaTin,
                b.TieuDe,
                b.Gia,
                b.HinhAnhBaiDangs.Where(h => h.LaAnhBia).OrderBy(h => h.ThuTu)
                    .Select(h => h.DuongDan).FirstOrDefault()
                    ?? b.HinhAnhBaiDangs.OrderBy(h => h.ThuTu).Select(h => h.DuongDan).FirstOrDefault()
                    ?? b.AnhSanPhams.Select(a => a.Url).FirstOrDefault(),
                b.DanhMuc.DanhMucCha == null
                    ? b.DanhMuc.TenDanhMuc
                    : b.DanhMuc.DanhMucCha.TenDanhMuc + " > " + b.DanhMuc.TenDanhMuc,
                new NguoiDangChoDuyetResponse(b.IdNguoiDung, b.NguoiDung.HoTen),
                b.NgayDang,
                b.PhuongXa == null
                    ? b.ThanhPho.TenThanhPho
                    : b.PhuongXa.TenPhuongXa + ", " + b.ThanhPho.TenThanhPho));

        return new PagedResult<BaiDangChoDuyetResponse>(items, total, page, pageSize);
    }

    public async Task<ThongKeBaiDangResponse> ThongKeCuaToiAsync(int idNguoiDung)
    {
        var counts = await _uow.BaiDangs.ThongKeCuaToiAsync(idNguoiDung);
        var byStatus = Enum.GetValues<TrangThaiBaiDang>()
            .Distinct()
            .Select(status => new ThongKeTrangThaiBaiDang(
                status.ToString(),
                counts.GetValueOrDefault(status)))
            .ToList();

        return new ThongKeBaiDangResponse(byStatus, byStatus.Sum(x => x.SoLuong));
    }

    public async Task DayTinAsync(int id, int idNguoiDung)
    {
        await _uow.ExecuteInTransactionAsync(async () =>
        {
            var baiDang = await GetBaiDangCuaNguoiDungAsync(id, idNguoiDung);
            var now = DateTime.Now;
            if (baiDang.TrangThai != TrangThaiBaiDang.DaDuyet
                || baiDang.NgayHetHan.HasValue && baiDang.NgayHetHan.Value <= now)
            {
                throw new DomainException("Chỉ đẩy tin đã duyệt và chưa hết hạn.");
            }

            if (!await _uow.NguoiDungs.TryTruLuotDayAsync(idNguoiDung))
                throw new DomainException("Bạn đã hết lượt đẩy tin.");

            if (!await _uow.BaiDangs.TryDayTinAsync(id, idNguoiDung, now))
                throw new DomainException("Chỉ đẩy tin đã duyệt và chưa hết hạn.");

            return true;
        });
    }

    public async Task GiaHanAsync(int id, int idNguoiDung)
    {
        await _uow.ExecuteInTransactionAsync(async () =>
        {
            var baiDang = await GetBaiDangCuaNguoiDungAsync(id, idNguoiDung);
            if (baiDang.TrangThai is not (TrangThaiBaiDang.DaDuyet or TrangThaiBaiDang.DaAn))
                throw new DomainException("Chỉ gia hạn được tin đã duyệt hoặc đang ẩn.");

            var now = DateTime.Now;
            if (!await _uow.NguoiDungs.TryTruLuotDangAsync(idNguoiDung))
                throw new DomainException("Bạn đã hết lượt đăng tin. Vui lòng mua gói dịch vụ.");

            if (!await _uow.BaiDangs.GiaHanAsync(id, idNguoiDung, now, SoNgayHienThi))
                throw new DomainException("Chỉ gia hạn được tin đã duyệt hoặc đang ẩn.");

            return true;
        });
    }

public async Task DuyetAsync(int id)
{
    var baiDang = await _uow.BaiDangs.GetByIdAsync(id)
        ?? throw new NotFoundException(nameof(BaiDang), id);

    baiDang.Duyet();
    baiDang.NgayHetHan ??= DateTime.Now.AddDays(SoNgayHienThi);

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

public async Task TuChoiAsync(int id, string? lyDo)
{
    await _tuChoiValidator.ValidateAndThrowAsync(new TuChoiBaiDangRequest(lyDo));

    var (idNguoiDung, response) = await _uow.ExecuteInTransactionAsync(async () =>
    {
        var baiDang = await _uow.BaiDangs.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(BaiDang), id);

        baiDang.TuChoi(lyDo!.Trim());

        if (await _uow.NguoiDungs.CongLuotDangAsync(baiDang.IdNguoiDung) != 1)
            throw new NotFoundException(nameof(NguoiDung), baiDang.IdNguoiDung);

        var thongBao = new ThongBao
        {
            IdNguoiDung = baiDang.IdNguoiDung,
            TieuDe = "Bài đăng bị từ chối",
            NoiDung = baiDang.TieuDe
        };

        await _uow.ThongBaos.AddAsync(thongBao);
        await _uow.SaveChangesAsync();

        return (baiDang.IdNguoiDung, new ThongBaoResponse(
            thongBao.Id,
            thongBao.TieuDe,
            thongBao.NoiDung,
            thongBao.NgayTao,
            thongBao.TrangThai));
    });

    await _thongBaoNotifier.GuiThongBaoMoiAsync(idNguoiDung, response);
}

}