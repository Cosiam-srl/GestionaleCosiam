using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class CantiereAndNoteControllers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    State = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    start = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EstimatedEnding = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cantiere", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "File",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    URL = table.Column<string>(type: "nvarchar(2083)", maxLength: 2083, nullable: true),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_File", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ListaNoteDiCantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdNote = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListaNoteDiCantiere", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListaNoteDiCantiere_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListaNoteDiCantiere_Note_IdNote",
                        column: x => x.IdNote,
                        principalTable: "Note",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ListaPersonaleResponsabileDiCantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdPersonale = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListaPersonaleResponsabileDiCantiere", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListaPersonaleResponsabileDiCantiere_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListaPersonaleResponsabileDiCantiere_Personale_IdPersonale",
                        column: x => x.IdPersonale,
                        principalTable: "Personale",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AttachmentsCantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdFile = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttachmentsCantiere", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttachmentsCantiere_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttachmentsCantiere_File_IdFile",
                        column: x => x.IdFile,
                        principalTable: "File",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttachmentsCantiere_IdCantiere",
                table: "AttachmentsCantiere",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_AttachmentsCantiere_IdFile",
                table: "AttachmentsCantiere",
                column: "IdFile");

            migrationBuilder.CreateIndex(
                name: "IX_ListaNoteDiCantiere_IdCantiere",
                table: "ListaNoteDiCantiere",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_ListaNoteDiCantiere_IdNote",
                table: "ListaNoteDiCantiere",
                column: "IdNote");

            migrationBuilder.CreateIndex(
                name: "IX_ListaPersonaleResponsabileDiCantiere_IdCantiere",
                table: "ListaPersonaleResponsabileDiCantiere",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_ListaPersonaleResponsabileDiCantiere_IdPersonale",
                table: "ListaPersonaleResponsabileDiCantiere",
                column: "IdPersonale");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttachmentsCantiere");

            migrationBuilder.DropTable(
                name: "ListaNoteDiCantiere");

            migrationBuilder.DropTable(
                name: "ListaPersonaleResponsabileDiCantiere");

            migrationBuilder.DropTable(
                name: "File");

            migrationBuilder.DropTable(
                name: "Cantiere");
        }
    }
}
