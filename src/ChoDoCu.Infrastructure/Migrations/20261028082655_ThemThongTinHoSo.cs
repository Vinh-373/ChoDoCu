using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChoDoCu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ThemThongTinHoSo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "diaChiChiTiet",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gioiThieu",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "tenGianHang",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "diaChiChiTiet",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "gioiThieu",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "tenGianHang",
                table: "AspNetUsers");
        }
    }
}
