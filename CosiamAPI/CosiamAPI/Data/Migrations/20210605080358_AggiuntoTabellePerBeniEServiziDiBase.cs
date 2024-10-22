using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiuntoTabellePerBeniEServiziDiBase : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BeniEServizi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Um = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BeniEServizi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServizioCliente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdBeniEServizi = table.Column<int>(type: "int", nullable: false),
                    pricePerUm = table.Column<float>(type: "real", nullable: false),
                    IdCliente = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServizioCliente", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServizioCliente_BeniEServizi_IdBeniEServizi",
                        column: x => x.IdBeniEServizi,
                        principalTable: "BeniEServizi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServizioCliente_Clienti_IdCliente",
                        column: x => x.IdCliente,
                        principalTable: "Clienti",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ServizioFornitore",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdBeniEServizi = table.Column<int>(type: "int", nullable: false),
                    pricePerUm = table.Column<float>(type: "real", nullable: false),
                    IdFornitore = table.Column<int>(type: "int", nullable: true),
                    IdCliente = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServizioFornitore", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServizioFornitore_BeniEServizi_IdBeniEServizi",
                        column: x => x.IdBeniEServizi,
                        principalTable: "BeniEServizi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServizioFornitore_Fornitori_IdCliente",
                        column: x => x.IdCliente,
                        principalTable: "Fornitori",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServizioCliente_IdBeniEServizi",
                table: "ServizioCliente",
                column: "IdBeniEServizi");

            migrationBuilder.CreateIndex(
                name: "IX_ServizioCliente_IdCliente",
                table: "ServizioCliente",
                column: "IdCliente");

            migrationBuilder.CreateIndex(
                name: "IX_ServizioFornitore_IdBeniEServizi",
                table: "ServizioFornitore",
                column: "IdBeniEServizi");

            migrationBuilder.CreateIndex(
                name: "IX_ServizioFornitore_IdCliente",
                table: "ServizioFornitore",
                column: "IdCliente");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServizioCliente");

            migrationBuilder.DropTable(
                name: "ServizioFornitore");

            migrationBuilder.DropTable(
                name: "BeniEServizi");
        }
    }
}
