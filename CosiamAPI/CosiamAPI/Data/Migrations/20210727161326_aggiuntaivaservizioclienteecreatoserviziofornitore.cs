using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class aggiuntaivaservizioclienteecreatoserviziofornitore : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IVA",
                table: "ServizioCliente",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ServizioFornitore",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UM = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PricePerUM = table.Column<double>(type: "float", nullable: false),
                    IVA = table.Column<int>(type: "int", nullable: false),
                    IdFornitore = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServizioFornitore", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServizioFornitore_Fornitori_IdFornitore",
                        column: x => x.IdFornitore,
                        principalTable: "Fornitori",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServizioFornitore_IdFornitore",
                table: "ServizioFornitore",
                column: "IdFornitore");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServizioFornitore");

            migrationBuilder.DropColumn(
                name: "IVA",
                table: "ServizioCliente");
        }
    }
}
