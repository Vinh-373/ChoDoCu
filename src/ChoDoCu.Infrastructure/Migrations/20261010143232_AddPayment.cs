using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChoDoCu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "maGiaoDichNgoai",
                table: "thanhToan",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_thanhToan_maGiaoDichNgoai",
                table: "thanhToan",
                column: "maGiaoDichNgoai",
                unique: true,
                filter: "[maGiaoDichNgoai] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_thanhToan_maGiaoDichNgoai",
                table: "thanhToan");

            migrationBuilder.DropColumn(
                name: "maGiaoDichNgoai",
                table: "thanhToan");
        }
    }
}
