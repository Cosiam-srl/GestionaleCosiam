using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class fornitoriclientimodels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Location",
                table: "Fornitori",
                newName: "Telephone");

            migrationBuilder.AlterColumn<string>(
                name: "Surname",
                table: "Personale",
                type: "nvarchar(17)",
                maxLength: 17,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(17)",
                oldMaxLength: 17,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Fornitori",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CAP",
                table: "Fornitori",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Clienti",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CAP",
                table: "Clienti",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Clienti",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PIVA",
                table: "Clienti",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Clienti",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Telephone",
                table: "Clienti",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Clienti",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Fornitori");

            migrationBuilder.DropColumn(
                name: "CAP",
                table: "Fornitori");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Clienti");

            migrationBuilder.DropColumn(
                name: "CAP",
                table: "Clienti");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Clienti");

            migrationBuilder.DropColumn(
                name: "PIVA",
                table: "Clienti");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Clienti");

            migrationBuilder.DropColumn(
                name: "Telephone",
                table: "Clienti");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Clienti");

            migrationBuilder.RenameColumn(
                name: "Telephone",
                table: "Fornitori",
                newName: "Location");

            migrationBuilder.AlterColumn<string>(
                name: "Surname",
                table: "Personale",
                type: "nvarchar(17)",
                maxLength: 17,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(17)",
                oldMaxLength: 17);
        }
    }
}
