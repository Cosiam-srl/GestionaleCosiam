using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiuntoBudget : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Budget",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RicaviPrevisionali = table.Column<double>(type: "float", nullable: false),
                    CostiPrevisionali = table.Column<double>(type: "float", nullable: false),
                    UtilePrevisionale = table.Column<double>(type: "float", nullable: false),
                    RicaviConsuntivi = table.Column<double>(type: "float", nullable: false),
                    CostiConsuntivi = table.Column<double>(type: "float", nullable: false),
                    UtileConsuntivo = table.Column<double>(type: "float", nullable: false),
                    PercentualeRicavi = table.Column<int>(type: "int", nullable: false),
                    CostiPercentuale = table.Column<int>(type: "int", nullable: false),
                    UtilePercentuale = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Budget", x => x.id);
                    table.ForeignKey(
                        name: "FK_Budget_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Budget_IdCantiere",
                table: "Budget",
                column: "IdCantiere");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Budget");
        }
    }
}
