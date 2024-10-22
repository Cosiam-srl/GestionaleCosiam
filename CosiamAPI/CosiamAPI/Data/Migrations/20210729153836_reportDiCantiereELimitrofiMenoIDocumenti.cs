using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class reportDiCantiereELimitrofiMenoIDocumenti : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InventoryPropsList");

            migrationBuilder.DropTable(
                name: "InventoryItem");

            migrationBuilder.DropTable(
                name: "Prop");

            migrationBuilder.AddColumn<int>(
                name: "IdReport",
                table: "TimeCard",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ReportDiCantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SignId = table.Column<int>(type: "int", nullable: false),
                    JObject = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportDiCantiere", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportDiCantiere_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReportDiCantiere_File_SignId",
                        column: x => x.SignId,
                        principalTable: "File",
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
                    Quantity = table.Column<double>(type: "float", nullable: false),
                    ServizioId = table.Column<int>(type: "int", nullable: false),
                    IdReport = table.Column<int>(type: "int", nullable: false)
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
                    Quantity = table.Column<double>(type: "float", nullable: false),
                    ServizioId = table.Column<int>(type: "int", nullable: false),
                    IdReport = table.Column<int>(type: "int", nullable: false)
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
                    NumberOfHoursOfUsage = table.Column<int>(type: "int", nullable: false),
                    BeginningDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LitersOfFuel = table.Column<double>(type: "float", nullable: false),
                    FuelCost = table.Column<double>(type: "float", nullable: false),
                    MezzoId = table.Column<int>(type: "int", nullable: false),
                    IdReport = table.Column<int>(type: "int", nullable: false)
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
                name: "IX_TimeCard_IdReport",
                table: "TimeCard",
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
                name: "IX_ReportDiCantiere_IdCantiere",
                table: "ReportDiCantiere",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_ReportDiCantiere_SignId",
                table: "ReportDiCantiere",
                column: "SignId");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleCard_IdReport",
                table: "VehicleCard",
                column: "IdReport");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleCard_MezzoId",
                table: "VehicleCard",
                column: "MezzoId");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeCard_ReportDiCantiere_IdReport",
                table: "TimeCard",
                column: "IdReport",
                principalTable: "ReportDiCantiere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeCard_ReportDiCantiere_IdReport",
                table: "TimeCard");

            migrationBuilder.DropTable(
                name: "ListOfGoodsAndServicesInUse");

            migrationBuilder.DropTable(
                name: "ListOfServicesSoldToClient");

            migrationBuilder.DropTable(
                name: "VehicleCard");

            migrationBuilder.DropTable(
                name: "ReportDiCantiere");

            migrationBuilder.DropIndex(
                name: "IX_TimeCard_IdReport",
                table: "TimeCard");

            migrationBuilder.DropColumn(
                name: "IdReport",
                table: "TimeCard");

            migrationBuilder.CreateTable(
                name: "InventoryItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BrandOrBuilder = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExtimatedValue = table.Column<double>(type: "float", nullable: false),
                    Model = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SerialNumberOrLicensePlate = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryItem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Prop",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Discriminator = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PropertyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PropValue = table.Column<double>(type: "float", nullable: true),
                    StringProp_PropValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prop", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InventoryPropsList",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InventoryItemId = table.Column<int>(type: "int", nullable: false),
                    PropId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryPropsList", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryPropsList_InventoryItem_InventoryItemId",
                        column: x => x.InventoryItemId,
                        principalTable: "InventoryItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InventoryPropsList_Prop_PropId",
                        column: x => x.PropId,
                        principalTable: "Prop",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryPropsList_InventoryItemId",
                table: "InventoryPropsList",
                column: "InventoryItemId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryPropsList_PropId",
                table: "InventoryPropsList",
                column: "PropId");
        }
    }
}
