﻿using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class profiloclientefoto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "File",
                table: "Clienti",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "File",
                table: "Clienti");
        }
    }
}