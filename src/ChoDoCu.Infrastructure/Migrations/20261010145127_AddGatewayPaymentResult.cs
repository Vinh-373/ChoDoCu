using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChoDoCu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGatewayPaymentResult : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Bổ sung mã giao dịch, mã phản hồi của cổng và thời điểm thanh toán thành công.
            migrationBuilder.AddColumn<string>(
                name: "maGiaoDichCongTT",
                table: "thanhToan",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "maPhanHoiCongTT",
                table: "thanhToan",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ngayThanhToan",
                table: "thanhToan",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Hoàn tác ba cột kết quả nếu migration bị rollback.
            migrationBuilder.DropColumn(
                name: "maGiaoDichCongTT",
                table: "thanhToan");

            migrationBuilder.DropColumn(
                name: "maPhanHoiCongTT",
                table: "thanhToan");

            migrationBuilder.DropColumn(
                name: "ngayThanhToan",
                table: "thanhToan");
        }
    }
}
