using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class sistematoPrezziarioClienteERelativiServizi : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServizioCliente_BeniEServizi_IdBeniEServizi",
                table: "ServizioCliente");

            migrationBuilder.DropForeignKey(
                name: "FK_ServizioCliente_Clienti_IdCliente",
                table: "ServizioCliente");

            migrationBuilder.DropTable(
                name: "ServizioFornitore");

            migrationBuilder.DropIndex(
                name: "IX_ServizioCliente_IdCliente",
                table: "ServizioCliente");

            migrationBuilder.DropColumn(
                name: "IdCliente",
                table: "ServizioCliente");

            migrationBuilder.DropColumn(
                name: "IVA",
                table: "BeniEServizi");

            migrationBuilder.RenameColumn(
                name: "pricePerUm",
                table: "ServizioCliente",
                newName: "PricePerUm");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "ServizioCliente",
                newName: "ID");

            migrationBuilder.RenameColumn(
                name: "IdBeniEServizi",
                table: "ServizioCliente",
                newName: "IdPrezziario");

            migrationBuilder.RenameIndex(
                name: "IX_ServizioCliente_IdBeniEServizi",
                table: "ServizioCliente",
                newName: "IX_ServizioCliente_IdPrezziario");

            migrationBuilder.RenameColumn(
                name: "Um",
                table: "BeniEServizi",
                newName: "ValidationYear");

            migrationBuilder.AlterColumn<double>(
                name: "PricePerUm",
                table: "ServizioCliente",
                type: "float",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "real");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "ServizioCliente",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "ServizioCliente",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UM",
                table: "ServizioCliente",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdPrezziarioGenerale",
                table: "Contratto",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ScontoCliente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdPrezziarioCliente = table.Column<int>(type: "int", nullable: false),
                    Sconto = table.Column<int>(type: "int", nullable: false),
                    IdCliente = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScontoCliente", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScontoCliente_BeniEServizi_IdPrezziarioCliente",
                        column: x => x.IdPrezziarioCliente,
                        principalTable: "BeniEServizi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScontoCliente_Clienti_IdCliente",
                        column: x => x.IdCliente,
                        principalTable: "Clienti",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScontoCliente_IdCliente",
                table: "ScontoCliente",
                column: "IdCliente");

            migrationBuilder.CreateIndex(
                name: "IX_ScontoCliente_IdPrezziarioCliente",
                table: "ScontoCliente",
                column: "IdPrezziarioCliente");

            migrationBuilder.AddForeignKey(
                name: "FK_ServizioCliente_BeniEServizi_IdPrezziario",
                table: "ServizioCliente",
                column: "IdPrezziario",
                principalTable: "BeniEServizi",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServizioCliente_BeniEServizi_IdPrezziario",
                table: "ServizioCliente");

            migrationBuilder.DropTable(
                name: "ScontoCliente");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "ServizioCliente");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "ServizioCliente");

            migrationBuilder.DropColumn(
                name: "UM",
                table: "ServizioCliente");

            migrationBuilder.DropColumn(
                name: "IdPrezziarioGenerale",
                table: "Contratto");

            migrationBuilder.RenameColumn(
                name: "PricePerUm",
                table: "ServizioCliente",
                newName: "pricePerUm");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "ServizioCliente",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "IdPrezziario",
                table: "ServizioCliente",
                newName: "IdBeniEServizi");

            migrationBuilder.RenameIndex(
                name: "IX_ServizioCliente_IdPrezziario",
                table: "ServizioCliente",
                newName: "IX_ServizioCliente_IdBeniEServizi");

            migrationBuilder.RenameColumn(
                name: "ValidationYear",
                table: "BeniEServizi",
                newName: "Um");

            migrationBuilder.AlterColumn<float>(
                name: "pricePerUm",
                table: "ServizioCliente",
                type: "real",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AddColumn<int>(
                name: "IdCliente",
                table: "ServizioCliente",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IVA",
                table: "BeniEServizi",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ServizioFornitore",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdBeniEServizi = table.Column<int>(type: "int", nullable: false),
                    IdFornitore = table.Column<int>(type: "int", nullable: true),
                    pricePerUm = table.Column<float>(type: "real", nullable: false)
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
                        name: "FK_ServizioFornitore_Fornitori_IdFornitore",
                        column: x => x.IdFornitore,
                        principalTable: "Fornitori",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServizioCliente_IdCliente",
                table: "ServizioCliente",
                column: "IdCliente");

            migrationBuilder.CreateIndex(
                name: "IX_ServizioFornitore_IdBeniEServizi",
                table: "ServizioFornitore",
                column: "IdBeniEServizi");

            migrationBuilder.CreateIndex(
                name: "IX_ServizioFornitore_IdFornitore",
                table: "ServizioFornitore",
                column: "IdFornitore");

            migrationBuilder.AddForeignKey(
                name: "FK_ServizioCliente_BeniEServizi_IdBeniEServizi",
                table: "ServizioCliente",
                column: "IdBeniEServizi",
                principalTable: "BeniEServizi",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServizioCliente_Clienti_IdCliente",
                table: "ServizioCliente",
                column: "IdCliente",
                principalTable: "Clienti",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
