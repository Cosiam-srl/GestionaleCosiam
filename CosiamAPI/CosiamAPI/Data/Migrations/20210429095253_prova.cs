using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class prova : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CantiereId",
                table: "Personale",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ListaCapiCantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdPersonale = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListaCapiCantiere", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListaCapiCantiere_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListaCapiCantiere_Personale_IdPersonale",
                        column: x => x.IdPersonale,
                        principalTable: "Personale",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListaProjectManagerCantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdPersonale = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListaProjectManagerCantiere", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListaProjectManagerCantiere_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListaProjectManagerCantiere_Personale_IdPersonale",
                        column: x => x.IdPersonale,
                        principalTable: "Personale",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Personale_CantiereId",
                table: "Personale",
                column: "CantiereId");

            migrationBuilder.CreateIndex(
                name: "IX_ListaCapiCantiere_IdCantiere",
                table: "ListaCapiCantiere",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_ListaCapiCantiere_IdPersonale",
                table: "ListaCapiCantiere",
                column: "IdPersonale");

            migrationBuilder.CreateIndex(
                name: "IX_ListaProjectManagerCantiere_IdCantiere",
                table: "ListaProjectManagerCantiere",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_ListaProjectManagerCantiere_IdPersonale",
                table: "ListaProjectManagerCantiere",
                column: "IdPersonale");

            migrationBuilder.AddForeignKey(
                name: "FK_Personale_Cantiere_CantiereId",
                table: "Personale",
                column: "CantiereId",
                principalTable: "Cantiere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Personale_Cantiere_CantiereId",
                table: "Personale");

            migrationBuilder.DropTable(
                name: "ListaCapiCantiere");

            migrationBuilder.DropTable(
                name: "ListaProjectManagerCantiere");

            migrationBuilder.DropIndex(
                name: "IX_Personale_CantiereId",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "CantiereId",
                table: "Personale");
        }
    }
}
