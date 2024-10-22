using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class modificatoModellaPersona : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "extraordinaryPrice",
                table: "Personale",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "ordinaryPrice",
                table: "Personale",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "skills",
                table: "Personale",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "InventoryItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Model = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SerialNumberOrLicensePlate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BrandOrBuilder = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExtimatedValue = table.Column<double>(type: "float", nullable: false)
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
                    PropertyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Discriminator = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    PropId = table.Column<int>(type: "int", nullable: false),
                    InventoryItemId = table.Column<int>(type: "int", nullable: false)
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InventoryPropsList");

            migrationBuilder.DropTable(
                name: "InventoryItem");

            migrationBuilder.DropTable(
                name: "Prop");

            migrationBuilder.DropColumn(
                name: "extraordinaryPrice",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "ordinaryPrice",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "skills",
                table: "Personale");
        }
    }
}
