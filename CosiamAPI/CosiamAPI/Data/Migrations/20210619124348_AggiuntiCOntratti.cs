using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiuntiCOntratti : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Contratto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdCliente = table.Column<int>(type: "int", nullable: false),
                    shortDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    longDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    cig = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    cup = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    soa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    idPm = table.Column<int>(type: "int", nullable: false),
                    Place = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    YearOfCompletition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    netContractualAmount = table.Column<int>(type: "int", nullable: true),
                    extraWorkAmount = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contratto", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contratto_Clienti_IdCliente",
                        column: x => x.IdCliente,
                        principalTable: "Clienti",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Contratto_Personale_idPm",
                        column: x => x.idPm,
                        principalTable: "Personale",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contratto_IdCliente",
                table: "Contratto",
                column: "IdCliente");

            migrationBuilder.CreateIndex(
                name: "IX_Contratto_idPm",
                table: "Contratto",
                column: "idPm");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Contratto");
        }
    }
}
