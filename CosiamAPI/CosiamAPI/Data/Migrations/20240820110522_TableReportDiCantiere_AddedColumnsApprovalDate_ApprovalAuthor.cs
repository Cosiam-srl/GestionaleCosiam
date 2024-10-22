using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    /// <inheritdoc />
    public partial class TableReportDiCantiere_AddedColumnsApprovalDate_ApprovalAuthor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApprovalAuthor",
                table: "ReportDiCantiere",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovalDate",
                table: "ReportDiCantiere",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalAuthor",
                table: "ReportDiCantiere");

            migrationBuilder.DropColumn(
                name: "ApprovalDate",
                table: "ReportDiCantiere");
        }
    }
}
