using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiuntoIndexerPerServiziClienteInPrezziarioClienteBis : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WordsCounter",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdPrezziarioCliente = table.Column<int>(type: "int", nullable: false),
                    word = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    idServizioCliente = table.Column<int>(type: "int", nullable: false),
                    counter = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WordsCounter", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WordsCounter_PrezziarioCliente_IdPrezziarioCliente",
                        column: x => x.IdPrezziarioCliente,
                        principalTable: "PrezziarioCliente",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_WordsCounter_ServizioCliente_idServizioCliente",
                        column: x => x.idServizioCliente,
                        principalTable: "ServizioCliente",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WordsCounter_IdPrezziarioCliente",
                table: "WordsCounter",
                column: "IdPrezziarioCliente");

            migrationBuilder.CreateIndex(
                name: "IX_WordsCounter_idServizioCliente",
                table: "WordsCounter",
                column: "idServizioCliente");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WordsCounter");
        }
    }
}
