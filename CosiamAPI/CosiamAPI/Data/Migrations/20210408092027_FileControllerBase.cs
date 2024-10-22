using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class FileControllerBase : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "URL",
                table: "File");

            migrationBuilder.DropColumn(
                name: "name",
                table: "File");

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "File",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FolderPath",
                table: "File",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "File",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UploadDateTime",
                table: "File",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileName",
                table: "File");

            migrationBuilder.DropColumn(
                name: "FolderPath",
                table: "File");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "File");

            migrationBuilder.DropColumn(
                name: "UploadDateTime",
                table: "File");

            migrationBuilder.AddColumn<string>(
                name: "URL",
                table: "File",
                type: "nvarchar(2083)",
                maxLength: 2083,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "name",
                table: "File",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
