using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChoDoCu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChuanHoaTrangThaiBiTuChoi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE baiDang SET trangThai = 'BiTuChoi' WHERE trangThai = 'TuChoi'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
