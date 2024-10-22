using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class NotaToFileLinkage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttachmentsCantiere");

            migrationBuilder.CreateTable(
                name: "AttachmentsNota",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdFile = table.Column<int>(type: "int", nullable: false),
                    IdNota = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttachmentsNota", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttachmentsNota_Cantiere_IdNota",
                        column: x => x.IdNota,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttachmentsNota_File_IdFile",
                        column: x => x.IdFile,
                        principalTable: "File",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttachmentsNota_IdFile",
                table: "AttachmentsNota",
                column: "IdFile");

            migrationBuilder.CreateIndex(
                name: "IX_AttachmentsNota_IdNota",
                table: "AttachmentsNota",
                column: "IdNota");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttachmentsNota");

            migrationBuilder.CreateTable(
                name: "AttachmentsCantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdCantiere = table.Column<int>(type: "int", nullable: false),
                    IdFile = table.Column<int>(type: "int", nullable: false)
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
        }
    }
}
