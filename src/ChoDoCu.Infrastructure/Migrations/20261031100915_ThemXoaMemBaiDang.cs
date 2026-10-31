using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChoDoCu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ThemXoaMemBaiDang : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "daXoa",
                table: "baiDang",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ngayXoa",
                table: "baiDang",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "daXoa",
                table: "baiDang");

            migrationBuilder.DropColumn(
                name: "ngayXoa",
                table: "baiDang");
        }
    }
}
