using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChoDoCu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CreateIntial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    normalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    concurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "banner",
                columns: table => new
                {
                    idBanner = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    hinhAnh = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    viTri = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ngaySua = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_banner", x => x.idBanner);
                });

            migrationBuilder.CreateTable(
                name: "danhMuc",
                columns: table => new
                {
                    idDanhMuc = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idDanhMucCha = table.Column<int>(type: "int", nullable: true),
                    tenDanhMuc = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    anhDanhMuc = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_danhMuc", x => x.idDanhMuc);
                    table.ForeignKey(
                        name: "FK_danhMuc_danhMuc_idDanhMucCha",
                        column: x => x.idDanhMucCha,
                        principalTable: "danhMuc",
                        principalColumn: "idDanhMuc",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "dichVu",
                columns: table => new
                {
                    idDichVu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenDichVu = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    gia = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    thoiGianDichVu = table.Column<int>(type: "int", nullable: false),
                    luotDay = table.Column<int>(type: "int", nullable: false),
                    luotDang = table.Column<int>(type: "int", nullable: false),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dichVu", x => x.idDichVu);
                });

            migrationBuilder.CreateTable(
                name: "hang",
                columns: table => new
                {
                    idHang = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenHang = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    logo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hang", x => x.idHang);
                });

            migrationBuilder.CreateTable(
                name: "phuongThucThanhToan",
                columns: table => new
                {
                    idPhuongThucTT = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenPhuongThuc = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    moTa = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_phuongThucThanhToan", x => x.idPhuongThucTT);
                });

            migrationBuilder.CreateTable(
                name: "thanhPho",
                columns: table => new
                {
                    idThanhPho = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenThanhPho = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_thanhPho", x => x.idThanhPho);
                });

            migrationBuilder.CreateTable(
                name: "thuocTinhSanPham",
                columns: table => new
                {
                    idThuocTinh = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenThuocTinh = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_thuocTinhSanPham", x => x.idThuocTinh);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    roleId = table.Column<int>(type: "int", nullable: false),
                    claimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    claimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_roleId",
                        column: x => x.roleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "dongSanPham",
                columns: table => new
                {
                    idDongSanPham = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenDongSanPham = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    idHang = table.Column<int>(type: "int", nullable: false),
                    idDanhMuc = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dongSanPham", x => x.idDongSanPham);
                    table.ForeignKey(
                        name: "FK_dongSanPham_danhMuc_idDanhMuc",
                        column: x => x.idDanhMuc,
                        principalTable: "danhMuc",
                        principalColumn: "idDanhMuc",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_dongSanPham_hang_idHang",
                        column: x => x.idHang,
                        principalTable: "hang",
                        principalColumn: "idHang",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "phuongXa",
                columns: table => new
                {
                    idPhuongXa = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idThanhPho = table.Column<int>(type: "int", nullable: false),
                    tenPhuongXa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_phuongXa", x => x.idPhuongXa);
                    table.ForeignKey(
                        name: "FK_phuongXa_thanhPho_idThanhPho",
                        column: x => x.idThanhPho,
                        principalTable: "thanhPho",
                        principalColumn: "idThanhPho",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "dongCuThe",
                columns: table => new
                {
                    idDongCuThe = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenDongCuThe = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    idDongSanPham = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dongCuThe", x => x.idDongCuThe);
                    table.ForeignKey(
                        name: "FK_dongCuThe_dongSanPham_idDongSanPham",
                        column: x => x.idDongSanPham,
                        principalTable: "dongSanPham",
                        principalColumn: "idDongSanPham",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    idNguoiDung = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    anhNguoiDung = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    idThanhPho = table.Column<int>(type: "int", nullable: true),
                    idPhuongXa = table.Column<int>(type: "int", nullable: true),
                    hoTen = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    soDienThoai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ngaySinh = table.Column<DateTime>(type: "datetime2", nullable: false),
                    gioiTinh = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    luotDang = table.Column<int>(type: "int", nullable: false),
                    luotDay = table.Column<int>(type: "int", nullable: false),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    userName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    normalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    normalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    emailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    passWord = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    securityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    concurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    phoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    phoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    twoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    lockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    lockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    accessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.idNguoiDung);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_phuongXa_idPhuongXa",
                        column: x => x.idPhuongXa,
                        principalTable: "phuongXa",
                        principalColumn: "idPhuongXa",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_thanhPho_idThanhPho",
                        column: x => x.idThanhPho,
                        principalTable: "thanhPho",
                        principalColumn: "idThanhPho",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sanPham",
                columns: table => new
                {
                    idSanPham = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idDanhMuc = table.Column<int>(type: "int", nullable: false),
                    idHang = table.Column<int>(type: "int", nullable: false),
                    idDongSanPham = table.Column<int>(type: "int", nullable: false),
                    idDongCuThe = table.Column<int>(type: "int", nullable: false),
                    tenSanPham = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    giaTien = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    moTa = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sanPham", x => x.idSanPham);
                    table.ForeignKey(
                        name: "FK_sanPham_danhMuc_idDanhMuc",
                        column: x => x.idDanhMuc,
                        principalTable: "danhMuc",
                        principalColumn: "idDanhMuc",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sanPham_dongCuThe_idDongCuThe",
                        column: x => x.idDongCuThe,
                        principalTable: "dongCuThe",
                        principalColumn: "idDongCuThe",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sanPham_dongSanPham_idDongSanPham",
                        column: x => x.idDongSanPham,
                        principalTable: "dongSanPham",
                        principalColumn: "idDongSanPham",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sanPham_hang_idHang",
                        column: x => x.idHang,
                        principalTable: "hang",
                        principalColumn: "idHang",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    userId = table.Column<int>(type: "int", nullable: false),
                    claimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    claimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_userId",
                        column: x => x.userId,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    loginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    providerKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    providerDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    userId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.loginProvider, x.providerKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_userId",
                        column: x => x.userId,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    userId = table.Column<int>(type: "int", nullable: false),
                    roleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.userId, x.roleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_roleId",
                        column: x => x.roleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_userId",
                        column: x => x.userId,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    userId = table.Column<int>(type: "int", nullable: false),
                    loginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.userId, x.loginProvider, x.name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_userId",
                        column: x => x.userId,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hoiThoai",
                columns: table => new
                {
                    idHoiThoai = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idNguoiDung1 = table.Column<int>(type: "int", nullable: false),
                    idNguoiDung2 = table.Column<int>(type: "int", nullable: false),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    tinNhanCuoi = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hoiThoai", x => x.idHoiThoai);
                    table.ForeignKey(
                        name: "FK_hoiThoai_AspNetUsers_idNguoiDung1",
                        column: x => x.idNguoiDung1,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_hoiThoai_AspNetUsers_idNguoiDung2",
                        column: x => x.idNguoiDung2,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lichSuTimKiem",
                columns: table => new
                {
                    idLichSu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idNguoiDung = table.Column<int>(type: "int", nullable: false),
                    tuKhoa = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lichSuTimKiem", x => x.idLichSu);
                    table.ForeignKey(
                        name: "FK_lichSuTimKiem_AspNetUsers_idNguoiDung",
                        column: x => x.idNguoiDung,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "muaDichVu",
                columns: table => new
                {
                    idMuaDichVu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idDichVu = table.Column<int>(type: "int", nullable: false),
                    idNguoiDung = table.Column<int>(type: "int", nullable: false),
                    ngayMua = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ngayHetHan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_muaDichVu", x => x.idMuaDichVu);
                    table.ForeignKey(
                        name: "FK_muaDichVu_AspNetUsers_idNguoiDung",
                        column: x => x.idNguoiDung,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_muaDichVu_dichVu_idDichVu",
                        column: x => x.idDichVu,
                        principalTable: "dichVu",
                        principalColumn: "idDichVu",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "thongBao",
                columns: table => new
                {
                    idThongBao = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idNguoiDung = table.Column<int>(type: "int", nullable: false),
                    tieuDe = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    noiDung = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_thongBao", x => x.idThongBao);
                    table.ForeignKey(
                        name: "FK_thongBao_AspNetUsers_idNguoiDung",
                        column: x => x.idNguoiDung,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "baiDang",
                columns: table => new
                {
                    idBaiDang = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idNguoiDung = table.Column<int>(type: "int", nullable: false),
                    idSanPham = table.Column<int>(type: "int", nullable: false),
                    idDanhMuc = table.Column<int>(type: "int", nullable: false),
                    idThanhPho = table.Column<int>(type: "int", nullable: false),
                    idPhuongXa = table.Column<int>(type: "int", nullable: true),
                    idDichVu = table.Column<int>(type: "int", nullable: true),
                    tieuDe = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    noiDung = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    diaChi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    diaChiChiTiet = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ngayDang = table.Column<DateTime>(type: "datetime2", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    uuTien = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_baiDang", x => x.idBaiDang);
                    table.ForeignKey(
                        name: "FK_baiDang_AspNetUsers_idNguoiDung",
                        column: x => x.idNguoiDung,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_baiDang_danhMuc_idDanhMuc",
                        column: x => x.idDanhMuc,
                        principalTable: "danhMuc",
                        principalColumn: "idDanhMuc",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_baiDang_dichVu_idDichVu",
                        column: x => x.idDichVu,
                        principalTable: "dichVu",
                        principalColumn: "idDichVu",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_baiDang_phuongXa_idPhuongXa",
                        column: x => x.idPhuongXa,
                        principalTable: "phuongXa",
                        principalColumn: "idPhuongXa",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_baiDang_sanPham_idSanPham",
                        column: x => x.idSanPham,
                        principalTable: "sanPham",
                        principalColumn: "idSanPham",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_baiDang_thanhPho_idThanhPho",
                        column: x => x.idThanhPho,
                        principalTable: "thanhPho",
                        principalColumn: "idThanhPho",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sanPham_thuocTinh",
                columns: table => new
                {
                    idSanPham = table.Column<int>(type: "int", nullable: false),
                    idThuocTinh = table.Column<int>(type: "int", nullable: false),
                    giaTri = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sanPham_thuocTinh", x => new { x.idSanPham, x.idThuocTinh });
                    table.ForeignKey(
                        name: "FK_sanPham_thuocTinh_sanPham_idSanPham",
                        column: x => x.idSanPham,
                        principalTable: "sanPham",
                        principalColumn: "idSanPham",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_sanPham_thuocTinh_thuocTinhSanPham_idThuocTinh",
                        column: x => x.idThuocTinh,
                        principalTable: "thuocTinhSanPham",
                        principalColumn: "idThuocTinh",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tinNhan",
                columns: table => new
                {
                    idTinNhan = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idHoiThoai = table.Column<int>(type: "int", nullable: false),
                    idNguoiGui = table.Column<int>(type: "int", nullable: false),
                    noiDung = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    daXem = table.Column<bool>(type: "bit", nullable: false),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tinNhan", x => x.idTinNhan);
                    table.ForeignKey(
                        name: "FK_tinNhan_AspNetUsers_idNguoiGui",
                        column: x => x.idNguoiGui,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tinNhan_hoiThoai_idHoiThoai",
                        column: x => x.idHoiThoai,
                        principalTable: "hoiThoai",
                        principalColumn: "idHoiThoai",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "thanhToan",
                columns: table => new
                {
                    idThanhToan = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idMuaDichVu = table.Column<int>(type: "int", nullable: false),
                    idPhuongThucTT = table.Column<int>(type: "int", nullable: false),
                    maGiaoDichNgoai = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    maGiaoDichCongTT = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    maPhanHoiCongTT = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    tongTien = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ngayThanhToan = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_thanhToan", x => x.idThanhToan);
                    table.ForeignKey(
                        name: "FK_thanhToan_muaDichVu_idMuaDichVu",
                        column: x => x.idMuaDichVu,
                        principalTable: "muaDichVu",
                        principalColumn: "idMuaDichVu",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_thanhToan_phuongThucThanhToan_idPhuongThucTT",
                        column: x => x.idPhuongThucTT,
                        principalTable: "phuongThucThanhToan",
                        principalColumn: "idPhuongThucTT",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "anhSanPham",
                columns: table => new
                {
                    idAnhSanPham = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idBaiDang = table.Column<int>(type: "int", nullable: false),
                    url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_anhSanPham", x => x.idAnhSanPham);
                    table.ForeignKey(
                        name: "FK_anhSanPham_baiDang_idBaiDang",
                        column: x => x.idBaiDang,
                        principalTable: "baiDang",
                        principalColumn: "idBaiDang",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "baoCao",
                columns: table => new
                {
                    idBaoCao = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idNguoiDung = table.Column<int>(type: "int", nullable: false),
                    idBaiDang = table.Column<int>(type: "int", nullable: false),
                    noiDung = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_baoCao", x => x.idBaoCao);
                    table.ForeignKey(
                        name: "FK_baoCao_AspNetUsers_idNguoiDung",
                        column: x => x.idNguoiDung,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_baoCao_baiDang_idBaiDang",
                        column: x => x.idBaiDang,
                        principalTable: "baiDang",
                        principalColumn: "idBaiDang",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "yeuThich",
                columns: table => new
                {
                    idYeuThich = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    idNguoiDung = table.Column<int>(type: "int", nullable: false),
                    idBaiDang = table.Column<int>(type: "int", nullable: false),
                    ngayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_yeuThich", x => x.idYeuThich);
                    table.ForeignKey(
                        name: "FK_yeuThich_AspNetUsers_idNguoiDung",
                        column: x => x.idNguoiDung,
                        principalTable: "AspNetUsers",
                        principalColumn: "idNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_yeuThich_baiDang_idBaiDang",
                        column: x => x.idBaiDang,
                        principalTable: "baiDang",
                        principalColumn: "idBaiDang",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_anhSanPham_idBaiDang",
                table: "anhSanPham",
                column: "idBaiDang");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_roleId",
                table: "AspNetRoleClaims",
                column: "roleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "normalizedName",
                unique: true,
                filter: "[normalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_userId",
                table: "AspNetUserClaims",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_userId",
                table: "AspNetUserLogins",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_roleId",
                table: "AspNetUserRoles",
                column: "roleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "normalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_email",
                table: "AspNetUsers",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_idPhuongXa",
                table: "AspNetUsers",
                column: "idPhuongXa");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_idThanhPho",
                table: "AspNetUsers",
                column: "idThanhPho");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_soDienThoai",
                table: "AspNetUsers",
                column: "soDienThoai",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_userName",
                table: "AspNetUsers",
                column: "userName",
                unique: true,
                filter: "[userName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "normalizedUserName",
                unique: true,
                filter: "[normalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_baiDang_idDanhMuc",
                table: "baiDang",
                column: "idDanhMuc");

            migrationBuilder.CreateIndex(
                name: "IX_baiDang_idDichVu",
                table: "baiDang",
                column: "idDichVu");

            migrationBuilder.CreateIndex(
                name: "IX_baiDang_idNguoiDung",
                table: "baiDang",
                column: "idNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_baiDang_idPhuongXa",
                table: "baiDang",
                column: "idPhuongXa");

            migrationBuilder.CreateIndex(
                name: "IX_baiDang_idSanPham",
                table: "baiDang",
                column: "idSanPham",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_baiDang_idThanhPho",
                table: "baiDang",
                column: "idThanhPho");

            migrationBuilder.CreateIndex(
                name: "IX_baiDang_trangThai_ngayDang",
                table: "baiDang",
                columns: new[] { "trangThai", "ngayDang" });

            migrationBuilder.CreateIndex(
                name: "IX_baoCao_idBaiDang",
                table: "baoCao",
                column: "idBaiDang");

            migrationBuilder.CreateIndex(
                name: "IX_baoCao_idNguoiDung",
                table: "baoCao",
                column: "idNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_danhMuc_idDanhMucCha",
                table: "danhMuc",
                column: "idDanhMucCha");

            migrationBuilder.CreateIndex(
                name: "IX_dongCuThe_idDongSanPham",
                table: "dongCuThe",
                column: "idDongSanPham");

            migrationBuilder.CreateIndex(
                name: "IX_dongSanPham_idDanhMuc",
                table: "dongSanPham",
                column: "idDanhMuc");

            migrationBuilder.CreateIndex(
                name: "IX_dongSanPham_idHang",
                table: "dongSanPham",
                column: "idHang");

            migrationBuilder.CreateIndex(
                name: "IX_hoiThoai_idNguoiDung1_idNguoiDung2",
                table: "hoiThoai",
                columns: new[] { "idNguoiDung1", "idNguoiDung2" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_hoiThoai_idNguoiDung2",
                table: "hoiThoai",
                column: "idNguoiDung2");

            migrationBuilder.CreateIndex(
                name: "IX_lichSuTimKiem_idNguoiDung_ngayTao",
                table: "lichSuTimKiem",
                columns: new[] { "idNguoiDung", "ngayTao" });

            migrationBuilder.CreateIndex(
                name: "IX_muaDichVu_idDichVu",
                table: "muaDichVu",
                column: "idDichVu");

            migrationBuilder.CreateIndex(
                name: "IX_muaDichVu_idNguoiDung",
                table: "muaDichVu",
                column: "idNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_phuongXa_idThanhPho",
                table: "phuongXa",
                column: "idThanhPho");

            migrationBuilder.CreateIndex(
                name: "IX_sanPham_idDanhMuc",
                table: "sanPham",
                column: "idDanhMuc");

            migrationBuilder.CreateIndex(
                name: "IX_sanPham_idDongCuThe",
                table: "sanPham",
                column: "idDongCuThe");

            migrationBuilder.CreateIndex(
                name: "IX_sanPham_idDongSanPham",
                table: "sanPham",
                column: "idDongSanPham");

            migrationBuilder.CreateIndex(
                name: "IX_sanPham_idHang",
                table: "sanPham",
                column: "idHang");

            migrationBuilder.CreateIndex(
                name: "IX_sanPham_thuocTinh_idThuocTinh",
                table: "sanPham_thuocTinh",
                column: "idThuocTinh");

            migrationBuilder.CreateIndex(
                name: "IX_thanhPho_tenThanhPho",
                table: "thanhPho",
                column: "tenThanhPho",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_thanhToan_idMuaDichVu",
                table: "thanhToan",
                column: "idMuaDichVu");

            migrationBuilder.CreateIndex(
                name: "IX_thanhToan_idPhuongThucTT",
                table: "thanhToan",
                column: "idPhuongThucTT");

            migrationBuilder.CreateIndex(
                name: "IX_thanhToan_maGiaoDichNgoai",
                table: "thanhToan",
                column: "maGiaoDichNgoai",
                unique: true,
                filter: "[maGiaoDichNgoai] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_thongBao_idNguoiDung_trangThai",
                table: "thongBao",
                columns: new[] { "idNguoiDung", "trangThai" });

            migrationBuilder.CreateIndex(
                name: "IX_tinNhan_idHoiThoai_ngayTao",
                table: "tinNhan",
                columns: new[] { "idHoiThoai", "ngayTao" });

            migrationBuilder.CreateIndex(
                name: "IX_tinNhan_idNguoiGui",
                table: "tinNhan",
                column: "idNguoiGui");

            migrationBuilder.CreateIndex(
                name: "IX_yeuThich_idBaiDang",
                table: "yeuThich",
                column: "idBaiDang");

            migrationBuilder.CreateIndex(
                name: "IX_yeuThich_idNguoiDung_idBaiDang",
                table: "yeuThich",
                columns: new[] { "idNguoiDung", "idBaiDang" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "anhSanPham");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "banner");

            migrationBuilder.DropTable(
                name: "baoCao");

            migrationBuilder.DropTable(
                name: "lichSuTimKiem");

            migrationBuilder.DropTable(
                name: "sanPham_thuocTinh");

            migrationBuilder.DropTable(
                name: "thanhToan");

            migrationBuilder.DropTable(
                name: "thongBao");

            migrationBuilder.DropTable(
                name: "tinNhan");

            migrationBuilder.DropTable(
                name: "yeuThich");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "thuocTinhSanPham");

            migrationBuilder.DropTable(
                name: "muaDichVu");

            migrationBuilder.DropTable(
                name: "phuongThucThanhToan");

            migrationBuilder.DropTable(
                name: "hoiThoai");

            migrationBuilder.DropTable(
                name: "baiDang");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "dichVu");

            migrationBuilder.DropTable(
                name: "sanPham");

            migrationBuilder.DropTable(
                name: "phuongXa");

            migrationBuilder.DropTable(
                name: "dongCuThe");

            migrationBuilder.DropTable(
                name: "thanhPho");

            migrationBuilder.DropTable(
                name: "dongSanPham");

            migrationBuilder.DropTable(
                name: "danhMuc");

            migrationBuilder.DropTable(
                name: "hang");
        }
    }
}
