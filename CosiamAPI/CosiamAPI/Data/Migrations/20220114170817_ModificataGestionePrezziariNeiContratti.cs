using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class ModificataGestionePrezziariNeiContratti : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contratto_PrezziarioCliente_IdPrezziarioCliente",
                table: "Contratto");

            migrationBuilder.DropIndex(
                name: "IX_Contratto_IdPrezziarioCliente",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "IdPrezziarioCliente",
                table: "Contratto");

            migrationBuilder.CreateTable(
                name: "ListaPrezzariContratto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdContratto = table.Column<int>(type: "int", nullable: false),
                    IdPrezziario = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListaPrezzariContratto", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListaPrezzariContratto_Contratto_IdContratto",
                        column: x => x.IdContratto,
                        principalTable: "Contratto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListaPrezzariContratto_PrezziarioCliente_IdPrezziario",
                        column: x => x.IdPrezziario,
                        principalTable: "PrezziarioCliente",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListaPrezzariContratto_IdContratto",
                table: "ListaPrezzariContratto",
                column: "IdContratto");

            migrationBuilder.CreateIndex(
                name: "IX_ListaPrezzariContratto_IdPrezziario",
                table: "ListaPrezzariContratto",
                column: "IdPrezziario");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListaPrezzariContratto");

            migrationBuilder.AddColumn<int>(
                name: "IdPrezziarioCliente",
                table: "Contratto",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Contratto_IdPrezziarioCliente",
                table: "Contratto",
                column: "IdPrezziarioCliente");

            migrationBuilder.AddForeignKey(
                name: "FK_Contratto_PrezziarioCliente_IdPrezziarioCliente",
                table: "Contratto",
                column: "IdPrezziarioCliente",
                principalTable: "PrezziarioCliente",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
