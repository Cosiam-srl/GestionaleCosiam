using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiuntiCommentiSuQuestionario : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "commentiAttrezzatureMezzi",
                table: "AllegatiEQuestionarioReportModel",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "commentiFornitori",
                table: "AllegatiEQuestionarioReportModel",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "commentiMeteo",
                table: "AllegatiEQuestionarioReportModel",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "commentiRisorseUmane",
                table: "AllegatiEQuestionarioReportModel",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "commentiAttrezzatureMezzi",
                table: "AllegatiEQuestionarioReportModel");

            migrationBuilder.DropColumn(
                name: "commentiFornitori",
                table: "AllegatiEQuestionarioReportModel");

            migrationBuilder.DropColumn(
                name: "commentiMeteo",
                table: "AllegatiEQuestionarioReportModel");

            migrationBuilder.DropColumn(
                name: "commentiRisorseUmane",
                table: "AllegatiEQuestionarioReportModel");
        }
    }
}
