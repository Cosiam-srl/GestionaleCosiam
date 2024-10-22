using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class aggiuntaListaAttachmentsAttrezzatura1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "attachementsAttrezzatura",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdAttrezzaturaAt = table.Column<int>(type: "int", nullable: false),
                    IdFile = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_attachementsAttrezzatura", x => x.Id);
                    table.ForeignKey(
                        name: "FK_attachementsAttrezzatura_AttrezzaturaAT_IdAttrezzaturaAt",
                        column: x => x.IdAttrezzaturaAt,
                        principalTable: "AttrezzaturaAT",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_attachementsAttrezzatura_File_IdFile",
                        column: x => x.IdFile,
                        principalTable: "File",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_attachementsAttrezzatura_IdAttrezzaturaAt",
                table: "attachementsAttrezzatura",
                column: "IdAttrezzaturaAt");

            migrationBuilder.CreateIndex(
                name: "IX_attachementsAttrezzatura_IdFile",
                table: "attachementsAttrezzatura",
                column: "IdFile");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "attachementsAttrezzatura");
        }
    }
}
