using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class AddedTable_AttachmentsBudget : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AttachmentsBudget",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdAttivitaBudget = table.Column<int>(type: "int", nullable: false),
                    IdFile = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttachmentsBudget", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttachmentsBudget_BudgetAttivita_IdAttivitaBudget",
                        column: x => x.IdAttivitaBudget,
                        principalTable: "BudgetAttivita",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttachmentsBudget_File_IdFile",
                        column: x => x.IdFile,
                        principalTable: "File",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttachmentsBudget_IdAttivitaBudget",
                table: "AttachmentsBudget",
                column: "IdAttivitaBudget");

            migrationBuilder.CreateIndex(
                name: "IX_AttachmentsBudget_IdFile",
                table: "AttachmentsBudget",
                column: "IdFile");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttachmentsBudget");
        }
    }
}
