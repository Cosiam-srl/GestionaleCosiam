using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiustateTabelleSecondoIndicazioniSal2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Date",
                table: "Note",
                newName: "DueDate");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreationDate",
                table: "Note",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "Note",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Note",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TimeCard",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumberOfHours = table.Column<int>(type: "int", nullable: false),
                    BeginningDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PersonaleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeCard", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeCard_Personale_PersonaleId",
                        column: x => x.PersonaleId,
                        principalTable: "Personale",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TimeCard_PersonaleId",
                table: "TimeCard",
                column: "PersonaleId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TimeCard");

            migrationBuilder.DropColumn(
                name: "CreationDate",
                table: "Note");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Note");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Note");

            migrationBuilder.RenameColumn(
                name: "DueDate",
                table: "Note",
                newName: "Date");
        }
    }
}
