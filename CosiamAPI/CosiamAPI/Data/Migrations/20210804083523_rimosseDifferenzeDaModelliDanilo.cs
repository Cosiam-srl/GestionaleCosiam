using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class rimosseDifferenzeDaModelliDanilo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentsList");

            migrationBuilder.DropTable(
                name: "ListOfGoodsAndServicesInUse");

            migrationBuilder.DropTable(
                name: "ListOfServicesSoldToClient");

            migrationBuilder.DropTable(
                name: "VehicleCard");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DocumentsList",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdCantiere = table.Column<int>(type: "int", nullable: false),
                    IdFile = table.Column<int>(type: "int", nullable: false),
                    IdReport = table.Column<int>(type: "int", nullable: false)
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
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListOfGoodsAndServicesInUse",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdReport = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<double>(type: "float", nullable: false),
                    ServizioId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListOfGoodsAndServicesInUse", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListOfGoodsAndServicesInUse_ReportDiCantiere_IdReport",
                        column: x => x.IdReport,
                        principalTable: "ReportDiCantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListOfGoodsAndServicesInUse_ServizioFornitore_ServizioId",
                        column: x => x.ServizioId,
                        principalTable: "ServizioFornitore",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListOfServicesSoldToClient",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdReport = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<double>(type: "float", nullable: false),
                    ServizioId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListOfServicesSoldToClient", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListOfServicesSoldToClient_ReportDiCantiere_IdReport",
                        column: x => x.IdReport,
                        principalTable: "ReportDiCantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListOfServicesSoldToClient_ServizioCliente_ServizioId",
                        column: x => x.ServizioId,
                        principalTable: "ServizioCliente",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VehicleCard",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BeginningDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FuelCost = table.Column<double>(type: "float", nullable: false),
                    IdReport = table.Column<int>(type: "int", nullable: false),
                    LitersOfFuel = table.Column<double>(type: "float", nullable: false),
                    MezzoId = table.Column<int>(type: "int", nullable: false),
                    NumberOfHoursOfUsage = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleCard", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VehicleCard_Mezzi_MezzoId",
                        column: x => x.MezzoId,
                        principalTable: "Mezzi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VehicleCard_ReportDiCantiere_IdReport",
                        column: x => x.IdReport,
                        principalTable: "ReportDiCantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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

            migrationBuilder.CreateIndex(
                name: "IX_ListOfGoodsAndServicesInUse_IdReport",
                table: "ListOfGoodsAndServicesInUse",
                column: "IdReport");

            migrationBuilder.CreateIndex(
                name: "IX_ListOfGoodsAndServicesInUse_ServizioId",
                table: "ListOfGoodsAndServicesInUse",
                column: "ServizioId");

            migrationBuilder.CreateIndex(
                name: "IX_ListOfServicesSoldToClient_IdReport",
                table: "ListOfServicesSoldToClient",
                column: "IdReport");

            migrationBuilder.CreateIndex(
                name: "IX_ListOfServicesSoldToClient_ServizioId",
                table: "ListOfServicesSoldToClient",
                column: "ServizioId");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleCard_IdReport",
                table: "VehicleCard",
                column: "IdReport");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleCard_MezzoId",
                table: "VehicleCard",
                column: "MezzoId");
        }
    }
}
