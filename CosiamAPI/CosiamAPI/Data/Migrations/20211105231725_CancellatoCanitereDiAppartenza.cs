using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class CancellatoCanitereDiAppartenza : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DocumentsList_Cantiere_IdCantiere",
                table: "DocumentsList");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentsList_File_IdFile",
                table: "DocumentsList");

            migrationBuilder.DropIndex(
                name: "IX_DocumentsList_IdCantiere",
                table: "DocumentsList");

            migrationBuilder.DropColumn(
                name: "IdCantiere",
                table: "DocumentsList");

            migrationBuilder.RenameColumn(
                name: "IdFile",
                table: "DocumentsList",
                newName: "IdFileDiCantiere");

            migrationBuilder.RenameIndex(
                name: "IX_DocumentsList_IdFile",
                table: "DocumentsList",
                newName: "IX_DocumentsList_IdFileDiCantiere");

            migrationBuilder.AlterColumn<string>(
                name: "type",
                table: "DocumentsList",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentsList_ListaFileDiCantiere_IdFileDiCantiere",
                table: "DocumentsList",
                column: "IdFileDiCantiere",
                principalTable: "ListaFileDiCantiere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DocumentsList_ListaFileDiCantiere_IdFileDiCantiere",
                table: "DocumentsList");

            migrationBuilder.RenameColumn(
                name: "IdFileDiCantiere",
                table: "DocumentsList",
                newName: "IdFile");

            migrationBuilder.RenameIndex(
                name: "IX_DocumentsList_IdFileDiCantiere",
                table: "DocumentsList",
                newName: "IX_DocumentsList_IdFile");

            migrationBuilder.AlterColumn<int>(
                name: "type",
                table: "DocumentsList",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdCantiere",
                table: "DocumentsList",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentsList_IdCantiere",
                table: "DocumentsList",
                column: "IdCantiere");

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentsList_Cantiere_IdCantiere",
                table: "DocumentsList",
                column: "IdCantiere",
                principalTable: "Cantiere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentsList_File_IdFile",
                table: "DocumentsList",
                column: "IdFile",
                principalTable: "File",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
