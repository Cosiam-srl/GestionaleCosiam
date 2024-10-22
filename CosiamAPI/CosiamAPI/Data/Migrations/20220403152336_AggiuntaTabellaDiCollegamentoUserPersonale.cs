using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiuntaTabellaDiCollegamentoUserPersonale : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProfileManagement",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdUser = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    IdPersonale = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileManagement", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfileManagement_AspNetUsers_IdUser",
                        column: x => x.IdUser,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfileManagement_Personale_IdPersonale",
                        column: x => x.IdPersonale,
                        principalTable: "Personale",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProfileManagement_IdPersonale",
                table: "ProfileManagement",
                column: "IdPersonale",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfileManagement_IdUser",
                table: "ProfileManagement",
                column: "IdUser",
                unique: true,
                filter: "[IdUser] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProfileManagement");
        }
    }
}
