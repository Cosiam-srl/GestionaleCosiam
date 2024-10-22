using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class ModificataGerstioneQuestionario : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JObject",
                table: "ReportDiCantiere");

            migrationBuilder.CreateTable(
                name: "AllegatiEQuestionarioReportModel",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    commenti = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fornitori = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    meteo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    mezzi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    risorseUmane = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdReport = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AllegatiEQuestionarioReportModel", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AllegatiEQuestionarioReportModel_ReportDiCantiere_IdReport",
                        column: x => x.IdReport,
                        principalTable: "ReportDiCantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AllegatiEQuestionarioReportModel_IdReport",
                table: "AllegatiEQuestionarioReportModel",
                column: "IdReport");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AllegatiEQuestionarioReportModel");

            migrationBuilder.AddColumn<string>(
                name: "JObject",
                table: "ReportDiCantiere",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
