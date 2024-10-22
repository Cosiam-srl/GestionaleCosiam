using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiunteSALfatture : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Saltura",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumeroFattura = table.Column<int>(type: "int", nullable: false),
                    IVA = table.Column<int>(type: "int", nullable: false),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalValue = table.Column<double>(type: "float", nullable: false),
                    IssueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RecessDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Saltura", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Saltura_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AttachmentsSaltura",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdFile = table.Column<int>(type: "int", nullable: false),
                    IdSaltura = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttachmentsSaltura", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttachmentsSaltura_File_IdFile",
                        column: x => x.IdFile,
                        principalTable: "File",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttachmentsSaltura_Saltura_IdSaltura",
                        column: x => x.IdSaltura,
                        principalTable: "Saltura",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttachmentsSaltura_IdFile",
                table: "AttachmentsSaltura",
                column: "IdFile");

            migrationBuilder.CreateIndex(
                name: "IX_AttachmentsSaltura_IdSaltura",
                table: "AttachmentsSaltura",
                column: "IdSaltura");

            migrationBuilder.CreateIndex(
                name: "IX_Saltura_IdCantiere",
                table: "Saltura",
                column: "IdCantiere");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttachmentsSaltura");

            migrationBuilder.DropTable(
                name: "Saltura");
        }
    }
}
