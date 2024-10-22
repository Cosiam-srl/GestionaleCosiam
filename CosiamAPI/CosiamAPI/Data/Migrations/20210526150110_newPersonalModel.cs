using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class newPersonalModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Personale_Ruoli_RuoliId",
                table: "Personale");

            migrationBuilder.DropTable(
                name: "Ruoli");

            migrationBuilder.DropIndex(
                name: "IX_Personale_RuoliId",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "RuoliId",
                table: "Personale");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Personale",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BirthPlace",
                table: "Personale",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "ConsegnaDPI",
                table: "Personale",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ConsegnaTesserino",
                table: "Personale",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Employed",
                table: "Personale",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "HiringEndDate",
                table: "Personale",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "HiringStartDate",
                table: "Personale",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "OrganizationRole",
                table: "Personale",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Personale",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "contract",
                table: "Personale",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "job",
                table: "Personale",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "medicalIdoneity",
                table: "Personale",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "BirthPlace",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "ConsegnaDPI",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "ConsegnaTesserino",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "Employed",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "HiringEndDate",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "HiringStartDate",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "OrganizationRole",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "contract",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "job",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "medicalIdoneity",
                table: "Personale");

            migrationBuilder.AddColumn<int>(
                name: "RuoliId",
                table: "Personale",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Ruoli",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Framework = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Payment = table.Column<double>(type: "float", nullable: false),
                    roleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    um = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ruoli", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Personale_RuoliId",
                table: "Personale",
                column: "RuoliId");

            migrationBuilder.AddForeignKey(
                name: "FK_Personale_Ruoli_RuoliId",
                table: "Personale",
                column: "RuoliId",
                principalTable: "Ruoli",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
