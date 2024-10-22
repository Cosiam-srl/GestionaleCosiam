using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class CorrezioneConsistenzaNomiTabelleDB : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListaPersonaleResponsabileDiCantiere_Cantiere_IdCantiere",
                table: "ListaPersonaleResponsabileDiCantiere");

            migrationBuilder.DropForeignKey(
                name: "FK_ListaPersonaleResponsabileDiCantiere_Personale_IdPersonale",
                table: "ListaPersonaleResponsabileDiCantiere");

            migrationBuilder.DropTable(
                name: "TagNota");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ListaPersonaleResponsabileDiCantiere",
                table: "ListaPersonaleResponsabileDiCantiere");

            migrationBuilder.RenameTable(
                name: "ListaPersonaleResponsabileDiCantiere",
                newName: "ListaPersonaleAssegnatoDiCantiere");

            migrationBuilder.RenameIndex(
                name: "IX_ListaPersonaleResponsabileDiCantiere_IdPersonale",
                table: "ListaPersonaleAssegnatoDiCantiere",
                newName: "IX_ListaPersonaleAssegnatoDiCantiere_IdPersonale");

            migrationBuilder.RenameIndex(
                name: "IX_ListaPersonaleResponsabileDiCantiere_IdCantiere",
                table: "ListaPersonaleAssegnatoDiCantiere",
                newName: "IX_ListaPersonaleAssegnatoDiCantiere_IdCantiere");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ListaPersonaleAssegnatoDiCantiere",
                table: "ListaPersonaleAssegnatoDiCantiere",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "PersonaleResponsabile",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdPersonale = table.Column<int>(type: "int", nullable: false),
                    IdNote = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonaleResponsabile", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonaleResponsabile_Note_IdNote",
                        column: x => x.IdNote,
                        principalTable: "Note",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PersonaleResponsabile_Personale_IdPersonale",
                        column: x => x.IdPersonale,
                        principalTable: "Personale",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PersonaleResponsabile_IdNote",
                table: "PersonaleResponsabile",
                column: "IdNote");

            migrationBuilder.CreateIndex(
                name: "IX_PersonaleResponsabile_IdPersonale",
                table: "PersonaleResponsabile",
                column: "IdPersonale");

            migrationBuilder.AddForeignKey(
                name: "FK_ListaPersonaleAssegnatoDiCantiere_Cantiere_IdCantiere",
                table: "ListaPersonaleAssegnatoDiCantiere",
                column: "IdCantiere",
                principalTable: "Cantiere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ListaPersonaleAssegnatoDiCantiere_Personale_IdPersonale",
                table: "ListaPersonaleAssegnatoDiCantiere",
                column: "IdPersonale",
                principalTable: "Personale",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListaPersonaleAssegnatoDiCantiere_Cantiere_IdCantiere",
                table: "ListaPersonaleAssegnatoDiCantiere");

            migrationBuilder.DropForeignKey(
                name: "FK_ListaPersonaleAssegnatoDiCantiere_Personale_IdPersonale",
                table: "ListaPersonaleAssegnatoDiCantiere");

            migrationBuilder.DropTable(
                name: "PersonaleResponsabile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ListaPersonaleAssegnatoDiCantiere",
                table: "ListaPersonaleAssegnatoDiCantiere");

            migrationBuilder.RenameTable(
                name: "ListaPersonaleAssegnatoDiCantiere",
                newName: "ListaPersonaleResponsabileDiCantiere");

            migrationBuilder.RenameIndex(
                name: "IX_ListaPersonaleAssegnatoDiCantiere_IdPersonale",
                table: "ListaPersonaleResponsabileDiCantiere",
                newName: "IX_ListaPersonaleResponsabileDiCantiere_IdPersonale");

            migrationBuilder.RenameIndex(
                name: "IX_ListaPersonaleAssegnatoDiCantiere_IdCantiere",
                table: "ListaPersonaleResponsabileDiCantiere",
                newName: "IX_ListaPersonaleResponsabileDiCantiere_IdCantiere");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ListaPersonaleResponsabileDiCantiere",
                table: "ListaPersonaleResponsabileDiCantiere",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "TagNota",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdNote = table.Column<int>(type: "int", nullable: false),
                    IdPersonale = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TagNota", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TagNota_Note_IdNote",
                        column: x => x.IdNote,
                        principalTable: "Note",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TagNota_Personale_IdPersonale",
                        column: x => x.IdPersonale,
                        principalTable: "Personale",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TagNota_IdNote",
                table: "TagNota",
                column: "IdNote");

            migrationBuilder.CreateIndex(
                name: "IX_TagNota_IdPersonale",
                table: "TagNota",
                column: "IdPersonale");

            migrationBuilder.AddForeignKey(
                name: "FK_ListaPersonaleResponsabileDiCantiere_Cantiere_IdCantiere",
                table: "ListaPersonaleResponsabileDiCantiere",
                column: "IdCantiere",
                principalTable: "Cantiere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ListaPersonaleResponsabileDiCantiere_Personale_IdPersonale",
                table: "ListaPersonaleResponsabileDiCantiere",
                column: "IdPersonale",
                principalTable: "Personale",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
