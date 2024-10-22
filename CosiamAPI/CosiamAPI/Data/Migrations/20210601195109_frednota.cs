using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class frednota : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ThreadNota",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdReferredNote = table.Column<int>(type: "int", nullable: false),
                    IdReferringNote = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThreadNota", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ThreadNota_Note_IdReferredNote",
                        column: x => x.IdReferredNote,
                        principalTable: "Note",
                        principalColumn: "Id");
                    //,
                        //onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ThreadNota_Note_IdReferringNote",
                        column: x => x.IdReferringNote,
                        principalTable: "Note",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ThreadNota_IdReferredNote",
                table: "ThreadNota",
                column: "IdReferredNote");

            migrationBuilder.CreateIndex(
                name: "IX_ThreadNota_IdReferringNote",
                table: "ThreadNota",
                column: "IdReferringNote");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ThreadNota");
        }
    }
}
