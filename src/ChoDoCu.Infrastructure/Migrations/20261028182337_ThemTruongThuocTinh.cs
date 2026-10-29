using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChoDoCu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ThemTruongThuocTinh : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "batBuoc",
                table: "thuocTinhSanPham",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "idThuocTinhCha",
                table: "thuocTinhSanPham",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "thuTu",
                table: "thuocTinhSanPham",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_thuocTinhSanPham_idThuocTinhCha",
                table: "thuocTinhSanPham",
                column: "idThuocTinhCha");

            migrationBuilder.AddForeignKey(
                name: "FK_thuocTinhSanPham_thuocTinhSanPham_idThuocTinhCha",
                table: "thuocTinhSanPham",
                column: "idThuocTinhCha",
                principalTable: "thuocTinhSanPham",
                principalColumn: "idThuocTinh",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_thuocTinhSanPham_thuocTinhSanPham_idThuocTinhCha",
                table: "thuocTinhSanPham");

            migrationBuilder.DropIndex(
                name: "IX_thuocTinhSanPham_idThuocTinhCha",
                table: "thuocTinhSanPham");

            migrationBuilder.DropColumn(
                name: "batBuoc",
                table: "thuocTinhSanPham");

            migrationBuilder.DropColumn(
                name: "idThuocTinhCha",
                table: "thuocTinhSanPham");

            migrationBuilder.DropColumn(
                name: "thuTu",
                table: "thuocTinhSanPham");
        }
    }
}
