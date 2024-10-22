using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class modificataLogicaFirmaReportFanculoSQL : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DocumentsList",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdFile = table.Column<int>(type: "int", nullable: false),
                    IdReport = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentsList", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentsList_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentsList_File_IdFile",
                        column: x => x.IdFile,
                        principalTable: "File",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentsList_ReportDiCantiere_IdReport",
                        column: x => x.IdReport,
                        principalTable: "ReportDiCantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentsList_IdCantiere",
                table: "DocumentsList",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentsList_IdFile",
                table: "DocumentsList",
                column: "IdFile");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentsList_IdReport",
                table: "DocumentsList",
                column: "IdReport");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentsList");
        }
    }
}
