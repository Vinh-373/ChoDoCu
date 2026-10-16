using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChoDoCu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetRoleClaims_Roles_roleId",
                table: "AspNetRoleClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserClaims_nguoiDung_userId",
                table: "AspNetUserClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserLogins_nguoiDung_userId",
                table: "AspNetUserLogins");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_Roles_roleId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_nguoiDung_userId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserTokens_nguoiDung_userId",
                table: "AspNetUserTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_baiDang_nguoiDung_idNguoiDung",
                table: "baiDang");

            migrationBuilder.DropForeignKey(
                name: "FK_baoCao_nguoiDung_idNguoiDung",
                table: "baoCao");

            migrationBuilder.DropForeignKey(
                name: "FK_hoiThoai_nguoiDung_idNguoiDung1",
                table: "hoiThoai");

            migrationBuilder.DropForeignKey(
                name: "FK_hoiThoai_nguoiDung_idNguoiDung2",
                table: "hoiThoai");

            migrationBuilder.DropForeignKey(
                name: "FK_lichSuTimKiem_nguoiDung_idNguoiDung",
                table: "lichSuTimKiem");

            migrationBuilder.DropForeignKey(
                name: "FK_muaDichVu_nguoiDung_idNguoiDung",
                table: "muaDichVu");

            migrationBuilder.DropForeignKey(
                name: "FK_nguoiDung_phuongXa_idPhuongXa",
                table: "nguoiDung");

            migrationBuilder.DropForeignKey(
                name: "FK_nguoiDung_thanhPho_idThanhPho",
                table: "nguoiDung");

            migrationBuilder.DropForeignKey(
                name: "FK_thongBao_nguoiDung_idNguoiDung",
                table: "thongBao");

            migrationBuilder.DropForeignKey(
                name: "FK_tinNhan_nguoiDung_idNguoiGui",
                table: "tinNhan");

            migrationBuilder.DropForeignKey(
                name: "FK_yeuThich_nguoiDung_idNguoiDung",
                table: "yeuThich");

            migrationBuilder.DropTable(
                name: "RoleChucNangs");

            migrationBuilder.DropTable(
                name: "ChucNangs");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_nguoiDung",
                table: "nguoiDung");

            migrationBuilder.DropColumn(
                name: "idRole",
                table: "nguoiDung");

            migrationBuilder.RenameTable(
                name: "nguoiDung",
                newName: "AspNetUsers");

            migrationBuilder.RenameIndex(
                name: "IX_nguoiDung_userName",
                table: "AspNetUsers",
                newName: "IX_AspNetUsers_userName");

            migrationBuilder.RenameIndex(
                name: "IX_nguoiDung_soDienThoai",
                table: "AspNetUsers",
                newName: "IX_AspNetUsers_soDienThoai");

            migrationBuilder.RenameIndex(
                name: "IX_nguoiDung_idThanhPho",
                table: "AspNetUsers",
                newName: "IX_AspNetUsers_idThanhPho");

            migrationBuilder.RenameIndex(
                name: "IX_nguoiDung_idPhuongXa",
                table: "AspNetUsers",
                newName: "IX_AspNetUsers_idPhuongXa");

            migrationBuilder.RenameIndex(
                name: "IX_nguoiDung_email",
                table: "AspNetUsers",
                newName: "IX_AspNetUsers_email");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AspNetUsers",
                table: "AspNetUsers",
                column: "idNguoiDung");

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

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "normalizedName",
                unique: true,
                filter: "[normalizedName] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_roleId",
                table: "AspNetRoleClaims",
                column: "roleId",
                principalTable: "AspNetRoles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_userId",
                table: "AspNetUserClaims",
                column: "userId",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_userId",
                table: "AspNetUserLogins",
                column: "userId",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_roleId",
                table: "AspNetUserRoles",
                column: "roleId",
                principalTable: "AspNetRoles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_userId",
                table: "AspNetUserRoles",
                column: "userId",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_phuongXa_idPhuongXa",
                table: "AspNetUsers",
                column: "idPhuongXa",
                principalTable: "phuongXa",
                principalColumn: "idPhuongXa",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_thanhPho_idThanhPho",
                table: "AspNetUsers",
                column: "idThanhPho",
                principalTable: "thanhPho",
                principalColumn: "idThanhPho",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_userId",
                table: "AspNetUserTokens",
                column: "userId",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_baiDang_AspNetUsers_idNguoiDung",
                table: "baiDang",
                column: "idNguoiDung",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_baoCao_AspNetUsers_idNguoiDung",
                table: "baoCao",
                column: "idNguoiDung",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_hoiThoai_AspNetUsers_idNguoiDung1",
                table: "hoiThoai",
                column: "idNguoiDung1",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_hoiThoai_AspNetUsers_idNguoiDung2",
                table: "hoiThoai",
                column: "idNguoiDung2",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_lichSuTimKiem_AspNetUsers_idNguoiDung",
                table: "lichSuTimKiem",
                column: "idNguoiDung",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_muaDichVu_AspNetUsers_idNguoiDung",
                table: "muaDichVu",
                column: "idNguoiDung",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_thongBao_AspNetUsers_idNguoiDung",
                table: "thongBao",
                column: "idNguoiDung",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_tinNhan_AspNetUsers_idNguoiGui",
                table: "tinNhan",
                column: "idNguoiGui",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_yeuThich_AspNetUsers_idNguoiDung",
                table: "yeuThich",
                column: "idNguoiDung",
                principalTable: "AspNetUsers",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_roleId",
                table: "AspNetRoleClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_userId",
                table: "AspNetUserClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_userId",
                table: "AspNetUserLogins");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_roleId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_userId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_phuongXa_idPhuongXa",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_thanhPho_idThanhPho",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_userId",
                table: "AspNetUserTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_baiDang_AspNetUsers_idNguoiDung",
                table: "baiDang");

            migrationBuilder.DropForeignKey(
                name: "FK_baoCao_AspNetUsers_idNguoiDung",
                table: "baoCao");

            migrationBuilder.DropForeignKey(
                name: "FK_hoiThoai_AspNetUsers_idNguoiDung1",
                table: "hoiThoai");

            migrationBuilder.DropForeignKey(
                name: "FK_hoiThoai_AspNetUsers_idNguoiDung2",
                table: "hoiThoai");

            migrationBuilder.DropForeignKey(
                name: "FK_lichSuTimKiem_AspNetUsers_idNguoiDung",
                table: "lichSuTimKiem");

            migrationBuilder.DropForeignKey(
                name: "FK_muaDichVu_AspNetUsers_idNguoiDung",
                table: "muaDichVu");

            migrationBuilder.DropForeignKey(
                name: "FK_thongBao_AspNetUsers_idNguoiDung",
                table: "thongBao");

            migrationBuilder.DropForeignKey(
                name: "FK_tinNhan_AspNetUsers_idNguoiGui",
                table: "tinNhan");

            migrationBuilder.DropForeignKey(
                name: "FK_yeuThich_AspNetUsers_idNguoiDung",
                table: "yeuThich");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AspNetUsers",
                table: "AspNetUsers");

            migrationBuilder.RenameTable(
                name: "AspNetUsers",
                newName: "nguoiDung");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUsers_userName",
                table: "nguoiDung",
                newName: "IX_nguoiDung_userName");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUsers_soDienThoai",
                table: "nguoiDung",
                newName: "IX_nguoiDung_soDienThoai");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUsers_idThanhPho",
                table: "nguoiDung",
                newName: "IX_nguoiDung_idThanhPho");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUsers_idPhuongXa",
                table: "nguoiDung",
                newName: "IX_nguoiDung_idPhuongXa");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUsers_email",
                table: "nguoiDung",
                newName: "IX_nguoiDung_email");

            migrationBuilder.AddColumn<string>(
                name: "idRole",
                table: "nguoiDung",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_nguoiDung",
                table: "nguoiDung",
                column: "idNguoiDung");

            migrationBuilder.CreateTable(
                name: "ChucNangs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenChucNang = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChucNangs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    concurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    moTa = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    normalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    tenChucVu = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    trangThai = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "RoleChucNangs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    chucNangId = table.Column<int>(type: "int", nullable: false),
                    roleId = table.Column<int>(type: "int", nullable: false),
                    idChucNang = table.Column<int>(type: "int", nullable: false),
                    idRole = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleChucNangs", x => x.id);
                    table.ForeignKey(
                        name: "FK_RoleChucNangs_ChucNangs_chucNangId",
                        column: x => x.chucNangId,
                        principalTable: "ChucNangs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleChucNangs_Roles_roleId",
                        column: x => x.roleId,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RoleChucNangs_chucNangId",
                table: "RoleChucNangs",
                column: "chucNangId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleChucNangs_roleId",
                table: "RoleChucNangs",
                column: "roleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "Roles",
                column: "normalizedName",
                unique: true,
                filter: "[normalizedName] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetRoleClaims_Roles_roleId",
                table: "AspNetRoleClaims",
                column: "roleId",
                principalTable: "Roles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserClaims_nguoiDung_userId",
                table: "AspNetUserClaims",
                column: "userId",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserLogins_nguoiDung_userId",
                table: "AspNetUserLogins",
                column: "userId",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_Roles_roleId",
                table: "AspNetUserRoles",
                column: "roleId",
                principalTable: "Roles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_nguoiDung_userId",
                table: "AspNetUserRoles",
                column: "userId",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserTokens_nguoiDung_userId",
                table: "AspNetUserTokens",
                column: "userId",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_baiDang_nguoiDung_idNguoiDung",
                table: "baiDang",
                column: "idNguoiDung",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_baoCao_nguoiDung_idNguoiDung",
                table: "baoCao",
                column: "idNguoiDung",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_hoiThoai_nguoiDung_idNguoiDung1",
                table: "hoiThoai",
                column: "idNguoiDung1",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_hoiThoai_nguoiDung_idNguoiDung2",
                table: "hoiThoai",
                column: "idNguoiDung2",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_lichSuTimKiem_nguoiDung_idNguoiDung",
                table: "lichSuTimKiem",
                column: "idNguoiDung",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_muaDichVu_nguoiDung_idNguoiDung",
                table: "muaDichVu",
                column: "idNguoiDung",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_nguoiDung_phuongXa_idPhuongXa",
                table: "nguoiDung",
                column: "idPhuongXa",
                principalTable: "phuongXa",
                principalColumn: "idPhuongXa",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_nguoiDung_thanhPho_idThanhPho",
                table: "nguoiDung",
                column: "idThanhPho",
                principalTable: "thanhPho",
                principalColumn: "idThanhPho",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_thongBao_nguoiDung_idNguoiDung",
                table: "thongBao",
                column: "idNguoiDung",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_tinNhan_nguoiDung_idNguoiGui",
                table: "tinNhan",
                column: "idNguoiGui",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_yeuThich_nguoiDung_idNguoiDung",
                table: "yeuThich",
                column: "idNguoiDung",
                principalTable: "nguoiDung",
                principalColumn: "idNguoiDung",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
