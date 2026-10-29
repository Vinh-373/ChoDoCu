using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChoDoCu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MoRongBaiDang : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateSequence<int>(
                name: "maTinSequence",
                schema: "dbo",
                startValue: 0L,
                maxValue: 99999L);

            migrationBuilder.AddColumn<string>(
                name: "danhSachGiaTriLuaChon",
                table: "thuocTinhSanPham",
                type: "nvarchar(max)",
                nullable: false,
                defaultValueSql: "'[]'");

            migrationBuilder.AddColumn<int>(
                name: "idDanhMuc",
                table: "thuocTinhSanPham",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "kieuDuLieu",
                table: "thuocTinhSanPham",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Text");

            migrationBuilder.AlterColumn<string>(
                name: "tieuDe",
                table: "baiDang",
                type: "nvarchar(70)",
                maxLength: 70,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddColumn<bool>(
                name: "choPhepChat",
                table: "baiDang",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "coThuongLuong",
                table: "baiDang",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "gia",
                table: "baiDang",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "giaChotNhanh",
                table: "baiDang",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "luotXem",
                table: "baiDang",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "lyDoTuChoi",
                table: "baiDang",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "maTin",
                table: "baiDang",
                type: "nvarchar(7)",
                maxLength: 7,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE [baiDang]
                SET [maTin] = CONCAT('CD', RIGHT('00000' + CONVERT(varchar(5), NEXT VALUE FOR dbo.maTinSequence), 5));
                """);

            migrationBuilder.AlterColumn<string>(
                name: "maTin",
                table: "baiDang",
                type: "nvarchar(7)",
                maxLength: 7,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(7)",
                oldMaxLength: 7,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "moTa",
                table: "baiDang",
                type: "nvarchar(1500)",
                maxLength: 1500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ngayCapNhat",
                table: "baiDang",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<string>(
                name: "quanHuyen",
                table: "baiDang",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "soDienThoaiLienHe",
                table: "baiDang",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "hinhAnhBaiDang",
                columns: table => new
                {
                    idBaiDang = table.Column<int>(type: "int", nullable: false),
                    thuTu = table.Column<int>(type: "int", nullable: false),
                    duongDan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    laVideo = table.Column<bool>(type: "bit", nullable: false),
                    laAnhBia = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hinhAnhBaiDang", x => new { x.idBaiDang, x.thuTu });
                    table.ForeignKey(
                        name: "FK_hinhAnhBaiDang_baiDang_idBaiDang",
                        column: x => x.idBaiDang,
                        principalTable: "baiDang",
                        principalColumn: "idBaiDang",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_thuocTinhSanPham_idDanhMuc",
                table: "thuocTinhSanPham",
                column: "idDanhMuc");

            migrationBuilder.CreateIndex(
                name: "IX_baiDang_maTin",
                table: "baiDang",
                column: "maTin",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_thuocTinhSanPham_danhMuc_idDanhMuc",
                table: "thuocTinhSanPham",
                column: "idDanhMuc",
                principalTable: "danhMuc",
                principalColumn: "idDanhMuc",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_thuocTinhSanPham_danhMuc_idDanhMuc",
                table: "thuocTinhSanPham");

            migrationBuilder.DropTable(
                name: "hinhAnhBaiDang");

            migrationBuilder.DropIndex(
                name: "IX_thuocTinhSanPham_idDanhMuc",
                table: "thuocTinhSanPham");

            migrationBuilder.DropIndex(
                name: "IX_baiDang_maTin",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "danhSachGiaTriLuaChon",
                table: "thuocTinhSanPham");

            migrationBuilder.DropColumn(
                name: "idDanhMuc",
                table: "thuocTinhSanPham");

            migrationBuilder.DropColumn(
                name: "kieuDuLieu",
                table: "thuocTinhSanPham");

            migrationBuilder.DropColumn(
                name: "choPhepChat",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "coThuongLuong",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "gia",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "giaChotNhanh",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "luotXem",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "lyDoTuChoi",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "maTin",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "moTa",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "ngayCapNhat",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "quanHuyen",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "soDienThoaiLienHe",
                table: "baiDang");

            migrationBuilder.DropSequence(
                name: "maTinSequence",
                schema: "dbo");

            migrationBuilder.AlterColumn<string>(
                name: "tieuDe",
                table: "baiDang",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(70)",
                oldMaxLength: 70);
        }
    }
}
